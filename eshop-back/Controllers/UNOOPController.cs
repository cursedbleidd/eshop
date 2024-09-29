using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using eshop_back.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace eshop_back.Controllers
{
    // Контроллер для Users
    [Route("api/[controller]")]
    [ApiController]
    //TODO: Put (password change)
    public class UserController : ControllerBase
    {
        private readonly ApplicationContext _context;

        public UserController(ApplicationContext context)
        {
            _context = context;
        }

        // Получение списка всех пользователей доступно только администраторам
        [Authorize(Roles = nameof(AccountType.Admin))]
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users.Include(u => u.Orders).ThenInclude(o => o.OrderItems).ThenInclude(oi => oi.Product).ToListAsync();
            var dUsers = users.Select(u => new UserDTO
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Orders = u.Orders,
                AccType = u.AccType
            });
            return Ok(dUsers);
        }

        // Регистрация нового пользователя (доступно без авторизации)
        [AllowAnonymous]
        [HttpPost("register")]
        //TODO: make it impossible to register as admin
        public async Task<IActionResult> Register(User user)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash); // Хеширование пароля
            var token = GenerateJwtToken(user);
            user.Token = token;
            user.TokenExpire = DateTime.UtcNow.AddHours(2); // Время истечения токена
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { Token = token });
        }

        // Удаление пользователя доступно только администраторам
        [Authorize(Roles = nameof(AccountType.Admin))]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Авторизация пользователя
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                return Unauthorized();
            }

            // Генерация JWT токена (пример)
            var token = GenerateJwtToken(user);
            user.Token = token;
            user.TokenExpire = DateTime.UtcNow.AddHours(2); // Время истечения токена

            await _context.SaveChangesAsync();

            return Ok(new { Token = token });
        }

        private string GenerateJwtToken(User user) //TODO: move all protected data to appsettings.json or hide it in any other way
        {
            // Секретный ключ для подписи токена
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your-Secret-Key-Super-Super-Long-And-Very-Secure12345")); //move to appsettings.json

            // Определяем клеймы (claims) для токена. Обычно включают ID пользователя и его роль.
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Role, user.AccType.ToString()), // Добавляем роль пользователя
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Уникальный идентификатор токена
             };

            // Создание токена с помощью ключа и алгоритма подписи
            var token = new JwtSecurityToken(
                issuer: "yourIssuer",  // Издатель токена
                audience: "yourAudience", // Получатель токена
                claims: claims, // Клеймы, которые мы создали выше
                expires: DateTime.UtcNow.AddHours(2), // Время истечения токена
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

            // Возвращаем сгенерированный JWT токен
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // Контроллер для NewsItems
    [Route("api/[controller]")]
    [ApiController]
    public class NewsItemsController : ControllerBase
    {
        private readonly ApplicationContext _context;

        public NewsItemsController(ApplicationContext context)
        {
            _context = context;
        }

        // GET: api/NewsItems
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NewsItem>>> GetNewsItems()
        {
            return await _context.News.ToListAsync();
        }

        // GET: api/NewsItems/{id}
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<NewsItem>> GetNewsItem(int id)
        {
            var newsItem = await _context.News.FindAsync(id);
            if (newsItem == null)
            {
                return NotFound();
            }
            return newsItem;
        }

        // POST: api/NewsItems
        [Authorize(Roles = nameof(AccountType.Admin))]
        [HttpPost]
        public async Task<ActionResult<NewsItem>> PostNewsItem(NewsItem newsItem)
        {
            _context.News.Add(newsItem);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetNewsItem), new { id = newsItem.Id }, newsItem);
        }

        // PUT: api/NewsItems/{id}
        [Authorize(Roles = nameof(AccountType.Admin))]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutNewsItem(int id, NewsItem newsItem)
        {
            if (id != newsItem.Id)
            {
                return BadRequest();
            }

            _context.Entry(newsItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NewsItemExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/NewsItems/{id}
        [Authorize(Roles = nameof(AccountType.Admin))]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNewsItem(int id)
        {
            var newsItem = await _context.News.FindAsync(id);
            if (newsItem == null)
            {
                return NotFound();
            }

            _context.News.Remove(newsItem);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool NewsItemExists(int id)
        {
            return _context.News.Any(e => e.Id == id);
        }
    }

    // Контроллер для Products
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationContext _context;

        public ProductsController(ApplicationContext context)
        {
            _context = context;
        }

        // GET: api/Products
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products.ToListAsync();
        }

        // GET: api/Products/{id}
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }
            return product;
        }

        // POST: api/Products
        [Authorize(Roles = nameof(AccountType.Admin))]
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // PUT: api/Products/{id}
        [Authorize(Roles = nameof(AccountType.Admin))]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, Product product)
        {
            if (id != product.Id)
            {
                return BadRequest();
            }

            _context.Entry(product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Products/{id}
        [Authorize(Roles = nameof(AccountType.Admin))]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool ProductExists(int id)
        {
            return _context.Products.Any(e => e.Id == id);
        }
    }

    // Контроллер для Orders
    [Route("api/[controller]")]
    [ApiController]
    //TODO: Put (cancel order)
    public class OrderController : ControllerBase 
    {
        // Класс для входного запроса на создание заказа
        public class CreateOrderRequest
        {
            public string Destination { get; set; } = null!;
            public string NameRec { get; set; } = null!;
            public string SurnameRec { get; set; } = null!;
            public List<OrderItemRequest> OrderItems { get; set; } = new();
        }

        // Класс для представления элемента заказа
        public class OrderItemRequest
        {
            public Product Product { get; set; }
            public int Quantity { get; set; }
        }
        private readonly ApplicationContext _context;

        public OrderController(ApplicationContext context)
        {
            _context = context;
        }

        // Доступен для авторизованных пользователей
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetUserOrders()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in claims");
            }
            var orders = await _context.Orders
                                       .Where(o => o.UserId == int.Parse(userId))
                                       .Include(o => o.OrderItems)
                                       .ThenInclude(oi => oi.Product)
                                       .ToListAsync();
            return Ok(orders);
        }

        // Создание заказа только для авторизованных пользователей
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
        {
            // Получаем UserId из токена
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("User ID not found in claims");
            }

            var userId = int.Parse(userIdClaim);

            var user = await _context.Users.FindAsync(userId);
            if (request.OrderItems.Count == 0)
                return BadRequest();
            // Создаем новый объект Order
            var order = new Order
            {
                UserId = userId,
                Destination = request.Destination,
                NameRec = request.NameRec,
                SurnameRec = request.SurnameRec,
                Status = "Pending",
                OrderItems = new List<OrderItem>()
            };

            // Загрузка продуктов из базы данных
            foreach (var orderItemRequest in request.OrderItems)
            {
                var product = await _context.Products.FindAsync(orderItemRequest.Product.Id);
                if (product == null)
                {
                    return BadRequest($"Product with ID {orderItemRequest.Product.Id} not found.");
                }

                var orderItem = new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = orderItemRequest.Quantity,
                    Product = product
                };
                order.OrderItems.Add(orderItem);
            }



            // Сохраняем заказ в базе данных
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(order);
        }
        [Authorize(Roles = nameof(AccountType.Admin))]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(int id, OrderDTO orderd)
        {
            if (id != orderd.Id)
            {
                return BadRequest();
            }
            var order = await _context.Orders.FindAsync(id);
            order.Status = orderd.Status;
            _context.Entry(order).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }
        private bool OrderExists(int id) => _context.Orders.Any((e) => e.Id == id);
        // Метод удаления заказа доступен только для администраторов
        [Authorize(Roles = nameof(AccountType.Admin))]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    // Контроллер для OrderItems
    [Route("api/[controller]")]
    [ApiController]
    //TODO: idk, delete mb
    public class OrderItemsController : ControllerBase 
    {
        private readonly ApplicationContext _context;

        public OrderItemsController(ApplicationContext context)
        {
            _context = context;
        }

        // GET: api/OrderItems
        [Authorize(Roles = nameof(AccountType.Admin))]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderItem>>> GetOrderItems()
        {
            return await _context.OrderItems.ToListAsync();
        }

        // GET: api/OrderItems/{id}
        [Authorize(Roles = nameof(AccountType.Admin))]
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderItem>> GetOrderItem(int id)
        {
            var orderItem = await _context.OrderItems.FindAsync(id);
            if (orderItem == null)
            {
                return NotFound();
            }
            return orderItem;
        }

        // POST: api/OrderItems
        [Authorize(Roles = nameof(AccountType.Admin))]
        [HttpPost]
        public async Task<ActionResult<OrderItem>> PostOrderItem(OrderItem orderItem)
        {
            _context.OrderItems.Add(orderItem);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetOrderItem), new { id = orderItem.Id }, orderItem);
        }

        // PUT: api/OrderItems/{id}
        [Authorize(Roles = nameof(AccountType.Admin))]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrderItem(int id, OrderItem orderItem)
        {
            if (id != orderItem.Id)
            {
                return BadRequest();
            }

            _context.Entry(orderItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderItemExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/OrderItems/{id}
        [Authorize(Roles = nameof(AccountType.Admin))]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrderItem(int id)
        {
            var orderItem = await _context.OrderItems.FindAsync(id);
            if (orderItem == null)
            {
                return NotFound();
            }

            _context.OrderItems.Remove(orderItem);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool OrderItemExists(int id)
        {
            return _context.OrderItems.Any(e => e.Id == id);
        }
    }
}
