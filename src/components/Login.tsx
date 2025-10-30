"use client";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Lock, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

interface Usuario {
  UsrNme: string;
  UsrCpf: string;
  UsrEml: string;
  UsrId: number;
  UsrTpoId: number;
  UsrLgn: string;
}

type Eletroposto = {
  UndId: number;
  PostoRecarga: string;
};

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();
  const [postosUnicos, setPostosUnicos] = useState<Eletroposto[]>([]);
  const [contagem, setContagem] = useState<Record<number, number>>({});
  const [postoSelecionado, setPostoSelecionado] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [erroLogin, setErroLogin] = useState<string | null>(null);
  const [erroSelect, setErroSelect] = useState<string | null>(null);
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  const handleLogin = async () => {
    setLoading(true);
    setErroLogin(null);

    if (!postoSelecionado) {
      setErroSelect("Por favor, selecione um Eletroposto");
      setLoading(false);
      return;
    } else {
      setErroSelect(null);
    }

    try {
      // Aqui vai buscar o turno
      const turnoChecklist = await fetch("/api/turno");
      if (!turnoChecklist.ok) {
        setErroLogin("Não foi possível obter o turno atual.");
        setLoading(false);
        return;
      }
      const turnoData = await turnoChecklist.json();
      localStorage.setItem("turnoAtual", JSON.stringify(turnoData));

      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario,
          senha,
          UndId: postoSelecionado,
          DtaOpe: turnoData.DtaOpe,
          TrnId: turnoData.TrnId,
        }),
      });
      const data = await res.json();
      // Caso o backend retorne resetRequired (SttId = 8)
      if (data.resetRequired) {
        router.push(`/resetar-senha?userId=${data.userId}`); // redireciona para a tela de redefinir senha
        throw new Error(data.message || "Redefinição de senha necessária");
      }
      if (!res.ok) {
        throw new Error(data.message); // rejeita a promise
      }
      // Irá salvar o usuário no "usuarioLogado"
      const userLogged: Usuario = data.user;
      localStorage.setItem("usuarioLogado", JSON.stringify(userLogged));

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

      // Verifica se o usuário já respondeu o checklist
      if (data.jaRespondeu) {
        router.push("/abastecimento"); // já respondeu → vai direto para abastecimento
        return;
      } else {
        router.push("/checklist-eletroposto");
      }
    } catch (error) {
      console.log("Erro no login:", error);
      setErroLogin("Usuário ou senha incorretos");
    } finally {
      setLoading(false); // vai desativar o loading do botão
    }
  };

  // Irá salvar o eletroposto que o usuário escolher
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
          <Label className="text-lg font-bold">Usuário</Label>
          <div className="relative w-64">
            <Input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="h-12 w-64 bg-gray-100"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <User />
            </div>
          </div>
        </div>
        <div>
          <Label className="text-lg font-bold">Senha</Label>
          <div className="relative w-64">
            <Input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="h-12 w-64 bg-gray-100"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Lock />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-center">
          <Label className="text-lg font-bold mb-3">Eletroposto?</Label>
          <Select
            onValueChange={(value) => {
              setPostoSelecionado(Number(value));
              setErroSelect(null);
            }}
          >
            <SelectTrigger className="bg-gray-100 h-12 w-64">
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
          {erroSelect && (
            <p className="text-red-500 text-sm mt-1">{erroSelect}</p>
          )}
        </div>

        {/* Esqueci a senha */}
        {/*
        <div>
          <Link href="/esqueceu-senha">
            <span className="text-blue-500 text-sm underline">
              Esqueceu a senha?
            </span>
          </Link>
        </div>
        */}

        {erroLogin && <p className="text-red-500 text-sm mt-2">{erroLogin}</p>}

        <Button
          onClick={handleLogin}
          className="w-full h-12 mt-5 text-lg bg-gray-800"
        >
          {loading ? (
            <div className="flex justify-center items-center h-20">
              <div className="w-5 h-5 border-4 border-blue-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            "Entrar"
          )}
        </Button>
      </div>
    </div>
  );
};

export default Login;
