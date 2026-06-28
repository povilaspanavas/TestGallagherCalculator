using ProbabilityCalculator.Api.Contracts;
using ProbabilityCalculator.Api.Models;

namespace ProbabilityCalculator.Api.Services;

public sealed record CalculationOperationDefinition(
    CalculationOperation Id,
    string Label,
    string Description,
    string Formula,
    int DisplayOrder,
    Func<decimal, decimal, decimal> Calculate)
{
    public CalculationOperationResponse ToResponse() =>
        new(Id, Label, Description, Formula, DisplayOrder);
}
