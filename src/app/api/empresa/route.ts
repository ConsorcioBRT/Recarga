import prisma from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const consorciadas = await prisma.emp.findMany({
      select: {
        EmpId: true,
        EmpNme: true,
        EmpRaz: true,
        EmpRdz: true,
        EmpAtv: true,
        EmpCnpj: true,
      },
      orderBy: {
        EmpId: "asc",
      },
    });
    return NextResponse.json(consorciadas);
  } catch (error) {
    console.error("Erro ao buscar Usuários:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
