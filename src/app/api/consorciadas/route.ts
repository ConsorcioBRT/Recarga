import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const consorciadas = await prisma.frn.findMany({
      select: {
        FrnNme: true,
      },
      orderBy: {
        FrnNme: "asc",
      },
    });
    return NextResponse.json(consorciadas);
  } catch (error) {
    console.error("Erro ao buscar consorciadas:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
