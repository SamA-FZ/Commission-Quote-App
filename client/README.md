
# Commission Quote Client

This directory contains the TypeScript React client for the Commission Quote Application. It provides a Material UI quote form, validates inputs before making a request, sends the configured API key to the server, and displays the returned commission rate and total commission.

The server is a separate service in `../server`. Start it before submitting quotes from the client.

## Prerequisites

- Node.js 20 LTS or newer
- npm 10 or newer
- The Commission Quote API running locally or available at a configured URL

Check the installed versions:

```
node --version
npm --version
```

## Install dependencies

From the repository root:

```
npm --prefix .\client install --no-audit --no-fund
```

Or, from this directory:

```
npm install
```

The client uses React, TypeScript, Axios, Material UI, Emotion, React Scripts, and React Testing Library. `react-scripts` has a large legacy dependency tree, so installation may produce deprecation warnings. Those warnings alone do not mean installation failed.

## Configure the API connection

Create a `.env` file in this `client` directory. Do not commit it.

```env
REACT_APP_COMMISSION_QUOTE_BACKEND=http://localhost:4000
REACT_APP_COMMISSION_QUOTE_API_KEY=replace-with-the-matching-server-api-key
```

React Scripts exposes only environment variables beginning with `REACT_APP_`. If either name does not have that prefix, the browser client will not receive the value and the quote request will likely return `401 Invalid API key`.

The API key must match `COMMISSION_QUOTE_API_KEY` in the server's `.env`. Restart the client development server after changing `.env` values because React Scripts reads them when it starts.

## Run locally

Start the client development server:

```
npm run dev
```

`npm start` runs the same command. The application normally opens at `http://localhost:3000`.

Create a production build:

```
npm run build
```

## Quote workflow

The page includes:

- A Material UI banking-style quote form.
- A light/dark mode toggle.
- Loan amount, loan term, and risk-band inputs.
- Loading and request-failure states.
- A quote result panel positioned to the right of the form on desktop and below it on smaller screens.

The client only shows the result panel after the API returns both `commissionRate` and `totalCommission`.

### Client-side validation

The form blocks invalid values before making an API request:

| Input | Allowed values |
| --- | --- |
| Loan amount | Finite number from `1` to `10,000,000` |
| Loan term | Whole number from `1` to `480` months |
| Risk band | Whole number from `1` to `25` |

The API independently validates the same constraints. Client validation improves feedback but is not a security boundary.

## API request contract

Axios sends this request:

```http
GET /api/commission/quote?loanAmount=100000&loanTerm=60&riskBand=5
X-API-Key: configured-client-api-key
Content-Type: application/json
```

The configured API base URL defaults to `http://localhost:4000`. The request helper is implemented in [src/util/api.tsx](src/util/api.tsx).

The expected successful response is:

```json
{
	"quote": {
		"QuoteId": "generated-identifier",
		"commissionRate": 0.05,
		"totalCommission": 5000
	}
}
```

The client displays `commissionRate` as a percentage and formats `totalCommission` as currency.

## API-key security note

This implementation sends an `X-API-Key` header from the browser to the API. Any key bundled into a browser application can be inspected by users, so it is appropriate only for a trusted internal prototype or low-risk development environment.

Do not place production secrets, database credentials, or upstream-provider API keys in this client. For a public application, use server-managed user authentication such as secure cookie sessions or short-lived access tokens. Keep provider credentials on the server only.

Do not copy a real API key into `.env.example`, source files, logs, screenshots, or documentation. Rotate any key that has been exposed.

## Tests

Run all client tests once:

```
$env:CI = 'true'
npm run test -- --watchAll=false
```

Run the interactive test watcher:

```
npm run test
```

The current suite includes:

- [src/App.test.tsx](src/App.test.tsx): initial state, default input values, dark-mode toggle, client validation, loading state, successful result rendering, and failed API-request behavior.
- [src/util/api.test.tsx](src/util/api.test.tsx): Axios client configuration, request parameters, quote-response extraction, and error propagation.

The suite runs without calling the live server: API calls are mocked so tests remain deterministic despite the server's required simulated failure behavior. The latest run completed successfully with 2 passing test suites and 10 passing tests.
