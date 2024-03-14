import { UserAuthKind } from "@dfns/sdk/codegen/datamodel/Auth";
import { MessageActions, MessagePayload } from "../hooks/useDfns";
import { useState } from "react";

// Note:
// create user init (requires service account)
// this code calls APIs in node in this nextjs instance
// calls that require private data to instantiate
// which we don't want exposed in the client

interface ServerRequestsProps {
  sendMessageToDfns: ({}: MessagePayload) => void;
}
export const useServerRequests = ({
  sendMessageToDfns,
}: ServerRequestsProps) => {
  const [errorMessage, setErrorMessage] = useState("");

  const createNewUser = async (userName: string) => {
    setErrorMessage("");
    try {
      if (!userName) {
        throw new Error("Username not set");
      }
      // Note: this nextjs instance has server-side code
      const response = await fetch("/api/register/init", {
        method: "POST",
        body: JSON.stringify({
          email: userName,
          kind: UserAuthKind.EndUser,
        }),
      });
      const challenge = await response.json();

      if (!!challenge.error) {
        throw new Error(challenge.error);
      }
      sendMessageToDfns({
        action: MessageActions.registerAuth,
        userName,
        challenge,
      } as MessagePayload);
    } catch (e) {
      console.error("server createNewUser error:", e);
      setErrorMessage(String(e));
      throw new Error(String(e));
    }
  };

  return {
    createNewUser,
    errorMessage,
  };
};
