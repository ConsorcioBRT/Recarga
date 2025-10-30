import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./global.css";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Controle de Recarga",
  description: "Sistema para gerenciar a Recarga dos ônibus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins antialiased`}>
        {children}
        <Toaster position="bottom-center" />
        <SpeedInsights />
      </body>
    </html>
  );
}
