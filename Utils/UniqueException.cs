namespace sticker.Utils;

public class UniqueException : Exception
{
    public UniqueException(string field) : base($"El nombre propuesto ya existe en la tabla de {field}")
    {
        Field = field;
    }

    public string Field { get; }
}