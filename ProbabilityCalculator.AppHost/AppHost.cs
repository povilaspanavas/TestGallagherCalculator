var builder = DistributedApplication.CreateBuilder(args);

var api = builder
    .AddProject<Projects.ProbabilityCalculator_Api>("ProbabilityCalculatorApi")
    .WithHttpsEndpoint(port: 5001);

builder.AddViteApp("ClientApp", "../src/ClientApp")
    .WithHttpEndpoint(port: 5173, env: "PORT")
    .WithExternalHttpEndpoints()
    .WithReference(api);

builder.Build().Run();