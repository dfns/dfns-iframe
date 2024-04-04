"use client";

import { useState, useRef, useEffect } from "react";
// import { IframeActiveState } from "@/app/hooks/useDfns";
import { DfnsIframe } from "@/app/utils/dfns/components/DfnsIframe";
import useDfnsConnect from "@/app/utils/dfns/useDfnsConnect";
import { IframeActiveState } from "@/app/utils/dfns/types";

const TEST_EMAIL = "rod+grvt70@dfns.co";

export default function Home() {
  const [userName, setUserName] = useState(TEST_EMAIL);
  // const [isIframeReady, setIsIframeReady] = useState(false);
  // const iframeRef = useRef<HTMLIFrameElement>(null);

  const { isConnectReady, login, logout } = useDfnsConnect();

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
        onClick={async () => {
          // await register({ userName });
        }}
      >
        logout
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
        <DfnsIframe initialScreen={IframeActiveState.createUserAndWallet} />
      </div>
    </main>
  );
}
