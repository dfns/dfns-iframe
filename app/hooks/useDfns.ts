"use client";
import {
  CreateWalletResponse,
  ListWalletsResponse,
  BlockchainNetwork,
} from "@dfns/datamodel/dist/Wallets";
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
  login = "login",
  registerInitSign = "registerInitSign",
  createWallet = "createWallet",
  listWallets = "listWallets",
  userWalletExists = "userWalletExists",
  signWalletTransaction = "signWalletTransaction",
  getAuthToken = "getAuthToken",
  loginWithToken = "loginWithToken",
  registerInit = "registerInit",
  logout = "logout",
  updateIframeScreenState = "updateIframeScreenState",
  parentErrorMessage = "parentErrorMessage",
}
export type MessageResponsePayload = {
  action?: MessageActionsResponses;
  parentAction?: MessageParentActionsResponses;
  userAuthToken?: string;
  errorMessage?: string;
  signedInitRegistration?: UserRegistrationResponse;
  userLoginResponse?: {
    token: string;
  };
  userFromToken?: {
    id: string;
    username: string;
    orgId: string;
  };
  signedChallenge?: Fido2Attestation;
  createdWallet?: CreateWalletResponse;
  walletId?: string;
  userWallets?: ListWalletsResponse;
  kind?: string;
  onLoginShow?: IframeActiveState;
  onLogoutShow?: IframeActiveState;
  userWalletExists?: boolean;
};
export type MessagePayload = {
  action: MessageActions;
  IframeActiveState?: IframeActiveState;
  token?: string;
  userName?: string;
  onLoginShow?: IframeActiveState;
  onLogoutShow?: IframeActiveState;
  challenge?: UserRegistrationChallenge;
  walletName?: string;
  networkId?: BlockchainNetwork;
};
// Actions internal to dfns action responses
export enum MessageActionsResponses {
  authToken = "authToken",
  authenticated = "authenticated",
  errorMessage = "errorMessage",
  registered = "registered",
  walletCreated = "walletCreated",
  walletsList = "walletsList",
}
// Actions where iframe parent might need to take action
export enum MessageParentActionsResponses {
  initUserRegister = "initUserRegister",
  completeUserRegister = "completeUserRegister",
  userLoginSuccess = "userLoginSuccess",
  userLogoutSuccess = "userLogoutSuccess",
  userLoginWithTokenComplete = "userLoginWithTokenComplete",
  isWalletExists = "isWalletExists",
  error = "error",
}
export enum IframeActiveState {
  default = "default",
  createUserAndWallet = "createUserAndWallet",
  signTransaction = "signTransaction",
  recoveryCredentials = "recoveryCredentials",
  recoveryCodes = "recoveryCodes",
  credentialsList = "credentialsList",
  parentErrorMessage = "parentErrorMessage",
  userWallet = "userWallet",
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

  const loginUserWithToken = (token: string) => {
    sendMessageToDfns({
      action: MessageActions.loginWithToken,
      token,
    } as MessagePayload);
  };

  interface LoginArgs {
    userName?: string;
    onLoginShow?: IframeActiveState;
  }
  const login = ({ userName, onLoginShow }: LoginArgs) => {
    if (!userName) {
      return;
    }
    sendMessageToDfns({
      action: MessageActions.login,
      userName,
      onLoginShow,
    } as MessagePayload);
  };

  interface LogoutArgs {
    onLogoutShow?: IframeActiveState;
  }
  const logout = ({ onLogoutShow }: LogoutArgs) => {
    sendMessageToDfns({
      action: MessageActions.logout,
      onLogoutShow,
    } as MessagePayload);
  };

  const registerUserInitSign = (
    userName: string,
    challenge: UserRegistrationChallenge
  ) => {
    sendMessageToDfns({
      action: MessageActions.registerInitSign,
      userName,
      challenge,
    } as MessagePayload);
  };

  const createWallet = () => {
    sendMessageToDfns({
      action: MessageActions.createWallet,
      userName,
      walletName: "test wallet name",
      networkId: BlockchainNetwork.EthereumSepolia,
    });
  };

  const userWalletExists = () => {
    sendMessageToDfns({
      action: MessageActions.userWalletExists,
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

  const handleReceivedWindowMessages = useCallback(
    async (event: MessageEvent) => {
      // console.log("all messages", event);
      if (!IFRAME_URL.includes(event.origin)) {
        return;
      }

      const action = event?.data?.action || "";
      const parentAction = event?.data?.parentAction || "";
      if (
        !Object.values(MessageActionsResponses).includes(action) &&
        !Object.values(MessageParentActionsResponses).includes(parentAction)
      ) {
        return;
      }

      isMessageReplied.current = true;
      setIsMessageTargetReady(true);

      if (
        !!onReceiveDfnsMessage &&
        Object.values(MessageParentActionsResponses).includes(parentAction)
      ) {
        // actions intended for parent to resolve
        onReceiveDfnsMessage(event);
      }

      switch (action) {
        case MessageActionsResponses.authToken:
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
    },
    [onReceiveDfnsMessage]
  );

  useEffect(() => {
    window.addEventListener("message", handleReceivedWindowMessages, false);
    return () =>
      window.removeEventListener("message", handleReceivedWindowMessages);
  }, [handleReceivedWindowMessages]);

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
    registerUserInitSign,
    onIframeLoaded,
    loginUserWithToken,
    createWallet,
    userWalletExists,
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
