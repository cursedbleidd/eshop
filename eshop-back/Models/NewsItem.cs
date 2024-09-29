namespace eshop_back.Models
{
    public class NewsItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Text { get; set; }
    }
}
