using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http;
using ProbabilityCalculator.Api.Contracts;
using ProbabilityCalculator.Api.Models;

namespace ProbabilityCalculator.Api.IntegrationTests;

public sealed class CalculationEndpointTests : IClassFixture<ApiTestApplicationFactory>
{
    private readonly HttpClient _client;

    public CalculationEndpointTests(ApiTestApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task PostCalculation_WithValidRequest_ReturnsCalculationResponse()
    {
        var request = new CalculationRequest(
            0.5m,
            0.25m,
            CalculationOperation.CombinedWith);

        using var response = await _client.PostAsJsonAsync(
            "/api/calculations",
            request,
            JsonOptions);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var calculation = await response.Content
            .ReadFromJsonAsync<CalculationResponse>(JsonOptions);

        Assert.Equal(
            new CalculationResponse(
                0.5m,
                0.25m,
                CalculationOperation.CombinedWith,
                0.125m),
            calculation);
    }

    [Fact]
    public async Task PostCalculation_WithInvalidRequest_ReturnsValidationProblem()
    {
        var request = new CalculationRequest(
            -0.1m,
            0.25m,
            CalculationOperation.Either);

        using var response = await _client.PostAsJsonAsync(
            "/api/calculations",
            request,
            JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(
            "application/problem+json",
            response.Content.Headers.ContentType?.MediaType);

        var problem = await response.Content
            .ReadFromJsonAsync<HttpValidationProblemDetails>();

        Assert.NotNull(problem);
        Assert.Equal(400, problem.Status);
        Assert.True(problem.Errors.TryGetValue("probabilityA", out var probabilityAErrors));
        Assert.Contains(
            "Probability A must be between 0 and 1.",
            probabilityAErrors);
    }

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters =
        {
            new JsonStringEnumConverter(
                JsonNamingPolicy.CamelCase,
                allowIntegerValues: false)
        }
    };
}
