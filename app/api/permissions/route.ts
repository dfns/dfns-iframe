import { BaseAuthApi } from "@dfns/sdk";
import { NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { DFNS_END_USER_TOKEN_COOKIE } from "../constants";
import { dfns } from "../utils";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("starting permissions complete...");
    const body = await req.json();
    const user = body.user;

    console.log("user:", body?.user);

    if (!body?.user) {
      return NextResponse.json(
        { ok: false, error: `error: user data not set` },
        {
          status: 401,
        }
      );
    }

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
        identityId: user.id,
      },
    });

    console.log("permissionAssignment createAssignment", {
      permissionAssignment,
    });

    console.log("finished permissions...");

    return NextResponse.json(
      { permission, permissionAssignment },
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
