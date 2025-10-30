"use client";

import { useState } from "react";
import CheckListItemOnibus from "./CheckListItemOnibus";
import CheckListDialogOnibus from "./CheckListDialogOnibus";
import Footer from "./Footer";

const CheckListOnibus = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const veiculos = [
    { id: "6", onibusId: "1201" },
    { id: "7", onibusId: "1202" },
    { id: "8", onibusId: "1203" },
    { id: "9", onibusId: "1204" },
    { id: "10", onibusId: "1205" },
    { id: "11", onibusId: "1206" },
    { id: "12", onibusId: "20805" },
    { id: "13", onibusId: "20806" },
  ];

  const handleRespond = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    setIsDialogOpen(true);
  };

  const handleComplete = (vehicleId: string) => {
    // Aqui você faz o PUT para marcar CheckList = 1
    console.log(`Checklist concluído para o veículo ${vehicleId}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <h1 className="text-2xl text-center mt-10 mb-10">
          Checklist das Recargas
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5 px-4">
          {veiculos.map((v) => (
            <CheckListItemOnibus
              key={v.id}
              vehicle={v}
              onClick={handleRespond}
            />
          ))}
        </div>

        <CheckListDialogOnibus
          vehicleId={selectedVehicle}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onComplete={handleComplete}
        />
      </main>
      <Footer className="fixed bottom-0 w-full" />
    </div>
  );
};

export default CheckListOnibus;
