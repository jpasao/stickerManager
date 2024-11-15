using Dapper.Contrib.Extensions;

namespace sticker.Models;

[Table("tags")]
public class Tag
{
    [Key]
    public int IdTag { get; set; }

    public required string TagName { get; set; } 
}