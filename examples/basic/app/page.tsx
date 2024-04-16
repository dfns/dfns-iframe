"use client";

import { useState } from "react";
import { DfnsIframe } from "@dfns/sdk-connect/sdk-connect/DfnsIframe";
import useDfnsConnect from "@dfns/sdk-connect/sdk-connect/useDfnsConnect";
import {
  IframeActiveState,
  MessageParentActionPayload,
  MessageParentActions,
} from "@dfns/sdk-connect/sdk-connect";
import { useServerRequests } from "@/app/hooks/useServerRequests";
import { BlockchainNetwork } from "@dfns/datamodel/dist/Wallets";

export default function Home() {
  const [userName, setUserName] = useState("");

  async function onParentAction(
    parentAction: MessageParentActions,
    payload: MessageParentActionPayload
  ) {
    switch (parentAction) {
      case MessageParentActions.initUserRegister:
        await createUserWithWallet();
        return;
      case MessageParentActions.login:
        const showScreen = payload.showScreen || IframeActiveState.default;
        await login({
          userName,
          showScreen,
        });
        return;
      default:
        return;
    }
  }
  const {
    isConnectReady,
    login,
    logout,
    signRegisterUserInit,
    loginUserWithToken,
    createWallet,
    // changeIframeScreen,
    showUserCredentials,
  } = useDfnsConnect(onParentAction);

  const {
    getRegisterInitChallenge,
    getRestartRegisterInitChallenge,
    addPermissionsToNewUser,
    delegatedLoginNewUser,
  } = useServerRequests();

  async function createUserWithWallet() {
    try {
      const challenge = await getChallengeOrLogin(userName);
      const response = await signRegisterUserInit({
        userName,
        challenge,
      });
      const user = response.user;
      await addPermissionsToNewUser(user);
      const { token } = await delegatedLoginNewUser(userName);
      await loginUserWithToken({
        token,
        showScreen: IframeActiveState.userWallet,
      });
      await createWallet({
        userName,
        walletName: "testWallet1",
        networkId: BlockchainNetwork.EthereumSepolia,
        showScreen: IframeActiveState.userWallet,
      });
    } catch (e) {
      console.log("createUserWithWallet error", e);
    }
  }

  async function getChallengeOrLogin(username: string) {
    try {
      console.log("try getRegisterInitChallenge");
      // new user
      const challenge = await getRegisterInitChallenge(userName);
      return challenge;
    } catch (e) {
      const error = e as Error;
      if (error.message === "User already exists.") {
        try {
          console.log("try getRestartRegisterInitChallenge");
          // user has not signed previous challenges
          const challenge = await getRestartRegisterInitChallenge(username);
          return challenge;
        } catch (e) {
          console.log("----try login", e);
          try {
            // user is already registered
            await login({ userName, showScreen: IframeActiveState.userWallet });
            throw new Error("User Exists log in instead of register");
          } catch (e) {
            console.log("----pure failure");
            throw e;
          }
        }
      }
    }
  }

  return (
    <main className=" min-h-screen bg-[#CCC] text-[black] p-4 max-w-[90hw] flex flex-col ">
      <p>isDfnsIframeReady: {isConnectReady ? "true" : "false"}</p>
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
            await login({ userName, showScreen: IframeActiveState.userWallet });
          }}
        >
          login {userName}
        </button>
      </label>

      <h3 className="mt-16 mb-2">Dfns Iframe</h3>
      <div className="border-8 border-sky-500 w-[420px]">
        <DfnsIframe initialScreen={IframeActiveState.createUserAndWallet} />
      </div>
    </main>
  );
}
