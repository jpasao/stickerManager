using sticker.Models;

namespace sticker.Interfaces;

interface IStickerRepository
{
    Task<IResult> SearchSticker(StickerFilter filters);

    Task<IResult> SaveSticker(Sticker sticker);

    Task<IResult> DeleteSticker(int id);
}