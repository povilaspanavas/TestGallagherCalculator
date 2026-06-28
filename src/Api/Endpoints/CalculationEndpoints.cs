using ProbabilityCalculator.Api.Contracts;
using ProbabilityCalculator.Api.Services;
using ProbabilityCalculator.Api.Validation;
using Microsoft.Extensions.Logging;

namespace ProbabilityCalculator.Api.Endpoints;

public static class CalculationEndpoints
{
    public const string OperationsOutputCachePolicy = "CalculationOperations";

    public static IEndpointRouteBuilder MapCalculationEndpoints(
        this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet(
                "/api/calculations/operations",
                (ICalculationOperationCatalog operations) =>
                    Results.Ok(operations.Operations.Select(operation => operation.ToResponse())))
            .WithName("GetCalculationOperations")
            .Produces<IReadOnlyList<CalculationOperationResponse>>()
            .CacheOutput(OperationsOutputCachePolicy);

        endpoints.MapPost(
                "/api/calculations",
                (
                    CalculationRequest request,
                    ICalculationOperationCatalog operations,
                    IProbabilityCalculator calculator,
                    ILogger<MapCalculationEndpointsMarker> logger) =>
                {
                    var errors = CalculationRequestValidator.Validate(
                        request,
                        operations);

                    if (errors.Count > 0)
                    {
                        return Results.ValidationProblem(errors);
                    }

                    var probabilityA = request.ProbabilityA!.Value;
                    var probabilityB = request.ProbabilityB!.Value;
                    var operation = request.Operation!.Value;
                    var result = calculator.Calculate(
                        probabilityA,
                        probabilityB,
                        operation);

                    logger.LogInformation(
                        "Calculation completed at {CalculatedAt}: operation={Operation}, probabilityA={ProbabilityA}, " +
                        "probabilityB={ProbabilityB}, result={Result}",
                        DateTimeOffset.UtcNow,
                        operation,
                        probabilityA,
                        probabilityB,
                        result);

                    return Results.Ok(new CalculationResponse(
                        probabilityA,
                        probabilityB,
                        operation,
                        result));
                })
            .WithName("CalculateProbability")
            .Produces<CalculationResponse>()
            .ProducesValidationProblem();

        return endpoints;
    }
}

internal sealed class MapCalculationEndpointsMarker { }
