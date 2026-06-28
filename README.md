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

The repository also includes a GitHub Actions workflow in
`.github/workflows/ci.yml`. On pushes and pull requests to `main`, it:

-   restores, builds, and tests the .NET solution
-   collects .NET test results and coverage
-   installs, lints, tests, and builds the React/TypeScript client app

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

## Logging and observability

Each successful calculation is written as a structured application log with:

-   the UTC calculation time
-   the calculation operation
-   both input probabilities
-   the calculated result

The API uses the shared `ProbabilityCalculator.ServiceDefaults` project to add
OpenTelemetry logging, metrics, and tracing. In local development these logs are
available through the normal .NET logging pipeline. In a deployed environment,
telemetry can be exported to the provider used by the hosting platform:

-   set `APPLICATIONINSIGHTS_CONNECTION_STRING` to send telemetry to Azure
    Monitor Application Insights
-   set `OTEL_EXPORTER_OTLP_ENDPOINT` to send telemetry to any OTLP-compatible
    collector or observability platform

For an Azure deployment, Application Insights can be connected to a Log
Analytics workspace so operational logs, traces, metrics, and calculation
events can be queried through Azure Monitor Logs / Log Analytics.

## Architecture notes

The API is stateless and keeps calculation logic behind small service
interfaces. Supported calculations are exposed through the operation catalog and
the frontend loads them from `/api/calculations/operations`, so adding another
calculation should not require hard-coding frontend options.

Validation is duplicated intentionally: the React app gives immediate feedback
to the user, while the API remains the source of truth for request validation.
No authentication, authorization, or database has been added because the
exercise explicitly excludes them.

## Cloud and DevOps

The current GitHub Actions workflow is a build-and-test quality gate. The same
workflow, Azure DevOps Pipelines, or another CI/CD platform could be extended to
package and deploy the application. A typical container-based path would be:

-   build Docker images for the API and client app
-   push images to Azure Container Registry
-   deploy to Azure Container Apps for a simple managed container platform, or
    Azure Kubernetes Service if the organisation needs deeper orchestration
    control
-   use `/health` for readiness checks and `/alive` for liveness checks
-   configure OpenTelemetry export to the organisation's observability provider,
    such as Azure Monitor Application Insights

Infrastructure could be provisioned with Terraform. For an Azure deployment,
that would normally include:

-   a Resource Group
-   Azure Container Registry
-   Azure Container Apps Environment and Container Apps, or an Azure Kubernetes
    Service cluster
-   Azure Monitor Application Insights
-   a Log Analytics workspace for Azure Monitor Logs
-   managed identities or federated workload identity for CI/CD deployments
-   Key Vault for secrets such as connection strings, if secrets are required

In production, the deployment would use multiple replicas, platform health
checks, autoscaling rules, centralized logs and traces, alerts for error rate
and latency, and zero-downtime rollout strategies such as blue/green or rolling
deployments.

## Exercise coverage

Implemented:

-   C# backend API for the calculations
-   React/TypeScript frontend
-   CombinedWith and Either operations
-   client-side and server-side validation for probabilities from `0` to `1`
-   backend unit and integration tests
-   frontend component and validation tests
-   structured calculation logging with OpenTelemetry export hooks
-   CI workflow for build, lint, and test

Not included as runnable assets:

-   Dockerfiles and deployment manifests
-   Terraform infrastructure modules
-   production alert rules or dashboards

Those items are described above as the intended production path rather than
included in this small exercise repository.
