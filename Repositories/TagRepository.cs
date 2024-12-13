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
            var sql = @"SELECT IdTag, TagName 
                FROM tags 
                WHERE (@TagName = '' OR TagName LIKE CONCAT('%', @TagName, '%')) 
                ORDER BY TagName";
            var response = (await db.QueryAsync<Tag>(sql, tag).ConfigureAwait(false)).AsList();

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
        catch (UniqueException ex)
        {
            return Response.BuildError(ex, 400);
        }
        catch (Exception ex)
        {
            if (ex.Message.Contains("Duplicate")) throw new UniqueException("Etiquetas");
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