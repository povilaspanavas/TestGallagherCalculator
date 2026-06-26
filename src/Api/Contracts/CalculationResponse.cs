using ProbabilityCalculator.Api.Models;

namespace ProbabilityCalculator.Api.Contracts;

public sealed record CalculationResponse(
    decimal ProbabilityA,
    decimal ProbabilityB,
    CalculationOperation Operation,
    decimal Result);
