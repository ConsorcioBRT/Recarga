"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import Footer from "./Footer";
import { Separator } from "./ui/separator";

type OnibusComRecarga = {
  EqpItmId: number;
  Onibus: string;
  Situacao: string;
  Data_Operacao: string;
  UndId: number;
  PostoRecarga: string | null;
  Bateria: number | null;
  Odometro: number | null;
  Carga_kWh: number | null;
  RcgId: number | null;
};

const Historico = () => {
  const [onibus, setOnibus] = useState<OnibusComRecarga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOnibus() {
      try {
        const res = await fetch("/api/veiculos");
        const data = await res.json();
        setOnibus(data);
      } catch (error) {
        console.error("Erro ao buscar ônibus", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOnibus();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow mb-16">
        <div className="flex items-center justify-center mt-10 mb-10">
          <h1 className="text-2xl">Histórico de Recargas</h1>
        </div>
        {/* Histórico de Recargas */}
        <div className="mt-5 mx-8">
          <Table>
            <TableCaption>Lista de Recargas recentes.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Ônibus</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Eletroposto</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4}>Carregando ...</TableCell>
                </TableRow>
              ) : onibus.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>Nenhum ônibus encontrado</TableCell>
                </TableRow>
              ) : (
                onibus.map((item, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <TableRow>
                        <TableCell className="text-xs">{item.Onibus}</TableCell>
                        <TableCell className="text-xs">
                          {item.Situacao}
                        </TableCell>
                        <TableCell className="text-xs">
                          {item.PostoRecarga}
                        </TableCell>
                        <TableCell className="text-xs">
                          {item.Data_Operacao
                            ? new Date(item.Data_Operacao).toLocaleDateString(
                                "pt-BR",
                                {
                                  timeZone: "UTC",
                                }
                              )
                            : "—"}
                        </TableCell>
                      </TableRow>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm w-full rounded-xl p-6">
                      <DialogHeader>
                        <DialogTitle>
                          Resumo da Recarga - Ônibus {item.Onibus}
                          <Separator className="mt-2" />
                        </DialogTitle>

                        <div className="flex flex-col items-start gap-3">
                          <div className="flex items-center gap-10 mt-3">
                            <h1 className="bg-white  p-2 rounded-lg">
                              <strong>Ônibus:</strong> {item.Onibus}
                            </h1>
                            <h1 className="bg-white  p-2 rounded-lg">
                              <strong>Data:</strong>{" "}
                              {item.Data_Operacao
                                ? new Date(
                                    item.Data_Operacao
                                  ).toLocaleDateString("pt-BR", {
                                    timeZone: "UTC",
                                  })
                                : "—"}
                            </h1>
                          </div>
                          <h1 className="bg-white  p-2 rounded-lg">
                            <strong>Status:</strong> {item.Situacao}
                          </h1>
                          <h1 className="bg-white  p-2 rounded-lg">
                            <strong>Eletroposto:</strong> {item.PostoRecarga}
                          </h1>
                          <h1 className="bg-white  p-2 rounded-lg text-justify">
                            <strong>Bateria:</strong> {item.Bateria} %
                          </h1>
                          <h1 className="bg-white  p-2 rounded-lg text-justify">
                            <strong>Odômetro:</strong> {item.Odometro}
                          </h1>
                          <h1 className="bg-white  p-2 rounded-lg text-justify">
                            <strong>Carga Utilizada:</strong> {item.Carga_kWh}{" "}
                            kWh
                          </h1>
                        </div>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
      <Footer className="fixed bottom-0 w-full" />
    </div>
  );
};

export default Historico;
