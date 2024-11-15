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

    public async Task<IResult> SaveImage(int idSticker, IFormFile image)
    {
        try
        {
            if (image == null || image.Length == 0) 
            {
                return Response.BuildError(new Exception("No data received"), 400);
            }
            byte[]? imageBytes = null;

            using (var imageFileStream = image.OpenReadStream())
            using (var imageMemoryStream = new MemoryStream())
            {
                await imageFileStream.CopyToAsync(imageMemoryStream);
                imageBytes = imageMemoryStream.ToArray();
            }

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