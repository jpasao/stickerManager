using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using sticker.Code;
using sticker.Models;
using sticker.Repositories;

namespace sticker.Controllers;

[ApiController]
[Route("[controller]")]
public class DashboardController : ControllerBase
{
    private readonly DashboardRepository repository;

    public DashboardController(IOptions<ConnectionString> connectionString)
    {
        repository = new DashboardRepository(connectionString);
    }

    [HttpGet("Overview")]
    public async Task<IResult> Overview()
    {
        return await repository.GetOverview();
    }

    [HttpGet("Sticker")]
    public async Task<IResult> Sticker()
    {
        return await repository.GetStickerDistribution();
    }

    [HttpGet("Tag")]
    public async Task<IResult> Tag()
    {
        return await repository.GetTagDistribution();
    }

    [HttpGet("Category")]
    public async Task<IResult> Category()
    {
        return await repository.GetCategoryDistribution();
    }
}