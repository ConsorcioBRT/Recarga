import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

// Vai filtrar todos as perguntas sobre os Veículos
export async function GET() {
  try {
    const checklist = await prisma.vwPesquisaPergunta.findMany({
      where: { PsqTpoId: 2 },
      select: {
        PsqTpoId: true,
        Tipo_Pesquisa: true,
        PsqPrgId: true,
        Pergunta: true,
        Sequencia: true,
      },
      orderBy: {
        PsqPrgId: "asc",
      },
    });
    return NextResponse.json(checklist);
  } catch (error) {
    console.error("Erro ao buscar Lista de Check:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
