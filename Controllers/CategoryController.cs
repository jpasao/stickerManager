using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using sticker.Code;
using sticker.Models;
using sticker.Repositories;

namespace sticker.Controllers;

[ApiController]
[Route("[controller]")]
public class CategoryController : ControllerBase
{
    private readonly CategoryRepository repository;

    public CategoryController(IOptions<ConnectionString> connectionString)
    {
        repository = new CategoryRepository(connectionString);
    }

    [HttpPost("Get")]
    public async Task<IResult> Get(Category category)
    {
        return await repository.SearchCategory(category);
    }

    [HttpPost("Post")]
    public async Task<IResult> Post(Category category)
    {
        return await repository.SaveCategory(category);
    }

    [HttpPut]
    public async Task<IResult> Put(Category category)
    {
        return await repository.SaveCategory(category);
    }

    [HttpDelete]
    public async Task<IResult> Delete(int id)
    {
        return await repository.DeleteCategory(id);
    }

    [HttpGet("Dependency")]
    public async Task<IResult> Dependencies(int id)
    {
        return await repository.GetDependencies(id);
    }
}