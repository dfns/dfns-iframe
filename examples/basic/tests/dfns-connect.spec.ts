import { test, expect, Page } from "@playwright/test";

async function setupVirtualAuthenticator(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send("WebAuthn.enable");

  const authenticator = await client.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "usb",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    },
  });

  return { client, authenticatorId: authenticator.authenticatorId };
}

const PARENT_IFRAME_URL = "http://localhost:3001";
const IFRAME_URL = "http://localhost:3000/iframe";

test.only("WebAuthn create passkey and sign request", async ({ page }) => {
  const { client, authenticatorId } = await setupVirtualAuthenticator(page);

  const random = Math.random().toString(36).substring(2, 15);
  // needs to be email that can receive verification code to complete
  // recovery
  const randomValidEmail = `rod+${random}@dfns.co`;
  await page.goto(PARENT_IFRAME_URL);
  const iframe = await page.frame({ url: IFRAME_URL });

  if (!iframe) {
    throw new Error("Iframe not found");
  }

  const iframeURL = iframe.url();
  expect(iframeURL).toBe(IFRAME_URL);

  await page.getByPlaceholder("username").click();
  await page.getByPlaceholder("username").fill(randomValidEmail);
  await page
    .frameLocator("#dfnsIframe")
    .getByRole("button", { name: "Continue with my device" })
    .click();

  // @ts-expect-error webauthn.create exists
  page.on("webauthn.create", async (data) => {
    const credentialCreationResponse = await client.send(
      "WebAuthn.addCredential",
      {
        authenticatorId,
        credential: {
          credentialId: "test-credential-id",
          isResidentCredential: true,
          privateKey: "test-private-key",
          rpId: data.rpId,
          userHandle: "test-user-handle",
          signCount: 0,
        },
      }
    );

    if (credentialCreationResponse) {
      console.log("Passkey creation successful");
    } else {
      console.log("Passkey creation failed");
    }
  });

  // @ts-expect-error webauthn.get exists
  page.on("webauthn.get", async (data) => {
    console.log({ data });
    // @ts-expect-error WebAuthn.addAssertion exists
    const assertionResponse = await client.send("WebAuthn.addAssertion", {
      authenticatorId,
      credential: {
        credentialId: "test-credential-id",
        userHandle: "test-user-handle",
        authenticatorData: "test-authenticator-data",
        signature: "test-signature",
        clientDataJSON: "test-client-data-json",
      },
    });

    if (assertionResponse) {
      console.log("Sign request successful");
    } else {
      console.log("Sign request failed");
    }
  });

  await iframe.waitForURL(`${IFRAME_URL}/recovery-codes`);
  const recoveryCode = await page
    .frameLocator("#dfnsIframe")
    .getByTestId("recovery-code-input")
    .getByRole("textbox")
    .inputValue();

  console.log("recoveryCode", recoveryCode);

  const recoveryKey = await page
    .frameLocator("#dfnsIframe")
    .getByTestId("recovery-key-input")
    .getByRole("textbox")
    .inputValue();

  console.log("recoveryKey", recoveryKey);

  await page
    .frameLocator("#dfnsIframe")
    .getByText("I’ve saved them in a secure")
    .click();
  await page
    .frameLocator("#dfnsIframe")
    .getByTestId("recovery-saved-continue-btn")
    .click();

  await iframe.waitForURL(`${IFRAME_URL}/user-wallet`);

  await expect(
    page.frameLocator("#dfnsIframe").getByTestId("user-wallet")
  ).toHaveCount(1);

  await page.getByTestId("parent-sign-transaction-btn").click({ force: true });

  console.log("iframe.url()1 :", iframe.url());
  await iframe.waitForURL(`${IFRAME_URL}/sign-transaction`);
  console.log("iframe.url()2:", iframe.url());

  await page
    .frameLocator("#dfnsIframe")
    .getByTestId("sign-transaction-btn")
    .click();

  await expect(
    page.frameLocator("#dfnsIframe").getByTestId("transaction-signed-success")
  ).toHaveCount(1);

  await page.getByTestId("logout-btn").click();
  await iframe.waitForURL(`${IFRAME_URL}/create-user-and-wallet`);

  await page.getByTestId("recover-credentials-btn").click();

  await iframe.waitForURL(`${IFRAME_URL}/recover`);

  await page
    .frameLocator("#dfnsIframe")
    .getByTestId("recovery-email-input")
    .getByRole("textbox")
    .fill(randomValidEmail);

  await page
    .frameLocator("#dfnsIframe")
    .getByTestId("recovery-email-btn")
    .click();

  await page
    .frameLocator("#dfnsIframe")
    .getByTestId("recovery-code-input")
    .getByRole("textbox")
    .fill(recoveryCode);

  await page
    .frameLocator("#dfnsIframe")
    .getByTestId("recovery-key-input")
    .getByRole("textbox")
    .fill(recoveryKey);

  // verification string needs to be retrieved from email
  await page.pause();

  // Clean up
  await client.send("WebAuthn.removeVirtualAuthenticator", {
    authenticatorId,
  });
});
