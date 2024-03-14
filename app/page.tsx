"use client";

import { useState, useRef, useEffect } from "react";
import { parseUnits, Transaction } from "ethers";

import {
  useDfns,
  MessageActions,
  IframeActiveState,
} from "@/app/hooks/useDfns";
import { useServerRequests } from "@/app/hooks/useServerRequests";
import { DfnsIframe } from "@/app/components/DfnsIframe";

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [userName] = useState("rod+local9224@dfns.co");

  const iframeRef = useRef(null);

  const {
    login,
    logout,
    isDfnsReady,
    onIframeLoaded,
    userAuthToken,
    sendMessageToDfns,
    userWallets,
    messageErrors,
  } = useDfns({
    iframeRef,
    userName,
    initialInterfaceState: IframeActiveState.createUserAndWallet,
  });

  const { createNewUser, errorMessage } = useServerRequests({
    sendMessageToDfns,
  });

  const sendTransaction = (walletId: string, address: string) => {
    const tx = {
      to: "0xa238b6008Bc2FBd9E386A5d4784511980cE504Cd",
      value: "1",
      gasLimit: "21000",
      maxPriorityFeePerGas: "50000000000",
      maxFeePerGas: "20000000000",
      nonce: 3,
      type: 2,
      chainId: 11155111,
    };

    console.log("send transaction payload", { tx });
    console.log("send transactions to address", address);

    sendMessageToDfns({
      action: MessageActions.doCreateWalletSignature,
      walletId,
      transaction: tx,
      kind: "Transaction",
    });
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;
  return (
    <main className="min-h-screen bg-[#CCC] text-[black] p-4 max-w-[90hw] flex flex-col ">
      <h1 className="my-3 text-xl">Example website with Dfns iframe</h1>
      {!!errorMessage && (
        <div>
          <div>errorMessages: {errorMessage}</div>

          <div>messageErrors: {messageErrors}</div>
        </div>
      )}
      <h4 className="py-1 text-sm">
        iframe status: {isDfnsReady ? "ready" : "not ready"}
      </h4>
      <h4 className="py-1 text-sm">
        userAuthToken: {!!userAuthToken ? "set" : "not set"} in iframe and
        iframe parent
      </h4>
      <h2>userName: {userName}</h2>
      <div className="flex gap-2">
        <button className="bg-[black] text-[white] p-4 my-4" onClick={login}>
          Login
        </button>
        <button className="bg-[black] text-[white] p-4 my-4" onClick={logout}>
          Logout
        </button>
        <button
          className="bg-[black] text-[white] p-4  my-4"
          onClick={() => createNewUser(userName)}
        >
          Register New User
        </button>
      </div>
      <div className="flex  flex-col gap-2">
        {!!userAuthToken && (
          <>
            <div className="gap-2 flex">
              <button
                className="bg-[black] text-[white] p-4  my-4"
                onClick={() =>
                  sendMessageToDfns({
                    action: MessageActions.createWallet,
                    userName,
                    walletName: "test wallet name",
                    networkId: "EthereumSepolia",
                  })
                }
              >
                Create New Wallet
              </button>
              <button
                className="bg-[black] text-[white] p-4  my-4"
                onClick={() =>
                  sendMessageToDfns({
                    action: MessageActions.listWallets,
                    userName,
                  })
                }
              >
                List user wallets
              </button>
            </div>
            {!!userWallets && (
              <div>
                <h3 className="text-sm mb-0 pb-0 font-bold">User Wallets</h3>
                <ul>
                  {!!userWallets &&
                    userWallets.items.map((w, index) => (
                      <li
                        key={index}
                        className="py-2  text-sm flex flex-row gap-2"
                      >
                        <span>
                          {w.status} - {w.network} - {w.address}
                        </span>
                        <button
                          onClick={() => {
                            sendTransaction(w.id, w.address);
                          }}
                          className="bg-[black] px-4 py-2 rounded-xl text-[white]"
                        >
                          Send test transaction
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <DfnsIframe onLoad={onIframeLoaded} />
    </main>
  );
}
