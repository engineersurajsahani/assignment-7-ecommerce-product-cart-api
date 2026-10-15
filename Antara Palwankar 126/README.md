# 🛒 Assignment 07: E-Commerce Product & Shopping Cart API

**Track:** Backend Development | **Level:** Beginner to Intermediate  
**Author:** Antara Palwankar (Roll No: 126)  
**Tech Stack:** Node.js, Express.js, JSON / File-System Data Storage (`fs/promises`), `bcryptjs`, `express-session`, `dotenv`, `uuid`

---

## 📌 1. Project Overview
This project is a RESTful API for an E-Commerce Product Catalog & Shopping Cart management system. All data persistence is performed directly on JSON files using Node's asynchronous file system (`fs/promises`).

### Key Features
- **Async File I/O:** Custom promise-based read/write wrapper with atomic error recovery.
- **Product Catalog & Multi-Criteria Engine:** Search by keyword, filter by category, price ranges (`minPrice`, `maxPrice`), stock availability, and multiple sort orders (`price_asc`, `price_desc`, `rating_desc`, `newest`, `name_asc`).
- **Stateful Shopping Cart:** Session-tied shopping carts with automated item total & cart total recalculations.
- **Stock Reservation & Validation:** Prevents adding more items than available in inventory.
- **Atomic Checkout Simulation:** Validates inventory before purchase, decrements product stock, clears the cart, and issues an order confirmation.
- **Authentication & Security:** Password hashing via `bcryptjs` and session management via `express-session`.

---

## 🏗️ 2. Folder Architecture
```
Assignment 7/Antara Palwankar 126/
├── data/
│   ├── carts.json
│   ├── products.json
│   └── users.json
├── controllers/
│   ├── authController.js
│   ├── cartController.js
│   └── productController.js
├── middleware/
│   ├── authGuard.js         # Protects routes requiring session
│   ├── logger.js            # HTTP request logger
│   └── validateProduct.js   # Validates price > 0, stock >= 0
├── routes/
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   └── productRoutes.js
├── utils/
│   └── fileHelper.js        # Asynchronous fs/promises readData & writeData
├── .env
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## 🛠️ 3. Installation & Setup

1. **Navigate to project directory:**
   ```bash
   cd "Assignment 7/Antara Palwankar 126"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   A `.env` file is already created. You can customize variables if needed:
   ```env
   PORT=5000
   SESSION_SECRET=ecom_super_secret_session_key_2026_antara
   NODE_ENV=development
   ```

4. **Start the server:**
   - Development mode (auto-reload):
     ```bash
     npm run dev
     ```
   - Production / standard mode:
     ```bash
     npm start
     ```

---

## 📋 4. API Documentation

### 🔐 Authentication Endpoints
| Method | Endpoint | Description | Request Body Example | Status Codes |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register customer with hashed password | `{"username":"alex","email":"alex@shop.com","password":"password123"}` | `201 Created`, `400 Bad Request` |
| `POST` | `/api/auth/login` | Authenticate customer & create session | `{"email":"alex@shop.com","password":"password123"}` | `200 OK`, `401 Unauthorized` |
| `POST` | `/api/auth/logout` | Terminate active user session | *None* | `200 OK` |
| `GET` | `/api/auth/me` | Fetch active user session profile | *None* | `200 OK`, `401 Unauthorized` |

---

### 📦 Product Catalog Endpoints
| Method | Endpoint | Query Parameters | Description | Request Body Example | Status Codes |
|---|---|---|---|---|---|
| `GET` | `/api/products` | `?category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc&search=key` | Filter, search & sort products | *None* | `200 OK` |
| `GET` | `/api/products/:id` | *None* | Fetch single product by ID | *None* | `200 OK`, `404 Not Found` |
| `POST` | `/api/products` | *None* | Create new product | `{"name":"Mechanical Keyboard","category":"Electronics","price":1899,"stock":25,"rating":4.5}` | `201 Created`, `400 Bad Request` |
| `PUT` | `/api/products/:id` | *None* | Update price, stock or details | `{"price":1799,"stock":30}` | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/api/products/:id` | *None* | Delete product from store | *None* | `200 OK`, `404 Not Found` |

---

### 🛒 Shopping Cart Endpoints (Authenticated)
| Method | Endpoint | Description | Request Body Example | Status Codes |
|---|---|---|---|---|
| `GET` | `/api/cart` | View current user's cart with calculated item & cart total | *None* | `200 OK`, `401 Unauthorized` |
| `POST` | `/api/cart/items` | Add product to cart (Validates stock availability) | `{"productId":"prod_101","quantity":2}` | `200 OK`, `400 Out of Stock / Bad Request`, `404 Not Found` |
| `DELETE` | `/api/cart/items/:productId` | Remove specific product from cart | *None* | `200 OK`, `404 Not in Cart` |
| `POST` | `/api/cart/checkout` | Place order, verify & decrement stock, clear cart | *None* | `200 OK`, `400 Empty Cart / Out of Stock` |

---

## 🧪 5. Testing Guide

### 1. Register & Login
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","email":"john@example.com","password":"password123"}' \
  -c cookies.txt

# Or Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
  -c cookies.txt
```

### 2. Search & Filter Products
```bash
curl -X GET "http://localhost:5000/api/products?category=Electronics&minPrice=1000&maxPrice=3000&sort=price_asc"
```

### 3. Add to Cart with Stock Validation
```bash
# Attempt to add 999 items (exceeding stock) -> 400 Bad Request
curl -X POST http://localhost:5000/api/cart/items \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"productId":"prod_101","quantity":999}'

# Add valid quantity (e.g. 2 items) -> 200 OK
curl -X POST http://localhost:5000/api/cart/items \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"productId":"prod_101","quantity":2}'
```

### 4. View Cart & Checkout
```bash
# View Cart
curl -X GET http://localhost:5000/api/cart -b cookies.txt

# Checkout
curl -X POST http://localhost:5000/api/cart/checkout -b cookies.txt
```
