"use client";
import { useContext, useEffect } from "react";
import DfnsConnectContext from "./DfnsConnectContext";
import { MessageParentActionPayload, MessageParentActions } from ".";

export const useDfnsConnect = (
  onParentAction?: (
    parentAction: MessageParentActions,
    payload: MessageParentActionPayload
  ) => void
) => {
  const context = useContext(DfnsConnectContext);

  if (context === null) {
    throw new Error("useDfnsConnect must be used within DfnsConnectProvider");
  }

  useEffect(() => {
    if (!!context?.requiredActionName && onParentAction) {
      onParentAction(
        context?.requiredActionName as MessageParentActions,
        context?.requiredActionPayload
      );
    }
  }, [
    context?.requiredActionName,
    context?.requiredActionPayload,
    context?.signedTransaction,
    context?.requiredActionId,
    onParentAction,
  ]);

  return context;
};

export default useDfnsConnect;
