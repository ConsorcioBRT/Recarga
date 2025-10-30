import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

// Irei buscar todas as respostas dos CheckLists
export async function GET() {
  try {
    const respostasCheck = await prisma.psq_rsp.findMany({
      select: {
        DtaOpe: true,
        TrnId: true,
        PsqId: true,
        PsqTpoId: true,
        PsqPrgId: true,
        PsqRspId: true,
        PsqRsp: true,
        PsqDth: true,
        SttId: true,
        UsrIdAlt: true,
        DtaAlt: true,
      },
      orderBy: {
        PsqPrgId: "asc",
      },
    });
    return NextResponse.json(respostasCheck);
  } catch (error) {
    console.error("Erro ao buscar respostas", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}

// Aqui vai ser para a Data da Operação ser sempre o dia anterior quando for 00h até 4:59h
function ajustarDtaOpe(dta: Date): Date {
  const novaData = new Date(dta);
  const hora = novaData.getHours();
  if (hora >= 0 && hora < 5) {
    novaData.setDate(novaData.getDate() - 1);
  }
  return novaData;
}

// Converte string "YYYY-MM-DD HH:mm:ss" para Date local
function parseDataBrasilia(str: string): Date {
  const [datePart, timePart] = str.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  // new Date(year, monthIndex, day, hour, minute, second)
  return new Date(year, month - 1, day, hour, minute, second);
}

// Irei criar as respostas dos CheckLists
export async function POST(request: Request) {
  try {
    const respostas = await request.json();

    if (!Array.isArray(respostas) || respostas.length === 0) {
      return new NextResponse("Nenhuma reposta enviada", { status: 400 });
    }

    const respostasCriadas = [];

    for (const r of respostas) {
      const {
        UndId,
        DtaOpe,
        TrnId,
        PsqId,
        PsqTpoId,
        PsqPrgId,
        PsqRsp,
        PsqDth,
        SttId,
        UsrIdAlt,
        DtaAlt,
      } = r;

      if (!PsqPrgId || PsqRsp === undefined || PsqRsp === null) {
        return new NextResponse("Dados incompletos", { status: 400 });
      }

      // transforma o DtaOpe recebido em Date e ajusta
      let dtaOpeNovo: Date;
      if (DtaOpe) {
        const dtaOpeBody = parseDataBrasilia(DtaOpe);
        dtaOpeNovo = ajustarDtaOpe(dtaOpeBody);
      } else {
        const agora = new Date();
        dtaOpeNovo = ajustarDtaOpe(agora);
      }

      const resposta = await prisma.psq_rsp.create({
        data: {
          UndId,
          DtaOpe: dtaOpeNovo,
          TrnId,
          PsqId: PsqId || 1,
          PsqTpoId: PsqTpoId || 1,
          PsqPrgId,
          PsqRsp,
          PsqDth: PsqDth || "",
          SttId: SttId || 1,
          UsrIdAlt,
          DtaAlt: parseDataBrasilia(DtaAlt),
        },
      });
      respostasCriadas.push(resposta);
    }

    return NextResponse.json(respostasCriadas, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro ao salvar resposta:", error);
      return new NextResponse(
        JSON.stringify({ message: error.message, stack: error.stack }),
        { status: 500 }
      );
    }
    console.error("Erro desconhecido:", error);
    return new NextResponse("Erro interno no servidor", { status: 500 });
  }
}
