import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const postos = await prisma.vwPostoRecarga.findMany({
      select: {
        UndId: true,
        PostoRecarga: true,
      },
      orderBy: {
        PostoRecarga: "asc",
      },
    });

    return NextResponse.json(postos);
  } catch (error) {
    console.error("Erro ao buscar postos de recarga:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
