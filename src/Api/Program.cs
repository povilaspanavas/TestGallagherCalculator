using System.Text.Json;
using System.Text.Json.Serialization;
using ProbabilityCalculator.Api.Endpoints;
using ProbabilityCalculator.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.Converters.Add(
        new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
});

builder.Services.AddSingleton<IProbabilityCalculator, ProbabilityCalculatorService>();

var app = builder.Build();

app.MapGet("/", () => Results.Ok(new
{
    name = "Probability Calculator API",
    endpoint = "/api/calculations"
}));

app.MapCalculationEndpoints();

app.Run();

public partial class Program;
