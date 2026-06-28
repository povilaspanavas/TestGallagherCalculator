using ProbabilityCalculator.Api.Contracts;
using ProbabilityCalculator.Api.Models;
using ProbabilityCalculator.Api.Services;

namespace ProbabilityCalculator.Api.Validation;

public static class CalculationRequestValidator
{
    public static Dictionary<string, string[]> Validate(
        CalculationRequest request,
        ICalculationOperationCatalog operations)
    {
        var errors = new Dictionary<string, string[]>();

        ValidateProbability(
            request.ProbabilityA,
            "probabilityA",
            "Probability A",
            errors);

        ValidateProbability(
            request.ProbabilityB,
            "probabilityB",
            "Probability B",
            errors);

        if (request.Operation is null)
        {
            errors["operation"] = ["Select a calculation."];
        }
        else if (!operations.IsSupported(request.Operation.Value))
        {
            errors["operation"] = ["The selected calculation is not supported."];
        }

        return errors;
    }

    private static void ValidateProbability(
        decimal? value,
        string fieldName,
        string displayName,
        IDictionary<string, string[]> errors)
    {
        if (value is null)
        {
            errors[fieldName] = [$"{displayName} is required."];
        }
        else if (value is < 0 or > 1)
        {
            errors[fieldName] = [$"{displayName} must be between 0 and 1."];
        }
    }
}
