import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

// Aqui vai fazer a consulta na view vw_turno_atual
export async function GET() {
  try {
    const turno = await prisma.vwTurnoAtual.findFirst({
      select: {
        DtaAtu: true,
        DtaOpe: true,
        TrnId: true,
      },
      orderBy: {
        TrnId: "asc",
      },
    });

    return NextResponse.json(turno);
  } catch (error) {
    console.error("Erro ao buscar turno:", error);
    return NextResponse.json("Erro ao buscar turno atual", { status: 500 });
  }
}
