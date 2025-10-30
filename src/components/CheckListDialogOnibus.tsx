"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

interface ChecklistAPIItem {
  PsqPrgId: number;
  Pergunta: string;
}

interface ChecklistItem {
  id: string;
  question: string;
  answer: "yes" | "no" | null;
}

interface Props {
  vehicleId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (vehicleId: string, checklist: ChecklistItem[]) => void;
}

const VeiculoDialog = ({ vehicleId, isOpen, onClose, onComplete }: Props) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen && vehicleId) {
      async function fetchChecklist() {
        try {
          const res = await fetch("/api/checklistOnibus");
          if (!res.ok) throw new Error("Erro ao buscar checklist");
          const data: ChecklistAPIItem[] = await res.json();

          const mappedChecklist: ChecklistItem[] = data.map((item) => ({
            id: item.PsqPrgId.toString(),
            question: item.Pergunta,
            answer: null,
          }));

          setChecklist(mappedChecklist);
          setCurrentStep(0);
        } catch (error) {
          console.error("Erro ao buscar checklist:", error);
          setChecklist([
            { id: "1", question: "Verificar óleo", answer: null },
            { id: "2", question: "Verificar pneus", answer: null },
            { id: "3", question: "Verificar freios", answer: null },
          ]);
          setCurrentStep(0);
        }
      }

      fetchChecklist();
    }
  }, [isOpen, vehicleId]);

  const handleAnswer = (value: "yes" | "no") => {
    setChecklist((prev) =>
      prev.map((item, index) =>
        index === currentStep ? { ...item, answer: value } : item
      )
    );
  };

  const handleNext = () => {
    if (currentStep < checklist.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (vehicleId) {
      onComplete(vehicleId, checklist); // envia checklist completo
      onClose();
    }
  };

  if (checklist.length === 0) return null;

  const currentItem = checklist[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Checklist - Ônibus {vehicleId}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-500 mb-2 text-center">
          Pergunta {currentStep + 1} de {checklist.length}
        </p>

        <div className="flex flex-col items-center gap-4">
          <span className="text-center font-medium">
            {currentItem.question}?
          </span>

          <div className="flex gap-4">
            <Button
              variant={currentItem.answer === "yes" ? "default" : "outline"}
              onClick={() => handleAnswer("yes")}
            >
              Sim
            </Button>
            <Button
              variant={currentItem.answer === "no" ? "destructive" : "outline"}
              onClick={() => handleAnswer("no")}
            >
              Não
            </Button>
          </div>

          <Button
            className="mt-4 w-full"
            onClick={handleNext}
            disabled={currentItem.answer === null} // só permite avançar se responder
          >
            {currentStep === checklist.length - 1 ? "Concluir" : "Próximo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VeiculoDialog;
