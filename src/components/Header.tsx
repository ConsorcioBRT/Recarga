import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LogOut, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Usuario {
  UsrNme: string;
  UsrCpf: string;
  UsrEml: string;
  UsrId: number;
  UsrTpoId: number;
}

interface Veiculo {
  EqpItmId: number;
  Onibus: string;
  Situacao: string;
  Data_Operacao: string;
  UndId: number;
  PostoRecarga: string;
  Bateria: number;
  Odometro: number;
  Carga_kWh: number;
  Capacidade_Termica: number;
}

type EletropostoSelecionado = {
  UndId: number;
  PostoRecarga: string;
  Contagem: number;
};

const Header = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [eletroposto, setEletroposto] = useState<EletropostoSelecionado | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("usuarioLogado");
    if (userData) {
      setUsuario(JSON.parse(userData));
    }
    const posto = localStorage.getItem("eletropostoSelecionado");
    if (posto) {
      setEletroposto(JSON.parse(posto));
    }
  }, []);

  const handleLogout = async () => {
    // Aqui vai pegar o Veículo da api
    const response = await fetch("/api/veiculos");
    const onibus: Veiculo[] = await response.json();

    // Vai verificar se tem recarga iniciada
    const recargaAberta = onibus.some(
      (v: Veiculo) => v.Situacao === "INICIADA"
    );

    // Se caso houver recarga iniciada, vai mostrar um aviso
    if (recargaAberta) {
      // Mostra o toast e espera o clique no botão
      toast.custom((t) => (
        <div className="bg-white text-black p-4 rounded shadow-lg flex flex-col gap-2">
          <div className="flex flex-col items-center justify-center mb-5">
            <span className="text-sm">Ainda possui recargas em aberto!</span>
            <span className="text-gray-600 text-sm">Deseja sair?</span>
          </div>
          <div className="flex justify-between gap-2 px-10">
            <button
              className="bg-gray-300 text-black px-4 py-2 rounded font-bold"
              onClick={() => {
                toast.dismiss(t.id);
              }}
            >
              Não
            </button>
            <button
              className="bg-gray-800 text-white px-4 py-2 rounded font-bold"
              onClick={async () => {
                toast.dismiss(t.id); // fecha o toast
                // Executa o logout após o clique
                await fetch("/api/logout");
                localStorage.removeItem("formDataConfirmacao");
                localStorage.removeItem("usuarioLogado");
                localStorage.removeItem("eletropostoSelecionado");
                localStorage.removeItem("veiculoSelecionado");
                localStorage.removeItem("turnoAtual");
                router.push("/");
              }}
            >
              Sim
            </button>
          </div>
        </div>
      ));
      return; // impede que o logout continue até o clique
    }

    try {
      await fetch("/api/logout"); // chama a api para apagar o cookie
      localStorage.removeItem("formDataConfirmacao"); // Vai limpar o Confirmação do localStorage
      localStorage.removeItem("usuarioLogado"); // Vai limpar o Usuários do localStorage
      localStorage.removeItem("eletropostoSelecionado"); // Vai limpar o Eletroposto do localStorage
      localStorage.removeItem("veiculoSelecionado"); // Vai limpar o Veículo do localStorage
      localStorage.removeItem("turnoAtual"); // Vai limpar o Turno do localStorage
      router.push("/");
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  };

  return (
    <div className="w-full bg-gray-800 rounded-b-3xl shadow-md p-5 flex flex-col items-start hover:shadow-lg transition">
      <div className="flex items-center justify-between gap-28">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{usuario?.UsrNme?.[0] ?? "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-base text-white">
              {usuario?.UsrNme ?? "Usuário"}
            </span>
            {eletroposto && (
              <span className="text-sm text-white flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {eletroposto.PostoRecarga}
              </span>
            )}
          </div>
        </div>
        <div>
          <LogOut onClick={handleLogout} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default Header;
