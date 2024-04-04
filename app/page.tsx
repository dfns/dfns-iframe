"use client";

import { useState } from "react";
import { DfnsIframe } from "@/app/utils/dfns/components/DfnsIframe";
import useDfnsConnect from "@/app/utils/dfns/useDfnsConnect";
import { IframeActiveState } from "@/app/utils/dfns/types";
import { useServerRequests } from "@/app/hooks/useServerRequests";
import { BlockchainNetwork } from "@dfns/datamodel/dist/Wallets";

const TEST_EMAIL = "rod+grvt111@dfns.co";

export default function Home() {
  const [userName, setUserName] = useState(TEST_EMAIL);
  const {
    isConnectReady,
    login,
    logout,
    signRegisterUserInit,
    loginUserWithToken,
    createWallet,
  } = useDfnsConnect();

  const {
    getRegisterInitChallenge,
    addPermissionsToNewUser,
    delegatedLoginNewUser,
  } = useServerRequests();

  async function createUserInit() {
    try {
      const challenge = await getRegisterInitChallenge(userName);
      const response = await signRegisterUserInit({
        userName,
        challenge,
      });
      const user = response.signedRegisterInitChallenge.user;
      await addPermissionsToNewUser(user);
      const { token } = await delegatedLoginNewUser(userName);
      await loginUserWithToken({
        token,
      });
      // create wallet
      await createWallet({
        userName,
        walletName: "testWallet1",
        networkId: BlockchainNetwork.EthereumSepolia,
        showScreen: IframeActiveState.userWallet,
      });
    } catch (e) {
      if (e?.message === "User already exists.") {
        login({ userName, showScreen: IframeActiveState.createUserAndWallet });
      } else {
        console.error(e);
      }
    }
  }
  return (
    <main className=" min-h-screen bg-[#CCC] text-[black] p-4 max-w-[90hw] flex flex-col ">
      <p>isDfnsIframeReady: {isConnectReady ? "true" : "false"}</p>

      <button
        className="bg-black text-white p-4 rounded-lg m-2"
        onClick={async () => {
          await login({ userName });
        }}
      >
        login
      </button>

      <button
        className="bg-black text-white p-4 rounded-lg m-2"
        onClick={async () => {
          await logout();
        }}
      >
        logout
      </button>

      <button
        className="bg-black text-white p-4 rounded-lg m-2"
        onClick={createUserInit}
      >
        register
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
      </label>

      <h3 className="mt-16 mb-2">Dfns Iframe</h3>
      <div className="border-8 border-sky-500 w-[420px]">
        <DfnsIframe initialScreen={IframeActiveState.userWallet} />
      </div>
    </main>
  );
}
