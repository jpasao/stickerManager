using sticker.Models;

namespace sticker.Interfaces;

interface ICategoryRepository
{
    Task<IResult> SearchCategory(Category category);

    Task<IResult> SaveCategory(Category category);

    Task<IResult> DeleteCategory(int id);

    Task<IResult> GetDependencies(int id);
}