using System.Net;

namespace ProbabilityCalculator.Api.IntegrationTests;

public sealed class ServiceDefaultsTests : IClassFixture<ApiTestApplicationFactory>
{
    private readonly HttpClient _client;

    public ServiceDefaultsTests(ApiTestApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetHealth_ReturnsOk()
    {
        using var response = await _client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
