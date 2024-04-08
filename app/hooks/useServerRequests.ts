import { UserAuthKind } from "@dfns/sdk/codegen/datamodel/Auth";

// Note:
// create user init (requires service account)
// this code calls APIs in node in this nextjs instance
// calls that require private data to instantiate
// which we don't want exposed in the client

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

  const addPermissionsToNewUser = async (user) => {
    try {
      if (!user) {
        throw new Error("user not set");
      }
      // Note: this nextjs instance has server-side code
      const response = await fetch("/api/permissions", {
        method: "POST",
        body: JSON.stringify({
          user,
        }),
      });

      return response;
    } catch (e) {
      console.error(e.message);
    }
  };

  const delegatedLoginNewUser = async (userName: string) => {
    try {
      if (!userName) {
        throw new Error("user not set");
      }
      // Note: this nextjs instance has server-side code
      const response = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({
          email: userName,
        }),
      });
      const parsedResponse = await response.json();
      return parsedResponse;
    } catch (e) {
      console.error(e.message);
    }
  };

  return {
    getRegisterInitChallenge,
    addPermissionsToNewUser,
    delegatedLoginNewUser,
  };
};
