using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using sticker.Code;
using sticker.Models;
using sticker.Repositories;

namespace sticker.Controllers;

[ApiController]
[Route("[controller]")]
public class TagController : ControllerBase
{
    private readonly TagRepository repository;

    public TagController(IOptions<ConnectionString> connectionString)
    {
        repository = new TagRepository(connectionString);
    }

    [HttpPost("Get")]
    public async Task<IResult> Get(Tag tag)
    {
        return await repository.SearchTag(tag);
    }

    [HttpPost("Post")]
    public async Task<IResult> Post(Tag tag)
    {
        return await repository.SaveTag(tag);
    }

    [HttpPut]
    public async Task<IResult> Put(Tag tag)
    {
        return await repository.SaveTag(tag);
    }

    [HttpDelete]
    public async Task<IResult> Delete(int id)
    {
        return await repository.DeleteTag(id);
    }

    [HttpGet("Dependency")]
    public async Task<IResult> Dependencies(int id)
    {
        return await repository.GetDependencies(id);
    }
}