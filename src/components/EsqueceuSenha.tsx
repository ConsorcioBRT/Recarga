import Image from "next/image";
import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

const EsqueceuSenha = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      {/* Div onde irá ficar o forms de login e senha */}
      <div className="flex flex-col gap-6 p-6 w-80 items-center justify-center shadow-xl rounded-xl bg-white">
        <div>
          <Image
            src="/image/brtgo_logo.jpg"
            alt="Logo"
            width={160}
            height={140}
            className="rounded-full"
          />
        </div>
        <div>
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft />
            <span>Voltar</span>
          </Link>
        </div>
        <div>
          <Label className="text-lg font-bold">Redefinição de Senha</Label>
        </div>
        <div className="mb-20">
          <Label className="text-sm font-bold">E-mail</Label>
          <div className="relative w-64">
            <Input type="text" className="h-12 w-64 bg-gray-100" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <User />
            </div>
          </div>
        </div>

        <Button className="w-full h-12 text-lg bg-gray-800">Enviar</Button>
      </div>
    </div>
  );
};

export default EsqueceuSenha;
