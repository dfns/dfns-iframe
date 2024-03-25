import { NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { dfns } from "../../utils";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const body = await req.json();
  const email = body.email;
  const kind = body.kind;

  try {
    const registrationChallenge =
      await dfns.auth.createDelegatedUserRegistration({
        body: { email, kind },
      });
    return NextResponse.json(registrationChallenge, {
      status: 200,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message || "Server error",
      },
      { status: e?.httpStatus || 500 }
    );
  }
}
