using ProbabilityCalculator.Api.Models;

namespace ProbabilityCalculator.Api.Services;

public sealed class ProbabilityCalculatorService : IProbabilityCalculator
{
    public decimal Calculate(
        decimal probabilityA,
        decimal probabilityB,
        CalculationOperation operation)
    {
        EnsureValidProbability(probabilityA, nameof(probabilityA));
        EnsureValidProbability(probabilityB, nameof(probabilityB));

        return operation switch
        {
            CalculationOperation.CombinedWith => probabilityA * probabilityB,
            CalculationOperation.Either =>
                probabilityA + probabilityB - (probabilityA * probabilityB),
            _ => throw new ArgumentOutOfRangeException(
                nameof(operation),
                operation,
                "Unsupported calculation operation.")
        };
    }

    private static void EnsureValidProbability(decimal value, string parameterName)
    {
        if (value is < 0 or > 1)
        {
            throw new ArgumentOutOfRangeException(
                parameterName,
                value,
                "Probability must be between 0 and 1.");
        }
    }
}
