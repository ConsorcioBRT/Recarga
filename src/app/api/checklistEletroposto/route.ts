import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

// Função para pegar todos que forem checklist do Eletroposto
export async function GET() {
  try {
    const checklistEletroposto = await prisma.vwPesquisaPergunta.findMany({
      where: { PsqTpoId: 1 },
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
    return NextResponse.json(checklistEletroposto);
  } catch (error) {
    console.error("Erro ao buscar perguntas do Eletroposto", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
