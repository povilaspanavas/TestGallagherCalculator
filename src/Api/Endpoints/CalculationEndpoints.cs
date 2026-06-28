using ProbabilityCalculator.Api.Contracts;
using ProbabilityCalculator.Api.Models;
using ProbabilityCalculator.Api.Services;
using ProbabilityCalculator.Api.Validation;
using Microsoft.Extensions.Logging;

namespace ProbabilityCalculator.Api.Endpoints;

public static class CalculationEndpoints
{
    public const string OperationsOutputCachePolicy = "CalculationOperations";

    private static readonly CalculationOperationResponse[] OperationResponses =
    [
        new(
            CalculationOperation.CombinedWith,
            "Combined with",
            "The probability that both events occur.",
            "P(A) × P(B)",
            1),
        new(
            CalculationOperation.Either,
            "Either",
            "The probability that at least one event occurs.",
            "P(A) + P(B) − P(A)P(B)",
            2)
    ];

    public static IEndpointRouteBuilder MapCalculationEndpoints(
        this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet(
                "/api/calculations/operations",
                () => Results.Ok(OperationResponses))
            .WithName("GetCalculationOperations")
            .Produces<IReadOnlyList<CalculationOperationResponse>>()
            .CacheOutput(OperationsOutputCachePolicy);

        endpoints.MapPost(
                "/api/calculations",
                (CalculationRequest request, IProbabilityCalculator calculator, ILogger<MapCalculationEndpointsMarker> logger) =>
                {
                    var errors = CalculationRequestValidator.Validate(request);

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
