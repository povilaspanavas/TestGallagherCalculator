using ProbabilityCalculator.Api.Models;

namespace ProbabilityCalculator.Api.Contracts;

public sealed record CalculationRequest(
    decimal? ProbabilityA,
    decimal? ProbabilityB,
    CalculationOperation? Operation);
