"use client";

import { Label } from "@radix-ui/react-label";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Button } from "./ui/button";
import Header from "./Header";
import { useRouter } from "next/navigation";

type Eletroposto = {
  UndId: number;
  PostoRecarga: string;
};

const Home = () => {
  const [postosUnicos, setPostosUnicos] = useState<Eletroposto[]>([]);
  const [contagem, setContagem] = useState<Record<number, number>>({});
  const [postoSelecionado, setPostoSelecionado] = useState<number | null>(null);
  const router = useRouter();
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  useEffect(() => {
    async function fetchConsorciadas() {
      try {
        const res = await fetch(`/api/eletroposto`);
        if (!res.ok) {
          throw new Error("Erro ao buscar consorciadas");
        }
        const data: Eletroposto[] = await res.json();

        // Vai calcular a contagem e criar uma lista única
        const counts: Record<number, number> = {};
        const map = new Map<number, Eletroposto>();

        data.forEach((item) => {
          const id = item.UndId;
          counts[id] = (counts[id] || 0) + 1;
          // salva a primeira ocorrência para usar o nome no select
          if (!map.has(id)) map.set(id, item);
        });

        setPostosUnicos(Array.from(map.values()));
        setContagem(counts);
      } catch (error) {
        console.error("Erro:", error);
      }
    }

    fetchConsorciadas();
  }, [baseUrl]);

  // Função para salvar e navegar
  const handleProximo = () => {
    if (!postoSelecionado) {
      alert("Por favor, selecione um Eletroposto");
      return;
    }

    const posto = postosUnicos.find((p) => p.UndId === postoSelecionado);
    const qtd = contagem[postoSelecionado] || 0;

    // Irá salvar no LocalStorage
    localStorage.setItem(
      "eletropostoSelecionado",
      JSON.stringify({
        UndId: postoSelecionado,
        PostoRecarga: posto?.PostoRecarga ?? "",
        Contagem: qtd,
      })
    );
    router.push("/abastecimento");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Texto seja bem-vindo */}
      <Header />
      <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl p-8 mt-40">
        <div className="flex flex-col items-start justify-center">
          <Label className="text-xl mb-3">Qual o seu Eletroposto?</Label>
          <Select onValueChange={(value) => setPostoSelecionado(Number(value))}>
            <SelectTrigger className="bg-white h-14 w-72 mb-10">
              <SelectValue placeholder="Eletropostos" />
            </SelectTrigger>
            <SelectContent>
              {postosUnicos.map((ele) => (
                <SelectItem key={ele.UndId} value={String(ele.UndId)}>
                  {ele.PostoRecarga}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          className="h-14 w-72 text-lg bg-gray-800"
          onClick={handleProximo}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
};

export default Home;
