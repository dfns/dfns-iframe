import { NextRequest, NextResponse } from "next/server";
import { dfns } from "../utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body.email;

  try {
    if (!email) throw new Error("email not set");
    const { token: userAuthToken } = await dfns.auth.createDelegatedUserLogin({
      body: { username: email },
    });
    return NextResponse.json(
      { ok: "true", token: `${userAuthToken}` },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `error: ${e}` },
      { status: 401 }
    );
  }
}
