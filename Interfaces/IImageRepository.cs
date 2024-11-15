namespace sticker.Interfaces;

interface IImageRepository
{
    Task<IResult> GetImages(int idSticker);

    Task<IResult> SaveImage(int idSticker, IFormFile image);

    Task<IResult> DeleteImage(int idImage);
}