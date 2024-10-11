import { useState, useEffect } from "react";

export const useWebAuthn = () => {
  const [isWebauthnSupported, setIsWebauthnSupported] = useState<
    null | boolean
  >(null);
  const [
    isBrowserSupportsWebAuthnAutofill,
    setIsBrowserSupportsWebAuthnAutofill,
  ] = useState<null | boolean>(null);
  const [
    isPlatformAuthenticatorAvailable,
    setIsPlatformAuthenticatorAvailable,
  ] = useState<null | boolean>(null);
  const [isCrossOriginWebauthnSupported, setIsCrossOriginWebauthnSupported] =
    useState<null | boolean>(null);

  const detectWebauthnError = (errorMessage: string) => {
    const knownCrossOriginErrorMessages = [
      "The following credential operations can only occur in a document which is same-origin with all of its ancestors: storage/retrieval of 'PasswordCredential' and 'FederatedCredential', storage of 'PublicKeyCredential'.",
      "The following credential operations can only occur in a document which is same-origin with all of its ancestors: storage/retrieval of 'PasswordCredential' and 'FederatedCredential', storage of 'PublicKeyCredential'.",
      "undefined is not an object (evaluating 'navigator.credentials.create')",
      "undefined is not an object (evaluating 'navigator.credentials.get')",
      "The origin of the document is not the same as its ancestors.",
    ];
    if (
      !!errorMessage &&
      knownCrossOriginErrorMessages.find(
        (m) => m.toLowerCase().trim() === errorMessage.toLowerCase().trim()
      )
    ) {
      setIsCrossOriginWebauthnSupported(false);
    }
  };

  const getBrowserCapabilities = async () => {
    const isPublicKeyCredentialSupported =
      window?.PublicKeyCredential !== undefined &&
      typeof window.PublicKeyCredential === "function";
    const isCredentialsPresentInNavigator = "credentials" in window?.navigator;
    const isNavigatorCredentialsSupported = !(
      typeof navigator.credentials !== "object" ||
      typeof navigator.credentials.create !== "function" ||
      typeof navigator.credentials.get !== "function" ||
      !isCredentialsPresentInNavigator
    );
    setIsWebauthnSupported(
      isPublicKeyCredentialSupported && isNavigatorCredentialsSupported
    );

    /**
     * Determine whether the browser can communicate with a built-in authenticator, like
     * Touch ID, Android fingerprint scanner, or Windows Hello.
     *
     * This method will _not_ be able to tell you the name of the platf xorm authenticator.
     */
    const isPlatformAuthenticatorAvailable =
      await window?.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    setIsPlatformAuthenticatorAvailable(isPlatformAuthenticatorAvailable);

    /**
     * Determine if the browser supports conditional UI, so that WebAuthn credentials can
     * be shown to the user in the browser's typical password autofill popup.
     */
    const isBrowserSupportsWebAuthnAutofill =
      await window?.PublicKeyCredential?.isConditionalMediationAvailable();
    setIsBrowserSupportsWebAuthnAutofill(isBrowserSupportsWebAuthnAutofill);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      getBrowserCapabilities();
    }
  }, []);
  return {
    isWebauthnSupported,
    isCrossOriginWebauthnSupported,
    isBrowserSupportsWebAuthnAutofill,
    isPlatformAuthenticatorAvailable,
    detectWebauthnError,
  };
};
