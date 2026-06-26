using ProbabilityCalculator.Api.Models;

namespace ProbabilityCalculator.Api.Services;

public interface IProbabilityCalculator
{
    decimal Calculate(
        decimal probabilityA,
        decimal probabilityB,
        CalculationOperation operation);
}
