using sticker.Code;
using sticker.Interfaces;
using sticker.Repositories;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
var policyName = "AllowAll";

builder.Logging.ClearProviders().AddConsole();
builder.Services
    .AddControllersWithViews()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.Converters.Add(new JsonException());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddSingleton<TagRepository>();
builder.Services.AddTransient<ITagRepository, TagRepository>();
builder.Services.AddSingleton<CategoryRepository>();
builder.Services.AddTransient<ICategoryRepository, CategoryRepository>();
builder.Services.AddSingleton<StickerRepository>();
builder.Services.AddTransient<IStickerRepository, StickerRepository>();
builder.Services.AddSingleton<ImageRepository>();
builder.Services.AddTransient<IImageRepository, ImageRepository>();
builder.Services.AddSingleton<DashboardRepository>();
builder.Services.AddTransient<IDashboardRepository, DashboardRepository>();
builder.Services.Configure<ConnectionString>(builder.Configuration.GetSection("ConnectionStrings"));
builder.Services.AddCors(options => 
{
    options.AddPolicy(policyName, builder =>
    {
        builder.AllowAnyMethod()
            .AllowAnyHeader()
            .SetIsOriginAllowed(origin => true)
            .AllowCredentials();
    });
});

var app = builder.Build();
if (app.Environment.IsProduction())
{
    app.UseHsts();
    app.UseDeveloperExceptionPage();
    app.UseCors(policyName);
    app.Urls.Add("http://*:5001");
} 
if (app.Environment.IsDevelopment())
{
    app.Use((context, next) =>
    {
        return next(context);
    });
    app.Urls.Add("http://*:5003");
}
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();
app.UseCors(policyName);

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");
app.Run();
