using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using sticker.Code;
using sticker.Models;
using sticker.Repositories;

namespace sticker.Controllers;

[ApiController]
[Route("[controller]")]
public class StickerController : ControllerBase
{
    private readonly StickerRepository repository;

    public StickerController(IOptions<ConnectionString> connectionString)
    {
        repository = new StickerRepository(connectionString);
    }

    [HttpPost("Get")]
    public async Task<IResult> Get(StickerFilter filters)
    {
        return await repository.SearchSticker(filters);
    }

    [HttpPost("Post")]
    public async Task<IResult> Post(Sticker sticker)
    {
        return await repository.SaveSticker(sticker);
    }

    [HttpPut]
    public async Task<IResult> Put(Sticker sticker)
    {
        return await repository.SaveSticker(sticker);
    }

    [HttpDelete]
    public async Task<IResult> Delete(int id)
    {
        return await repository.DeleteSticker(id);
    }
}