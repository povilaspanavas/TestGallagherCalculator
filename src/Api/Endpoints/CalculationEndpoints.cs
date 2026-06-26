using ProbabilityCalculator.Api.Contracts;
using ProbabilityCalculator.Api.Services;
using ProbabilityCalculator.Api.Validation;

namespace ProbabilityCalculator.Api.Endpoints;

public static class CalculationEndpoints
{
    public static IEndpointRouteBuilder MapCalculationEndpoints(
        this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost(
                "/api/calculations",
                (CalculationRequest request, IProbabilityCalculator calculator) =>
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
