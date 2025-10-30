import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/src/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const { userId, novaSenha } = await request.json();

    if (!userId || !novaSenha) {
      return NextResponse.json(
        { message: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    // Validações de segurança mínimas
    if (typeof novaSenha !== "string" || novaSenha.length < 6) {
      return NextResponse.json(
        { message: "Senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    await prisma.usr.update({
      where: { UsrId: Number(userId) },
      data: {
        UsrPwd: hashedPassword,
        SttId: 1,
      },
    });
    return NextResponse.json({ message: "Senha atualizada com sucesso." });
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
