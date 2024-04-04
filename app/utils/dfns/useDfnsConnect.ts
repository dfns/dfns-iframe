"use client";
import { useContext } from "react";
import DfnsConnectContext from "@/app/utils/dfns/DfnsConnectContext";

export const useDfnsConnect = () => {
  const context = useContext(DfnsConnectContext);

  if (context === null) {
    throw new Error("useDfnsConnect must be used within DfnsConnectProvider");
  }

  return context;
};

export default useDfnsConnect;
