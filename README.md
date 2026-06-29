# Probability Calculator

A small probability calculator built with a .NET 10 Minimal API, a React/TypeScript frontend, and .NET Aspire for local orchestration.

The calculator supports:

-   **Combined with:** `P(A) × P(B)`
-   **Either:** `P(A) + P(B) - P(A)P(B)`
-   Probabilities from `0` to `1`, inclusive
-   Client-side and server-side validation

## Implemented scope

Implemented:

-   C# backend API for the calculations
-   React/TypeScript frontend
-   CombinedWith and Either operations
-   client-side and server-side validation for probabilities from `0` to `1`
-   backend unit and integration tests
-   frontend component and validation tests
-   structured calculation logging and local observability through Aspire
-   CI workflow for build, lint, test, and .NET coverage collection

Not included as runnable assets:

-   Dockerfiles and deployment manifests
-   Terraform infrastructure modules
-   production alert rules or dashboards

Those items are discussed later as the intended production path rather than
included as runnable assets in this small exercise repository.

## Run locally

Requirements:

-   .NET 10 SDK or newer
-   Node.js `^20.19.0 || >=22.12.0`, with npm bundled by Node.js

Start the application through the .NET Aspire AppHost:

```powershell
dotnet run --project src/ProbabilityCalculator.AppHost --launch-profile https
```

The AppHost starts both the Minimal API and the ClientApp (React frontend). Open the dashboard
URL printed by Aspire to inspect the running resources. The `https` launch
profile pins the local ports used below.

Local links:

-   Aspire dashboard: [https://localhost:17137](https://localhost:17137)
-   ClientApp: [http://localhost:5173](http://localhost:5173)
-   API reference (Scalar/OpenAPI): [https://localhost:5001/scalar](https://localhost:5001/scalar)

## Project structure

```text
src/
  Api/                                .NET Minimal API
  ClientApp/                          React and TypeScript application
    src/                              React source and colocated Vitest tests
  ProbabilityCalculator.AppHost/      .NET Aspire host for API and ClientApp
  ProbabilityCalculator.ServiceDefaults/ Common Aspire service configuration
tests/
  ProbabilityCalculator.Api.Tests/    Backend unit tests
  ProbabilityCalculator.Api.IntegrationTests/ Backend integration tests
```

## Tests and builds

```powershell
dotnet test

npm --prefix src\ClientApp test
npm --prefix src\ClientApp run lint
npm --prefix src\ClientApp run build
```

The repository also includes a GitHub Actions workflow in
`.github/workflows/ci.yml`. On pushes and pull requests to `main`, it:

-   restores, builds, and tests the .NET solution
-   collects .NET test results and coverage
-   installs, lints, tests, and builds the React/TypeScript client app

## API

The API exposes OpenAPI documentation through Scalar at
`https://localhost:5001/scalar` when running in the `Development` environment.

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

The other accepted operation is `"either"`. Invalid or missing values return an HTTP 400 validation problem response. For a production deployment, the API would also use centralized exception handling middleware to convert unexpected failures into standard problem details responses without leaking internal exception details.

`GET /api/calculations/operations`

Returns the supported calculation operations used by the ClientApp. The endpoint
uses output caching because these operation definitions are read frequently by
clients but change rarely.

Example response:

```json
[
  {
    "id": "combinedWith",
    "label": "Combined with",
    "description": "The probability that both events occur.",
    "formula": "P(A) × P(B)",
    "displayOrder": 1
  },
  {
    "id": "either",
    "label": "Either",
    "description": "The probability that at least one event occurs.",
    "formula": "P(A) + P(B) − P(A)P(B)",
    "displayOrder": 2
  }
]
```

`GET /health`

Readiness endpoint intended for load balancers, deployment checks, and uptime
monitoring.

`GET /alive`

Liveness endpoint intended for process-level checks.

These endpoints are available in all environments to support production
monitoring and orchestration. In a real deployment, they should avoid exposing
detailed dependency or infrastructure information and should normally be
restricted through hosting or network controls, for example private Kubernetes
probes, internal load balancer access, Azure API Management policies, or Azure
Container Apps internal ingress.

## Logging and observability

Each successful calculation is written as a structured application log with:

-   the UTC calculation time
-   the calculation operation
-   both input probabilities
-   the calculated result

When running locally through AppHost, calculation logs can be viewed directly at
`https://localhost:17137/structuredlogs`. The Aspire dashboard also shows the
running resources, traces, and metrics.

The API uses the `ProbabilityCalculator.ServiceDefaults` project to add
OpenTelemetry logging, metrics, and tracing. In a deployed environment,
telemetry can be exported to the provider used by the hosting environment:

-   set `APPLICATIONINSIGHTS_CONNECTION_STRING` to send telemetry to Azure
    Monitor Application Insights
-   set `OTEL_EXPORTER_OTLP_ENDPOINT` to send telemetry to any OTLP-compatible
    collector or observability platform

For an Azure deployment, a workspace-based Application Insights resource would
provide the application monitoring view for requests, failures, dependencies,
traces, metrics, and performance. The connected Log Analytics workspace would
retain the telemetry and support deeper querying through Azure Monitor Logs.

The React frontend is not instrumented in this exercise. In production, it
would be worth tracking browser errors, page performance, and API request
correlation, ideally using tooling that fits the same OpenTelemetry/Azure
Monitor observability pipeline as the API.

## Architecture notes

The API is stateless and keeps calculation logic behind small service
interfaces. Supported calculations are exposed through the operation catalog and
the frontend loads them from `/api/calculations/operations`, so adding another
calculation should not require hard-coding frontend options.

Validation is duplicated intentionally: the React app gives immediate feedback
to the user, while the API remains the source of truth for request validation.
Authentication, authorization, and database persistence are intentionally out of
scope.

The operations endpoint currently uses local output caching, which is enough for
this small service because the data is static and cheap to rebuild. In a larger
multi-instance deployment, similar read-heavy reference data could use a
distributed cache such as Redis so all API instances share the same cached data
and avoid repeatedly querying the backing store.

## Security considerations

Authentication and authorization are out of scope for this exercise. For a
production deployment, the API would enforce HTTPS, restrict CORS to trusted
frontend origins, avoid leaking exception details, review calculation logs for
sensitive data, and restrict development tooling such as public OpenAPI/Scalar
access. Health endpoints should expose only minimal information and normally be
protected through hosting or network controls.

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
-   a workspace-based Azure Application Insights resource connected to a Log
    Analytics workspace
-   managed identities or federated workload identity for CI/CD deployments
-   runtime secret injection for connection strings and other sensitive
    configuration, using the deployment platform or a managed secret store

In production, the deployment would use multiple replicas, platform health
checks, autoscaling rules, centralized logs and traces, alerts for error rate
and latency, and zero-downtime rollout strategies such as blue/green or rolling
deployments. For a 99.99% availability target, the design would also consider
zone-redundant hosting, multi-region failover where required, and static
frontend delivery through a CDN or edge-capable hosting service.
