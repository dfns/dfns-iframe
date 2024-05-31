import { BlockchainNetwork } from "@dfns/datamodel/dist/Wallets";
import { UserRegistrationChallenge, UserRegistrationResponse } from "@dfns/sdk";
import {
  MessageActions,
  MessageActionsResponses,
  MessageParentActions,
  MessageParentActionsResponses,
  IframeActiveState,
  TransactionPayload,
  Wallet,
} from ".";
const DFNS_IFRAME_URL = process.env.NEXT_PUBLIC_IFRAME_URL || "";
const APP_ID = process.env.NEXT_PUBLIC_DFNS_APP_ID || "";
const ORG_ID = process.env.NEXT_PUBLIC_DFNS_ORG_ID || "";

function getTheme() {
  try {
    return process.env.NEXT_PUBLIC_THEME
      ? JSON.parse(process.env.NEXT_PUBLIC_THEME)
      : "";
  } catch {
    console.error(
      "Error parsing THEME JSON, please make sure it is valid JSON"
    );
    return {};
  }
}
const THEME = getTheme();

interface EssentialPayload {
  action?: MessageActions;
  actionResponse?: MessageActionsResponses;
  parentAction?: MessageParentActions;
  parentActionResponse?: MessageParentActionsResponses;
}
interface AlwaysOptionalPayload {
  showScreen?: IframeActiveState;
}
export interface LoginPayload {
  userName?: string;
}
export interface LoginPayload {
  userName?: string;
}
export interface SignRegisterUserInitPayload {
  userName?: string;
  challenge?: UserRegistrationChallenge;
  showScreen?: IframeActiveState;
}
export interface SignRegisterUserInitPayload {
  userName?: string;
  challenge?: UserRegistrationChallenge;
  showScreen?: IframeActiveState;
  signedRegisterInitChallenge?: UserRegistrationResponse;
}
export interface LoginWithTokenPayload {
  token?: string;
}
export interface CreateWalletPayload {
  userName?: string;
  walletName?: string;
  wallets?: Wallet[];
  networkId?: BlockchainNetwork;
  network?: string;
  showScreen?: IframeActiveState;
  transactionPayload?: TransactionPayload;
}
export interface IframeMessagePayload
  extends EssentialPayload,
    AlwaysOptionalPayload,
    LoginWithTokenPayload,
    SignRegisterUserInitPayload,
    CreateWalletPayload,
    LoginPayload {}

export type MessageResponse = {
  actionResponse: MessageActionsResponses;
  signedRegisterInitChallenge?: UserRegistrationResponse;
  isUserLoggedin?: boolean;
  userWalletAddress?: string;
  isUserCreatedSuccess?: boolean;
};
export const sendMessageToIframe = (
  iframe: HTMLIFrameElement,
  payload: IframeMessagePayload
): Promise<MessageResponse> => {
  return new Promise((resolve, reject) => {
    const messageHandler = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) {
        return;
      }
      const received = event?.data?.actionResponse || "";
      const expected = payload.actionResponse || "";
      if (
        !received ||
        !expected ||
        !Object.values(MessageActionsResponses).includes(received) ||
        expected !== received
      ) {
        return;
      }
      window.removeEventListener("message", messageHandler, false);
      resolve(event.data as MessageResponse);
    };
    window.addEventListener("message", messageHandler, false);
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          { ...payload, appId: APP_ID, orgId: ORG_ID, theme: THEME },
          DFNS_IFRAME_URL
        );
      }
    } catch (error) {
      window.removeEventListener("message", messageHandler, false);
      reject(error);
    }
  });
};
