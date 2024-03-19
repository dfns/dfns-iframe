"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import {
  useDfns,
  MessageActions,
  IframeActiveState,
  MessageActionsResponses,
} from "@/app/hooks/useDfns";
import { useServerRequests } from "@/app/hooks/useServerRequests";
import { DfnsIframe } from "@/app/components/DfnsIframe";

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [userName] = useState("rod+local1913@dfns.co");
  const iframeRef = useRef(null);
  const { getCreateNewUserChallenge, addPermissionsToNewUser } =
    useServerRequests();
  const onReceiveDfnsMessage = useCallback(
    (event: MessageEvent) => {
      if (event.data.action === MessageActionsResponses.registered) {
        try {
          const user = event.data.userRegistration.user;
          addPermissionsToNewUser(user);
        } catch (e) {
          console.error("error adding permissions to new user", e);
        }
      }
    },
    [addPermissionsToNewUser]
  );
  const {
    isDfnsReady,
    messageErrors,
    userAuthToken,
    userWallets,
    changeIframeScreen,
    login,
    logout,
    registerUser,
    onIframeLoaded,
    sendMessageToDfns,
    signTransaction,
  } = useDfns({
    iframeRef,
    userName,
    onReceiveDfnsMessage,
  });
  const sendTestDemoTransaction = (
    walletId: string,
    address: string = "0xa238b6008Bc2FBd9E386A5d4784511980cE504Cd"
  ) => {
    const tx = {
      to: address,
      value: "1",
      gasLimit: "21000",
      maxPriorityFeePerGas: "50000000000",
      maxFeePerGas: "20000000000",
      nonce: 3,
      type: 2,
      chainId: 11155111,
    };
    signTransaction(walletId, tx, "Transaction");
  };

  const createUserInit = useCallback(async () => {
    const challenge = await getCreateNewUserChallenge(userName);
    await registerUser(userName, challenge);
  }, [userName, registerUser, getCreateNewUserChallenge]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;
  return (
    <main className="min-h-screen bg-[#CCC] text-[black] p-4 max-w-[90hw] flex flex-col ">
      <h1 className="my-3 text-xl">Example website with Dfns iframe</h1>
      {!!messageErrors && (
        <div className="text-[red]">messageErrors: {messageErrors}</div>
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
          onClick={createUserInit}
        >
          Register New User
        </button>
      </div>
      <div>
        change iframe screen
        <select
          className="py-2 px-5 m-2 rounded-xl"
          onChange={(e) =>
            changeIframeScreen(e.target.value as IframeActiveState.default)
          }
        >
          <option>select screen...</option>
          {Object.values(IframeActiveState).map((screen, i) => (
            <option key={i} value={screen}>
              {screen}
            </option>
          ))}
        </select>
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
                  {!!userWallets && userWallets?.items?.length > 0 ? (
                    userWallets.items.map((w, index: number) => (
                      <li
                        key={index}
                        className="py-2  text-sm flex flex-row gap-2"
                      >
                        <span>
                          {w.status} - {w.network} - {w.address}
                        </span>
                        <button
                          onClick={() => {
                            sendTestDemoTransaction(w.id, w.address);
                          }}
                          className="bg-[black] px-4 py-2 rounded-xl text-[white]"
                        >
                          Send test transaction
                        </button>
                      </li>
                    ))
                  ) : (
                    <li>User has no wallets</li>
                  )}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
      <DfnsIframe
        onLoad={onIframeLoaded}
        initialScreen={IframeActiveState.createUserAndWallet}
      />
    </main>
  );
}
