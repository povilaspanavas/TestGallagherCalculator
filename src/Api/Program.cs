using System.Text.Json;
using System.Text.Json.Serialization;
using Scalar.AspNetCore;
using ProbabilityCalculator.Api.Endpoints;
using ProbabilityCalculator.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(
        new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
});

builder.Services.AddScoped<IProbabilityCalculator, ProbabilityCalculatorService>();
builder.Services.AddOpenApi();

var app = builder.Build();

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(); // /scalar
}

app.MapGet("/", () => Results.Redirect("/scalar"));

app.MapCalculationEndpoints();

app.Run();

public abstract partial class Program;