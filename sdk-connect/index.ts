import {
  UserRegistrationChallenge,
  UserRegistrationResponse,
  Fido2Attestation,
} from "@dfns/sdk";
import { BlockchainNetwork } from "./windowMessage";
import {
  CreateWalletResponse,
  ListWalletsResponse,
} from "@dfns/sdk/generated/wallets";

export enum IframeActiveState {
  default = "default",
  createUserAndWallet = "createUserAndWallet",
  signTransaction = "signTransaction",
  recoveryCodes = "recoveryCodes",
  credentialsList = "credentialsList",
  recoveryCredentialsList = "recoveryCredentialsList",
  parentErrorMessage = "parentErrorMessage",
  userWallet = "userWallet",
  waiting = "waiting",
  webauthnWaiting = "webauthnWaiting",
  createPasskeyWaiting = "createPasskeyWaiting",
  transactionWaiting = "transactionWaiting",
  recover = "recover",
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
  listUserRecoveryCredentials = "listUserRecoveryCredentials",
  userWalletExists = "userWalletExists",
  createAdditionalCredential = "createAdditionalCredential",
  signWalletTransaction = "signWalletTransaction",
  createUserAndWallet = "createUserAndWallet",
  getCurrentUserInfo = "getCurrentUserInfo",

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
  listUserRecoveryCredentialsSuccess = "listUserRecoveryCredentialsSuccess",
  createAdditionalCredentialSuccess = "createAdditionalCredentialSuccess",
  signWalletTransactionSuccess = "signWalletTransactionSuccess",
  createUserAndWalletSuccess = "createUserAndWalletSuccess",
  getCurrentUserInfoSuccess = "getCurrentUserInfoSuccess",

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
  error?: Error;
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
  error?: Error;
  errorMessage?: String;
};
export enum MessageParentActions {
  initUserRegister = "initUserRegister",
  login = "login",
  handleError = "handleError",
  handleSignedTransaction = "handleSignedTransaction",
}
export type CreateUserAndWalletResponse = {
  userWalletAddress: string | undefined;
  isUserCreatedSuccess: boolean | undefined;
};
export type ErrorParentPayload = {
  message?: String;
  error?: Error;
};
export type MessageParentActionPayload = {
  showScreen?: IframeActiveState;
};
export enum MessageParentActionsResponses {
  initUserRegisterSuccess = "initUserRegisterSuccess",
  loginSuccess = "loginSuccess",
  handleErrorSuccess = "handleErrorSuccess",
  handleSignedTransactionSuccess = "handleSignedTransactionSuccess",
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
export type Networks =
  | "Algorand"
  | "AlgorandTestnet"
  | "ArbitrumOne"
  | "ArbitrumSepolia"
  | "AvalancheC"
  | "AvalancheCFuji"
  | "Base"
  | "BaseSepolia"
  | "Bitcoin"
  | "BitcoinTestnet3"
  | "Bsc"
  | "BscTestnet"
  | "Ethereum"
  | "EthereumGoerli"
  | "EthereumSepolia"
  | "FantomOpera"
  | "FantomTestnet"
  | "Litecoin"
  | "LitecoinTestnet"
  | "Optimism"
  | "OptimismSepolia"
  | "Polygon"
  | "PolygonAmoy"
  | "PolygonMumbai"
  | "Tron"
  | "TronNile"
  | "ArbitrumGoerli"
  | "BaseGoerli"
  | "Cardano"
  | "CardanoPreprod"
  | "Kusama"
  | "OptimismGoerli"
  | "Polkadot"
  | "Westend"
  | "Solana"
  | "SolanaDevnet"
  | "Stellar"
  | "StellarTestnet"
  | "Tezos"
  | "TezosGhostnet"
  | "XrpLedger"
  | "XrpLedgerTestnet"
  | "KeyEdDSA"
  | "KeyECDSA"
  | "KeyECDSAStark";

export type Wallet = {
  network: Networks;
  name?: string;
};
export type CreateUserAndWalletProps = {
  wallets: Wallet[];
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
  verifyingContract?: string;
  salt?: string;
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

export type DfnsConnectTheme = {
  global: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    highlightColor?: string;
  };
  primaryButton: {
    backgroundColor?: string;
    textColor?: string;
    borderRadiusPx?: string;
  };
  secondaryButton: {
    textColor?: string;
    backgroundColor?: string;
    outlineColor?: string;
  };
  indicators: {
    successColor?: string;
    errorColor?: string;
  };
  logoImgUrl?: string;
  logoDarkImgUrl?: string;
};
export type DfnsConnectConfig = {
  iframeUrl: string;
  appId: string;
  orgId: string;
  theme?: DfnsConnectTheme;
};
