using System.Text.Json;
using System.Text.Json.Serialization;
using Scalar.AspNetCore;
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
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(); // /scalar
}

app.MapGet("/", () => Results.Ok(new
{
    name = "Probability Calculator API",
    endpoint = "/api/calculations"
}));

app.MapCalculationEndpoints();

app.Run();

public partial class Program;