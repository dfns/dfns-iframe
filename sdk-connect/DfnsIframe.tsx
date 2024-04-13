"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { IframeActiveState, MessageActions, MessageActionsResponses } from ".";
import useDfnsConnect from "./useDfnsConnect";
import { sendMessageToIframe } from "./windowMessage";

const DFNS_IFRAME_URL = process.env.NEXT_PUBLIC_IFRAME_URL || "";

export interface DfnsIframeProps {
  isVisible?: boolean;
  iframeUrl?: string;
  iframeHeight?: number;
  iframeWidth?: number;
  initialScreen?: IframeActiveState;
  onLoad?: (
    iframe: HTMLIFrameElement,
    initialScreen: IframeActiveState
  ) => void;
  onReady?: (
    iframe: HTMLIFrameElement,
    initialScreen: IframeActiveState
  ) => void;
}
export const DfnsIframe = ({
  isVisible = true,
  iframeUrl = DFNS_IFRAME_URL,
  iframeHeight = 600,
  iframeWidth = 400,
  initialScreen = IframeActiveState.default,
  onLoad,
  onReady,
}: DfnsIframeProps) => {
  const { setIframeRef, setIframeReady, showIframeScreen } = useDfnsConnect();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const intervalId = useRef<number>(0);
  const isMessageReplied = useRef<boolean>(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [isIframeReady, setIsIframeReady] = useState(false);

  const getConnectionStatus = useCallback(async () => {
    const iframe: HTMLIFrameElement | null = iframeRef.current;
    if (!iframe) return;
    try {
      const result = await sendMessageToIframe(iframe, {
        action: MessageActions.iframeReady,
        actionResponse: MessageActionsResponses.iframeReadySuccess,
      });
      const actionResponse = result.actionResponse;
      if (
        (actionResponse as MessageActionsResponses) ===
        MessageActionsResponses.iframeReadySuccess
      ) {
        clearInterval(intervalId.current);
        isMessageReplied.current = true;
        setIsIframeReady(true);
        setIframeReady();
        if (onReady) {
          onReady(iframe, initialScreen);
        }
      }
    } catch (e) {
      console.error("Error getting iframe ready status");
    }
  }, [onReady, initialScreen, setIframeReady]);

  const setIframeInitialScreen = useCallback(async () => {
    const iframe: HTMLIFrameElement | null = iframeRef.current;
    if (!iframe || !isIframeReady) return;
    const showScreen = initialScreen
      ? initialScreen
      : IframeActiveState.default;
    await showIframeScreen({ showScreen });
  }, [initialScreen, isIframeReady, showIframeScreen]);

  useEffect(() => {
    if (!isIframeReady || !initialScreen) return;
    setIframeInitialScreen();
  }, [isIframeReady, setIframeInitialScreen, initialScreen]);

  useEffect(() => {
    if (!iframeRef?.current) return;
    const iframe: HTMLIFrameElement | null = iframeRef.current;
    if (iframe) {
      setIframeRef(iframe);
      iframe.onload = () => {
        setIsIframeLoaded(true);
        if (onLoad) onLoad(iframe, initialScreen);
      };
    }
  }, [iframeRef, setIframeRef, onLoad, initialScreen]);

  useEffect(() => {
    clearInterval(intervalId.current);
    if (isIframeReady) return;
    intervalId.current = window.setInterval(() => {
      isMessageReplied.current
        ? clearInterval(intervalId.current)
        : getConnectionStatus();
    }, 1000);
  }, [isIframeLoaded, getConnectionStatus, isIframeReady]);

  return (
    <>
      {isVisible && iframeUrl && (
        <iframe
          ref={iframeRef}
          allow={`
          payment; 
          publickey-credentials-get *; 
          publickey-credentials-create *; 
          clipboard-read; 
          clipboard-write;
          `}
          id="dfnsIframe"
          src={iframeUrl}
          style={{
            width: `${iframeWidth}px`,
            height: `${iframeHeight}px`,
            overflow: "hidden",
            display: isVisible ? "" : "none",
          }}
        />
      )}
    </>
  );
};

DfnsIframe.displayName = "DfnsIframe";

export default DfnsIframe;
