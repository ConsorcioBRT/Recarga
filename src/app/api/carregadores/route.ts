import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Aqui vai pegar o UndId da query striing (?undId=x)
    const { searchParams } = new URL(request.url);
    const undId = searchParams.get("undId");
    if (!undId) {
      return new NextResponse("Parâmetro UndId é obrigatório", { status: 400 });
    }

    // Aqui vai buscar todos os carregadores com o mesmo UndId
    const carregadores = await prisma.vwCarregador.findMany({
      where: { UndId: Number(undId) },
      select: {
        UndId: true,
        EqpItmId: true,
        Carregador: true,
      },
      orderBy: {
        Carregador: "asc",
      },
    });

    return NextResponse.json(carregadores);
  } catch (error) {
    console.error("Erro ao buscar Usuários:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
