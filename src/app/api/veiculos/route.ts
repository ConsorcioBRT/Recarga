import prisma from "@/src/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eqpItmId = searchParams.get("EqpItmId");

    // Buscar todos os ônibus da view ou filtra por EqpItmId
    const onibus = await prisma.vwOnibus.findMany({
      where: eqpItmId ? { EqpItmId: Number(eqpItmId) } : undefined,
      select: {
        RcgIdOrg: true,
        EqpItmId: true,
        Onibus: true,
        Situacao: true,
        Data_Operacao: true,
        UndId: true,
        PostoRecarga: true,
        CrrId: true,
        Carregador: true,
        DataInicio: true,
        DataFinal: true,
        BateriaInicio: true,
        Bateria: true,
        BateriaEntregue: true,
        OdometroInicio: true,
        Odometro: true,
        KmRodado: true,
        Carga_kWh: true,
        Checklist: true,
        Capacidade_Tecnica: true,
      },
      orderBy: { Onibus: "asc" },
    });

    // Buscar as recargas iniciadas para esses ônibus (SttRcgId === 5, por exemplo)
    const recargasIniciadas = await prisma.rcg.findMany({
      where: { SttRcgId: 5 }, // status iniciada
      select: {
        RcgId: true,
        VclId: true,
      },
    });

    // Juntar RcgId na lista de ônibus carregando
    const onibusComRecarga = onibus.map((o) => {
      if (o.Situacao === "INICIADA") {
        const recarga = recargasIniciadas.find((r) => r.VclId === o.EqpItmId);
        return {
          ...o,
          RcgId: recarga ? recarga.RcgId : null,
        };
      }
      return { ...o, RcgId: null };
    });

    return NextResponse.json(onibusComRecarga);
  } catch (error) {
    console.error("Erro ao buscar ônibus:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { RcgId, novoStatus } = body;

    if (!RcgId || novoStatus === undefined) {
      return new NextResponse("Parâmetros inválidos", { status: 400 });
    }

    // Atualizar status na tabela rcg
    const atualizado = await prisma.rcg.update({
      where: { RcgId },
      data: { SttRcgId: novoStatus },
    });

    return NextResponse.json({
      message: "Status atualizado com sucesso",
      atualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
