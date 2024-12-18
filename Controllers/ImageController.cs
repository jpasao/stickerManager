using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using sticker.Code;
using sticker.Models;
using sticker.Repositories;

namespace sticker.Controllers;

[ApiController]
[Route("[controller]")]
public class ImageController : ControllerBase
{
    private readonly ImageRepository repository;

    public ImageController(IOptions<ConnectionString> connectionString)
    {
        repository = new ImageRepository(connectionString);
    }

    [HttpGet]
    public async Task<IResult> Get(int id)
    {
        return await repository.GetImages(id);
    }

    [HttpPost("Thumbnails")]
    public async Task<IResult> GetThumbnails(Page page)
    {
        return await repository.GetThumbnails(page);
    }

    [HttpGet("Count")]
    public async Task<IResult> CountImages()
    {
        return await repository.CountImages();
    }

    [HttpPost]
    public async Task<IResult> Post(int id, List<IFormFile> images)
    {
        return await repository.SaveImage(id, images);
    }

    [HttpDelete]
    public async Task<IResult> Delete(int id)
    {
        return await repository.DeleteImage(id);
    }
}