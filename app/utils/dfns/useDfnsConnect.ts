"use client";
import { useContext, useEffect } from "react";
import DfnsConnectContext from "@/app/utils/dfns/DfnsConnectContext";
import { MessageParentActions } from "@/app/utils/dfns/types";

export const useDfnsConnect = (
  onParentAction: (parentAction: MessageParentActions) => void
) => {
  const context = useContext(DfnsConnectContext);

  if (context === null) {
    throw new Error("useDfnsConnect must be used within DfnsConnectProvider");
  }

  useEffect(() => {
    if (!!context?.requiredActionName && onParentAction) {
      onParentAction(context?.requiredActionName as MessageParentActions);
    }
  }, [context?.requiredActionName, onParentAction]);

  return context;
};

export default useDfnsConnect;
