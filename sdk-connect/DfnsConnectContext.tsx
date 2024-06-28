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
  MessageParentActionPayload,
  TransactionPayload,
  CreateUserAndWalletProps,
  ErrorParentPayload,
  CreateUserAndWalletResponse,
  DfnsConnectConfig,
} from ".";
import { GenerateSignatureResponse } from "@dfns/sdk/generated/wallets";
export interface DfnsContextType {
  config: DfnsConnectConfig;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  iframeUrl: string;
  isConnectReady: boolean;
  requiredActionName: string;
  requiredActionPayload: MessageParentActionPayload;
  requiredActionId: string;
  signedTransaction: GenerateSignatureResponse;
  errorPayload: ErrorParentPayload;
  setIframeRef: (iframe: HTMLIFrameElement) => void;
  setIframeReady: () => void;
  changeIframeScreen: ({ showScreen }: ChangeIframeScreenProps) => void;
  login: ({ userName, showScreen }: LoginProps) => void;
  logout: ({ showScreen }: LogoutProps) => void;
  showUserCredentials: () => void;
  showUserRecoveryCredentials: () => void;
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
  signEip712: (transactionPayload: TransactionPayload) => void;
  showIframeScreen: ({ showScreen }: { showScreen: IframeActiveState }) => void;
  getCurrentUserInfo: () => { userWallets: string; isUserLoggedin: boolean };
  getUserWalletAddress: () => { userWallets: string };
  getIsUserLoggedin: () => { isUserLoggedin: boolean };
  createUserAndWallet: ({
    wallets,
    challenge,
    showScreen,
  }: CreateUserAndWalletProps) => Promise<CreateUserAndWalletResponse>;
}

const DfnsConnectContext = createContext<DfnsContextType | null>(null);

export default DfnsConnectContext;
