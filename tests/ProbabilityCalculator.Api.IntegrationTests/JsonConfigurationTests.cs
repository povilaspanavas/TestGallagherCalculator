using System.Net;
using System.Net.Http.Json;

namespace ProbabilityCalculator.Api.IntegrationTests;

public sealed class JsonConfigurationTests : IClassFixture<ApiTestApplicationFactory>
{
    private readonly HttpClient _client;

    public JsonConfigurationTests(ApiTestApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task PostCalculation_SerializesEnumsAsCamelCaseStrings()
    {
        var request = new
        {
            probabilityA = 0.5m,
            probabilityB = 0.25m,
            operation = "combinedWith"
        };

        using var response = await _client.PostAsJsonAsync(
            "/api/calculations",
            request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();

        Assert.Contains("\"operation\":\"combinedWith\"", content);
        Assert.DoesNotContain("\"operation\":0", content);
    }

    [Fact]
    public async Task PostCalculation_RejectsNumericEnumValues()
    {
        var request = new
        {
            probabilityA = 0.5m,
            probabilityB = 0.25m,
            operation = 0
        };

        using var response = await _client.PostAsJsonAsync(
            "/api/calculations",
            request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
