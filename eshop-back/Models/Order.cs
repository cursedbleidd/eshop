using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace eshop_back.Models
{
    public class OrderDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? Destination { get; set; }
        public string? Status { get; set; }
        public string? NameRec { get; set; }
        public string? SurnameRec { get; set; }
    }
    public class Order : OrderDTO
    {
        public List<OrderItem> OrderItems { get; set; } = new();
        [JsonIgnore]
        public User User { get; set; } = null!;
    }
}
