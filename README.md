# Probability Calculator

A small probability calculator built with a .NET 10 Minimal API and a React/TypeScript frontend.

The calculator supports:

-   **Combined with:** `P(A) × P(B)`
-   **Either:** `P(A) + P(B) - P(A)P(B)`
-   Probabilities from `0` to `1`, inclusive
-   Client-side and server-side validation

## Project structure

```text
src/Api/                              .NET Minimal API
src/ClientApp/                        React and TypeScript application
src/ClientApp/src/                    React source and colocated Vitest tests
tests/ProbabilityCalculator.Api.Tests/ Backend unit tests
tests/ProbabilityCalculator.Api.IntegrationTests/ Backend integration tests
```

## Run locally

Requirements:

-   .NET 10 SDK or newer
-   Node.js and npm

Start the API:

```powershell
dotnet run --project src/Api
```

The API listens on `http://localhost:5000`.

In a second terminal, start the frontend:

```powershell
cd src\ClientApp
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. The Vite development server proxies `/api` requests to the Minimal API.

## Tests and builds

```powershell
dotnet test

cd src\ClientApp
npm test
npm run lint
npm run build
```

## API

`GET /health`

Readiness endpoint intended for load balancers, deployment checks, and uptime
monitoring.

`GET /alive`

Liveness endpoint intended for process-level checks.

These endpoints are available in all environments to support production
monitoring and orchestration. In a real deployment, they should avoid exposing
detailed dependency or infrastructure information and should normally be
restricted through platform or network controls, for example private Kubernetes
probes, internal load balancer access, or API gateway/reverse-proxy rules.

`POST /api/calculations`

Example request:

```json
{
  "probabilityA": 0.5,
  "probabilityB": 0.5,
  "operation": "combinedWith"
}
```

Example response:

```json
{
  "probabilityA": 0.5,
  "probabilityB": 0.5,
  "operation": "combinedWith",
  "result": 0.25
}
```

The other accepted operation is `"either"`. Invalid or missing values return an HTTP 400 validation problem response.
