using ProbabilityCalculator.Api.Models;
using ProbabilityCalculator.Api.Services;

namespace ProbabilityCalculator.Api.Tests;

public sealed class ProbabilityCalculatorServiceTests
{
    private readonly ProbabilityCalculatorService _calculator = new();

    [Theory]
    [InlineData(0.5, 0.5, 0.25)]
    [InlineData(0, 0.75, 0)]
    [InlineData(1, 1, 1)]
    public void CombinedWith_MultipliesTheProbabilities(
        decimal probabilityA,
        decimal probabilityB,
        decimal expected)
    {
        var result = _calculator.Calculate(
            probabilityA,
            probabilityB,
            CalculationOperation.CombinedWith);

        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData(0.5, 0.5, 0.75)]
    [InlineData(0, 0.75, 0.75)]
    [InlineData(1, 0.2, 1)]
    public void Either_CalculatesTheProbabilityOfAtLeastOneEvent(
        decimal probabilityA,
        decimal probabilityB,
        decimal expected)
    {
        var result = _calculator.Calculate(
            probabilityA,
            probabilityB,
            CalculationOperation.Either);

        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData(-0.01, 0.5)]
    [InlineData(1.01, 0.5)]
    [InlineData(0.5, -0.01)]
    [InlineData(0.5, 1.01)]
    public void Calculate_RejectsProbabilitiesOutsideTheValidRange(
        decimal probabilityA,
        decimal probabilityB)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            _calculator.Calculate(
                probabilityA,
                probabilityB,
                CalculationOperation.CombinedWith));
    }
}
