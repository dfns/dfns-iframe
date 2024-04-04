"use client";

import React, { useRef, useState, useMemo, PropsWithChildren } from "react";
import DfnsConnectContext from "@/app/utils/dfns/DfnsConnectContext";
import {
  sendMessageToIframe,
  IframeMessagePayload,
} from "@/app/utils/dfns/windowMessage";
import {
  MessageActions,
  MessageActionsResponses,
  IframeActiveState,
  LoginProps,
  ChangeIframeScreenProps,
} from "@/app/utils/dfns/types";

const DfnsConnectProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeReady, setIsIframeReady] = useState(false);

  const iframe: HTMLIFrameElement | null = iframeRef?.current
    ? iframeRef.current
    : null;
  const isConnectReady = !!iframe && isIframeReady;

  const setIframeRef = (ref: HTMLIFrameElement) => {
    iframeRef.current = ref;
  };

  const setIframeReady = () => {
    setIsIframeReady(true);
  };

  async function _login({
    userName,
    showScreen = IframeActiveState.createUserAndWallet,
  }: LoginProps) {
    if (!userName) {
      console.error("Username required to attempt login");
      return;
    }
    try {
      await _sendMessageToIframe({
        action: MessageActions.login,
        actionResponse: MessageActionsResponses.loginSuccess,
        userName,
        showScreen,
      });
    } catch (e) {
      console.error("error logging in");
    }
  }

  async function _logout({
    showScreen,
  }: { showScreen?: IframeActiveState } = {}) {
    try {
      await _sendMessageToIframe({
        action: MessageActions.logout,
        actionResponse: MessageActionsResponses.logoutSuccess,
        showScreen,
      });
    } catch (e) {
      console.error("error logging out");
    }
  }

  async function _changeIframeScreen({
    showScreen,
  }: { showScreen?: IframeActiveState } = {}) {
    if (!showScreen || !Object.values(IframeActiveState).includes(showScreen))
      return;
    console.log("sene message to iframe show screen", showScreen);
    await _sendMessageToIframe({
      action: MessageActions.updateIframeScreenState,
      actionResponse: MessageActionsResponses.updateIframeScreenStateSuccess,
      showScreen,
    });
  }

  function requireIframeReady<T extends AnyFunction>(originalFunction: T): T {
    return function (this: any, ...args: any[]) {
      if (!iframe || !isIframeReady) {
        throw new Error("Iframe is not ready");
      }
      return originalFunction.apply(this, args);
    } as T;
  }

  type AnyFunction = (...args: any[]) => any;
  async function _sendMessageToIframe(payload: IframeMessagePayload) {
    const iframe: HTMLIFrameElement | null = iframeRef?.current
      ? iframeRef.current
      : null;
    if (!iframe) throw new Error("iframe is not ready to receive messages");
    return await sendMessageToIframe(iframe, payload);
  }

  const login = requireIframeReady(_login);
  const logout = requireIframeReady(_logout);
  const changeIframeScreen = requireIframeReady(_changeIframeScreen);

  const value = useMemo(
    () => ({
      iframeRef,
      isConnectReady,
      setIframeRef,
      setIframeReady,
      changeIframeScreen,
      login,
      logout,
    }),
    [isConnectReady, login, logout, changeIframeScreen]
  );

  return (
    <DfnsConnectContext.Provider value={value}>
      {children}
    </DfnsConnectContext.Provider>
  );
};

export default DfnsConnectProvider;
