using System.Text.Json.Serialization;
using Dapper.Contrib.Extensions;

namespace sticker.Models;

[Table("stickers")]
public class Sticker
{
    [Key]
    public int IdSticker { get; set; }

    public required string StickerName  { get; set; }

    public required List<Tag> Tag { get; set; }

    [JsonIgnore]
    public int[]? TagIdList { get; set; }

    [JsonIgnore]
    public int NoTags {get; set; }

    [JsonIgnore]
    public DateTime Created { get; }
}