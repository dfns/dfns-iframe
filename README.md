# Interacting with DFNS iframe

This Nextjs project was created as a demo of how to interact with the Dfns iframe to be used to authenticate user actions via the dfns origin.

## Installation

### Populate .env file with credentials

.env.example needs to be renamed to .env and the credentials updated with valid information.

```
NEXT_PUBLIC_IFRAME_URL=https://app.dfns.ninja/iframe # change to app.dfns.io for production
NEXT_PUBLIC_DFNS_APP_ID=XXX Your Default Dfns App ID XXX
NEXT_PUBLIC_DFNS_ORG_ID=XXX Your Org ID XXX

DFNS_API_URL='https://api.dfns.ninja' # change to app.dfns.io for production

DFNS_CRED_ID=XXX Cred ID From your service account XXX
DFNS_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----
XXX Your Private Key XXX
-----END PRIVATE KEY-----'
DFNS_AUTH_TOKEN=XXX Auth Token from service account creation XXX
```

### Install packages

```
npm install
```

### Run in developer mode (hot reload)

```
npm run dev
```

To use a locally signed cert use for https

```
npm run devs
```

## Important notes

- Iframe url needs to be live
- Iframe needs to accept the domain this project is running under. It currently accepts `http://localhost:3001` for local development but rejects other origins
- Iframe is under active development and might create breaking changes.
- Iframe is not currently deployed to ninja only
