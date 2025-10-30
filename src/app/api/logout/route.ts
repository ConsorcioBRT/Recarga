import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ message: "Logout realizado." });

  // Aqui vai apagar o cookie HttpOnly
  response.cookies.set("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
