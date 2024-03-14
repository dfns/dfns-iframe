import { SignUserActionChallengeRequest } from "@dfns/sdk";
import { CreateWalletRequest } from "@dfns/sdk/types/wallets";
import { NextResponse } from "next/server";

import { DFNS_END_USER_TOKEN_COOKIE } from "../../../constants";
import { getDfnsDelegatedClient } from "../../../utils";

export default async function POST(request, res) {
  const body = (await request.json()) as {
    request: CreateWalletRequest;
    signedChallenge: SignUserActionChallengeRequest;
  };

  const endUserAuthToken = request.cookies.get(
    DFNS_END_USER_TOKEN_COOKIE
  )?.value;

  if (!endUserAuthToken) {
    return NextResponse.json(
      { message: "end user token not found" },
      { status: 401 }
    );
  }

  const dfnsDelegated = getDfnsDelegatedClient(endUserAuthToken);

  const wallet = await dfnsDelegated.wallets.createWalletComplete(
    body.request,
    body.signedChallenge
  );

  return NextResponse.json({ wallet });
}
