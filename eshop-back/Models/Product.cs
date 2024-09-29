using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace eshop_back.Models
{
    public class ProductDTO
    {
        //TODO: add bool InStock for deleting and editing
        //wont show when product when it's out of stock, make it impossible to order
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Brand { get; set; }
        public float Price { get; set; }
    }
    public class Product : ProductDTO
    {
        [JsonIgnore]
        public List<OrderItem> OrderItems { get; set; } = new();
    }
}
