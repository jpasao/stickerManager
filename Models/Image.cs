using Dapper.Contrib.Extensions;

namespace sticker.Models;

[Table("images")]
public class Image
{
    [Key]
    public int IdImage { get; set; }

    public int IdSticker { get; set; }

    public required byte[] StickerImage { get; set; }
}

public class ImageData
{
    public int IdSticker { get; set; }

    public required IFormFile Image { get; set; }
}