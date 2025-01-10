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
            var sql = @"SELECT IdCategory, CategoryName
                FROM categories
                /**where**/
                ORDER BY CategoryName";

            var template = builder.AddTemplate(sql);
            if (category.CategoryName.Length > 0)
            {
                var name = category.CategoryName;
                builder.Where($"CategoryName LIKE CONCAT('%', '{name}', '%')", new { name });
            }
            var response = (await db.QueryAsync<Category>(template.RawSql, category).ConfigureAwait(false)).AsList();

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
            int categorySave = 0;
            string sql;
            if (category.IdCategory == 0)
            {
                sql = "INSERT INTO categories (CategoryName) VALUES (@CategoryName); SELECT LAST_INSERT_ID()";
                categorySave = await db.ExecuteScalarAsync<int>(sql, category).ConfigureAwait(false);
            }
            else 
            {
                sql = "UPDATE categories SET CategoryName = @CategoryName WHERE IdCategory = @IdCategory";
                categorySave = await db.ExecuteAsync(sql, category).ConfigureAwait(false);
            }

            return Response.BuildResponse(categorySave);
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
                    INNER JOIN stickercategories SC ON C.IdCategory = SC.IdCategory
                    INNER JOIN stickers S ON S.IdSticker = SC.IdSticker
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