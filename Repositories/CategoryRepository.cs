using System.Data;
using Dapper;
using Microsoft.Extensions.Options;
using MySqlConnector;
using sticker.Code;
using sticker.Interfaces;
using sticker.Models;
using sticker.Utils;

namespace sticker.Repositories;

public class CategoryRepository(IOptions<ConnectionString> connectionStrings) : ICategoryRepository
{
    private readonly IDbConnection db = new MySqlConnection(connectionStrings.Value.StickerConnectionString);

    public async Task<IResult> SearchCategory(Category category)
    {
        try
        {
            var builder = new SqlBuilder();
            var sql = @"SELECT C.IdCategory, C.CategoryName, T.IdTag, T.TagName
                FROM categories C
                    LEFT JOIN tagcategories TC ON C.IdCategory = TC.IdCategory
                    LEFT JOIN tags T ON T.IdTag = TC.IdTag
                /**where**/
                ORDER BY C.CategoryName";

            var template = builder.AddTemplate(sql);
            if (category.CategoryName.Length > 0)
            {
                var name = category.CategoryName;
                builder.Where($"CategoryName LIKE CONCAT('%', '{name}', '%')", new { name });
            }
            var tagList = category.Tag.Select(t => t.IdTag).ToArray();
            if (tagList?.First() != 0)
            {
                var strTagList = string.Join(",", tagList);
                builder.Where($"T.IdTag IN ({strTagList})", new { strTagList });
            }
            var categories = (await db.QueryAsync<Category, Tag, Category>(template.RawSql,
                static (category, tag) =>
                {
                    category.Tag = [tag];
                    return category;
                }, splitOn: "IdTag"));

            var response = categories
                .GroupBy(p => p.IdCategory)
                .Select(g => 
                {
                    var groupedCategory = g.First();
                    groupedCategory.Tag = g.Select(tag => tag.Tag.Single()).ToList();
                    if (groupedCategory.Tag[0] != null)
                    {
                        groupedCategory.Tag = groupedCategory.Tag
                            .GroupBy(tag => tag.IdTag)
                            .Select(tag => tag.First())
                            .ToList();
                    }
                    return groupedCategory;
                }).AsList();

            return Response.BuildResponse(response);
        }
        catch (Exception ex)
        {
            return Response.BuildError(ex);
        }
    }

    public async Task<IResult> SaveCategory(Category category)
    {
        try
        {
            int categorySave = 0, tagCategoryDelete = 0, tagCategoryInsert = 0, categoryId = 0;
            string sql;
            bool newCategory = category.IdCategory == 0;
            if (newCategory)
            {
                sql = "INSERT INTO categories (CategoryName) VALUES (@CategoryName); SELECT LAST_INSERT_ID()";
                categorySave = await db.ExecuteScalarAsync<int>(sql, category).ConfigureAwait(false);
            }
            else 
            {
                sql = "UPDATE categories SET CategoryName = @CategoryName WHERE IdCategory = @IdCategory";
                categorySave = await db.ExecuteAsync(sql, category).ConfigureAwait(false);
            }

            categoryId = newCategory ? categorySave : category.IdCategory;

            if (category.Tag != null && category.Tag.Count > 0 && category.Tag[0].IdTag != 0)
            {
                if (!newCategory)
                {
                    sql = "DELETE FROM tagcategories WHERE IdCategory = @IdCategory";
                    tagCategoryDelete = await db.ExecuteAsync(sql, category).ConfigureAwait(false);
                }

                using var connection = new MySqlConnection(connectionStrings.Value.StickerConnectionString);

                sql = "INSERT INTO tagcategories (IdCategory, IdTag) VALUES (@IdCategory, @IdTag)";
                var tagCategories = category.Tag.Select(obj => new
                {
                    IdCategory = categoryId,
                    obj.IdTag
                });
                tagCategoryInsert = await connection.ExecuteAsync(sql, tagCategories);
            }

            var response = newCategory ? categoryId : categorySave + tagCategoryDelete + tagCategoryInsert;

            return Response.BuildResponse(response);
        }
        catch (MySqlException ex)
        {
            if (ex.Message.Contains("Duplicate")) {
                var exception = new UniqueException("Categorías");
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

    public async Task<IResult> DeleteCategory(int id)
    {
        try
        {
            var sql = "DELETE FROM categories WHERE IdCategory = @IdCategory";
            var response = await db.ExecuteAsync(sql, new { IdCategory = id }).ConfigureAwait(false);

            return Response.BuildResponse(response);
        }
        catch (Exception ex)
        {
            return Response.BuildError(ex);
        }
    }

    public async Task<IResult> GetDependencies(int id)
    {
        try
        {
            var sql = @"
                SELECT S.StickerName AS Name, 'Pegatinas' AS Category
                FROM categories C
                    INNER JOIN tagcategories TC ON C.IdCategory = TC.IdCategory
                    INNER JOIN stickertags ST ON ST.IdTag = TC.IdTag
                    INNER JOIN stickers S ON ST.IdSticker = S.IdSticker
                WHERE C.IdCategory = @IdCategory
                ORDER BY Name";
            var response = await db.QueryAsync<Dependency>(sql, new { IdCategory = id }).ConfigureAwait(false);

            return Response.BuildResponse(response);
        }
        catch (Exception ex)
        {
            return Response.BuildError(ex);
        }
    }
}