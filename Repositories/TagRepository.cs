using System.Data;
using Dapper;
using Microsoft.Extensions.Options;
using MySqlConnector;
using sticker.Code;
using sticker.Interfaces;
using sticker.Models;
using sticker.Utils;

namespace sticker.Repositories;

public class TagRepository(IOptions<ConnectionString> connectionStrings) : ITagRepository
{
    private readonly IDbConnection db = new MySqlConnection(connectionStrings.Value.StickerConnectionString);

    public async Task<IResult> SearchTag(Tag tag)
    {
        try
        {
            var builder = new SqlBuilder();
            var sql = @"SELECT IdTag, TagName
                FROM tags
                /**where**/
                ORDER BY TagName";

            var template = builder.AddTemplate(sql);
            if (tag.TagName.Length > 0)
            {
                var name = tag.TagName;
                builder.Where($"TagName LIKE CONCAT('%', '{name}', '%')", new { name });
            }
            var response = (await db.QueryAsync<Tag>(template.RawSql, tag).ConfigureAwait(false)).AsList();

            return Response.BuildResponse(response);
        }
        catch (Exception ex)
        {
            return Response.BuildError(ex);
        }
    }

    public async Task<IResult> SaveTag(Tag tag)
    {
        try
        {
            int tagSave = 0;
            string sql;
            if (tag.IdTag == 0)
            {
                sql = "INSERT INTO tags (TagName) VALUES (@TagName); SELECT LAST_INSERT_ID()";
                tagSave = await db.ExecuteScalarAsync<int>(sql, tag).ConfigureAwait(false);
            }
            else 
            {
                sql = "UPDATE tags SET TagName = @TagName WHERE IdTag = @IdTag";
                tagSave = await db.ExecuteAsync(sql, tag).ConfigureAwait(false);
            }

            return Response.BuildResponse(tagSave);
        }
        catch (MySqlException ex)
        {
            if (ex.Message.Contains("Duplicate")) {
                var exception = new UniqueException("Etiquetas");
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

    public async Task<IResult> DeleteTag(int id)
    {
        try
        {
            var sql = "DELETE FROM tags WHERE IdTag = @IdTag";
            var response = await db.ExecuteAsync(sql, new { IdTag = id }).ConfigureAwait(false);

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
                FROM tags T
                    INNER JOIN stickertags ST ON T.IdTag = ST.IdTag
                    INNER JOIN stickers S ON S.IdSticker = ST.IdSticker
                WHERE T.IdTag = @IdTag
                ORDER BY Name";
            var response = await db.QueryAsync<Dependency>(sql, new { IdTag = id }).ConfigureAwait(false);

            return Response.BuildResponse(response);
        }
        catch (Exception ex)
        {
            return Response.BuildError(ex);
        }
    }
}