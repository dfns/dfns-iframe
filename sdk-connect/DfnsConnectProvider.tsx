"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  PropsWithChildren,
} from "react";
import {
  CreateWalletProps,
  IframeActiveState,
  LoginProps,
  LoginWithTokenProps,
  MessageActions,
  MessageActionsResponses,
  ErrorParentPayload,
  MessageParentActionPayload,
  MessageParentActions,
  MessageParentActionsResponses,
  SignRegisterUserInitProps,
  CreateUserAndWalletProps,
  TransactionPayload,
  CreateUserAndWalletResponse,
} from ".";
import DfnsConnectContext from "./DfnsConnectContext";
import { IframeMessagePayload, sendMessageToIframe } from "./windowMessage";

export const DfnsConnectProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeReady, setIsIframeReady] = useState(false);

  const [requiredActionId, setRequiredActionId] = useState<string>();
  const [requiredActionName, setRequiredActionName] =
    useState<MessageParentActions>();
  const [requiredActionPayload, setRequiredActionPayload] =
    useState<MessageParentActionPayload>();
  const [errorPayload, setErrorPayload] = useState<ErrorParentPayload | null>();

  const iframe: HTMLIFrameElement | null = iframeRef?.current
    ? iframeRef.current
    : null;
  const isConnectReady = !!iframe && isIframeReady;

  const setIframeRef = (ref: HTMLIFrameElement) => {
    // @ts-expect-error
    iframeRef.current = ref;
  };

  const _showIframeScreen = async ({
    showScreen,
  }: {
    showScreen: IframeActiveState;
  }) => {
    try {
      await _sendMessageToIframe({
        action: MessageActions.updateIframeScreenState,
        actionResponse: MessageActionsResponses.updateIframeScreenStateSuccess,
        showScreen,
      });
    } catch (e) {
      console.error("Error updating Iframe screen");
    }
  };

  const setIframeReady = () => {
    setIsIframeReady(true);
  };

  async function _login({ userName, showScreen }: LoginProps) {
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

  async function _loginUserWithToken({
    token,
    showScreen,
  }: LoginWithTokenProps) {
    if (!token) throw new Error("Missing Token");
    try {
      return await _sendMessageToIframe({
        action: MessageActions.loginWithToken,
        actionResponse: MessageActionsResponses.loginWithTokenSuccess,
        token,
        showScreen,
      });
    } catch (e) {
      console.error("error logging out");
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

  async function _signRegisterUserInit({
    userName,
    challenge,
    showScreen,
  }: SignRegisterUserInitProps) {
    try {
      const response = await _sendMessageToIframe({
        action: MessageActions.signRegisterInit,
        actionResponse: MessageActionsResponses.signRegisterInitSuccess,
        userName,
        challenge,
        showScreen,
      });
      return response.signedRegisterInitChallenge;
    } catch (e) {
      console.error("error logging out");
    }
  }

  async function _createWallet({
    userName,
    walletName,
    networkId,
    showScreen,
  }: CreateWalletProps) {
    try {
      return await _sendMessageToIframe({
        action: MessageActions.createWallet,
        actionResponse: MessageActionsResponses.createWalletSuccess,
        userName,
        walletName,
        networkId,
        showScreen,
      });
    } catch (e) {
      console.error("error creating wallet");
    }
  }

  async function _createUserAndWallet({
    challenge,
    wallets,
    showScreen,
  }: CreateUserAndWalletProps): Promise<
    CreateUserAndWalletResponse | undefined
  > {
    try {
      const { userWalletAddress, isUserCreatedSuccess } =
        await _sendMessageToIframe({
          action: MessageActions.createUserAndWallet,
          actionResponse: MessageActionsResponses.createUserAndWalletSuccess,
          challenge,
          wallets,
          showScreen,
        });
      return {
        userWalletAddress,
        isUserCreatedSuccess,
      };
    } catch (e) {
      console.error("error creating user and wallet", e);
    }
  }

  async function _showUserCredentials() {
    await _sendMessageToIframe({
      action: MessageActions.listUserCredentials,
      actionResponse: MessageActionsResponses.listUserCredentialsSuccess,
    });
  }

  async function _signEip712(transactionPayload: TransactionPayload) {
    return await _sendMessageToIframe({
      action: MessageActions.signWalletTransaction,
      actionResponse: MessageActionsResponses.signWalletTransactionSuccess,
      transactionPayload,
    });
  }

  async function _getIsUserLoggedin() {
    const { isUserLoggedin } = await _sendMessageToIframe({
      action: MessageActions.getCurrentUserInfo,
      actionResponse: MessageActionsResponses.getCurrentUserInfoSuccess,
    });
    return isUserLoggedin;
  }

  async function _getUserWalletAddress() {
    const { userWalletAddress } = await _sendMessageToIframe({
      action: MessageActions.getCurrentUserInfo,
      actionResponse: MessageActionsResponses.getCurrentUserInfoSuccess,
    });
    return userWalletAddress;
  }

  async function _getCurrentUserInfo() {
    const { isUserLoggedin, userWalletAddress } = await _sendMessageToIframe({
      action: MessageActions.getCurrentUserInfo,
      actionResponse: MessageActionsResponses.getCurrentUserInfoSuccess,
    });
    return {
      isUserLoggedin,
      userWalletAddress,
    };
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
    try {
      const result = await sendMessageToIframe(iframe, payload);
      return result;
    } catch (e) {
      console.error("_sendMessageToIframe", e);
      throw e;
    }
  }

  useEffect(() => {
    if (!iframe || !isIframeReady) return;
    const handleIframeMessages = async (event: MessageEvent) => {
      if (!iframe || event.source !== iframe.contentWindow) {
        return;
      }
      const parentAction = event?.data?.parentAction || "";
      if (
        !parentAction ||
        !Object.values(MessageParentActions).includes(parentAction)
      ) {
        return;
      }
      _sendMessageToIframe({
        parentActionResponse:
          `${parentAction}Success` as MessageParentActionsResponses,
      });
      const showScreen = event?.data?.showScreen || "";
      setRequiredActionName(parentAction);
      setRequiredActionPayload(showScreen);
      const randomString = Math.random().toString(36).substring(2, 12);
      setRequiredActionId(randomString);
      setErrorPayload(
        event?.data?.errorMessage && event?.data?.errorObject
          ? {
              message: event?.data?.errorMessage || "",
              error: event?.data?.errorObject || "",
            }
          : null
      );
      const signedTransaction = event?.data?.signedTransaction;
      setRequiredActionPayload(signedTransaction);
    };
    window.addEventListener("message", handleIframeMessages, false);
    return () => {
      window.removeEventListener("message", handleIframeMessages, false);
    };
  }, [iframe, isIframeReady]);

  const login = requireIframeReady(_login);
  const logout = requireIframeReady(_logout);
  const signRegisterUserInit = requireIframeReady(_signRegisterUserInit);
  const loginUserWithToken = requireIframeReady(_loginUserWithToken);
  const createWallet = requireIframeReady(_createWallet);
  const signEip712 = requireIframeReady(_signEip712);
  const showIframeScreen = requireIframeReady(_showIframeScreen);
  const showUserCredentials = requireIframeReady(_showUserCredentials);
  const createUserAndWallet = requireIframeReady(_createUserAndWallet);
  const getCurrentUserInfo = requireIframeReady(_getCurrentUserInfo);
  const getIsUserLoggedin = requireIframeReady(_getIsUserLoggedin);
  const getUserWalletAddress = requireIframeReady(_getUserWalletAddress);

  const value = useMemo(
    () => ({
      iframeRef,
      isConnectReady,
      requiredActionName,
      requiredActionPayload,
      requiredActionId,
      errorPayload,
      setIframeRef,
      setIframeReady,
      login,
      logout,
      showUserCredentials,
      signRegisterUserInit,
      loginUserWithToken,
      createWallet,
      signEip712,
      showIframeScreen,
      createUserAndWallet,
      getCurrentUserInfo,
      getIsUserLoggedin,
      getUserWalletAddress,
    }),
    [
      isConnectReady,
      requiredActionName,
      requiredActionPayload,
      login,
      logout,
      signRegisterUserInit,
      showUserCredentials,
      loginUserWithToken,
      createWallet,
      showIframeScreen,
    ]
  );

  return (
    // @ts-expect-error
    <DfnsConnectContext.Provider value={value}>
      {children}
    </DfnsConnectContext.Provider>
  );
};

export default DfnsConnectProvider;
