using sticker.Models;

namespace sticker.Interfaces;

interface IImageRepository
{
    Task<IResult> GetImages(int idSticker);

    Task<IResult> GetThumbnails(Gallery filters);

    Task<IResult> SaveImage(int idSticker, List<IFormFile> images);

    Task<IResult> DeleteImage(int idImage);

    Task<IResult> CountImages();
}