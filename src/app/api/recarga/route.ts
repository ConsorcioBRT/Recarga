import { Prisma } from "@/src/lib/generated/prisma";
import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

// Aqui será o GET
export async function GET() {
  try {
    const recargas = await prisma.rcg.findMany({
      select: {
        RcgId: true,
        RcgIdOrg: true,
        EmpId: true,
        DtaOpe: true,
        UndId: true,
        VclId: true,
        CrrId: true,
        CrrCnc: true,
        DtaIni: true,
        DtaFin: true,
        SocIni: true,
        SocFin: true,
        RcgKwh: true,
        OdoIni: true,
        OdoFin: true,
        SttRcgId: true,
        FlhId: true,
        FlhDsc: true,
        SttId: true,
        SttIdChk: true,
        UsrIdAlt: true,
        DtaAlt: true,
        MtvDel: true,
      },
    });
    return NextResponse.json(recargas);
  } catch (error) {
    console.log("Erro ao buscar Recargas:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

// Aqui vai ser para a Data da Operação ser sempre o dia anterior quando for 00h até 4:59h
function ajustarDtaOpe(dtaIni: Date, dtaOpep: Date) {
  const hora = dtaIni.getHours();
  if (hora >= 0 && hora < 5) {
    dtaOpep.setDate(dtaOpep.getDate() - 1);
  }
  return dtaOpep;
}

// Converte string "YYYY-MM-DD HH:mm:ss" para Date local
function parseDataBrasilia(str: string): Date {
  const [datePart, timePart] = str.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  // new Date(year, monthIndex, day, hour, minute, second)
  // mês começa em 0
  return new Date(year, month - 1, day, hour, minute, second);
}

// Aqui será o POST
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      UndId,
      VclId,
      CrrId,
      CrrCnc,
      SocIni,
      OdoFin,
      UsrIdAlt,
      EmpId,
      DtaIni,
      DtaOpe,
    } = body;

    if (
      !UndId ||
      !VclId ||
      !CrrId ||
      CrrCnc === undefined ||
      SocIni === undefined ||
      OdoFin === undefined ||
      !UsrIdAlt ||
      !EmpId ||
      !DtaIni ||
      !DtaOpe
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes" },
        { status: 400 }
      );
    }
    // Aqui vai buscar a última recarga do veículo
    const ultimaRecarga = await prisma.rcg.findFirst({
      where: { VclId: Number(VclId) },
      orderBy: { DtaIni: "desc" },
    });

    // Aqui se a última recarga terminar com erro, usar ele como origem
    let rcgIdOrgNovo = 0;
    let dtaOpeNovo = new Date();
    let sttIdChkNovo = 0;
    if (ultimaRecarga) {
      if (ultimaRecarga.SttRcgId === 7 && ultimaRecarga.FlhId === 1) {
        rcgIdOrgNovo = ultimaRecarga.RcgIdOrg || ultimaRecarga.RcgId; // aqui irá salvar o RcgIdOrg atual com o RcgIdOrg anterior
        dtaOpeNovo = ultimaRecarga.DtaOpe;
        sttIdChkNovo = ultimaRecarga.SttIdChk ?? 0;
      }
    }

    // Aqui vai ajustar o horário das 00h até 5h
    const agora = new Date();
    dtaOpeNovo = ajustarDtaOpe(agora, dtaOpeNovo);

    const dadosParaSalvar = {
      UndId: Number(UndId),
      VclId: Number(VclId),
      CrrId: Number(CrrId),
      CrrCnc: Number(CrrCnc),
      DtaIni: parseDataBrasilia(DtaIni),
      DtaOpe: dtaOpeNovo,
      SocIni: Number(SocIni),
      OdoIni: ultimaRecarga?.OdoFin
        ? new Prisma.Decimal(Number(ultimaRecarga.OdoFin).toFixed(1))
        : null, // se não houver anterior, fica null
      OdoFin:
        OdoFin !== undefined
          ? new Prisma.Decimal(Number(OdoFin).toFixed(1))
          : null,
      UsrIdAlt: Number(UsrIdAlt),
      RcgIdOrg: rcgIdOrgNovo || null,
      EmpId: Number(EmpId),
      SttRcgId: 5,
      SttId: 1,
      FlhId: 0,
      SttIdChk: sttIdChkNovo,
    };
    console.log("Dados que serão enviados para o banco:", dadosParaSalvar);
    console.log("sttIdChkNovo calculado:", sttIdChkNovo);

    // Aqui será a criação da Nova Recarga
    let novaRecarga = await prisma.rcg.create({
      data: dadosParaSalvar,
    });

    // Ajuste do RcgIdOrg logo após a criação
    if (!novaRecarga.RcgIdOrg) {
      novaRecarga = await prisma.rcg.update({
        where: { RcgId: novaRecarga.RcgId },
        data: { RcgIdOrg: novaRecarga.RcgId },
      });
    }
    return NextResponse.json(novaRecarga);
  } catch (error) {
    console.error("Erro ao criar recarga:");
    console.error("Mensagem:", error);
    console.error("Stack:", error);
    console.error("Erro completo:", JSON.stringify(error, null, 2)); // mostra todos os campos serializáveis

    return NextResponse.json(
      {
        error: error || "Erro desconhecido",
        stack: error,
        meta: error || null, // Prisma costuma trazer detalhes aqui
        code: error || null, // tipo P2032
      },
      { status: 500 }
    );
  }
}

// Aqui será o PUT
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log("Dados recebidos no PUT:", body);

    const {
      RcgId,
      DtaFin,
      SocFin,
      RcgKwh,
      OdoFin,
      FlhId,
      FlhDsc,
      forcarSttRcgId6,
    } = body;

    if (!RcgId) {
      return NextResponse.json(
        { error: "RcgId é obrigatório" },
        { status: 400 }
      );
    }

    const recargaExistente = await prisma.rcg.findUnique({
      where: { RcgId: Number(RcgId) },
    });
    console.log("Recarga encontrada:", recargaExistente);

    if (!recargaExistente) {
      return NextResponse.json(
        { error: "Recarga não encontrada" },
        { status: 404 }
      );
    }

    type DadosAtualizadosType = {
      DtaFin?: Date;
      SocFin?: number;
      RcgKwh?: Prisma.Decimal;
      OdoFin?: Prisma.Decimal;
      FlhDsc?: string;
      SttRcgId?: number;
      FlhId?: number;
      RcgIdOrg?: number;
    };

    const dadosAtualizados: DadosAtualizadosType = {};

    if (DtaFin && !recargaExistente.DtaFin) {
      dadosAtualizados.DtaFin = parseDataBrasilia(DtaFin);
    }

    if (
      SocFin !== undefined &&
      (!recargaExistente.SocFin || recargaExistente.SocFin === 0)
    ) {
      dadosAtualizados.SocFin = Number(SocFin);
    }

    if (RcgKwh !== undefined) {
      dadosAtualizados.RcgKwh = new Prisma.Decimal(Number(RcgKwh).toFixed(3));
    }

    if (
      OdoFin !== undefined &&
      (!recargaExistente.OdoFin || recargaExistente.OdoFin.toNumber() === 0)
    ) {
      dadosAtualizados.OdoFin = new Prisma.Decimal(Number(OdoFin).toFixed(1));
    }

    if (FlhDsc && !recargaExistente.FlhDsc) {
      dadosAtualizados.FlhDsc = FlhDsc;
    }

    if (forcarSttRcgId6) {
      dadosAtualizados.SttRcgId = 6; // aqui vai atualiazr normalmente sem erro
      dadosAtualizados.FlhId = FlhId || 0;
      if (!recargaExistente.RcgIdOrg) {
        dadosAtualizados.RcgIdOrg = recargaExistente.RcgId;
      }
    } else if (FlhId === 1) {
      // finalizada com erro
      dadosAtualizados.FlhId = 1;
      dadosAtualizados.SttRcgId = 7;
      dadosAtualizados.RcgIdOrg =
        recargaExistente.RcgIdOrg || recargaExistente.RcgId; // aqui vai salvar o RcgId no RcgIdOrg
    } else if (recargaExistente.SttRcgId === 5) {
      // finalizada normalmente
      dadosAtualizados.FlhId = 0;
      dadosAtualizados.SttRcgId = 6;
    } else if (!recargaExistente.RcgIdOrg) {
      dadosAtualizados.RcgIdOrg = recargaExistente.RcgId;
    }

    const recargaAtualizada = await prisma.rcg.update({
      where: { RcgId: Number(RcgId) },
      data: dadosAtualizados,
    });

    console.log("Recarga atualizada:", recargaAtualizada);
    return NextResponse.json({ recargaAtualizada });
  } catch (error) {
    console.error("Erro ao atualizar recarga:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar recarga" },
      { status: 500 }
    );
  }
}
