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

    public async Task<IResult> SearchSticker(StickerFilter filters)
    {
        try
        {
            var builder = new SqlBuilder();
            var sql = @"SELECT
                    S.IdSticker,
                    S.StickerName,
                    T.IdTag,
                    T.TagName,
                    C.IdCategory,
                    C.CategoryName
                FROM stickers S 
                    LEFT JOIN stickertags ST ON ST.IdSticker = S.IdSticker
                    LEFT JOIN tags T ON T.IdTag = ST.IdTag
                    LEFT JOIN tagcategories TC ON TC.IdTag = T.IdTag
                    LEFT JOIN categories C ON C.IdCategory = TC.IdCategory
                /**where**/ 
                /**orderby**/";

            var template = builder.AddTemplate(sql);
            if (filters.Sticker.StickerName.Length > 0) 
            {
                var name = filters.Sticker.StickerName;
                builder.Where($"S.StickerName LIKE CONCAT('%', '{name}', '%')", new { name });
            }
            var tagList = filters.Sticker.Tag.Select(t => t.IdTag).ToArray();
            if (tagList?.First() != 0)
            {
                var strTagList = string.Join(",", tagList);
                builder.Where($"T.IdTag IN ({strTagList})", new { strTagList });

            }
            var categoryList = filters.Sticker.Category.Select(c => c.IdCategory).ToArray();
            if (categoryList?.First() != 0) 
            {
                var strCategoryList = string.Join(",", categoryList);
                builder.Where($"C.IdCategory IN ({strCategoryList})", new {strCategoryList});
            }
            var orderCriterium = filters.Ascending ? "ASC" : "DESC";
            var nameCriterium = filters.OrderByName ? "S.StickerName" : "S.IdSticker";
            var orderByCriterium = $"{nameCriterium} {orderCriterium}";
            builder.OrderBy($"{orderByCriterium}");

            var stickers = (await db.QueryAsync<Sticker, Tag, Category, Sticker>(template.RawSql,
                (sticker, tag, category) => 
                {
                    sticker.Tag = new List<Tag>{ tag };
                    sticker.TagIdList = tagList;
                    sticker.Category = new List<Category>{ category };
                    return sticker;
                }, splitOn: "IdTag, IdCategory"));

            var response = stickers
                .GroupBy(p => p.IdSticker)
                .Select(g => 
                {
                    var groupedSticker = g.First();

                    groupedSticker.Tag = g.Select(tag => tag.Tag.Single()).ToList();
                    if (groupedSticker.Tag[0] != null) 
                    {
                        groupedSticker.Tag = groupedSticker.Tag
                            .GroupBy(tag => tag?.IdTag)
                            .Select(tag => tag.First())
                            .ToList();
                    }
                    else 
                    {
                        groupedSticker.Tag = null;
                    }

                    groupedSticker.Category = g.Select(cat => cat.Category.Single()).ToList();
                    if (groupedSticker.Category[0] != null)
                    {
                        groupedSticker.Category = groupedSticker.Category
                            .GroupBy(cat => cat?.IdCategory)
                            .Select(cat => cat.First())
                            .ToList();
                    } 
                    else 
                    {
                        groupedSticker.Category = null;
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
            int stickerSave = 0, stickerTagDelete = 0, stickerTagInsert = 0, stickerCategoryDelete = 0, stickerCategoryInsert = 0,stickerId = 0;

            string sql;
            if (isNewSticker)
            {
                sql = "INSERT INTO stickers (StickerName) VALUES (@StickerName); SELECT LAST_INSERT_ID()";
                stickerSave = await db.ExecuteScalarAsync<int>(sql, new 
                {
                    sticker.IdSticker,
                    sticker.StickerName
                }).ConfigureAwait(false);
            }
            else 
            {
                sql = "UPDATE stickers SET StickerName = @StickerName WHERE IdSticker = @IdSticker";
                stickerSave = await db.ExecuteAsync(sql, new 
                {
                    sticker.IdSticker,
                    sticker.StickerName
                }).ConfigureAwait(false);
            }

            stickerId = isNewSticker ? stickerSave : sticker.IdSticker;

            if (sticker.Tag != null && sticker.Tag.Count > 0 && sticker.Tag[0].IdTag != 0)
            {
                if (!isNewSticker)
                {
                    sql = "DELETE FROM stickertags WHERE IdSticker = @IdSticker";
                    stickerTagDelete = await db.ExecuteAsync(sql, sticker).ConfigureAwait(false);
                }

                using var connection = new MySqlConnection(connectionStrings.Value.StickerConnectionString);

                sql = "INSERT INTO stickertags (IdTag, IdSticker) VALUES (@IdTag, @IdSticker)";
                var stickerTags = sticker.Tag.Select(obj => new {
                    obj.IdTag,
                    IdSticker = stickerId
                });
                stickerTagInsert = await connection.ExecuteAsync(sql, stickerTags);
            }
            if (sticker.Category != null && sticker.Category.Count > 0 && sticker.Category[0].IdCategory != 0)
            {
                if (!isNewSticker)
                {
                    sql = "DELETE FROM stickercategories WHERE IdSticker = @IdSticker";
                    stickerCategoryDelete = await db.ExecuteAsync(sql, sticker).ConfigureAwait(false);
                }

                using var connection = new MySqlConnection(connectionStrings.Value.StickerConnectionString);

                sql = "INSERT INTO stickercategories (IdCategory, IdSticker) VALUES (@IdCategory, @IdSticker)";
                var stickerCategories = sticker.Category.Select(obj => new {
                    obj.IdCategory,
                    IdSticker = stickerId
                });
                stickerCategoryInsert = await connection.ExecuteAsync(sql, stickerCategories);
            }

            var response = isNewSticker ? stickerId : stickerSave + stickerTagDelete + stickerTagInsert + stickerCategoryDelete + stickerCategoryInsert;

            return Response.BuildResponse(response); 
        }
        catch (MySqlException ex)
        {
            if (ex.Message.Contains("Duplicate")) {
                var exception = new UniqueException("Pegatinas");
                return Response.BuildError(exception, 400);
            }
            return Response.BuildError(ex, 400);
        }
        catch (UniqueException ex)
        {
            return Response.BuildError(ex, 400);
        }
        catch (Exception ex)
        {
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