"use client";

import { useEffect, useState } from "react";
import { DfnsIframe } from "@dfns/sdk-connect/sdk-connect/DfnsIframe";
import useDfnsConnect from "@dfns/sdk-connect/sdk-connect/useDfnsConnect";
import {
  IframeActiveState,
  MessageParentActionPayload,
  MessageParentActions,
  Wallet,
} from "@dfns/sdk-connect/sdk-connect";
import { useServerRequests } from "@/app/hooks/useServerRequests";

export default function Home() {
  const [userName, setUserName] = useState("");

  async function onParentAction(
    parentAction: MessageParentActions,
    payload?: MessageParentActionPayload
  ) {
    switch (parentAction) {
      case MessageParentActions.initUserRegister:
        if (!userName) {
          showIframeScreen({
            showScreen: IframeActiveState.createUserAndWallet,
          });
          return;
        }
        await createUserWithWallet();
        return;
      case MessageParentActions.handleSignedTransaction:
        console.log("handleSignedTransaction", payload);
        return;
      case MessageParentActions.login:
        const showScreen =
          payload?.showScreen || IframeActiveState.createUserAndWallet;
        await login({ userName, showScreen });
        return;
      default:
        return;
    }
  }
  const {
    isConnectReady,
    login,
    logout,
    signTransaction,
    showUserCredentials,
    showIframeScreen,
    createUserAndWallet,
    errorPayload,
  } = useDfnsConnect(onParentAction);

  const { getRegisterInitChallenge, getRestartRegisterInitChallenge } =
    useServerRequests();

  async function createUserWithWallet() {
    try {
      const challenge = await getChallengeOrLogin(userName);
      const newWallet: Wallet = {
        name: "Test Wallet Name",
        network: "EthereumSepolia",
      };
      await createUserAndWallet({
        challenge,
        wallets: [newWallet],
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function getChallengeOrLogin(username: string) {
    try {
      return await getRegisterInitChallenge(userName);
    } catch (e) {
      const error = e as Error;
      if (error.message === "User already exists.") {
        try {
          return await getRestartRegisterInitChallenge(username);
        } catch (e) {
          try {
            await login({ userName, showScreen: IframeActiveState.userWallet });
            throw new Error("User Exists log in instead of register");
          } catch (e) {
            throw e;
          }
        }
      } else {
        throw e;
      }
    }
  }

  useEffect(() => {
    if (!errorPayload) return;
    // listen for errors returned from iframe
    console.log({ errorPayload });
  }, [errorPayload]);

  return (
    <main className="min-h-screen bg-[#CCC] text-[black] p-4 max-w-[90hw] flex flex-row gap-8">
      <div className="border-8 border-sky-500 w-[505px] h-[495px]">
        <DfnsIframe
          initialScreen={IframeActiveState.createUserAndWallet}
          iframeWidth={490}
          iframeHeight={480}
        />
      </div>
      <div className="flex flex-col">
        <p>isDfnsIframeReady: {isConnectReady ? "true" : "false"}</p>
        <button
          className="bg-black text-white p-4 rounded-lg m-2"
          onClick={async () => {
            await showIframeScreen({
              showScreen: IframeActiveState.recoveryCodes,
            });
          }}
        >
          Show Recover Codes
        </button>
        <button
          className="bg-black text-white p-4 rounded-lg m-2"
          onClick={async () => {
            await showIframeScreen({
              showScreen: IframeActiveState.recover,
            });
          }}
        >
          Recover
        </button>
        <button
          className="bg-black text-white p-4 rounded-lg m-2"
          onClick={async () => {
            await logout({ showScreen: IframeActiveState.createUserAndWallet });
          }}
        >
          logout
        </button>
        <button
          className="bg-black text-white p-4 rounded-lg m-2"
          onClick={async () => await showUserCredentials()}
        >
          Show Credentials
        </button>
        <label>
          Username:
          <input
            className="p-4 m-3"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
            }}
            placeholder="username"
          />
          <button
            className="bg-black text-white p-4 rounded-lg m-2"
            onClick={async () => {
              if (!userName) {
                console.error("userName is not set");
                return;
              }
              await login({
                userName,
                showScreen: IframeActiveState.userWallet,
              });
            }}
          >
            login {userName}
          </button>
        </label>

        <button
          className="bg-black text-white p-4 rounded-lg m-2"
          onClick={() => {
            signTransaction({
              kind: "Eip712",
              types: {
                Person: [
                  { name: "name", type: "string" },
                  { name: "wallet", type: "address" },
                ],
                Mail: [
                  { name: "from", type: "Person" },
                  { name: "to", type: "Person" },
                  { name: "contents", type: "string" },
                ],
              },
              domain: {
                name: "Ether Mail",
                version: "1",
                chainId: 1,
                verifyingContract: "0x1b352de7a926ebd1bf52194dab487c2cb0793a9b",
                salt: "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558",
              },
              message: {
                from: {
                  name: "Chris",
                  wallet: "0x00e3495cf6af59008f22ffaf32d4c92ac33dac47",
                },
                to: {
                  name: "Bob",
                  wallet: "0xcc0ee1a1c5e788b61916c8f1c96c960f9a9d3db7",
                },
                contents: "Hello, Bob!",
              },
            });
          }}
        >
          Sign transaction
        </button>
        <button
          className="bg-black text-white p-4 rounded-lg m-2"
          onClick={() => {
            signTransaction({
              domain: {
                name: "GRVTEx",
                version: "0",
                chainId: 1,
              },
              types: {
                EIP712Domain: [
                  {
                    name: "name",
                    type: "string",
                  },
                  {
                    name: "version",
                    type: "string",
                  },
                  {
                    name: "chainId",
                    type: "uint256",
                  },
                ],
                CreateAccount: [
                  {
                    name: "accountID",
                    type: "address",
                  },
                  {
                    name: "nonce",
                    type: "uint32",
                  },
                ],
              },
              message: {
                // @ts-expect-error diverges from IEIP712TypedData
                accountID: "0xf6e6a0d1ebb8d19b432a1680f6c3bbee8fb2d6fe",
                nonce: "1781961150",
              },
              kind: "Eip712",
            });
          }}
        >
          Sign transaction 2
        </button>
      </div>
    </main>
  );
}
