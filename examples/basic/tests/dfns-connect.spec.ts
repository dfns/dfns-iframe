import { test, expect, Page } from "@playwright/test";
import { checkElementExistsByTestId } from "./helpers/exist";

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

test.only("WebAuthn create passkey and sign request", async ({ page }) => {
  const { client, authenticatorId } = await setupVirtualAuthenticator(page);

  const random = Math.random().toString(36).substring(2, 15);
  const randomValidEmail = `rod+${random}@dfns.co`;

  // await page.route("**/*", (route) => {
  //   const url = route.request().url();
  //   if (url.includes("http://localhost:3000/iframe")) {
  //     console.log("Intercepted iframe route:", url);
  //   }
  //   route.continue();
  // });

  await page.goto("http://localhost:3001");

  const iframe = await page.frame({ url: "http://localhost:3000/iframe" });

  if (!iframe) {
    throw new Error("Iframe not found");
  }

  const iframeURL = iframe.url();
  expect(iframeURL).toBe("http://localhost:3000/iframe");

  await page.getByPlaceholder("username").click();
  await page.getByPlaceholder("username").fill(randomValidEmail);
  await page
    .frameLocator("#dfnsIframe")
    .getByRole("button", { name: "Continue with my device" })
    .click();

  // Wait for a credential creation request and fulfill it
  // @ts-expect-error it works...
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

  // Wait for an assertion request and fulfill it
  // @ts-expect-error it works...
  page.on("webauthn.get", async (data) => {
    // @ts-expect-error it works...
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

  await iframe.waitForURL("http://localhost:3000/iframe/recovery-codes");

  await page
    .frameLocator("#dfnsIframe")
    .getByText("I’ve saved them in a secure")
    .click();
  await page
    .frameLocator("#dfnsIframe")
    .getByTestId("recovery-saved-continue-btn")
    .click();

  await iframe.waitForURL("http://localhost:3000/iframe/user-wallet");

  await expect(
    page.frameLocator("#dfnsIframe").getByTestId("user-wallet")
  ).toHaveCount(1);

  await page.getByTestId("parent-sign-transaction-btn").click({ force: true });

  console.log("iframe.url()1 :", iframe.url());
  await iframe.waitForURL("http://localhost:3000/iframe/sign-transaction");
  console.log("iframe.url()2:", iframe.url());

  await page
    .frameLocator("#dfnsIframe")
    .getByTestId("sign-transaction-btn")
    .click();

  await expect(
    page.frameLocator("#dfnsIframe").getByTestId("transaction-signed-success")
  ).toHaveCount(1);

  // Clean up
  await client.send("WebAuthn.removeVirtualAuthenticator", {
    authenticatorId,
  });
});
