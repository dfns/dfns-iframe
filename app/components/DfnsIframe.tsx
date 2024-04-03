"use client";

import React, { useEffect, useRef } from "react";
import { IframeActiveState } from "@/app/hooks/useDfns";
const DFNS_IFRAME_URL = process.env.NEXT_PUBLIC_IFRAME_URL || "";

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
export const DfnsIframe = React.forwardRef<HTMLIFrameElement, DfnsIframeProps>(
  (
    {
      isVisible = true,
      iframeUrl = DFNS_IFRAME_URL,
      iframeHeight = 400,
      iframeWidth = 400,
      initialScreen = IframeActiveState.default,
      onLoad,
    },
    ref
  ) => {
    // const iframeRef = useRef<HTMLIFrameElement>(null);
    useEffect(() => {
      if (!ref?.current) return;
      const iframe: HTMLIFrameElement | null = ref.current;
      if (iframe) {
        iframe.onload = () => {
          if (onLoad) onLoad(iframe, initialScreen);
        };
      }
    }, [ref, onLoad, initialScreen]);
    return (
      <>
        {isVisible && iframeUrl && (
          <iframe
            ref={ref}
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
  }
);

DfnsIframe.displayName = "DfnsIframe";

export default DfnsIframe;
