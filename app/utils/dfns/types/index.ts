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

  completeUserRegister = "completeUserRegister",
  userLoginSuccess = "userLoginSuccess",
  userLogoutSuccess = "userLogoutSuccess",
  userLoginWithTokenComplete = "userLoginWithTokenComplete",
  isWalletExists = "isWalletExists",
  error = "error",
}

export enum MessageParentActionsResponses {
  initUserRegisterSuccess = "initUserRegisterSuccess",
  loginSuccess = "loginSuccess",
  handleErrorSuccess = "handleErrorSuccess",

  completeUserRegisterSuccess = "completeUserRegisterSuccess",
  userLoginSuccess = "userLoginSuccess",
  userLogoutSuccess = "userLogoutSuccess",
  userLoginWithTokenCompleteSuccess = "userLoginWithTokenCompleteSuccess",
  isWalletExistsSuccess = "isWalletExistsSuccess",
  error = "errorSuccess",
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
