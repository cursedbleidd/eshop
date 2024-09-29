using System.Text.Json.Serialization;

namespace eshop_back.Models
{
    public enum AccountType
    {
        Admin,
        User
    }

    public class UserDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;

        // Перечисление типа учетной записи (Администратор или Пользователь)
        public AccountType AccType { get; set; } = AccountType.User;
        public List<Order> Orders { get; set; } = new();
    }

    public class User : UserDTO
    {
        // Пароль в хешированном виде для безопасности
        public string PasswordHash { get; set; } = null!;

        // Поле для хранения токена авторизации
        public string? Token { get; set; }
        public DateTime? TokenExpire { get; set; }
    }
}
