using sticker.Models;

namespace sticker.Interfaces;

interface IStickerRepository
{
    Task<IResult> SearchSticker(Sticker sticker);

    Task<IResult> SaveSticker(Sticker sticker);

    Task<IResult> DeleteSticker(int id);
}