"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
  MutableRefObject,
} from "react";
import {
  UserRegistrationChallenge,
  UserRegistrationResponse,
  Fido2Attestation,
} from "@dfns/sdk";

const APP_ID = process.env.NEXT_PUBLIC_DFNS_APP_ID || "";
const ORG_ID = process.env.NEXT_PUBLIC_DFNS_ORG_ID || "";
const IFRAME_URL = process.env.NEXT_PUBLIC_IFRAME_URL || "";
const WINDOW_W = 400;
const WINDOW_H = 400;

type MessageWindowOptions = "iframe" | "popup";
export enum MessageActions {
  startAuth = "startAuth",
  registerAuth = "registerAuth",
  createWallet = "createWallet",
  listWallets = "listWallets",
  signWalletTransaction = "signWalletTransaction",
  signWalletSignature = "signWalletSignature",
  getAuthToken = "getAuthToken",
  createUserRegistration = "createUserRegistration",
  logout = "logout",
  requestUserSignature = "requestUserSignature",
  updateIframeScreenState = "updateIframeScreenState",
}
export type MessagePayload = {
  action: MessageActions;
  IframeActiveState?: IframeActiveState;
  userName?: string;
  challenge?:
    | UserRegistrationChallenge
    | UserRegistrationResponse
    | Fido2Attestation;
  appId?: string;
  orgId?: string;
  errorMessage?: string;
  walletName?: string;
  networkId?: string;
  walletId?: string;
  transaction?: {};
  kind?: string;
};
export enum MessageActionsResponses {
  authToken = "authToken",
  actionError = "actionError",
  attestation = "attestation",
  authenticated = "authenticated",
  errorMessage = "errorMessage",
  registered = "registered",
  walletCreated = "walletCreated",
  walletsList = "walletsList",
  initCreateUserAndWallet = "initCreateUserAndWallet",
  signedChallenge = "signedChallenge",
}
export enum IframeActiveState {
  default = "default",
  createUserAndWallet = "createUserAndWallet",
  signTransaction = "signTransaction",
  recoveryDetails = "recoveryDetails",
  credentialsList = "credentialsList",
}
interface DfnsProps {
  iframeRef?: MutableRefObject<HTMLIFrameElement | null | undefined>;
  userName?: string;
  initialInterfaceState?: IframeActiveState;
  onReceiveDfnsMessage?: (event: MessageEvent) => void;
}
export const useDfns = ({
  userName,
  iframeRef,
  initialInterfaceState = IframeActiveState.default,
  onReceiveDfnsMessage,
}: DfnsProps) => {
  const popupRef = useRef<Window | null>(null);
  const intervalId = useRef<number>(0);
  const isMessageReplied = useRef<boolean>(false);

  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [isPopupLoaded] = useState(false);
  const [iframeScreen, setIframeScreen] = useState<IframeActiveState>(
    initialInterfaceState
  );
  const [userWallets, setUserWallets] = useState();
  const [messageErrors, setMessageErrors] = useState("");

  const [userAuthToken, setUserAuthToken] = useState("");
  const [messageTarget] = useState<MessageWindowOptions>("iframe");
  const [isMessageTargetReady, setIsMessageTargetReady] = useState(false);

  const isDfnsReady = isMessageTargetReady && isMessageReplied.current;

  const sendMessageToDfns = useCallback(
    (payload: MessagePayload) => {
      if (messageTarget === "iframe") {
        if (!isIframeLoaded || !iframeRef?.current?.contentWindow) return;
        iframeRef.current.contentWindow.postMessage(
          { ...payload, appId: APP_ID, orgId: ORG_ID },
          IFRAME_URL
        );
      } else if (messageTarget === "popup") {
        // NOTE: popups are necessary for browsers that do not support
        // <iframe allow="payment; publickey-credentials-get *" />
        // TODO: wait for popup loaded and active
        if (!popupRef?.current || !isPopupLoaded) {
          openPopup();
          return;
        }
        popupRef.current.postMessage(payload, IFRAME_URL);
      }
    },
    [messageTarget, iframeRef, isIframeLoaded, isPopupLoaded, popupRef]
  );

  const getAuthToken = useCallback(async () => {
    sendMessageToDfns({
      action: MessageActions.updateIframeScreenState,
      IframeActiveState: iframeScreen,
    } as MessagePayload);
    sendMessageToDfns({
      action: MessageActions.getAuthToken,
    } as MessagePayload);
  }, [sendMessageToDfns, iframeScreen]);

  const login = () => {
    console.log("do login");
    sendMessageToDfns({
      action: MessageActions.startAuth,
      userName,
    } as MessagePayload);
  };

  const logout = () => {
    sendMessageToDfns({ action: MessageActions.logout } as MessagePayload);
  };

  const registerUser = (userName, challenge) => {
    sendMessageToDfns({
      action: MessageActions.registerAuth,
      userName,
      challenge,
    } as MessagePayload);
  };

  const sign = (challenge: UserRegistrationChallenge) => {
    sendMessageToDfns({
      action: MessageActions.createUserRegistration,
      challenge,
    } as MessagePayload);
  };

  const signTransaction = (walletId, transaction, kind) => {
    sendMessageToDfns({
      action: MessageActions.signWalletTransaction,
      walletId,
      transaction,
      kind,
    });
  };

  const onIframeLoaded = (
    iframe: HTMLIFrameElement,
    initialScreen: IframeActiveState
  ) => {
    setIsIframeLoaded(true);
    if (iframeRef) {
      iframeRef.current = iframe;
    }
    setIframeScreen(initialScreen);
  };

  const openPopup = () => {
    if (!window) return;
    isMessageReplied.current = false;
    const left = window.screen.availWidth / 2;
    const top = window.screen.availHeight / 2 - 250;
    popupRef.current = window.open(
      IFRAME_URL,
      "dfns-popup",
      `popup,width=${WINDOW_W},height=${WINDOW_H},left=${left},top=${top}`
    );
    if (!popupRef.current) {
      console.error(
        "Popup blocked! Please allow popups for this website and try again."
      );
      return;
    }
    console.log("opened popup ", popupRef.current);
  };

  const changeIframeScreen = (screenName: IframeActiveState) => {
    sendMessageToDfns({
      action: MessageActions.updateIframeScreenState,
      IframeActiveState: screenName,
    });
  };

  const handleReceivedWindowMessages = async (event: MessageEvent) => {
    // console.log("all messages", event);
    if (!IFRAME_URL.includes(event.origin)) {
      return;
    }

    const action = event?.data?.action || "";
    if (!Object.values(MessageActionsResponses).includes(action)) {
      return;
    }

    isMessageReplied.current = true;

    // hook into all messages
    if (onReceiveDfnsMessage) onReceiveDfnsMessage(event);

    switch (action) {
      case MessageActionsResponses.authToken:
        setIsMessageTargetReady(true);
        setUserAuthToken(event.data.userAuthToken);
        return;
      case MessageActionsResponses.registered:
        console.log("user registered", event);
        return;
      case MessageActionsResponses.walletCreated:
        console.log("walletCreated", event);
        return;
      case MessageActionsResponses.walletsList:
        console.log("walletsList", event);
        setUserWallets(event.data.userWallets);
        return;
      case MessageActionsResponses.errorMessage:
        setMessageErrors(event.data.errorMessage);
        return;
      default:
        return;
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleReceivedWindowMessages, false);
    return () =>
      window.removeEventListener("message", handleReceivedWindowMessages);
  }, []);

  useEffect(() => {
    clearInterval(intervalId.current);
    intervalId.current = window.setInterval(() => {
      isMessageReplied.current
        ? clearInterval(intervalId.current)
        : getAuthToken();
    }, 200);
  }, [isMessageReplied, getAuthToken, messageTarget]);

  return {
    login,
    logout,
    sign,
    registerUser,
    onIframeLoaded,
    signTransaction,
    userAuthToken,
    userWallets,
    isDfnsReady,
    messageErrors,
    IFRAME_URL,
    WINDOW_W,
    WINDOW_H,
    changeIframeScreen,
    sendMessageToDfns,
  };
};
