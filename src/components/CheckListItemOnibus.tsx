"use client";

import React from "react";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";

interface Vehicle {
  id: string;
  onibusId: string;
  answered?: boolean; // depois você vai buscar do banco
}

interface Props {
  vehicle: Vehicle;
  onClick: (vehicleId: string) => void;
}

const VeiculoCheckListItem = ({ vehicle, onClick }: Props) => {
  return (
    <Button
      variant="ghost"
      onClick={() => onClick(vehicle.onibusId)}
      className="w-full h-1 p-4 justify-between bg-card border border-border hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center justify-between w-full">
        {/* ID arredondado */}
        <div className="flex-shrink-0 w-16 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-sm font-semibold text-white">
            {vehicle.onibusId}
          </span>
        </div>

        {/* Texto central */}
        <div className="flex-1 px-4">
          <span className="text-sm font-medium text-foreground">
            Responder Checklist
          </span>
        </div>

        {/* Status */}
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
          {vehicle.answered ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <X className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>
    </Button>
  );
};

export default VeiculoCheckListItem;
