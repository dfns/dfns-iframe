import { BaseAuthApi } from "@dfns/sdk";
import { NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { DFNS_END_USER_TOKEN_COOKIE } from "../../constants";
import { dfns } from "../../utils";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("starting register complete...");
    const body = res.body;

    if (!body?.tempAuthToken) {
      return res.status(400).json({ message: "error - not authtoken set" });
    }
    console.log("start createUserRegistration");
    // Complete end-user registration
    const result = await BaseAuthApi.createUserRegistration(
      body.signedChallenge,
      {
        appId: process.env.DFNS_APP_ID!,
        baseUrl: process.env.DFNS_API_URL!,
        authToken: body.tempAuthToken,
      }
    );

    console.log("result createUserRegistration", { result });

    // save Dfns EndUser ID in your system, eg:
    // saveUserDfnsInfo(result.user.id)

    console.log("start createPermission");

    // Create a generic permission to get/create wallets (can skip if permission was already created once)
    const permission = await dfns.permissions.createPermission({
      body: {
        name: `Allow Wallet Create/Read - ${Date.now()}`,
        operations: ["Wallets:Create", "Wallets:Read"],
      },
    });

    console.log("permission createPermission", { permission });

    console.log("start createAssignment");
    // Grant (assign) the permission to the end-user
    const permissionAssignment = await dfns.permissions.createAssignment({
      permissionId: permission.id,
      body: {
        identityId: result.user.id,
      },
    });

    console.log("permissionAssignment createAssignment", {
      permissionAssignment,
    });

    console.log("start createDelegatedUserLogin");
    // Perform delegated login to get the Dfns auth token of the end-user ("on his behalf")
    const { token: userAuthToken } = await dfns.auth.createDelegatedUserLogin({
      body: { username: result.user.username },
    });

    console.log("userAuthToken createDelegatedUserLogin", { userAuthToken });

    console.log("finished register complete...");

    // Here we chose to cache the end-user Dfns auth token in a cookie. You could choose to cache it in a store, or not cache it at all. If not cached though, you'll need to perform delegated login every time you want to do a Dfns action on behalf of your end-user.
    res?.cookies?.set(DFNS_END_USER_TOKEN_COOKIE, userAuthToken);

    return NextResponse.json(
      { result, permission, permissionAssignment },
      {
        status: 200,
      }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `error: ${e}` },
      {
        status: 401,
      }
    );
  }
}
