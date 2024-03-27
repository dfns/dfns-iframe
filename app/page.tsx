"use client";

import { useState, useRef, useEffect } from "react";

import {
  useDfns,
  MessageActions,
  IframeActiveState,
  MessageParentActionsResponses,
} from "@/app/hooks/useDfns";
import { useServerRequests } from "@/app/hooks/useServerRequests";
import { DfnsIframe } from "@/app/components/DfnsIframe";

const TEST_EMAIL = "rod+grvt57@dfns.co";

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [userName] = useState(TEST_EMAIL);
  const [serverErrorMessage, setServerErrorMessage] = useState("");
  const iframeRef = useRef(null);

  const {
    getRegisterInitChallenge,
    addPermissionsToNewUser,
    delegatedLoginNewUser,
  } = useServerRequests();

  const {
    isDfnsReady,
    messageErrors,
    userAuthToken,
    userWallets,
    changeIframeScreen,
    login,
    logout,
    createWallet,
    userWalletExists,
    registerUserInitSign,
    onIframeLoaded,
    sendMessageToDfns,
    loginUserWithToken,
  } = useDfns({
    iframeRef,
    userName,
    onReceiveDfnsMessage,
  });

  async function onReceiveDfnsMessage(event: MessageEvent) {
    const parentAction = event.data.parentAction;
    switch (parentAction) {
      case MessageParentActionsResponses.initUserRegister:
        createUserInit();
        return;
      case MessageParentActionsResponses.completeUserRegister:
        await createUserComplete(event);
        return;
      case MessageParentActionsResponses.userLoginWithTokenComplete:
      case MessageParentActionsResponses.userLoginSuccess:
        userWalletExists();
        return;
      case MessageParentActionsResponses.isWalletExists:
        const { isWalletExists } = event.data;
        if (!isWalletExists) {
          await createWallet();
        } else {
          changeIframeScreen(IframeActiveState.userWallet);
        }
        return;
      default:
        return;
    }
  }

  // initiates user creation with service account - step 1
  async function createUserInit() {
    setServerErrorMessage("");
    try {
      const challenge = await getRegisterInitChallenge(userName);
      await registerUserInitSign(userName, challenge);
    } catch (e) {
      if (e?.message === "User already exists.") {
        login({ userName, onLoginShow: IframeActiveState.createUserAndWallet });
        return;
      }
      setServerErrorMessage(`${e?.message}` || "server error");
    }
  }

  // completes user creation - step 2
  async function createUserComplete(event: MessageEvent) {
    try {
      const user = event.data.signedInitRegistration.user;
      await addPermissionsToNewUser(user);
      const { token } = await delegatedLoginNewUser(userName);
      await loginUserWithToken(token);
    } catch (e) {
      console.error("error adding permissions to new user", e);
    }
  }

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;
  return (
    <main className=" min-h-screen bg-[#CCC] text-[black] p-4 max-w-[90hw] flex flex-col ">
      <div className="border-8 border-[black] mb-8 p-2 w-[600px]">
        <h1 className="my-3 text-xl">Example website with Dfns iframe</h1>
        {!!messageErrors && (
          <div className="text-[red]">errors from: {messageErrors}</div>
        )}
        {!!serverErrorMessage && (
          <div className="text-[red]">server error: {serverErrorMessage}</div>
        )}
        <h4 className="py-1 text-sm">
          iframe status: {isDfnsReady ? "ready" : "not ready"}
        </h4>
        <h4 className="py-1 text-sm">
          userAuthToken: {!!userAuthToken ? "set" : "not set"} in iframe and
          iframe parent
        </h4>
        <h2>userName: {userName}</h2>
        <div className="flex gap-2">
          <button
            className="bg-[black] text-[white] p-4 my-4"
            onClick={() => {
              login({ userName });
            }}
          >
            Login
          </button>
          <button
            className="bg-[black] text-[white] p-4 my-4"
            onClick={() => {
              logout({ onLogoutShow: IframeActiveState.createUserAndWallet });
            }}
          >
            Logout
          </button>
          <button
            className="bg-[black] text-[white] p-4  my-4"
            onClick={createUserInit}
          >
            Register New User
          </button>
        </div>
        <div>
          change iframe screen
          <select
            className="py-2 px-5 m-2 rounded-xl"
            onChange={(e) =>
              changeIframeScreen(e.target.value as IframeActiveState.default)
            }
          >
            <option>select screen...</option>
            {Object.values(IframeActiveState).map((screen, i) => (
              <option key={i} value={screen}>
                {screen}
              </option>
            ))}
          </select>
        </div>
        <div className="flex  flex-col gap-2">
          {!!userAuthToken && (
            <>
              <div className="gap-2 flex">
                <button
                  className="bg-[black] text-[white] p-4  my-4"
                  onClick={() => {
                    setServerErrorMessage("");
                    createWallet();
                  }}
                >
                  Create New Wallet
                </button>
                <button
                  className="bg-[black] text-[white] p-4  my-4"
                  onClick={() => {
                    setServerErrorMessage("");
                    sendMessageToDfns({
                      action: MessageActions.listWallets,
                      userName,
                    });
                  }}
                >
                  List user wallets
                </button>
              </div>
              {!!userWallets && (
                <div>
                  <h3 className="text-sm mb-0 pb-0 font-bold">User Wallets</h3>
                  <ul>
                    {!!userWallets && userWallets?.items?.length > 0 ? (
                      userWallets.items.map((w: Wallet, index: number) => (
                        <li
                          key={index}
                          className="py-2 text-sm flex flex-row gap-2"
                        >
                          <span>
                            {w.status} - {w.network} - {w.address}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li>User has no wallets</li>
                    )}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <h3>Iframe below in blue</h3>
      <div className="border-8 border-sky-500 w-[420px]">
        <DfnsIframe
          onLoad={onIframeLoaded}
          initialScreen={IframeActiveState.createUserAndWallet}
        />
      </div>
    </main>
  );
}
