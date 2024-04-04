import {
  MessageActions,
  MessageActionsResponses,
  IframeActiveState,
} from "@/app/utils/dfns/types";

const DFNS_IFRAME_URL = process.env.NEXT_PUBLIC_IFRAME_URL || "";
const APP_ID = process.env.NEXT_PUBLIC_DFNS_APP_ID || "";
const ORG_ID = process.env.NEXT_PUBLIC_DFNS_ORG_ID || "";

interface AlwaysRequiredPayload {
  action: MessageActions;
  actionResponse: MessageActionsResponses;
}
interface AlwaysOptionalPayload {
  showScreen?: IframeActiveState;
}
export interface LoginPayload {
  userName?: string;
}
export interface IframeMessagePayload
  extends AlwaysRequiredPayload,
    AlwaysOptionalPayload,
    LoginPayload {}

export type MessageResponse = {
  actionResponse: MessageActionsResponses;
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
          { ...payload, appId: APP_ID, orgId: ORG_ID },
          DFNS_IFRAME_URL
        );
      }
    } catch (error) {
      window.removeEventListener("message", messageHandler, false);
      reject(error);
    }
  });
};
