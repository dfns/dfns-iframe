import { UserAuthKind } from "@dfns/sdk/codegen/datamodel/Auth";

export const useServerRequests = () => {
  const getRegisterInitChallenge = async (userName: string) => {
    try {
      if (!userName) {
        throw new Error("Username not set");
      }
      const response = await fetch("/api/register/init", {
        method: "POST",
        body: JSON.stringify({
          email: userName,
          kind: UserAuthKind.EndUser,
        }),
      });

      const challenge = await response.json();
      if (challenge.ok === false) {
        throw new Error(challenge.error || "Unknown error");
      }
      return challenge;
    } catch (e) {
      console.log("error", e);
      throw e;
    }
  };

  const addPermissionsToNewUser = async (user: any) => {
    try {
      if (!user) {
        throw new Error("user not set");
      }
      const response = await fetch("/api/permissions", {
        method: "POST",
        body: JSON.stringify({
          user,
        }),
      });

      return response;
    } catch (e) {
      throw e;
    }
  };

  const delegatedLoginNewUser = async (userName: string) => {
    try {
      if (!userName) {
        throw new Error("user not set");
      }
      const response = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({
          email: userName,
        }),
      });
      const parsedResponse = await response.json();
      return parsedResponse;
    } catch (e) {
      throw e;
    }
  };

  return {
    getRegisterInitChallenge,
    addPermissionsToNewUser,
    delegatedLoginNewUser,
  };
};
