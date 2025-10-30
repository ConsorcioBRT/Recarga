"use client";

import dynamic from "next/dynamic";
import React from "react";

const ResetarSenha = dynamic(() => import("@/src/components/ResetarSenha"), {
  ssr: false,
});

const RestarSenhaPage = () => {
  return (
    <div>
      <ResetarSenha />
    </div>
  );
};

export default RestarSenhaPage;
