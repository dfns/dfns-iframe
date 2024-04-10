"use client";

import { useState } from "react";
import { DfnsIframe } from "@/app/utils/dfns/components/DfnsIframe";
import useDfnsConnect from "@/app/utils/dfns/useDfnsConnect";
import {
  IframeActiveState,
  MessageParentActions,
} from "@/app/utils/dfns/types";
import { useServerRequests } from "@/app/hooks/useServerRequests";
import { BlockchainNetwork } from "@dfns/datamodel/dist/Wallets";

const TEST_EMAIL = "rod+grvt348@dfns.co";

// restart user registration challenge

export default function Home() {
  const [userName, setUserName] = useState(TEST_EMAIL);

  // actions initiated in the iframe that require
  // the parent website to take action
  async function onParentAction(parentAction: MessageParentActions) {
    switch (parentAction) {
      case MessageParentActions.initUserRegister:
        await createUserWithWallet();
        return;
      case MessageParentActions.login:
        await login({
          userName,
          showScreen: IframeActiveState.credentialsList,
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
    addPermissionsToNewUser,
    delegatedLoginNewUser,
  } = useServerRequests();

  async function createUserWithWallet() {
    try {
      const challenge = await getRegisterInitChallenge(userName);
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
      const error = e as Error;
      if (error.message === "User already exists.") {
        console.log("----try login");
        await login({
          userName,
        });
      } else {
        console.error(error);
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

      {/* <select
        onChange={(e) => {
          changeIframeScreen({
            showScreen: e.target.value as IframeActiveState,
          });
        }}
      >
        {Object.values(IframeActiveState).map((s, i) => (
          <option value={s} key={i}>
            {s}
          </option>
        ))}
      </select> */}
      <h3 className="mt-16 mb-2">Dfns Iframe</h3>
      <div className="border-8 border-sky-500 w-[420px]">
        <DfnsIframe initialScreen={IframeActiveState.createUserAndWallet} />
      </div>
    </main>
  );
}
