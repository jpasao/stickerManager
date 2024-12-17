namespace sticker.Interfaces;

interface IImageRepository
{
    Task<IResult> GetImages(int idSticker);

    Task<IResult> SaveImage(int idSticker, List<IFormFile> images);

    Task<IResult> DeleteImage(int idImage);
}