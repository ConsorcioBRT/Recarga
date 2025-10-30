import React, { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { DialogClose, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover } from "./ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { format } from "date-fns";
import { Camera } from "lucide-react";

{
  /* Função para Passar as Etapas de Ônibus Carregando */
}

type OnibusCarregando = {
  Onibus: string;
  RcgId?: number;
  odometroPreenchido?: boolean;
};

type FormRecargaFinal = {
  percentualFinal: string;
  odometro: string;
  energia: string;
  houveFalha: string;
  descricaoFalha?: string;
  forcarSttRcgId6?: boolean;
  DtaFin?: string;
};

type Props = {
  item: OnibusCarregando;
  finalizarRecarga: (item: OnibusCarregando, dados: FormRecargaFinal) => void;
  reiniciarRecarga?: boolean;
};

const DialogStepsCarregando: React.FC<Props> = ({ item, finalizarRecarga }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormRecargaFinal>({
    percentualFinal: "",
    odometro: "",
    energia: "",
    houveFalha: "",
    descricaoFalha: "",
  });
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  // 🔹 Busca dados do localStorage (igual ao enviarRecargaInicial)
  function pegarDadosDoLocalStorage() {
    const eletropostoJson = localStorage.getItem("veiculoSelecionado");
    const eletroposto = eletropostoJson ? JSON.parse(eletropostoJson) : null;
    const undId = eletroposto?.UndId ?? null;

    const veiculoJson = localStorage.getItem("veiculoSelecionado");
    const veiculo = veiculoJson ? JSON.parse(veiculoJson) : null;
    const vclId = veiculo?.EqpItmId ?? null;

    const recargaJson = localStorage.getItem("veiculoSelecionado");
    const recarga = recargaJson ? JSON.parse(recargaJson) : null;
    const recargaId = recarga?.RcgId ?? null;
    const dtaIni = new Date().toISOString();

    return { recargaId, undId, vclId, dtaIni };
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  async function uploadFoto(file: File) {
    if (!file) return;
    const { recargaId, undId, vclId, dtaIni } = pegarDadosDoLocalStorage();
    if (!recargaId || !undId || !vclId) {
      console.error("Faltam dados para montar o nome do arquivo.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("recargaId", recargaId);
    formData.append("undId", undId);
    formData.append("vclId", vclId);
    formData.append("dtaIni", dtaIni);

    try {
      const res = await fetch("https://brtgo.com.br/energia.php", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Arquivo enviado:", data.url);
      } else {
        console.error("Erro no upload:", data.error);
      }
    } catch (err) {
      console.error("Erro no fetch:", err);
    }
  }

  // Aqui vai salvar sempre o formData quando mudar
  useEffect(() => {
    localStorage.setItem("formDataConfirmacao", JSON.stringify(formData));
  }, [formData]);

  // 🔹 Função para formatar a data no fuso local (Brasília)
  function formatarDataLocal(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`;
  }

  const handleProximo = () => {
    // Step 1 - Percentual
    if (step === 1 && !formData.percentualFinal) {
      return alert("Preencha o percentual");
    }

    // Step 1 - Energia utilizada
    if (step === 1 && !formData.energia) {
      return alert("Preencha a energia utilizada");
    }
    setStep(step + 1);
  };

  return (
    <div className="grid gap-4 mt-6">
      {/* STEP 1: Percentual Final */}
      {step === 1 && (
        <div className="grid gap-3">
          <Label>Percentual Final (%)</Label>
          <Input
            type="number"
            value={formData.percentualFinal}
            onChange={(e) => {
              const value = e.target.value;
              if (
                value === "" ||
                (Number(value) >= 0 && Number(value) <= 100)
              ) {
                setFormData((prev) => ({ ...prev, percentualFinal: value }));
              }
            }}
            className="bg-white"
          />
          <Label>Energia Utilizada (kWh)</Label>
          <Input
            type="text"
            value={formData.energia}
            onChange={(e) => {
              let value = e.target.value.replace(/[^\d,]/g, "");
              // Garante que só haja uma vírgula
              const [inteiro, decimal] = value.split(",");
              value = inteiro + (decimal !== undefined ? "," + decimal : "");
              setFormData((prev) => ({ ...prev, energia: value }));
            }}
            className="bg-white"
          />
          <div className="flex items-center mt-5 mb-5 justify-center gap-3 p-2 rounded-sm relative">
            <Label
              htmlFor="fotoEnergia"
              className="flex items-center gap-2 text-white bg-yellow-500 p-4 rounded-lg"
            >
              <Camera className="w-4 h-4" />
              Registrar Energia (kWh)
            </Label>
            <Input
              id="fotoEnergia"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFotoChange}
            />
          </div>
          {fotoPreview && (
            <div className="mt-2">
              <p className="text-xs">Pré-visualização:</p>
              <img
                src={fotoPreview}
                alt="Foto do odômetro"
                className="w-32 h-auto"
              />
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Calendário */}
      {step === 2 && (
        <div className="grid gap-3">
          <Label>Dia da Finalização:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                {date ? format(date, "dd/MM/yyyy") : "Selecione uma data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (!d) return;
                  const novaData = new Date(d);
                  if (date) {
                    novaData.setHours(date.getHours());
                    novaData.setMinutes(date.getMinutes());
                  }
                  setDate(novaData);
                }}
              />
            </PopoverContent>
          </Popover>
          <Label>Hora da Finalização:</Label>
          <Input
            type="time"
            value={
              date
                ? `${String(date.getHours()).padStart(2, "0")}:${String(
                    date.getMinutes()
                  ).padStart(2, "0")}`
                : ""
            }
            onChange={(e) => {
              if (!date) return;
              const [h, m] = e.target.value.split(":").map(Number);
              const novaData = new Date(date);
              novaData.setHours(h);
              novaData.setMinutes(m);
              setDate(novaData);
            }}
            className="p-2 border rounded bg-white w-full"
          />
        </div>
      )}

      {/* STEP 3: Falhas */}
      {step === 3 && (
        <div className="grid gap-3">
          <Label>Houve Falhas?</Label>
          <Select
            value={formData.houveFalha}
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, houveFalha: val }))
            }
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
            </SelectContent>
          </Select>

          {formData.houveFalha === "sim" && (
            <>
              <Label>Descrição</Label>
              <Textarea
                value={formData.descricaoFalha}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    descricaoFalha: e.target.value,
                  }))
                }
                className="bg-white"
              />
            </>
          )}
        </div>
      )}

      {/* Footer: Navegação entre Steps */}
      <DialogFooter>
        <div className="flex items-center justify-between mt-4 gap-4">
          {step > 1 ? (
            <Button
              variant="outline"
              className="w-full h-14"
              onClick={() => setStep(step - 1)}
            >
              Voltar
            </Button>
          ) : (
            <DialogClose asChild>
              <Button variant="outline" className="w-full h-14">
                Cancelar
              </Button>
            </DialogClose>
          )}

          {step < 3 ? (
            <Button
              className="w-full h-14 bg-gray-900 text-lg font-bold"
              onClick={handleProximo}
            >
              Próximo
            </Button>
          ) : (
            <div className="flex gap-4 w-full">
              {formData.houveFalha === "sim" && (
                <DialogClose asChild>
                  {/* Botão de Reiniciar */}
                  <Button
                    onClick={async () => {
                      if (!date)
                        return alert("Selecione o Dia e Hora da finalização!");
                      // Envia a foto
                      if (fotoFile) {
                        await uploadFoto(fotoFile);
                      }
                      // Vai chamar a função do Finalizar
                      const payload: FormRecargaFinal = {
                        ...formData,
                        energia: formData.energia.replace(",", "."),
                        DtaFin: date ? formatarDataLocal(date) : undefined,
                        houveFalha: "sim",
                        descricaoFalha:
                          formData.descricaoFalha || "Reinício de recarga",
                      };

                      finalizarRecarga(item, payload);
                    }}
                    className="flex-1 h-14 bg-red-500 text-lg font-bold"
                  >
                    Reiniciar
                  </Button>
                </DialogClose>
              )}

              {/* Botão de Finalizar */}
              <DialogClose asChild>
                <Button
                  onClick={async () => {
                    if (!date)
                      return alert("Selecione o Dia e Hora da finalização!");
                    // Envia a foto
                    if (fotoFile) {
                      await uploadFoto(fotoFile);
                    }

                    finalizarRecarga(item, {
                      ...formData,
                      energia: formData.energia.replace(",", "."),
                      DtaFin: date ? formatarDataLocal(date) : undefined,
                      forcarSttRcgId6: true,
                    });
                  }}
                  disabled={!["sim", "nao"].includes(formData.houveFalha)}
                  className={`w-full h-14 text-lg font-bold ${
                    !["sim", "nao"].includes(formData.houveFalha)
                      ? "bg-gray-400 text-black cursor-not-allowed"
                      : "bg-yellow-500"
                  }`}
                >
                  Finalizar
                </Button>
              </DialogClose>
            </div>
          )}
        </div>
      </DialogFooter>
    </div>
  );
};

export default DialogStepsCarregando;
