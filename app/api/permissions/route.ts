import { NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { dfns } from "../utils";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = await req.json();
    const user = body.user;
    if (!body?.user) {
      return NextResponse.json(
        { ok: false, error: `error: user data not set` },
        {
          status: 401,
        }
      );
    }
    const permission = await dfns.permissions.createPermission({
      body: {
        name: `Allow Wallet Create/Read - ${Date.now()}`,
        operations: ["Wallets:Create", "Wallets:Read"],
      },
    });
    const permissionAssignment = await dfns.permissions.createAssignment({
      permissionId: permission.id,
      body: {
        identityId: user.id,
      },
    });

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
