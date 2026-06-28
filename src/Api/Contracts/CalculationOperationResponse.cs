using ProbabilityCalculator.Api.Models;

namespace ProbabilityCalculator.Api.Contracts;

public sealed record CalculationOperationResponse(
    CalculationOperation Id,
    string Label,
    string Description,
    string Formula,
    int DisplayOrder);
