# 🛒 Assignment 07: E-Commerce Product & Shopping Cart API

A lightweight, production-structured E-Commerce Product Catalog & Shopping Cart REST API built using **Node.js** and **Express.js**. This API persists data directly in structured JSON files via Node's asynchronous file system module (`fs/promises`) without relying on an external database engine.

---

## 📌 Features & Key Capabilities

- **Async File-System Data Storage**: Asynchronous file I/O operations (`fs/promises`) wrappers for `products.json`, `users.json`, and `carts.json`.
- **User Authentication**: Register & Login with password hashing (`bcryptjs`) and stateful session management (`express-session`).
- **Product Catalog Management**: Multi-criteria search and filtering (`category`, `minPrice`, `maxPrice`, `sort` by price/rating/name). Admin routes for adding, updating, and deleting products with strict price and stock validation (`price > 0`, `stock >= 0`).
- **Shopping Cart System**: Authenticated cart operations with live `cartTotal` calculation and stock availability checks prior to adding items.
- **Order Checkout Simulation**: Automatically checks stock availability across all cart items, decrements stock in `products.json`, and clears the user's shopping cart.
- **Custom Middleware**: Request logging middleware (`logger.js`), route authentication guard (`authGuard.js`), and input validation (`validateProduct.js`).

---

## 📁 Project Architecture

```
assignment-07-ecommerce-api/
├── data/
│   ├── carts.json          # Shopping carts tied to user sessions
│   ├── products.json       # Product catalog inventory
│   └── users.json          # Registered users with hashed passwords
├── controllers/
│   ├── authController.js   # User registration, login, and logout handlers
│   ├── cartController.js   # Cart viewing, item addition, removal, checkout
│   └── productController.js# Product listing, filtering, creation, updates
├── middleware/
│   ├── authGuard.js        # Session authentication verification
│   ├── logger.js           # Request logger (Method, URL, Status, Latency)
│   └── validateProduct.js  # Price > 0 and stock >= 0 validation
├── routes/
│   ├── authRoutes.js       # Authentication endpoints (/api/auth)
│   ├── cartRoutes.js       # Authenticated cart endpoints (/api/cart)
│   └── productRoutes.js    # Product catalog endpoints (/api/products)
├── utils/
│   └── fileHelper.js       # readData and writeData wrappers using fs/promises
├── test/
│   └── apiTest.js          # Integration test suite for all endpoints
├── .env.example            # Environment variables template
├── .gitignore              # Node modules and env exclusions
├── package.json            # Project dependencies and npm scripts
├── server.js               # Express application entrypoint
└── README.md               # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm

### 1. Installation
Clone or navigate into the workspace directory and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Default `.env` contents:
```env
PORT=3000
SESSION_SECRET=ecommerce_super_secret_key_2026_xyz
```

### 3. Run Server
- **Development Mode** (with Nodemon):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

The server runs by default at `http://localhost:3000`.

---

## 🧪 Testing & Verification

Run the automated integration test suite:
```bash
npm test
```

The test suite automatically tests:
1. Customer Registration & Login with session cookies.
2. Product filtering, multi-criteria price range search, and sorting.
3. Adding items to cart with stock validation (`quantity > stock` returns `400 Bad Request`).
4. Cart total calculation and item removal.
5. Checkout execution (verifying automatic stock decrement in `products.json` and cart reset).
6. User Logout.

---

## 📋 API Endpoints Specification

### 🔐 User Authentication (`/api/auth`)

| Method | Endpoint | Description | Request Body Example | Status Codes |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user with hashed password | `{"username":"alex","email":"alex@shop.com","password":"password123"}` | `201 Created`, `400 Bad Request` |
| `POST` | `/api/auth/login` | Authenticate customer & create session | `{"email":"alex@shop.com","password":"password123"}` | `200 OK`, `401 Unauthorized` |
| `POST` | `/api/auth/logout` | Terminate session | None | `200 OK` |

---

### 📦 Product Catalog Management (`/api/products`)

| Method | Endpoint | Query Parameters | Description | Request Body Example | Status Codes |
|---|---|---|---|---|---|
| `GET` | `/api/products` | `category`, `minPrice`, `maxPrice`, `sort` | Filter & search products | None | `200 OK` |
| `GET` | `/api/products/:id` | None | Fetch single product by ID | None | `200 OK`, `404 Not Found` |
| `POST` | `/api/products` | None | Add a new product (Admin route) | `{"name":"Mechanical Keyboard","category":"Electronics","price":1899,"stock":25,"rating":4.5}` | `201 Created`, `400 Bad Request` |
| `PUT` | `/api/products/:id` | None | Update product price or stock | `{"stock":30,"price":1799}` | `200 OK`, `404 Not Found`, `400 Bad Request` |
| `DELETE` | `/api/products/:id` | None | Remove product from catalog | None | `200 OK`, `404 Not Found` |

#### Supported `sort` options:
- `price_asc`: Low to high
- `price_desc`: High to low
- `rating_desc`: Highest rating first
- `name_asc` / `name_desc`: Alphabetical

---

### 🛒 Shopping Cart System (`/api/cart` - Authenticated)

| Method | Endpoint | Description | Request Body Example | Status Codes |
|---|---|---|---|---|
| `GET` | `/api/cart` | View current user's cart with calculated total | None | `200 OK`, `401 Unauthorized` |
| `POST` | `/api/cart/items` | Add product to cart (Validates stock availability) | `{"productId":"prod_101","quantity":1}` | `200 OK`, `400 Out of Stock`, `404 Not Found` |
| `DELETE` | `/api/cart/items/:productId` | Remove specific product from cart | None | `200 OK`, `404 Not in Cart` |
| `POST` | `/api/cart/checkout` | Simulate order placement & decrement product stock | None | `200 OK`, `400 Empty Cart / Stock Insufficient` |

---

## 🛠 Sample cURL Commands

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alex","email":"alex@shop.com","password":"password123"}'
```

### 2. Login User (with cookie jar)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@shop.com","password":"password123"}'
```

### 3. Filter Products by Category and Price
```bash
curl "http://localhost:3000/api/products?category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc"
```

### 4. Add Product to Cart
```bash
curl -X POST http://localhost:3000/api/cart/items \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_101","quantity":2}'
```

### 5. Checkout Cart
```bash
curl -X POST http://localhost:3000/api/cart/checkout \
  -b cookies.txt
```
