import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

// Aqui vai ser para a Data da Operação ser sempre o dia anterior quando for 00h até 4:59h
function ajustarDtaOpe(dta: Date): Date {
  const novaData = new Date(dta);
  const hora = novaData.getHours();
  if (hora >= 0 && hora < 5) {
    novaData.setDate(novaData.getDate() - 1);
  }
  return novaData;
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

// aqui é a api que vai buscar se o checklist do eletroposto já foi respondido ou não
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      UndId,
      DtaOpe,
      TrnId,
      PsqId,
      PsqTpoId,
      PsqPrgId,
      PsqRsp,
      PsqDth,
      SttId,
      UsrIdAlt,
      DtaAlt,
    } = body;

    if (UndId === undefined || UndId === null) {
      return new NextResponse("UndId não informado", { status: 400 });
    }

    // transforma o DtaOpe recebido em Date e ajusta
    let dtaOpeNovo: Date;
    if (DtaOpe) {
      const dtaOpeBody = parseDataBrasilia(DtaOpe);
      dtaOpeNovo = ajustarDtaOpe(dtaOpeBody);
    } else {
      const agora = new Date();
      dtaOpeNovo = ajustarDtaOpe(agora);
    }

    //Aqui vai criar um registro marcador - para identificar se já respondeu o checklist ou não
    const created = await prisma.psq_rsp.create({
      data: {
        UndId: Number(UndId),
        DtaOpe: dtaOpeNovo,
        TrnId: Number(TrnId),
        PsqId: PsqId || 1,
        PsqTpoId: PsqTpoId || 1,
        PsqPrgId: PsqPrgId || 999,
        PsqRsp: PsqRsp ?? 0,
        PsqDth: PsqDth || "Checklist Iniciado",
        SttId: SttId || 5,
        UsrIdAlt,
        DtaAlt: parseDataBrasilia(DtaAlt),
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Erro ao iniciar checklist:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
