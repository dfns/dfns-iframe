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
import {
  Eip712TypedData,
  Eip712TypedDataDomain,
} from "@dfns/sdk/codegen/datamodel/PublicKeys";
import { TransactionLike } from "ethers";

export enum IframeActiveState {
  default = "default",
  createUserAndWallet = "createUserAndWallet",
  signTransaction = "signTransaction",
  recoveryCredentials = "recoveryCredentials",
  recoveryCodes = "recoveryCodes",
  credentialsList = "credentialsList",
  parentErrorMessage = "parentErrorMessage",
  userWallet = "userWallet",
  waiting = "waiting",
}
export enum MessageActions {
  iframeReady = "iframeReady",
  login = "login",
  logout = "logout",
  signRegisterInit = "signRegisterInit",
  loginWithToken = "loginWithToken",
  createWallet = "createWallet",
  listWallets = "listWallets",
  listUserCredentials = "listUserCredentials",
  userWalletExists = "userWalletExists",
  createAdditionalCredential = "createAdditionalCredential",
  signWalletTransaction = "signWalletTransaction",

  getAuthToken = "getAuthToken",
  registerInit = "registerInit",
  updateIframeScreenState = "updateIframeScreenState",
  parentErrorMessage = "parentErrorMessage",
}
export enum MessageActionsResponses {
  iframeReadySuccess = "iframeReadySuccess",
  loginSuccess = "loginSuccess",
  logoutSuccess = "logoutSuccess",
  updateIframeScreenStateSuccess = "updateIframeScreenStateSuccess",
  signRegisterInitSuccess = "signRegisterInitSuccess",
  loginWithTokenSuccess = "loginWithTokenSuccess",
  createWalletSuccess = "createWalletSuccess",
  listUserCredentialsSuccess = "listUserCredentialsSuccess",
  createAdditionalCredentialSuccess = "createAdditionalCredentialSuccess",
  signWalletTransactionSuccess = "signWalletTransactionSuccess",

  authToken = "authToken",
  authenticated = "authenticated",
  errorMessage = "errorMessage",
  registered = "registered",
  walletsList = "walletsList",
}
export type MessageResponsePayload = {
  action?: MessageActionsResponses;
  parentAction?: MessageParentActionsResponses;
  userAuthToken?: string;
  errorMessage?: string;
  signedRegisterInitChallenge?: UserRegistrationResponse;
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
  onLoginShowScreen?: IframeActiveState;
  onLogoutShow?: IframeActiveState;
  userWalletExists?: boolean;
};
export type MessagePayload = {
  action: MessageActions;
  IframeActiveState?: IframeActiveState;
  token?: string;
  userName?: string;
  showScreen?: IframeActiveState;
  challenge?: UserRegistrationChallenge;
  walletName?: string;
  networkId?: BlockchainNetwork;
};
export enum MessageParentActions {
  initUserRegister = "initUserRegister",
  login = "login",
  handleError = "handleError",
  handleSignedTransaction = "handleSignedTransaction",

  // completeUserRegister = "completeUserRegister",
  // userLoginSuccess = "userLoginSuccess",
  // userLogoutSuccess = "userLogoutSuccess",
  // userLoginWithTokenComplete = "userLoginWithTokenComplete",
  // isWalletExists = "isWalletExists",
  // error = "error",
}
export type MessageParentActionPayload = {
  showScreen?: IframeActiveState;
};
export enum MessageParentActionsResponses {
  initUserRegisterSuccess = "initUserRegisterSuccess",
  loginSuccess = "loginSuccess",
  handleErrorSuccess = "handleErrorSuccess",
  handleSignedTransactionSuccess = "handleSignedTransactionSuccess",

  // completeUserRegisterSuccess = "completeUserRegisterSuccess",
  // userLoginSuccess = "userLoginSuccess",
  // userLogoutSuccess = "userLogoutSuccess",
  // userLoginWithTokenCompleteSuccess = "userLoginWithTokenCompleteSuccess",
  // isWalletExistsSuccess = "isWalletExistsSuccess",
  // error = "errorSuccess",
}
export type ChangeIframeScreenProps = {
  showScreen: IframeActiveState;
};
export type LoginProps = {
  userName: string;
  showScreen?: IframeActiveState;
};
export type LogoutProps = {
  showScreen?: IframeActiveState;
};
export type SignRegisterUserInitProps = {
  userName: string;
  challenge: UserRegistrationChallenge;
  showScreen?: IframeActiveState;
};
export type LoginWithTokenProps = {
  token: string;
  showScreen?: IframeActiveState;
};
export type CreateWalletProps = {
  userName: string;
  walletName: string;
  networkId: BlockchainNetwork;
  showScreen?: IframeActiveState;
};

interface ITypedDataField {
  name: string;
  type: string;
}
interface ITypeMap {
  [key: string]: ITypedDataField[];
}
interface IPerson {
  name: string;
  wallet: string;
}
interface IMail {
  from: IPerson;
  to: IPerson;
  contents: string;
}
interface IDomain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
  salt: string;
}
interface IEIP712TypedData {
  kind: string;
  types: ITypeMap;
  domain: IDomain;
  message: IMail;
}
export interface TransactionPayload extends IEIP712TypedData {
  kind: "Eip712";
  message: {
    from: {
      name: string;
      wallet: string;
    };
    to: {
      name: string;
      wallet: string;
    };
    contents: string;
  };
}