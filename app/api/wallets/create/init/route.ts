import { CreateWalletRequest } from "@dfns/sdk/types/Wallets";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

import { DFNS_END_USER_TOKEN_COOKIE } from "../../../constants";
import { getDfnsDelegatedClient } from "../../../utils";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  console.log("wallet init");
  const body = await req.json();
  const endUserAuthToken = body.userAuthToken;

  try {
    const dfnsDelegated = getDfnsDelegatedClient(endUserAuthToken);

    const createWalletRequest: CreateWalletRequest = {
      body: { network: "PolygonMumbai" },
    };

    const challenge = await dfnsDelegated.wallets.createWalletInit(
      createWalletRequest
    );

    return NextResponse.json(
      { createWalletRequest, challenge },
      {
        status: 200,
      }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `error: ${e}` },
      { status: 401 }
    );
  }
}
