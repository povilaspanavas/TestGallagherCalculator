# Probability Calculator

A small probability calculator built with a .NET 8 Minimal API and a React/TypeScript frontend.

The calculator supports:

-   **Combined with:** `P(A) × P(B)`
-   **Either:** `P(A) + P(B) - P(A)P(B)`
-   Probabilities from `0` to `1`, inclusive
-   Client-side and server-side validation

## Project structure

```text
src/Api/                              .NET Minimal API
src/ClientApp/                        React and TypeScript application
tests/ProbabilityCalculator.Api.Tests/ Backend unit tests
```

## Run locally

Requirements:

-   .NET 8 SDK or newer
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