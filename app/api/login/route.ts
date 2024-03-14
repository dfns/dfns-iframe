import { NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { DFNS_END_USER_TOKEN_COOKIE } from "../constants";
import { dfns } from "../utils";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const body = await req.json();
  const email = body.email;
  try {
    const { token: userAuthToken } = await dfns.auth.createDelegatedUserLogin({
      body: { username: email },
    });
    if (!!req?.cookies) {
      req.cookies.set(DFNS_END_USER_TOKEN_COOKIE, userAuthToken);
    }
    return NextResponse.json({ ok: true, userAuthToken }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `error: ${e}` },
      { status: 401 }
    );
  }
}
