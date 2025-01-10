using Dapper.Contrib.Extensions;

namespace sticker.Models;

[Table("categories")]
public class Category
{
    [Key]
    public int IdCategory { get; set; }

    public required string CategoryName { get; set; } 
}