using System.Data;
using Dapper;
using Microsoft.Extensions.Options;
using MySqlConnector;
using sticker.Code;
using sticker.Interfaces;
using sticker.Models;
using sticker.Utils;

namespace sticker.Repositories;

public class StickerRepository(IOptions<ConnectionString> connectionStrings) : IStickerRepository
{
    private readonly IDbConnection db = new MySqlConnection(connectionStrings.Value.StickerConnectionString);

    public async Task<IResult> SearchSticker(Sticker sticker)
    {
        try
        {
            var sql = @"SELECT
                    S.IdSticker,
                    S.StickerName,
                    T.IdTag,
                    T.TagName
                FROM stickers S 
                    LEFT JOIN stickertags ST ON ST.IdSticker = S.IdSticker
                    LEFT JOIN tags T ON T.IdTag = ST.IdTag
                WHERE (@NoTags = 1 OR T.IdTag IN @TagIdList) AND
                    (@StickerName = '' OR S.StickerName LIKE CONCAT('%', @StickerName, '%'))
                ORDER BY S.StickerName";
            
            var tagList = sticker.Tag.Select(t => t.IdTag).ToArray();
            sticker.TagIdList = tagList;
            sticker.NoTags = tagList[0] != 0 ? 0 : 1;
            var stickers = await db.QueryAsync<Sticker, Tag, Sticker>(sql,
                (sticker, tag) => 
                {
                    sticker.Tag = new List<Tag>{ tag };
                    sticker.TagIdList = tagList;
                    return sticker;                
                }, splitOn: "IdTag",
                param: new
                {
                    sticker.Tag,
                    sticker.TagIdList,
                    sticker.StickerName,
                    sticker.NoTags
                }
            ).ConfigureAwait(false);

            var response = stickers
                .GroupBy(p => p.IdSticker)
                .Select(g => 
                {
                    var groupedSticker = g.First();
                    groupedSticker.Tag = g.Select(tag => tag.Tag.Single()).ToList();

                    if (groupedSticker.Tag[0] != null) {
                    groupedSticker.Tag = groupedSticker.Tag
                        .GroupBy(tag => tag.IdTag)
                        .Select(tag => tag.First())
                        .ToList();
                    }

                    return groupedSticker;
                }).AsList();

            return Response.BuildResponse(response);
        }
        catch (Exception ex)
        {
            return Response.BuildError(ex);
        }
    }

    public async Task<IResult> SaveSticker(Sticker sticker)
    {
        try
        {
            bool isNewSticker = sticker.IdSticker == 0;
            int stickerSave = 0, stickerTagDelete = 0, stickerTagInsert = 0, stickerId = 0;
            var sql = isNewSticker ?
                "INSERT INTO stickers (StickerName) VALUES (@StickerName); SELECT LAST_INSERT_ID()" :
                "UPDATE stickers SET StickerName = @StickerName WHERE IdSticker = @IdSticker";

            stickerSave = await db.ExecuteScalarAsync<int>(sql, new 
            {
                sticker.IdSticker,
                sticker.StickerName
            }).ConfigureAwait(false);

            stickerId = isNewSticker ? stickerSave : sticker.IdSticker;

            if (sticker.Tag != null && sticker.Tag.Count > 0)
            {
                if (!isNewSticker)
                {
                    sql = "DELETE FROM stickertags WHERE IdSticker = @IdSticker";
                    stickerTagDelete = await db.ExecuteAsync(sql, sticker).ConfigureAwait(true);
                }

                sql = "INSERT INTO stickertags (IdTag, IdSticker) VALUES (@IdTag, @IdSticker)";
                sticker.Tag.ForEach(async tag => 
                {
                    var operation = db.ExecuteAsync(sql, new 
                    {
                        tag.IdTag,
                        IdSticker = stickerId
                    });
                    operation.ConfigureAwait(false);
                    stickerTagInsert = await operation;
                    operation.Dispose();
                });                
            }

            var response = stickerSave + stickerTagDelete + stickerTagInsert;

            return Response.BuildResponse(response); 
        }
        catch (UniqueException ex)
        {
            return Response.BuildError(ex, 400);
        }
        catch (Exception ex)
        {
            if (ex.Message.Contains("Duplicate")) throw new UniqueException("Pegatinas");
            return Response.BuildError(ex);
        }
    }

    public async Task<IResult> DeleteSticker(int id)
    {
        try
        {
            int stickerDelete = 0, stickerPhotoDelete = 0;
            var sql = "DELETE FROM stickers WHERE IdSticker = @IdSticker";
            stickerDelete = await db.ExecuteAsync(sql, new { IdSticker = id }).ConfigureAwait(false);

            if (stickerDelete > 0)
            {
            sql = "DELETE FROM images WHERE IdSticker = @IdSticker";
            stickerPhotoDelete = await db.ExecuteAsync(sql, 
            new 
            { 
                IdSticker = id 
            }).ConfigureAwait(false);  
            } 
            var response = stickerDelete + stickerPhotoDelete;

            return Response.BuildResponse(response);
        }
        catch (Exception ex)
        {
            return Response.BuildError(ex);
        }
    }
}