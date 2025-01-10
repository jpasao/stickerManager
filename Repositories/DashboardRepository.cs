using System.Data;
using Dapper;
using Microsoft.Extensions.Options;
using MySqlConnector;
using sticker.Code;
using sticker.Interfaces;
using sticker.Models;
using sticker.Utils;

namespace sticker.Repositories;

public class DashboardRepository(IOptions<ConnectionString> connectionStrings) : IDashboardRepository
{
    private readonly IDbConnection db = new MySqlConnection(connectionStrings.Value.StickerConnectionString);

    public async Task<IResult> GetOverview()
    {
        try
        {
            var sql = @"SELECT COUNT(*) AS Quantity, 'Etiquetas' AS Category FROM tags
                UNION
                SELECT COUNT(*) AS Quantity, 'Categorías' AS Category FROM categories
                UNION
                SELECT COUNT(*) AS Quantity, 'Pegatinas' AS Category FROM stickers
                ORDER BY Category";
            var response = await db.QueryAsync<Dashboard>(sql).ConfigureAwait(false);

            return Response.BuildResponse(response);
        }
        catch (Exception ex)
        {
            return Response.BuildError(ex);
        }
    }

    public async Task<IResult> GetStickerDistribution()
    {
        try
        {
            var sql = @"SELECT COUNT(*) AS Quantity, DATE_FORMAT(Created, '%b. %Y') AS Category
                FROM stickers
                GROUP BY DATE_FORMAT(Created, '%m-%y')
                ORDER BY YEAR(Created), MONTH(Created)";
            var response = await db.QueryAsync<Dashboard>(sql).ConfigureAwait(false);

            return Response.BuildResponse(response);
        }
        catch (Exception ex)
        {
            return Response.BuildError(ex);
        }
    }

    public async Task<IResult> GetTagDistribution()
    {
        try
        {
            var sql = @"SELECT COUNT(*) as Quantity, T.TagName AS Category
                FROM tags T
	                INNER JOIN stickertags S ON S.IdTag = T.IdTag
                GROUP BY S.IdTag
                ORDER BY Category";
            var response = await db.QueryAsync<Dashboard>(sql).ConfigureAwait(false);

            return Response.BuildResponse(response);
        }
        catch (Exception ex)
        {
            return Response.BuildError(ex);
        }
    }

    public async Task<IResult> GetCategoryDistribution()
    {
        try
        {
            var sql = @"SELECT COUNT(*) as Quantity, C.CategoryName AS Category
                FROM categories C
	                INNER JOIN stickercategories S ON S.IdCategory = C.IdCategory
                GROUP BY S.IdCategory
                ORDER BY Category";
            var response = await db.QueryAsync<Dashboard>(sql).ConfigureAwait(false);

            return Response.BuildResponse(response);
        }
        catch (Exception ex)
        {
            return Response.BuildError(ex);
        }
    }
}