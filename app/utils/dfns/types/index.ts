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

export enum MessageActions {
  iframeReady = "iframeReady",
  login = "login",
  logout = "logout",

  registerInitSign = "registerInitSign",
  createWallet = "createWallet",
  listWallets = "listWallets",
  userWalletExists = "userWalletExists",
  signWalletTransaction = "signWalletTransaction",
  getAuthToken = "getAuthToken",
  loginWithToken = "loginWithToken",
  registerInit = "registerInit",
  updateIframeScreenState = "updateIframeScreenState",
  parentErrorMessage = "parentErrorMessage",
}
export enum MessageActionsResponses {
  iframeReadySuccess = "iframeReadySuccess",
  loginSuccess = "loginSuccess",
  logoutSuccess = "logoutSuccess",
  updateIframeScreenStateSuccess = "updateIframeScreenStateSuccess",

  authToken = "authToken",
  authenticated = "authenticated",
  errorMessage = "errorMessage",
  registered = "registered",
  walletCreated = "walletCreated",
  walletsList = "walletsList",
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

export enum MessageParentActionsResponses {
  initUserRegister = "initUserRegister",
  completeUserRegister = "completeUserRegister",
  userLoginSuccess = "userLoginSuccess",
  userLogoutSuccess = "userLogoutSuccess",
  userLoginWithTokenComplete = "userLoginWithTokenComplete",
  isWalletExists = "isWalletExists",
  error = "error",
}

export type ChangeIframeScreenProps = {
  showScreen: IframeActiveState;
};
export type LoginProps = {
  userName: string;
  showScreen?: IframeActiveState;
};
