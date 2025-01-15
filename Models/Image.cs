using System.Text.Json.Serialization;
using Dapper.Contrib.Extensions;

namespace sticker.Models;

[Table("images")]
public class Image
{
    [Key]
    public int IdImage { get; set; }

    public int IdSticker { get; set; }

    public string? StickerName { get; set; }

    public required byte[] StickerImage { get; set; }
}

public record Gallery
{
    public int Start { get; set; }
    public int Size { get; set; }

    public bool Ascending { get; set; }

    public bool OrderByName { get; set; }

    public Sticker Sticker { get; set; }
}