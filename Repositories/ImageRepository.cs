using System.Data;
using Dapper;
using Microsoft.Extensions.Options;
using MySqlConnector;
using sticker.Code;
using sticker.Interfaces;
using sticker.Models;
using sticker.Utils;

namespace sticker.Repositories;

public class ImageRepository(IOptions<ConnectionString> connectionStrings) : IImageRepository
{
    private readonly IDbConnection db = new MySqlConnection(connectionStrings.Value.StickerConnectionString);

    public async Task<IResult> GetImages(int idSticker)
    {
        try
        {
            var sql = @"SELECT IdImage, StickerImage
                        FROM images
                        WHERE IdSticker = @IdSticker";
            var response = (await db.QueryAsync<Image>(sql, new { IdSticker = idSticker }).ConfigureAwait(false)).AsList();

            return Response.BuildResponse(response);
        }
        catch (Exception ex)
        {
            return Response.BuildError(ex);
        }
    }

    public async Task<IResult> GetThumbnails(Gallery filters)
    {
        try
        {
            var categoryList = filters.Sticker?.Category?.Select(c => c.IdCategory).ToArray();
            var strCategoryList = string.Join(",", categoryList);
            var tagList = filters.Sticker?.Tag?.Select(t => t.IdTag).ToArray();
            var strTagList = string.Join(",", tagList);
            var orderCriterium = filters.Ascending ? "ASC" : "DESC";
            var nameCriterium = filters.OrderByName ? "S.StickerName" : "I.IdImage";
            var orderByCriterium = $"{nameCriterium} {orderCriterium}";

            var builder = new SqlBuilder();
            var name = filters.Sticker.StickerName;

            var sql = @$"SELECT DISTINCT 
                    I.IdImage, I.IdSticker, I.StickerImage, S.StickerName
                FROM images I
                    INNER JOIN stickers S ON I.IdSticker = S.IdSticker
                    LEFT JOIN stickertags ST ON ST.IdSticker = I.IdSticker
                    LEFT JOIN tagcategories TC ON ST.IdTag = TC.IdTag
                /**where**/ 
                /**orderby**/
                LIMIT @Limit OFFSET @Offset";
            var template = builder.AddTemplate(sql);
            builder.Where("1=1");
            if (filters.Sticker.StickerName.Length > 0) {
                builder.Where($"S.StickerName LIKE '%{name}%'", new { name });
            }
            if (filters.Sticker?.Tag?.First().IdTag != 0) {
                builder.Where($"ST.IdTag IN ({strTagList})", new { strTagList });
            }
            if (filters.Sticker?.Category?.First().IdCategory != 0)
            {
                builder.Where($"TC.IdCategory IN ({strCategoryList})", new { strCategoryList });
            }
            builder.OrderBy($"{orderByCriterium}");
            builder.AddParameters(parameters: new 
            {
                Limit = filters.Size,
                Offset = filters.Start
            });

            var response = await db.QueryAsync<Image>(template.RawSql, template.Parameters);

            return Response.BuildResponse(response);
        }
        catch (Exception ex)
        {
            return Response.BuildError(ex);
        }
    }

    public async Task<IResult> CountImages()
    {
        try
        {
            var sql = $"SELECT COUNT(*) FROM images";
            var response = (await db.QueryAsync<int>(sql).ConfigureAwait(false)).AsList();

            return Response.BuildResponse(response);
        }
        catch (Exception ex)
        {
            return Response.BuildError(ex);
            throw;
        }
    }

    public async Task<IResult> SaveImage(int idSticker, List<IFormFile> images)
    {
        try
        {
            if (images.Count == 0 || images.First() == null || images.First().Length == 0) 
            {
                return Response.BuildError(new Exception("No data received"), 400);
            }
            byte[]? imageBytes = await GetImageArray(images[0]);

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@IdSticker", idSticker);
            parameters.Add("@StickerImage", imageBytes, DbType.Binary, ParameterDirection.Input);

            string sql = "INSERT INTO images (IdSticker, StickerImage) VALUES (@IdSticker, @StickerImage); SELECT LAST_INSERT_ID()";
            int response = await db.ExecuteScalarAsync<int>(sql, parameters).ConfigureAwait(false);

            return Response.BuildResponse(response);
        }
        catch (Exception ex)
        {
            return Response.BuildError(ex);
        }
    }

    private async Task<byte[]> GetImageArray(IFormFile image)
    {
        using (var imageFileStream = image.OpenReadStream())
        using (var imageMemoryStream = new MemoryStream())
        {
            await imageFileStream.CopyToAsync(imageMemoryStream);
            return imageMemoryStream.ToArray();
        }
    }

    public async Task<IResult> DeleteImage(int idImage)
    {
        try
        {
            var sql = "DELETE FROM images WHERE IdImage = @IdImage";
            var response = await db.ExecuteAsync(sql, 
            new
            {
                IdImage = idImage 
            }).ConfigureAwait(false);

            return Response.BuildResponse(response);  
        }
        catch (Exception ex)
        {
            return Response.BuildError(ex);
        }
    }
}