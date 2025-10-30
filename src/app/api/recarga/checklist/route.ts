import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { RcgId, SttIdChk } = body;

    if (!RcgId || SttIdChk === undefined) {
      return new NextResponse("Parâmetros inválidos", { status: 400 });
    }

    // Atualizar apenas SttIdChk na tabela rcg
    const atualizado = await prisma.rcg.update({
      where: { RcgId },
      data: { SttIdChk },
    });

    return NextResponse.json({
      message: "Checklist atualizado com sucesso",
      atualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar checklist:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
