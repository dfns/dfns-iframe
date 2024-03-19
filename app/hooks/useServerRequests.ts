import { UserAuthKind } from "@dfns/sdk/codegen/datamodel/Auth";

// Note:
// create user init (requires service account)
// this code calls APIs in node in this nextjs instance
// calls that require private data to instantiate
// which we don't want exposed in the client

export const useServerRequests = () => {
  const getCreateNewUserChallenge = async (userName: string) => {
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

      if (!!challenge.error) {
        throw new Error(challenge.error);
      }
      return challenge;
    } catch (e) {
      throw new Error(e.message);
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
      throw new Error(e.message);
    }
  };

  return {
    getCreateNewUserChallenge,
    addPermissionsToNewUser,
  };
};
