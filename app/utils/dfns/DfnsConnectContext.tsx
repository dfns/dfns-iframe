import { createContext } from "react";
import {
  ChangeIframeScreenProps,
  LoginProps,
  IframeActiveState,
} from "@/app/utils/dfns/types";

interface DfnsContextType {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  isConnectReady: boolean;
  setIframeRef: (iframe: HTMLIFrameElement) => void;
  setIframeReady: () => void;
  changeIframeScreen: ({ showScreen }: ChangeIframeScreenProps) => void;
  login: ({ userName, showScreen }: LoginProps) => void;
  logout: () => void;
}

const DfnsConnectContext = createContext<DfnsContextType | null>(null);

export default DfnsConnectContext;
