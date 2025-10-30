"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const ResetarSenha = () => {
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get("userId");

  const [novaSenha, setNovaSenha] = useState<string>("");
  const [confirmSenha, setConfirmSenha] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!userId) {
      toast.error("Parâmetro de usuário ausente.");
      return;
    }
    if (!novaSenha || !confirmSenha) {
      toast.error("Preencha os campos de senha.");
      return;
    }
    if (novaSenha.length < 6) {
      toast.error("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/usuarios/resetar-senha", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, novaSenha }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Erro ao redefinir senha.");
        setLoading(false);
        return;
      }

      toast.success("Senha redefinida com sucesso!");
      router.push("/"); // volta para a tela de login
    } catch (error) {
      console.error(error);
      toast.error("Erro no servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white shadow-md rounded p-6 w-80">
        <h1 className="text-xl font-bold mb-4">Redefinir Senha</h1>

        <Input
          type="password"
          className="border w-full p-2 mb-3"
          placeholder="Digite a nova senha"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
        />

        <Input
          type="password"
          className="border w-full p-2 mb-4"
          placeholder="Confirme a nova senha"
          value={confirmSenha}
          onChange={(e) => setConfirmSenha(e.target.value)}
        />

        <Button onClick={handleReset} disabled={loading} className="w-full">
          {loading ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </div>
    </div>
  );
};

export default ResetarSenha;
