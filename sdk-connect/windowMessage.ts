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
  DfnsConnectConfig,
} from ".";

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
  payload: IframeMessagePayload,
  config: DfnsConnectConfig
): Promise<MessageResponse> => {
  const { iframeUrl = "", appId = "", orgId = "", theme = {} } = config;
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
          { ...payload, appId, orgId, theme },
          iframeUrl
        );
      }
    } catch (error) {
      window.removeEventListener("message", messageHandler, false);
      reject(error);
    }
  });
};
