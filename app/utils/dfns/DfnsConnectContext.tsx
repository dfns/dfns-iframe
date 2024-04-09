import { UserRegistrationResponse } from "@dfns/sdk";
import { createContext } from "react";
import {
  ChangeIframeScreenProps,
  LoginProps,
  LogoutProps,
  SignRegisterUserInitProps,
  IframeActiveState,
  LoginWithTokenProps,
  CreateWalletProps,
} from "@/app/utils/dfns/types";

interface DfnsContextType {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  isConnectReady: boolean;
  requiredActionName: string;
  setIframeRef: (iframe: HTMLIFrameElement) => void;
  setIframeReady: () => void;
  changeIframeScreen: ({ showScreen }: ChangeIframeScreenProps) => void;
  login: ({ userName, showScreen }: LoginProps) => void;
  logout: ({ showScreen }: LogoutProps) => void;
  showUserCredentials: () => void;
  signRegisterUserInit: ({
    userName,
    challenge,
    showScreen,
  }: SignRegisterUserInitProps) => Promise<UserRegistrationResponse>;
  loginUserWithToken: ({ token }: LoginWithTokenProps) => void;
  createWallet: ({
    userName,
    walletName,
    networkId,
    showScreen,
  }: CreateWalletProps) => void;
  showIframeScreen: ({ showScreen }: { showScreen: IframeActiveState }) => void;
}

const DfnsConnectContext = createContext<DfnsContextType | null>(null);

export default DfnsConnectContext;
