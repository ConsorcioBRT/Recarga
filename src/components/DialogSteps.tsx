import React, { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Battery, Camera, Fuel, Gauge, PlugZap } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DialogClose, DialogFooter } from "./ui/dialog";

{
  /* Função para Passar as Etapas de Ônibus Livres */
}

const conectores = ["1", "2", "ambos"];

type DadosOnibus = {
  RcgIdOrg: number;
  EqpItmId: number;
  Onibus: string;
  Situacao: string;
  Data_Operacao: string | null;
  UndId: number | null;
  PostoRecarga: string | null;
  Bateria: number | null;
  Odometro: number | null;
  Carga_kWh: number | null;
  Capacidade_Tecnica: number;
};

type Carregador = {
  UndId: number;
  EqpItmId: number;
  Carregador: string;
};

const DialogSteps = ({
  veiculo,
  iniciarCarregamento,
}: {
  veiculo: { Onibus: string };
  iniciarCarregamento: (v: { Onibus: string }) => void;
}) => {
  const [step, setStep] = useState(1);
  const [conectorSelecionado] = useState<string | null>(null);
  /* const [setOdometro] = useState(""); */
  const [formData, setFormData] = useState({
    carregador: null as number | null,
    conector: null as string | null,
    percentualInicial: "",
    odometro: "",
    odometroConfirme: "",
  });
  const [carregadores, setCarregadores] = useState<Carregador[]>([]);
  const [formConfirmacao, setFormConfirmacao] = useState<
    typeof formData | null
  >(null);
  const carregadorSelecionado = carregadores.find(
    (c) => c.EqpItmId === formData.carregador
  );
  const [dadosOnibus, setDadosOnibus] = useState<DadosOnibus | null>(null);
  const [erroOdometro, setErroOdometro] = useState<string | null>(null);
  const odometroMaiorOuIgual =
    Number(formData.odometro) >= (dadosOnibus?.Odometro ?? 0);

  const odometroValido = formData.odometro === formData.odometroConfirme;
  const [erroOdometroConfirme, setErroOdometroConfirme] = useState<
    string | null
  >(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [formDataValues] = useState({
    recargaId: "",
    undId: "",
    vclId: "",
    dtaIni: "",
  });

  const [fotoFile, setFotoFile] = useState<File | null>(null);

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));

    uploadFoto(file);
  }

  async function uploadFoto(file: File) {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("recargaId", formDataValues.recargaId);
    formData.append("undId", formDataValues.undId);
    formData.append("vclId", formDataValues.vclId);
    formData.append("dtaIni", formDataValues.dtaIni);

    try {
      const res = await fetch("https://brtgo.com.br/upload.php", {
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

  useEffect(() => {
    if (step === 4) {
      const dados = localStorage.getItem("formDataConfirmacao");
      if (dados) {
        const parsed = JSON.parse(dados);
        setFormConfirmacao(parsed);
      }
    }
  }, [step]);

  useEffect(() => {
    if (step === 3) {
      const veiculoJson = localStorage.getItem("veiculoSelecionado");
      const veiculo = veiculoJson ? JSON.parse(veiculoJson) : null;
      const eqpItmId = veiculo?.EqpItmId ?? null;

      if (eqpItmId) {
        fetch(`/api/veiculos?EqpItmId=${eqpItmId}`)
          .then((r) => r.json())
          .then((data: DadosOnibus[]) => {
            if (data.length > 0) {
              setDadosOnibus(data[0]);
            }
          })
          .catch(console.error);
      }
    }
  }, [step]);

  useEffect(() => {
    const eletropostoJson = localStorage.getItem("eletropostoSelecionado");
    const eletroposto = eletropostoJson ? JSON.parse(eletropostoJson) : null;
    const UndId = eletroposto?.UndId;
    if (!UndId) return;

    fetch(`/api/carregadores?undId=${UndId}`)
      .then((r) => r.json())
      .then((data: Carregador[]) => {
        setCarregadores(data.filter((c) => c && c.EqpItmId != null));
      })
      .catch(console.error);
  }, []);

  // Aqui irá gerar o botões baseado nos carregadores
  const botoes = carregadores;

  function pegarDadosDoLocalStorage() {
    // Aqui irá pegar unidade
    const eletropostoJson = localStorage.getItem("eletropostoSelecionado");
    const eletroposto = eletropostoJson ? JSON.parse(eletropostoJson) : null;
    const UndId = eletroposto?.UndId ?? null;

    // pegar veículo que você deve salvar antes no localStorage na chave "veiculoSelecionado"
    const veiculoJson = localStorage.getItem("veiculoSelecionado");
    const veiculo = veiculoJson ? JSON.parse(veiculoJson) : null;
    const VclId = veiculo?.EqpItmId ?? null;

    // pegar usuário logado
    const usuarioJson = localStorage.getItem("usuarioLogado");
    const usuario = usuarioJson ? JSON.parse(usuarioJson) : null;
    const UsrIdAlt = usuario?.UsrId ?? null;

    return { UndId, VclId, UsrIdAlt };
  }

  type RecargaPayload = {
    UndId: number;
    VclId: number;
    CrrId: number | null;
    CrrCnc: number;
    DtaIni: string;
    DtaOpe: string;
    SocIni: number;
    UsrIdAlt: number;
    RcgIdOrg: number | null;
    EmpId: number;
    SttRcgId: number;
    SttId: number;
    SttIdChk: number;
    OdoIni?: number | null;
    OdoFin?: number | null;
  };

  // 🔹 Função para formatar a data no fuso local (Brasília)
  function formatarDataLocal(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`;
  }

  async function enviarRecargaInicial(
    formData: {
      carregador: number | null;
      conector: string | null;
      percentualInicial: string;
      odometro: string;
      odometroConfirme: string;
    },
    fotoFile?: File | null
  ) {
    try {
      // Pegando valores do localStorage
      const { UndId, VclId, UsrIdAlt } = pegarDadosDoLocalStorage();

      if (!UndId || !VclId || !UsrIdAlt) {
        console.error("Faltam dados no localStorage: UndId, VclId ou UsrIdAlt");
        return;
      }

      // Aqui vai buscar a última recarga do veículo
      const ultimaRecargaResp = await fetch(
        `/api/recarga/ultima?VclId=${VclId}`
      );
      const ultimaRecarga = ultimaRecargaResp.ok
        ? await ultimaRecargaResp.json()
        : null;

      // Data atual para DtaIni e DtaOpe
      const agora = new Date();
      const dataFormatada = formatarDataLocal(agora);

      const odometroValor = Number(formData.odometro.replace(/\./g, ""));

      // Montar dados para enviar
      const dadosParaEnviar: RecargaPayload = {
        UndId,
        VclId: Number(VclId),
        CrrId: formData.carregador,
        CrrCnc: formData.conector === "ambos" ? 0 : Number(formData.conector),
        DtaIni: dataFormatada,
        DtaOpe: dataFormatada,
        SocIni: Number(formData.percentualInicial),
        UsrIdAlt,
        RcgIdOrg: null,
        EmpId: 1,
        SttRcgId: 5,
        SttId: 1,
        SttIdChk: 0,
      };

      if (!ultimaRecarga) {
        // Se for a primeira vez, o OdoIni será nulo e o OdoFin recebe o valor informado
        dadosParaEnviar.OdoIni = null;
        dadosParaEnviar.OdoFin = odometroValor;
      } else if (ultimaRecarga.SttRcgId === 7) {
        dadosParaEnviar.OdoIni =
          ultimaRecarga.OdoFin ?? ultimaRecarga.OdoIni ?? null;
        dadosParaEnviar.OdoFin = odometroValor;
        dadosParaEnviar.RcgIdOrg = ultimaRecarga.RcgId;
      } else {
        // Aqui será a recarga normal
        dadosParaEnviar.OdoIni = ultimaRecarga.OdoFin ?? null;
        dadosParaEnviar.OdoFin = odometroValor;
      }

      console.log("Dados enviados para a API:", dadosParaEnviar);

      const resposta = await fetch("/api/recarga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosParaEnviar),
      });

      if (!resposta.ok) {
        const erro = await resposta.json();
        console.error(
          "Erro ao salvar recarga: " + (erro.error || JSON.stringify(erro))
        );
        return;
      }

      const dadosResposta = await resposta.json();
      console.log(`Recarga Iniciada! ID: ${dadosResposta.RcgId}`);

      // 2º Se tiver foto, envia para a API de upload
      if (fotoFile) {
        const formDataFoto = new FormData();
        formDataFoto.append("file", fotoFile);
        formDataFoto.append("recargaId", dadosResposta.RcgId); // opcional para vincular no back
        formDataFoto.append("undId", UndId.toString());
        formDataFoto.append("vclId", VclId.toString());
        formDataFoto.append("dtaIni", dadosResposta.DtaIni); // ou dataFormatada

        const uploadResp = await fetch("https://brtgo.com.br/upload.php", {
          method: "POST",
          body: formDataFoto,
        });

        if (!uploadResp.ok) {
          const erroUpload = await uploadResp.json();
          console.error("Erro ao enviar foto: " + (erroUpload.error || "erro"));
        } else {
          const fotoData = await uploadResp.json();
          console.log("Foto salva em:", fotoData.url);
        }
      }

      iniciarCarregamento(veiculo);
    } catch (error) {
      console.error("Erro ao enviar recarga: " + (error as Error).message);
    }
  }

  return (
    // Aqui onde irá fazer todo a parte do front-end, onde vai apenas chamar lá em cima, no primeiro Return
    <>
      <div className="grid gap-4 mt-6">
        {step === 1 && (
          <div className="flex flex-col gap-3">
            <Label className="flex items-center gap-2">
              <Fuel className="w-4 h-4" />
              Escolha um Carregador:
            </Label>
            <div className="grid grid-cols-5 gap-20">
              {botoes
                .filter(
                  (item): item is Carregador => !!item && item.EqpItmId != null
                )
                .map((item) => (
                  <Button
                    key={item.EqpItmId}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        carregador: item.EqpItmId,
                      }))
                    }
                    className={`inline-flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl h-20 w-20 bg-white text-black ${
                      formData.carregador === item.EqpItmId
                        ? "bg-gray-500 text-white"
                        : "bg-white"
                    }`}
                  >
                    {item.Carregador}
                  </Button>
                ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3">
            <Label className="flex items-center gap-2">
              <PlugZap />
              Escolha um Conector:
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {conectores.map((conector) => (
                <Button
                  key={conector}
                  onClick={() => setFormData((prev) => ({ ...prev, conector }))}
                  className={`inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl h-16 w-16  ${
                    conectorSelecionado === conector
                      ? "bg-gray-500 text-white"
                      : "bg-white text-black hover:text-white"
                  }`}
                >
                  {conector}
                </Button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <>
            {dadosOnibus && (
              <div className="p-4 border rounded shadow mb-4 bg-white">
                <h2 className="text-lg font-bold mb-2">Última recarga</h2>
                <p>
                  <strong className="text-xs">Data:</strong>{" "}
                  {dadosOnibus.Data_Operacao
                    ? new Date(dadosOnibus.Data_Operacao).toLocaleDateString(
                        "pt-BR",
                        {
                          timeZone: "UTC",
                        }
                      )
                    : "—"}
                </p>
                <p>
                  <strong className="text-xs">Unidade:</strong>{" "}
                  {dadosOnibus.PostoRecarga ?? "—"}
                </p>
                <p>
                  <strong className="text-xs">Soc Final:</strong>{" "}
                  {dadosOnibus.Bateria ?? "—"}%
                </p>
                <p>
                  <strong className="text-xs">Odômetro Final:</strong>{" "}
                  {dadosOnibus.Odometro ?? "—"} km
                </p>
                <p>
                  <strong className="text-xs">Total Kwh:</strong>{" "}
                  {dadosOnibus.Carga_kWh ?? "—"} kwh
                </p>
              </div>
            )}
            <div className="grid gap-3">
              <Label className="flex items-center gap-2">
                <Battery className="w-4 h-4" />
                Percentual Inicial (%):
              </Label>
              <Input
                id="percentual"
                type="number"
                inputMode="numeric"
                value={formData.percentualInicial} // aqui irá ser o final e quando reiniciar ele passa a ser inicial
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0 && value <= 100) {
                    setFormData((prev) => ({
                      ...prev,
                      percentualInicial: e.target.value,
                    }));
                  }
                }}
                className="bg-white"
              />
            </div>
            <div className="grid gap-3">
              <Label className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Odômetro (km):
              </Label>
              <Input
                id="odometro"
                type="text"
                inputMode="numeric"
                value={formData.odometro}
                onChange={(e) => {
                  const apenasNumeros = e.target.value.replace(/\D/g, "");
                  setFormData((prev) => ({
                    ...prev,
                    odometro: apenasNumeros,
                  }));
                }}
                onBlur={() => {
                  const valorNumerico = Number(formData.odometro);
                  const anterior = dadosOnibus?.Odometro ?? 0;

                  if (!isNaN(valorNumerico) && valorNumerico < anterior) {
                    setErroOdometro(
                      `O odômetro não pode ser menor que o anterior (${anterior} km)`
                    );
                  } else {
                    setErroOdometro(null);
                  }
                }}
                placeholder="0"
                className="bg-white"
              />
              {erroOdometro && (
                <p className="text-red-600 text-sm mt-1">{erroOdometro}</p>
              )}
            </div>
            <div className="grid gap-3">
              <Label className="flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Confirme o Odômetro (km):
              </Label>
              <Input
                id="odometroConfirme"
                type="text"
                inputMode="numeric"
                value={formData.odometroConfirme}
                onChange={(e) => {
                  const apenasNumeros = e.target.value.replace(/\D/g, "");
                  setFormData((prev) => ({
                    ...prev,
                    odometroConfirme: apenasNumeros,
                  }));
                }}
                onBlur={() => {
                  if (formData.odometroConfirme !== formData.odometro) {
                    setErroOdometroConfirme("Os odômetros devem ser iguais");
                  } else {
                    setErroOdometroConfirme(null);
                  }
                }}
                placeholder="0"
                className="bg-white"
              />
              {erroOdometroConfirme && (
                <p className="text-red-600 text-sm mt-1">
                  {erroOdometroConfirme}
                </p>
              )}
            </div>
            <div className="flex items-center mt-5 mb-5 justify-center gap-3 p-2 rounded-sm relative">
              <Label
                htmlFor="fotoOdometro"
                className="flex items-center gap-2 text-white bg-blue-500 p-4 rounded-lg"
              >
                <Camera className="w-4 h-4" />
                Registrar Odômetro
              </Label>
              <Input
                id="fotoOdometro"
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
          </>
        )}

        {step === 4 && formConfirmacao && (
          <div className="p-4 border rounded shadow">
            <h2 className="text-lg font-bold mb-4">Confirme os dados:</h2>
            <p>
              <strong>Carregador:</strong>{" "}
              {carregadorSelecionado ? carregadorSelecionado.Carregador : "N/A"}
            </p>
            <p>
              <strong>Conector:</strong> {formConfirmacao.conector}
            </p>
            <p>
              <strong>Percentual Inicial:</strong>{" "}
              {formConfirmacao.percentualInicial} %
            </p>
            <p>
              <strong>Odômetro:</strong> {formConfirmacao.odometro} km
            </p>
          </div>
        )}
      </div>

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

          {step < 4 ? (
            <Button
              type="button"
              className="w-full h-14 bg-green-500 text-lg font-bold"
              disabled={!odometroValido}
              onClick={() => {
                if (step === 1 && !formData.carregador) {
                  alert("Selecione um carregador.");
                  return;
                }
                if (step === 2 && !formData.conector) {
                  alert("Selecione um conector.");
                  return;
                }
                if (step === 3) {
                  if (!odometroMaiorOuIgual) {
                    alert(
                      `O odômetro atual ${
                        formData.odometro
                      } é menor que o anterior ${
                        dadosOnibus?.Odometro ?? 0
                      }. Verifique`
                    );
                  }
                  // Salva os dados no localStorage antes de ir para step 4
                  localStorage.setItem(
                    "formDataConfirmacao",
                    JSON.stringify(formData)
                  );
                }
                setStep(step + 1);
              }}
            >
              Próximo
            </Button>
          ) : (
            // Botão Carregar na step 4
            <DialogClose asChild>
              <Button
                type="submit"
                onClick={() => {
                  if (!formConfirmacao) {
                    alert("Nenhum dado para enviar");
                    return;
                  }
                  enviarRecargaInicial(formConfirmacao, fotoFile);
                }}
                className="w-full h-14 bg-green-500 text-lg font-bold"
              >
                Iniciar
              </Button>
            </DialogClose>
          )}
        </div>
      </DialogFooter>
    </>
  );
};

export default DialogSteps;
