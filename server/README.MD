# Commission Quote API

The Commission Quote API is the TypeScript and Express service for generating commission estimates. It runs independently from the browser client and is responsible for API-key validation, quote input validation, commission calculation, request logging, and error responses.

## Prerequisites

- Node.js 20 LTS or newer
- npm 10 or newer

Check the installed versions:

```
node --version
npm --version
```

## Install dependencies

From the repository root:

```
npm --prefix .\server install 
```

Or from this directory:

```
npm install
```

The project uses `express`, `cors`, `dotenv`, `zod`, and Node.js crypto APIs at runtime. TypeScript, `tsx`, Vitest, and Supertest are development dependencies.

## Configure environment variables

Create a local `.env` file in the `server` directory.

```
PORT=4000
COMMISSION_QUOTE_API_KEY=replace-with-a-new-long-random-value
```

`COMMISSION_QUOTE_API_KEY` is required. The server will refuse to start if it is missing.

Keep `.env.example` limited to placeholder values.

## Run the service

Start the development server with automatic TypeScript reload:

```
npm run dev
```

The API listens on `http://localhost:4000` unless `PORT` is set.

To build and run the compiled JavaScript:

```
npm run build
npm start
```

The build output in `dist/` is generated from the TypeScript source. Edit the files in `index.ts`, `routes/`, and `util/`, not generated files in `dist/`.


## Authentication and security

The current implementation uses a static API key, not JWT authentication. The request flow is:

```text
Client request with X-API-Key -> ensureAuthenticated middleware -> validated quote route -> quote service
```

The middleware uses a timing-safe comparison and returns `401 { "msg": "Invalid API key" }` for missing or invalid keys. API keys should be used only for trusted/internal clients because a browser client can expose any key shipped to it. Public applications should use user authentication with secure cookie sessions or short-lived tokens, and server-only credentials for any external upstream provider.

All query values are validated by Zod in the route before they reach the quote service. The service repeats essential numeric checks so direct code callers cannot bypass the HTTP validation layer.

The package includes `helmet` and `express-rate-limit`, but they are not currently registered in `index.ts`; configure them before exposing this API publicly. Production CORS should also be restricted to the known client origin rather than permitting arbitrary origins.

## Tests

Run the full server test suite:

```
npm run test
```

Watch tests during development:

```
npm run test:watch
```

The test suite covers commission-rate boundaries, generated quote data, invalid risk bands, the 10% simulated-failure branch, missing/invalid API keys, invalid request parameters, and valid authenticated responses.

## Troubleshooting

### `401 Invalid API key`

Ensure the caller sends `X-API-Key` and that its value exactly matches `COMMISSION_QUOTE_API_KEY` in the server `.env`. Restart the server after changing `.env` values.

### `EADDRINUSE: address already in use :::4000`

Another process is listening on port 4000. Stop that process or select another port:

```
$env:PORT = 4001
npm run dev
```

### Build errors or stale compiled files

Run:

```
npm run build
```

Use `npm run dev` for TypeScript source reloads. Do not edit `dist/` manually.
