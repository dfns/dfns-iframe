"use client";

import { useEffect, useRef } from "react";
import { IframeActiveState } from "@/app/hooks/useDfns";
const IFRAME_URL = process.env.NEXT_PUBLIC_IFRAME_URL || "";

interface DfnsIframeProps {
  isVisible?: boolean;
  iframeUrl?: string;
  iframeHeight?: number;
  iframeWidth?: number;
  initialScreen?: IframeActiveState;
  onLoad?: (
    iframe: HTMLIFrameElement,
    initialScreen: IframeActiveState
  ) => void;
}
export const DfnsIframe = ({
  isVisible = true,
  iframeUrl = IFRAME_URL,
  iframeHeight = 400,
  iframeWidth = 400,
  initialScreen = IframeActiveState.default,
  onLoad,
}: DfnsIframeProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (!iframeRef?.current) return;
    const iframe: HTMLIFrameElement | null = iframeRef.current;
    if (iframe) {
      iframe.onload = () => {
        if (onLoad) onLoad(iframe, initialScreen);
      };
    }
  }, [iframeRef, onLoad, initialScreen]);
  return (
    <>
      {isVisible && iframeUrl && (
        <iframe
          ref={iframeRef}
          allow="payment; publickey-credentials-get *; clipboard-read; clipboard-write;"
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
