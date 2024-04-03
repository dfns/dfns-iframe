import {
  CreateWalletResponse,
  ListWalletsResponse,
  BlockchainNetwork,
} from "@dfns/datamodel/dist/Wallets";
import {
  UserRegistrationChallenge,
  UserRegistrationResponse,
  Fido2Attestation,
} from "@dfns/sdk";
import { IframeActiveState } from "@/app/hooks/useDfns";

export enum MessageActions {
  iframeReady = "iframeReady",
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

const DFNS_IFRAME_URL = process.env.NEXT_PUBLIC_IFRAME_URL || "";

type MessagePromisePayload = {
  payload: {
    action: MessageActions;
    actionResponse: "IframeReadyResponse";
  };
};

export const sendMessageToIframe = <MessagePromisePayload, TResponse>(
  iframe: HTMLIFrameElement,
  payload: MessagePromisePayload
): Promise<TResponse> => {
  return new Promise((resolve, reject) => {
    const messageHandler = (event: MessageEvent) => {
      const action = event?.data?.action || "";
      const parentAction = event?.data?.parentAction || "";
      if (
        !Object.values(MessageActionsResponses).includes(action) &&
        !Object.values(MessageParentActionsResponses).includes(parentAction)
      ) {
        return;
      }
      if (event.source === iframe.contentWindow) {
        window.removeEventListener("message", messageHandler, false);
        resolve(event.data as TResponse);
      }
    };
    window.addEventListener("message", messageHandler, false);
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage(payload, DFNS_IFRAME_URL);
      }
    } catch (error) {
      window.removeEventListener("message", messageHandler, false);
      reject(error);
    }
  });
};
