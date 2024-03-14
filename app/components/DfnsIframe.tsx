"use client";

import { useEffect, useRef } from "react";

const IFRAME_URL = process.env.NEXT_PUBLIC_IFRAME_URL || "";

interface DfnsIframeProps {
  isVisible?: boolean;
  iframeUrl?: string;
  iframeHeight?: number;
  iframeWidth?: number;
  onLoad?: (iframe: HTMLIFrameElement) => void;
}
export const DfnsIframe = ({
  isVisible = true,
  iframeUrl = IFRAME_URL,
  iframeHeight = 400,
  iframeWidth = 400,
  onLoad,
}: DfnsIframeProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (!iframeRef?.current) return;
    const iframe: HTMLIFrameElement | null = iframeRef.current;
    if (iframe) {
      iframe.onload = () => {
        if (onLoad) onLoad(iframe);
      };
    }
  }, [iframeRef, onLoad]);
  return (
    <>
      {isVisible && iframeUrl && (
        <iframe
          ref={iframeRef}
          allow="payment; publickey-credentials-get *"
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
