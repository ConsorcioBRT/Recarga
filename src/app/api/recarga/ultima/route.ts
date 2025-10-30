import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const VclId = Number(searchParams.get("VclId"));

    if (!VclId) {
      return NextResponse.json(
        { error: "Parâmetro VclId é obrigatório" },
        { status: 400 }
      );
    }

    const ultimaRecarga = await prisma.rcg.findFirst({
      where: { VclId },
      orderBy: { DtaIni: "desc" },
      select: {
        RcgId: true,
        OdoIni: true,
        OdoFin: true,
        SttRcgId: true,
      },
    });

    if (!ultimaRecarga) {
      return NextResponse.json(null);
    }

    return NextResponse.json(ultimaRecarga);
  } catch (error) {
    console.error("Erro ao buscar última recarga:", error);
    return NextResponse.json(
      {
        error: "Erro interno ao buscar última recarga",
      },
      { status: 500 }
    );
  }
}
