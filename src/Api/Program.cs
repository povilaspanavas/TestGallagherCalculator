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
        new JsonStringEnumConverter(
            JsonNamingPolicy.CamelCase,
            allowIntegerValues: false));
});

builder.Services.AddSingleton<ICalculationOperationCatalog, CalculationOperationCatalog>();
builder.Services.AddScoped<IProbabilityCalculator, ProbabilityCalculatorService>();
builder.Services.AddOutputCache(options =>
{
    options.AddPolicy(
        CalculationEndpoints.OperationsOutputCachePolicy,
        policy => policy.Expire(TimeSpan.FromMinutes(30)));
});
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseOutputCache();

app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(); // /scalar
    app.MapGet("/", () => Results.Redirect("/scalar"));
}
else
{
    app.MapGet(
        "/",
        () => Results.Ok(new
        {
            name = "Probability Calculator API",
            status = "OK"
        }));
}

app.MapCalculationEndpoints();

app.Run();

public abstract partial class Program;
