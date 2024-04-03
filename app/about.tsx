"use client";

import { useState, useRef, useEffect } from "react";
// import { DfnsIframe } from "@/app/components/DfnsIframe";
// import { MessageActions, sendMessageToIframe } from "@/app/utils/windowMessage";

const TEST_EMAIL = "rod+grvt59@dfns.co";

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);
  // const iframeRef = useRef(null);

  // useEffect(() => {
  //   if (!iframeRef?.current) return;
  //   const getResponse = async () => {
  //     const response = await sendMessageToIframe(iframeRef?.current, {
  //       action: MessageActions.iframeReady,
  //     });
  //     console.log("resposne", response);
  //   };
  //   getResponse();
  //   setIsHydrated(true);
  // }, []);

  // if (!isHydrated) return null;
  return (
    <main className=" min-h-screen bg-[#CCC] text-[black] p-4 max-w-[90hw] flex flex-col ">
      <h3>Iframe below in blue</h3>
      <div className="border-8 border-sky-500 w-[420px]">
        {/* <DfnsIframe ref={iframeRef} /> */}
      </div>
    </main>
  );
}
