import { NextResponse, NextRequest } from "next/server";
import { dfns } from "../../utils";
import { DfnsError } from "@dfns/sdk";

export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();
  const email = body.email;
  const kind = body.kind;

  try {
    const registrationChallenge =
      await dfns.auth.createDelegatedRegistrationChallenge({
        body: { email, kind },
      });
    return NextResponse.json(registrationChallenge, {
      status: 200,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof DfnsError ? e?.message : "Server error",
      },
      { status: e instanceof DfnsError ? e?.httpStatus : 500 }
    );
  }
}
