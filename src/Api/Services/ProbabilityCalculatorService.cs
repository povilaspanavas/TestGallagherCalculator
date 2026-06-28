using ProbabilityCalculator.Api.Models;

namespace ProbabilityCalculator.Api.Services;

public sealed class ProbabilityCalculatorService : IProbabilityCalculator
{
    private readonly ICalculationOperationCatalog _operations;

    public ProbabilityCalculatorService(ICalculationOperationCatalog operations)
    {
        _operations = operations;
    }

    public decimal Calculate(
        decimal probabilityA,
        decimal probabilityB,
        CalculationOperation operation)
    {
        EnsureValidProbability(probabilityA, nameof(probabilityA));
        EnsureValidProbability(probabilityB, nameof(probabilityB));

        return _operations.GetRequiredOperation(operation)
            .Calculate(probabilityA, probabilityB);
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