import { NextResponse, NextRequest } from "next/server";
import { dfns } from "../../utils";
import { RegisterEndUserBody } from "@dfns/sdk/generated/auth";
import { BlockchainNetwork } from "@dfns/datamodel/dist/Wallets";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json();
    const firstFactorCredential = body.firstFactorCredential;

    if (!body?.user) {
      return NextResponse.json(
        { ok: false, error: `error: user data not set` },
        {
          status: 401,
        }
      );
    }
    const completeEndUserRegistration = await dfns.auth.registerEndUser({
      body: {
        firstFactorCredential: {
          credentialKind: "Fido2",
          credentialInfo: {
            credId: "",
            clientData: "",
            attestationData: "",
          },
        },
        wallets: {
          network: "EthereumSepolia",
          name: "default wallet name",
        },
      },
    });

    return NextResponse.json(
      { completeEndUserRegistration },
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
