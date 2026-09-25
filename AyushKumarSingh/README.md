# 🛒 Assignment 07: E-Commerce Product & Shopping Cart API

A lightweight, production-structured E-Commerce Product Catalog & Shopping Cart REST API built with **Node.js** and **Express.js**, persisting data in JSON files via `fs/promises` (no database engine required).

## Features

- Multi-criteria product filtering (category, price range, in-stock, search) and sorting
- Session-based authentication with hashed passwords (bcryptjs)
- Shopping cart with stock validation, running totals, and checkout that decrements inventory
- Custom middleware: request logger, session auth guard, product validation

## Setup

```bash
npm install
cp .env.example .env
npm run dev   # nodemon, or `npm start` for plain node
```

The server starts on `http://localhost:3000` by default (see `.env`).

## Project Structure

```
assignment-07-ecommerce-api/
├── data/                 # JSON "database" — products, users, carts
├── controllers/          # Route handler logic
├── middleware/           # logger, authGuard, validateProduct
├── routes/                # Express routers
├── utils/fileHelper.js   # async readData/writeData wrappers
├── server.js
└── .env.example
```

## API Reference

### Auth

| Method | Endpoint             | Body                                          |
| ------ | --------------------- | ---------------------------------------------- |
| POST   | `/api/auth/register`  | `{ username, email, password }`                |
| POST   | `/api/auth/login`     | `{ email, password }`                          |
| POST   | `/api/auth/logout`    | —                                               |

Login sets a session cookie (`connect.sid`) — send it on subsequent cart requests (e.g. with `curl -c/-b cookies.txt` or an HTTP client that persists cookies).

### Products

| Method | Endpoint            | Notes                                                                 |
| ------ | -------------------- | ---------------------------------------------------------------------- |
| GET    | `/api/products`      | Query: `category`, `minPrice`, `maxPrice`, `inStock`, `search`, `sort` (`price_asc`, `price_desc`, `rating_asc`, `rating_desc`, `newest`) |
| GET    | `/api/products/:id`  |                                                                        |
| POST   | `/api/products`      | `{ name, category, price, stock, rating? }`                            |
| PUT    | `/api/products/:id`  | Any subset of `{ name, category, price, stock, rating }`               |
| DELETE | `/api/products/:id`  |                                                                        |

### Cart (requires login session)

| Method | Endpoint                       | Notes                                     |
| ------ | -------------------------------- | ------------------------------------------ |
| GET    | `/api/cart`                     | Returns cart with calculated total          |
| POST   | `/api/cart/items`                | `{ productId, quantity }` — validates stock |
| DELETE | `/api/cart/items/:productId`     | Removes a line item                         |
| POST   | `/api/cart/checkout`             | Decrements product stock, empties cart      |

## Quick Test Flow

```bash
# Register + login (cookie jar keeps the session)
curl -c cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alex","email":"alex@shop.com","password":"password123"}'

curl -c cookies.txt -b cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@shop.com","password":"password123"}'

# Browse products
curl "http://localhost:3000/api/products?category=Electronics&sort=price_asc"

# Add to cart, then checkout
curl -b cookies.txt -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_101","quantity":2}'

curl -b cookies.txt -X POST http://localhost:3000/api/cart/checkout
```

The `data/products.json` file ships pre-seeded with 5 sample products across categories so you can test filtering immediately.
