using ProbabilityCalculator.Api.Models;

namespace ProbabilityCalculator.Api.Services;

public interface ICalculationOperationCatalog
{
    IReadOnlyList<CalculationOperationDefinition> Operations { get; }

    bool IsSupported(CalculationOperation operation);

    CalculationOperationDefinition GetRequiredOperation(CalculationOperation operation);
}