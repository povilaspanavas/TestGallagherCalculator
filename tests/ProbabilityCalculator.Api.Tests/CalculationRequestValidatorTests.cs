using ProbabilityCalculator.Api.Contracts;
using ProbabilityCalculator.Api.Models;
using ProbabilityCalculator.Api.Validation;

namespace ProbabilityCalculator.Api.Tests;

public sealed class CalculationRequestValidatorTests
{
    [Fact]
    public void Validate_AcceptsBoundaryProbabilities()
    {
        var request = new CalculationRequest(
            0,
            1,
            CalculationOperation.CombinedWith);

        var errors = CalculationRequestValidator.Validate(request);

        Assert.Empty(errors);
    }

    [Fact]
    public void Validate_ReportsMissingFields()
    {
        var request = new CalculationRequest(null, null, null);

        var errors = CalculationRequestValidator.Validate(request);

        Assert.Equal(3, errors.Count);
        Assert.Contains("probabilityA", errors);
        Assert.Contains("probabilityB", errors);
        Assert.Contains("operation", errors);
    }

    [Theory]
    [InlineData(-0.1, 0.5, "probabilityA")]
    [InlineData(1.1, 0.5, "probabilityA")]
    [InlineData(0.5, -0.1, "probabilityB")]
    [InlineData(0.5, 1.1, "probabilityB")]
    public void Validate_ReportsOutOfRangeProbabilities(
        decimal probabilityA,
        decimal probabilityB,
        string expectedField)
    {
        var request = new CalculationRequest(
            probabilityA,
            probabilityB,
            CalculationOperation.Either);

        var errors = CalculationRequestValidator.Validate(request);

        Assert.Contains(expectedField, errors);
    }
}
