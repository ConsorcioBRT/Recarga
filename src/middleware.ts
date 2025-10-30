import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;

  // Rotas privadas
  const protectedRoutes = [
    "/terminal",
    "/abastecimento",
    "/historico",
    "/checklist",
  ];

  const { pathname } = req.nextUrl;

  // Se já está logado e tenta acessar a tela de login (/), irá mandar pro /terminal
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/abastecimento", req.url));
  }

  // Se não tem token e tenta acessar rota protegida, irá retornar pro / (Login)
  if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Caso contrário, segue normalmente
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/terminal/:path*",
    "/abastecimento/:path*",
    "/historico/:path*",
    "/checklist-onibus/:path*",
    "/checklist-eletroposto/:path*",
    "/resetar-senha/:path*",
  ],
};
