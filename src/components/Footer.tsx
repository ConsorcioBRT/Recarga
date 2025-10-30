"use client";
import { Fuel } from "lucide-react";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

interface FooterProps {
  className?: string;
}

const Footer = ({ className = "" }: FooterProps) => {
  const pathname = usePathname();

  const linkClasses = (path: string) =>
    pathname === path
      ? "text-gray-800 font-bold text-sm" // cor quando está ativo
      : "text-gray-400 text-sm";

  return (
    <div
      className={`bg-white flex items-center justify-center h-16 ${className}`}
    >
      <div className="flex items-center justify-between gap-6">
        {/* Menu */}
        {/*
        <Link href="/terminal" className="flex flex-col items-center">
          <Home className={`w-5 h-5 ${linkClasses("/terminal")}`} />
          <span className={linkClasses("/terminal")}>Menu</span>
        </Link>
        */}

        {/* Recarga */}
        <Link href="/abastecimento" className="flex flex-col items-center">
          <Fuel className={`w-5 h-5 ${linkClasses("/abastecimento")}`} />
          <span className={linkClasses("/abastecimento")}>Recarga</span>
        </Link>

        {/* Histórico */}
        {/*
        <Link href="/historico" className="flex flex-col items-center">
          <History className={`w-5 h-5 ${linkClasses("/historico")}`} />
          <span className={linkClasses("/historico")}>Histórico</span>
        </Link>
        */}

        {/* CheckList */}
        {/*
        <Link href="/checklist-onibus" className="flex flex-col items-center">
          <Check className={`w-5 h-5 ${linkClasses("/checklist")}`} />
          <span className={linkClasses("/checklist")}>CheckList</span>
        </Link>
        */}
      </div>
    </div>
  );
};

export default Footer;
