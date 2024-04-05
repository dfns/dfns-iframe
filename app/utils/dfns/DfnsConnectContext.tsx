import { UserRegistrationResponse } from "@dfns/sdk";
import { createContext } from "react";
import {
  ChangeIframeScreenProps,
  LoginProps,
  SignRegisterUserInitProps,
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
  logout: () => void;
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
}

const DfnsConnectContext = createContext<DfnsContextType | null>(null);

export default DfnsConnectContext;
