using ProbabilityCalculator.Api.Models;

namespace ProbabilityCalculator.Api.Services;

/// <summary>
/// This stores all available operations. In a real app probably would come from some kind of storage
/// </summary>
public sealed class CalculationOperationCatalog : ICalculationOperationCatalog
{
    private readonly IReadOnlyDictionary<CalculationOperation, CalculationOperationDefinition> _operationsById;

    public CalculationOperationCatalog()
    {
        Operations =
        [
            new(
                CalculationOperation.CombinedWith,
                "Combined with",
                "The probability that both events occur.",
                "P(A) × P(B)",
                1,
                (probabilityA, probabilityB) => probabilityA * probabilityB),
            new(
                CalculationOperation.Either,
                "Either",
                "The probability that at least one event occurs.",
                "P(A) + P(B) − P(A)P(B)",
                2,
                (probabilityA, probabilityB) =>
                    probabilityA + probabilityB - (probabilityA * probabilityB))
        ];

        _operationsById = Operations.ToDictionary(operation => operation.Id);
    }

    public IReadOnlyList<CalculationOperationDefinition> Operations { get; }

    public bool IsSupported(CalculationOperation operation) =>
        _operationsById.ContainsKey(operation);

    public CalculationOperationDefinition GetRequiredOperation(CalculationOperation operation) =>
        _operationsById.TryGetValue(operation, out var definition)
            ? definition
            : throw new ArgumentOutOfRangeException(
                nameof(operation),
                operation,
                "Unsupported calculation operation.");
}