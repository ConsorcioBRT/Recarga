import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/src/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const consorciadas = await prisma.usr.findMany({
      select: {
        UsrId: true,
        UsrNme: true,
        UsrLgn: true,
        UsrCpf: true,
        UsrEml: true,
        UsrTpoId: true,
      },
      orderBy: {
        UsrNme: "asc",
      },
    });
    return NextResponse.json(consorciadas);
  } catch (error) {
    console.error("Erro ao buscar Usuários:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

// Aqui será o POST - Usando a criptografia
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-secret";
// Função para ajustar a data do turno
function getDtaOpeCorrigida(trnId: number, dta: Date) {
  const data = new Date(dta);
  const hora = data.getHours();

  if (trnId === 2 && hora <= 4) {
    // Turno 2, depois da meia-noite → pertence ao dia anterior
    data.setDate(data.getDate() - 1);
  }

  return data;
}
export async function POST(request: NextRequest) {
  try {
    const { usuario, senha, UndId, DtaOpe, TrnId } = await request.json();

    // Aqui vai procurar o usuário pelo nome, e-mail ou CPF
    const user = await prisma.usr.findFirst({
      where: {
        OR: [{ UsrEml: usuario }, { UsrCpf: usuario }, { UsrLgn: usuario }],
      },
    });

    if (!user) {
      return NextResponse.json(
        { messagem: "Usuário ou senha inválidos." },
        { status: 401 }
      );
    }

    // Aqui vai resetar a senha quando o SttId = 8
    if (user.SttId === 8) {
      return NextResponse.json(
        {
          message: "Usuário precisa resetar a senha.",
          resetRequired: true,
          userId: user.UsrId,
        },
        { status: 200 }
      );
    }

    // Aqui vai comparar a senha criptografada
    const senhaValida = await bcrypt.compare(senha, user.UsrPwd);
    if (!senhaValida) {
      return NextResponse.json(
        { messagem: "Usuário ou senha inválidos." },
        { status: 401 }
      );
    }

    // Aqui não vai enviar a senha no front
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { UsrPwd, ...userSemSenha } = user;

    // Aqui vai verificar se já respondeu o checklist do eletroposto
    console.log("Usuario ID:", user.UsrId);
    console.log("UndId selecionado:", UndId);

    // Verifica se o usuário já respondeu o checklist do eletroposto
    let jaRespondeu = false;
    if (DtaOpe && TrnId) {
      const dtaOpeCorrigida = getDtaOpeCorrigida(
        Number(TrnId),
        new Date(DtaOpe)
      );

      const inicioDia = new Date(dtaOpeCorrigida);
      inicioDia.setHours(0, 0, 0, 0);

      const fimDia = new Date(dtaOpeCorrigida);
      fimDia.setHours(23, 59, 59, 999);

      const resposta = await prisma.psq_rsp.findFirst({
        where: {
          UndId: Number(UndId),
          TrnId: Number(TrnId),
        },
      });
      console.log("Resposta encontrada:", resposta);
      console.log({
        UndId: Number(UndId),
        TrnId: Number(TrnId),
        DtaOpeOriginal: DtaOpe,
        DtaOpeConvertida: new Date(DtaOpe),
      });
      jaRespondeu = !!resposta;
    }

    if (!UndId) {
      return new NextResponse("UndId não informado", { status: 400 });
    }

    // Gera o Token por 15min
    const accessToken = jwt.sign(
      {
        id: user.UsrId,
        email: user.UsrEml,
        role: user.UsrTpoId,
      },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const response = NextResponse.json({
      message: "Login realizado com sucesso",
      user: userSemSenha,
      jaRespondeu: !!jaRespondeu,
    });

    // Irá salvar os tokens nos cookies
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 30, // 30min (é sempre considerado em segundos)
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erro no login" }, { status: 500 });
  }
}
