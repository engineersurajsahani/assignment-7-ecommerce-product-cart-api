# 🛒 Assignment 07: E-Commerce Product & Shopping Cart API

A lightweight, production-structured E-Commerce Product Catalog & Shopping Cart REST API built with **Node.js** and **Express.js**, persisting all data in structured JSON files via `fs/promises` (no database engine).

## ✨ Features

- Async, file-based persistence for products, users, and carts.
- Multi-criteria product filtering: category, price range, in-stock, search, sort.
- Session-based authentication with `bcryptjs` password hashing.
- Stock-aware shopping cart: quantities are validated against live inventory both when adding items and at checkout.
- Reusable middleware: request logger, auth guard, product payload validator.

## 🛠️ Tech Stack

- Node.js + Express.js
- `fs/promises` for JSON file I/O
- `bcryptjs` for password hashing
- `express-session` for stateful auth
- `uuid` for ID generation
- `dotenv` for environment config

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# edit .env and set a real SESSION_SECRET

# 3. Run in development (auto-restart on changes)
npm run dev

# ...or run in production mode
npm start
```

The API starts on `http://localhost:5000` by default (configurable via `PORT` in `.env`).

Sample product data is already seeded in `data/products.json` (5 products across Electronics, Footwear, Home & Kitchen, and Sports & Fitness). `data/users.json` and `data/carts.json` start empty and populate as you use the API.

## 📁 Project Structure

```
assignment-07-ecommerce-api/
├── data/
│   ├── carts.json
│   ├── products.json
│   └── users.json
├── controllers/
│   ├── authController.js
│   ├── cartController.js
│   └── productController.js
├── middleware/
│   ├── authGuard.js
│   ├── logger.js
│   └── validateProduct.js
├── routes/
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   └── productRoutes.js
├── utils/
│   └── fileHelper.js
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## 📋 API Reference

### 🔐 Auth

| Method | Endpoint             | Body                                                    | Notes                      |
|--------|-----------------------|----------------------------------------------------------|-----------------------------|
| POST   | `/api/auth/register`  | `{ "username", "email", "password" }`                    | Password hashed with bcrypt |
| POST   | `/api/auth/login`     | `{ "email", "password" }`                                 | Creates a session cookie    |
| POST   | `/api/auth/logout`    | —                                                          | Destroys the session        |

### 📦 Products

| Method | Endpoint            | Query / Body                                                                 | Notes                    |
|--------|----------------------|--------------------------------------------------------------------------------|----------------------------|
| GET    | `/api/products`      | `category`, `minPrice`, `maxPrice`, `inStock=true`, `search`, `sort`           | `sort`: `price_asc`, `price_desc`, `rating_asc`, `rating_desc`, `newest`, `oldest` |
| GET    | `/api/products/:id`  | —                                                                               | 404 if not found          |
| POST   | `/api/products`      | `{ "name", "category", "price", "stock", "rating"? }`                          | Validated by `validateProduct` |
| PUT    | `/api/products/:id`  | Any subset of the fields above                                                  | Validated by `validateProduct` |
| DELETE | `/api/products/:id`  | —                                                                               | 404 if not found          |

**Example filter query:**
```
GET /api/products?category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc
```

### 🛒 Cart (requires an active session — log in first)

| Method | Endpoint                          | Body                                    | Notes                                   |
|--------|-------------------------------------|-------------------------------------------|--------------------------------------------|
| GET    | `/api/cart`                        | —                                          | Returns items + live-calculated total       |
| POST   | `/api/cart/items`                  | `{ "productId", "quantity" }`             | 400 if requested qty exceeds available stock |
| DELETE | `/api/cart/items/:productId`       | —                                          | 404 if the product isn't in the cart        |
| POST   | `/api/cart/checkout`               | —                                          | Re-validates stock, decrements it, empties cart |

## 🧪 Testing & Verification

A typical manual test flow (using `curl`, Postman, or Thunder Client — remember to persist cookies across requests so the session is reused):

```bash
# 1. Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alex","email":"alex@shop.com","password":"password123"}'

# 2. Log in (save the session cookie, e.g. with -c cookies.txt)
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@shop.com","password":"password123"}'

# 3. Browse & filter products
curl "http://localhost:5000/api/products?category=Electronics&sort=price_asc"

# 4. Try adding more than available stock (prod_105 "Yoga Mat" has 0 in stock)
curl -b cookies.txt -X POST http://localhost:5000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_105","quantity":1}'
# -> 400 Bad Request: Insufficient stock

# 5. Add a valid item, view the cart
curl -b cookies.txt -X POST http://localhost:5000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_101","quantity":2}'
curl -b cookies.txt http://localhost:5000/api/cart

# 6. Checkout — verify prod_101's stock in data/products.json decremented by 2
curl -b cookies.txt -X POST http://localhost:5000/api/cart/checkout
```

## 📊 Grading Rubric Coverage

| Component                                              | Marks |
|---------------------------------------------------------|-------|
| File-System Async Data Persistence (`fs/promises`)       | 25    |
| Product Filtering, Search & Sorting Logic                | 20    |
| Shopping Cart Management & Stock Validation              | 25    |
| Session Authentication & Password Hashing                | 15    |
| Architecture, Error Handling & Code Quality              | 15    |
| **Total**                                                | **100** |
