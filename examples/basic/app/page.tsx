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

const IFRAME_HEIGHT = 618;
const IFRAME_WIDTH = 425;

export default function Home() {
  const [userName, setUserName] = useState("");

  // This function will listen for events
  // emmited by the iframe that might require
  // custom logic in your application
  async function onParentAction(
    parentAction: MessageParentActions,
    payload?: MessageParentActionPayload
  ) {
    switch (parentAction) {
      case MessageParentActions.initUserRegister:
        if (!userName) {
          await showIframeScreen({
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
    isWebauthnSupported,
    isCrossOriginWebauthnSupported,
    isConnectReady,
    login,
    logout,
    signEip712,
    showUserCredentials,
    showUserRecoveryCredentials,
    showIframeScreen,
    createUserAndWallet,
    getCurrentUserInfo,
    getIsUserLoggedin,
    getUserWalletAddress,
    getWebauthnSupport,
    getCrossOriginWebauthnSupport,
    errorPayload,
  } = useDfnsConnect(onParentAction);

  useEffect(() => {
    console.log({ isWebauthnSupported, isCrossOriginWebauthnSupported });
    if (!isConnectReady) return;
    console.log("getWebauthnSupport", getWebauthnSupport());
    /*
    Notes:
    getCrossOriginWebauthnSupport will return null until an attempt to create a passkey 
    if it fails in known environment, will return false.
    Will never return true.
    */
    console.log(
      "getCrossOriginWebauthnSupport",
      getCrossOriginWebauthnSupport()
    );
  }, [
    isConnectReady,
    isWebauthnSupported,
    isCrossOriginWebauthnSupported,
    getWebauthnSupport,
    getCrossOriginWebauthnSupport,
  ]);

  const { getRegisterInitChallenge, getRestartRegisterInitChallenge } =
    useServerRequests();

  async function createUserWithWallet() {
    try {
      const challenge = await getChallengeOrLogin(userName);
      const newWallet: Wallet = {
        name: "Test Wallet Name",
        network: "EthereumSepolia",
      };
      const { userWalletAddress, isUserCreatedSuccess } =
        await createUserAndWallet({
          challenge,
          wallets: [newWallet],
        });
      console.log("createUserWithWallet results", {
        userWalletAddress,
        isUserCreatedSuccess,
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
    // listen for ALL errors returned from iframe
    console.log({ errorPayload });
  }, [errorPayload]);

  return (
    <main className="min-h-screen bg-[#CCC] text-[black] p-4 max-w-[90hw] flex flex-row gap-8">
      <div
        className="border-8 border-sky-500"
        style={{
          width: `${IFRAME_WIDTH + 15}px`,
          height: `${IFRAME_HEIGHT + 15}px`,
        }}
      >
        <DfnsIframe iframeWidth={IFRAME_WIDTH} iframeHeight={IFRAME_HEIGHT} />
      </div>

      <div className="flex flex-col w-[400px]">
        <p>isDfnsIframeReady: {isConnectReady ? "true" : "false"}</p>

        <div className="flex flex-row justify-content-top">
          <input
            className="p-4 m-3 flex-1 h-12"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
            }}
            placeholder="username"
          />

          <button
            className="bg-black text-white py-0 px-5 rounded-lg m-2 h-12"
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
            login
          </button>
        </div>
        <button
          data-testid="logout-btn"
          className="bg-black text-white p-4 rounded-lg m-2"
          onClick={async () => {
            await logout({
              showScreen: IframeActiveState.createUserAndWallet,
            });
          }}
        >
          logout
        </button>
        <div className="flex flex-row">
          <button
            className="bg-black text-white p-4 rounded-lg m-2"
            onClick={async () => {
              const userInfo = await getCurrentUserInfo();
              console.log({ userInfo });
            }}
          >
            User info
          </button>
          <button
            className="bg-black text-white p-4 rounded-lg m-2"
            onClick={async () => {
              const isUserLoggedin = await getIsUserLoggedin();
              console.log({ isUserLoggedin });
            }}
          >
            isUserLoggedin
          </button>
          <button
            className="bg-black text-white p-4 rounded-lg m-2"
            onClick={async () => {
              const userWalletAddres = await getUserWalletAddress();
              console.log({ userWalletAddres });
            }}
          >
            Wallet address
          </button>
        </div>
        <button
          className="bg-black text-white p-4 rounded-lg m-2"
          onClick={async () => {
            await showIframeScreen({
              showScreen: IframeActiveState.userWallet,
            });
          }}
        >
          User Wallet
        </button>
        <button
          className="bg-black text-white p-4 rounded-lg m-2"
          onClick={async () => {
            await showUserRecoveryCredentials();
          }}
        >
          Backup Codes
        </button>

        <button
          className="bg-black text-white p-4 rounded-lg m-2"
          onClick={async () => await showUserCredentials()}
        >
          Security Keys (Devices)
        </button>
        <button
          data-testid="recover-credentials-btn"
          className="bg-black text-white p-4 rounded-lg m-2"
          onClick={async () => {
            await showIframeScreen({
              showScreen: IframeActiveState.recover,
            });
          }}
        >
          Recover account with codes
        </button>
        <button
          className="bg-black text-white p-4 rounded-lg m-2"
          data-testid="parent-sign-transaction-btn"
          onClick={() => {
            signEip712({
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
      </div>
    </main>
  );
}
