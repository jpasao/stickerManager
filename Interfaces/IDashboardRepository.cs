namespace sticker.Interfaces;

interface IDashboardRepository
{
    Task<IResult> GetOverview();

    Task<IResult> GetStickerDistribution();

    Task<IResult> GetTagDistribution();

    Task<IResult> GetCategoryDistribution();
}