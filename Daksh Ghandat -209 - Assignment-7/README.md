<<<<<<< HEAD
# 🛒 Assignment 07: E-Commerce Product & Shopping Cart API
> **Track:** Backend Development | **Level:** Beginner to Intermediate | **Estimated Time:** 5–7 Hours  
> **Tech Stack:** Node.js, Express.js, JSON / File-System Data Storage (`fs/promises`), bcryptjs, Express-Session

---

## 📌 1. Objective & Overview

Build a lightweight, production-structured **E-Commerce Product Catalog & Shopping Cart REST API** using **Node.js** and **Express.js**, persisting data directly in structured JSON files via Node's asynchronous file system module (`fs/promises`). This assignment reinforces core backend fundamentals: multi-criteria filtering, cart calculations (totals, discounts, stock validation), user session management, and custom middleware design without relying on a full database engine.

### Key Learning Outcomes:
- Asynchronous file I/O operations using Node's `fs/promises` (`readFile`, `writeFile`).
- Building dynamic search and filtering engines (Category, Price Range, In-Stock, Sorting).
- Managing stateful shopping cart sessions tied to authenticated users.
- Implementing inventory reservation checks before items are added to a cart.
- Designing reusable validation and logging middleware.

---

## 🛠️ 2. Tech Stack & Dependencies

```bash
# Initialize Node.js project
npm init -y

# Install runtime dependencies
npm install express bcryptjs express-session dotenv uuid

# Install development dependencies
npm install -D nodemon
```

---

## 🗄️ 3. JSON Data Schemas & Entities

Data will be persisted in `./data/products.json`, `./data/users.json`, and `./data/carts.json`.

### 📦 Product Entity (`data/products.json`)
```json
[
  {
    "id": "prod_101",
    "name": "Wireless Noise-Canceling Headphones",
    "category": "Electronics",
    "price": 2999,
    "stock": 15,
    "rating": 4.6,
    "createdAt": "2026-03-01T10:00:00.000Z"
  }
]
```

### 🛍️ Cart Entity (`data/carts.json`)
```json
[
  {
    "userId": "usr_001",
    "items": [
      {
        "productId": "prod_101",
        "name": "Wireless Noise-Canceling Headphones",
        "unitPrice": 2999,
        "quantity": 2,
        "itemTotal": 5998
      }
    ],
    "cartTotal": 5998,
    "updatedAt": "2026-03-01T11:30:00.000Z"
  }
]
```

---

## 📋 4. API Endpoints Specification

### 🔐 User Authentication

| Method | Endpoint | Description | Request Body Example | Status Codes |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register customer with hashed password | `{"username":"alex","email":"alex@shop.com","password":"password123"}` | `201 Created`<br>`400 Bad Request` |
| `POST` | `/api/auth/login` | Authenticate customer and create session | `{"email":"alex@shop.com","password":"password123"}` | `200 OK`<br>`401 Unauthorized` |
| `POST` | `/api/auth/logout` | Terminate session | None | `200 OK` |

### 📦 Product Catalog Management

| Method | Endpoint | Query Parameters | Description | Request Body Example | Status Codes |
|---|---|---|---|---|---|
| `GET` | `/api/products` | `?category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc` | Filter & search products | None | `200 OK` |
| `GET` | `/api/products/:id` | None | Fetch single product by ID | None | `200 OK`<br>`404 Not Found` |
| `POST` | `/api/products` | None | Add a new product (Admin route) | `{"name":"Mechanical Keyboard","category":"Electronics","price":1899,"stock":25,"rating":4.5}` | `201 Created`<br>`400 Bad Request` |
| `PUT` | `/api/products/:id` | None | Update price or stock count | `{"stock":30,"price":1799}` | `200 OK`<br>`404 Not Found` |
| `DELETE` | `/api/products/:id` | None | Remove product from store | None | `200 OK`<br>`404 Not Found` |

### 🛒 Shopping Cart System (Authenticated)

| Method | Endpoint | Description | Request Body Example | Status Codes |
|---|---|---|---|---|
| `GET` | `/api/cart` | View current user's cart with calculated total | None | `200 OK` |
| `POST` | `/api/cart/items` | Add product to cart (Validates stock availability) | `{"productId":"prod_101","quantity":1}` | `200 OK`<br>`400 Out of Stock` |
| `DELETE` | `/api/cart/items/:productId` | Remove specific product from cart | None | `200 OK`<br>`404 Not in Cart` |
| `POST` | `/api/cart/checkout` | Simulate order placement & decrement product stock | None | `200 OK`<br>`400 Empty Cart` |

---

## 🏗️ 5. Project Folder Architecture

```text
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
│   ├── authGuard.js         # Check req.session.user exists
│   ├── logger.js            # Request logger
│   └── validateProduct.js   # Verify price > 0, stock >= 0
├── routes/
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   └── productRoutes.js
├── utils/
│   └── fileHelper.js        # readJSONFile, writeJSONFile wrappers
├── .env.example
├── .gitignore
├── package.json
├── server.js
=======
# E-Commerce Product & Shopping Cart REST API

A beginner-friendly REST API for a small e-commerce application, built with **Node.js** and **Express.js**.

All data is stored in **JSON files** (inside the `data/` directory) using Node's `fs/promises` module — no database is used. The API supports user registration/login with **sessions**, a product catalog with filtering/searching/sorting, and a per-user shopping cart with stock validation and a simulated checkout.

---

## Table of Contents

1. [Description](#description)
2. [Technologies](#technologies)
3. [Project Structure](#project-structure)
4. [Installation](#installation)
5. [Environment Setup](#environment-setup)
6. [Running the Server](#running-the-server)
7. [Data Store](#data-store)
8. [API Endpoints](#api-endpoints)
9. [Query Parameters](#query-parameters)
10. [Testing with curl](#testing-with-curl)
11. [Full Testing Flow](#full-testing-flow)
12. [Security Notes](#security-notes)

---

## Description

This project demonstrates how to build a real REST API without a database.

It covers:

- Password hashing with `bcryptjs` so plain-text passwords are **never** stored.
- Authentication with `express-session` (session cookies).
- A product catalog you can filter, search and sort.
- A personal shopping cart for every logged-in user.
- Stock validation: you cannot add more items to the cart than are in stock.
- A simulated checkout that decreases product stock and clears the cart.

---

## Technologies

| Technology | Purpose |
| --- | --- |
| Node.js | Runtime (JavaScript on the server) |
| Express.js | Web framework (routes, middleware) |
| fs/promises | Asynchronous file reading/writing |
| JSON | Persistent data storage |
| bcryptjs | Password hashing |
| express-session | Login sessions |
| dotenv | Loading `.env` environment variables |
| uuid | Generating unique IDs |

---

## Project Structure

```
assignment-07-ecommerce-api/
├── data/
│   ├── carts.json          # Shopping carts for each user
│   ├── products.json       # Product catalog (5+ seeded products)
│   └── users.json          # Registered users (passwords are hashed)
├── controllers/
│   ├── authController.js   # Register / login / logout logic
│   ├── cartController.js   # Cart and checkout logic
│   └── productController.js# Product CRUD + filtering logic
├── middleware/
│   ├── authGuard.js        # Protects cart routes (401 if not logged in)
│   ├── logger.js           # Logs every request
│   └── validateProduct.js  # Validates product create/update payloads
├── routes/
│   ├── authRoutes.js       # /api/auth endpoints
│   ├── cartRoutes.js       # /api/cart endpoints
│   └── productRoutes.js    # /api/products endpoints
├── utils/
│   └── fileHelper.js       # Reusable readData/writeData (fs/promises)
├── .env.example            # Example environment variables
├── .gitignore
├── package.json
├── server.js               # Entry point: configures Express + session
>>>>>>> ca958fb (Add Assignment 7 E-Commerce Product & Cart API by Daksh Ghandat -209)
└── README.md
```

---

<<<<<<< HEAD
## ⚙️ 6. Core Implementation Guide: Asynchronous File Helper

```javascript
// utils/fileHelper.js
const fs = require('fs/promises');
const path = require('path');

const readData = async (filename) => {
  const filePath = path.join(__dirname, '../data', filename);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeData = async (filename, data) => {
  const filePath = path.join(__dirname, '../data', filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

module.exports = { readData, writeData };
=======
## Installation

```bash
npm install
>>>>>>> ca958fb (Add Assignment 7 E-Commerce Product & Cart API by Daksh Ghandat -209)
```

---

<<<<<<< HEAD
## 🧪 7. Testing & Verification

1. Seed `data/products.json` with 5 products across different categories.
2. Register and log in a user.
3. Test adding an item with quantity higher than available stock; ensure the API responds with `400 Bad Request: Insufficient stock`.
4. Test the checkout endpoint: verify that product stock in `products.json` decrements automatically upon successful checkout.

---

## 📊 8. Grading Rubric (100 Marks)

| Evaluation Component | Marks |
|---|:---:|
| **File-System Async Data Persistence (`fs/promises`)** | 25 |
| **Product Filtering, Search & Sorting Logic** | 20 |
| **Shopping Cart Management & Stock Validation** | 25 |
| **Session Authentication & Password Hashing** | 15 |
| **Architecture, Error Handling & Code Quality** | 15 |
| **Total Marks** | **100** |

---

## 📤 9. Submission Guidelines

- Submit your GitHub repository: `itm-assignment-07-ecommerce-api`.
- Ensure the `data/` directory contains sample JSON data ready to test.
=======
## Environment Setup

1. Create your environment file from the example:

```bash
cp .env.example .env
```

2. Open `.env` and set:

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | The port the server listens on | `3000` |
| `SESSION_SECRET` | A secret key used to sign session cookies | `a_long_random_string` |

`.env` is listed in `.gitignore`, so it is never committed to version control. `SESSION_SECRET` should be changed in production.

---

## Running the Server

Development (auto-restarts with nodemon):

```bash
npm run dev
```

Normal:

```bash
npm start
```

You should see:

```
Server running on http://localhost:3000
```

---

## Data Store

All persistent data lives in the `data/` directory. The `utils/fileHelper.js` file provides two async helpers:

- `readData(filename)` → reads + parses a JSON file, returns `[]` if the file is missing/corrupt
- `writeData(filename, data)` → writes pretty-printed JSON (`JSON.stringify(data, null, 2)`)

### Product schema

```json
{
  "id": "prod_101",
  "name": "Wireless Noise-Canceling Headphones",
  "category": "Electronics",
  "price": 2999,
  "stock": 15,
  "rating": 4.6,
  "createdAt": "2026-03-01T10:00:00.000Z"
}
```

### User schema

```json
{
  "id": "usr_91f2...",
  "username": "alex",
  "email": "alex@shop.com",
  "password": "$2b$10$...",   /* bcrypt hash, never the plain text */
  "createdAt": "2026-03-01T10:00:00.000Z"
}
```

### Cart schema

```json
{
  "userId": "usr_91f2...",
  "items": [
    {
      "productId": "prod_101",
      "name": "Wireless Noise-Canceling Headphones",
      "unitPrice": 2999,
      "quantity": 2,
      "itemTotal": 5998
    }
  ],
  "cartTotal": 5998,
  "updatedAt": "2026-03-01T11:30:00.000Z"
}
```

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth | Request body | Success status | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | Create a new user account | No | `username`, `email`, `password` | 201 | 400 duplicate email / bad input |
| POST | `/api/auth/login` | Log in and create a session | No | `email`, `password` | 200 | 401 invalid credentials |
| POST | `/api/auth/logout` | Destroy the session | No | – | 200 | – |

### Products (`/api/products`)

| Method | Endpoint | Description | Auth | Request body | Success status | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/products` | List products (supports filters/search/sort, see below) | No | – | 200 | 400 invalid query value |
| GET | `/api/products/:id` | Get a single product | No | – | 200 | 404 not found |
| POST | `/api/products` | Add a new product | No (kept simple) | `name`, `category`, `price`, `stock`, `rating` | 201 | 400 validation |
| PUT | `/api/products/:id` | Update product fields | No (kept simple) | any of `name`, `category`, `price`, `stock`, `rating` | 200 | 400 / 404 |
| DELETE | `/api/products/:id` | Delete a product | No (kept simple) | – | 200 | 404 |

> **Note on admin protection:** the assignment calls the product-management routes "admin routes", but a role system was intentionally kept out to stay beginner-friendly. If you want protection, add `authGuard` to those routes and document it.

### Cart (`/api/cart`)

All cart routes require a valid session cookie (be logged in).

| Method | Endpoint | Description | Auth | Request body | Success status | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/cart` | View your cart | Yes | – | 200 | 401 |
| POST | `/api/cart/items` | Add a product (or increase quantity) | Yes | `productId`, `quantity` | 200 | 400 / 401 / 404 |
| DELETE | `/api/cart/items/:productId` | Remove a product from your cart | Yes | – | 200 | 401 / 404 |
| POST | `/api/cart/checkout` | Simulated checkout (decreases stock, clears cart) | Yes | – | 200 | 400 / 401 |

### Service (`/`)

| Method | Endpoint | Description | Success status |
| --- | --- | --- | --- |
| GET | `/` | API info message | 200 |
| GET | `/api/health` | Health check | 200 |

---

## Query Parameters

`GET /api/products` accepts the following query parameters. They can all be combined.

| Parameter | Example | Behavior |
| --- | --- | --- |
| `category` | `?category=Electronics` | Returns only products in that category (case-insensitive) |
| `minPrice` | `?minPrice=1000` | Products with `price >= minPrice` |
| `maxPrice` | `?maxPrice=5000` | Products with `price <= maxPrice` |
| `inStock` | `?inStock=true` | `true` → only products with `stock > 0`; `false` → only out-of-stock products (`stock === 0`) |
| `search` | `?search=headphone` | Case-insensitive search over product name and category |
| `sort` | `?sort=price_asc` | One of: `price_asc`, `price_desc`, `rating_desc`, `name_asc`, `newest` |

Example combining many filters:

```
GET /api/products?category=Electronics&minPrice=1000&maxPrice=5000&inStock=true&sort=price_asc
```

Response:

```json
{
  "count": 1,
  "products": [ ... ]
}
```

---

## Testing with curl

Before testing, start the server with `npm run dev`.

Sessions rely on cookies, so every curl request after login must send the **same cookie jar** using `-c` (save) and `-b` (send). The examples below store the session in a local file called `cookies.txt`. **Postman/Thunder Client handle this automatically and are easier for testing.**

### 1. Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alex","email":"alex@shop.com","password":"password123"}'
```

Expected:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "usr_91f2...",
    "username": "alex",
    "email": "alex@shop.com"
  }
}
```

> The response never contains `password`.

### 2. Login (save the session cookie)

```bash
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@shop.com","password":"password123"}'
```

### 3. List products

```bash
curl http://localhost:3000/api/products
```

### 4. Filters and search

```bash
curl "http://localhost:3000/api/products?category=Electronics"
curl "http://localhost:3000/api/products?minPrice=1000&maxPrice=5000"
curl "http://localhost:3000/api/products?inStock=true"
curl "http://localhost:3000/api/products?sort=price_asc"
curl "http://localhost:3000/api/products?search=headphone"
```

### 5. Get a single product

```bash
curl http://localhost:3000/api/products/prod_101
```

### 6. Add a product

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Mechanical Keyboard","category":"Electronics","price":1899,"stock":25,"rating":4.5}'
```

### 7. View your cart (session cookie sent)

```bash
curl -b cookies.txt http://localhost:3000/api/cart
```

Before adding anything you get an empty cart:

```json
{
  "userId": "usr_91f2...",
  "items": [],
  "cartTotal": 0,
  "updatedAt": null
}
```

### 8. Add an item to the cart

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_101","quantity":2}'
```

### 9. Try to add more than stock

`prod_101` has stock 15. If your cart already has 2 and you ask for 20, the total (22) exceeds stock → 400:

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_101","quantity":20}'
```

```json
{
  "message": "Insufficient stock"
}
```

### 10. Remove an item from the cart

```bash
curl -b cookies.txt -X DELETE http://localhost:3000/api/cart/items/prod_101
```

### 11. Checkout

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/cart/checkout
```

```json
{
  "message": "Checkout successful",
  "order": {
    "userId": "usr_91f2...",
    "items": [ ... ],
    "total": 5998,
    "createdAt": "2026-09-17T12:00:00.000Z"
  }
}
```

### 12. Logout

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/auth/logout
rm -f cookies.txt
```

### 13. Verify 401 after logout

```bash
curl -b cookies.txt http://localhost:3000/api/cart
```

```json
{
  "message": "Authentication required"
}
```

---

## Full Testing Flow

1. **Register** — `POST /api/auth/register` (verify the user is created and the password is hashed in `data/users.json`).
2. **Login** — `POST /api/auth/login` (session cookie created).
3. **Get products** — `GET /api/products`.
4. **Filter products** — try `?category=Electronics`, `?minPrice=1000&maxPrice=5000`, `?inStock=true`, `?sort=price_asc`, `?search=headphone`.
5. **Add product to cart** — `POST /api/cart/items` with `{ "productId": "prod_101", "quantity": 2 }`.
6. **View cart** — `GET /api/cart` (verify `itemTotal` and `cartTotal`).
7. **Try quantity higher than stock** — add a large quantity and verify `400 Insufficient stock`. Product stock in `data/products.json` is **unchanged** because adding to the cart does not decrement stock.
8. **Remove item** — `DELETE /api/cart/items/prod_101`, then check the cart total is back to `0`.
9. **Add item again** — add `prod_101` again for checkout.
10. **Checkout** — `POST /api/cart/checkout`.
11. **Verify stock decreased** — open `data/products.json`; `prod_101` stock should now be `15 - <quantity added>`.
12. **Logout** — `POST /api/auth/logout`.
13. **Verify 401** — `GET /api/cart` now returns `401 Authentication required`.

---

## Security Notes

- Passwords are hashed with `bcryptjs` (10 salt rounds) — plain text is never stored.
- The `password` field is never returned by any endpoint.
- Sessions use a secret from the environment variable `SESSION_SECRET` (in `.env`, git-ignored).
- Request bodies are validated before processing.
- The global error handler returns generic JSON (`Internal server error`) — stack traces are never exposed.
- `.env`, `node_modules/` and `npm-debug.log*` are git-ignored.

> **Production note:** this project uses `express-session`'s default in-memory `MemoryStore`. It is fine for development/testing, but sessions are lost when the server restarts and memory usage grows with the number of users. It is **not recommended for production** — use a persistent store such as Redis or a database in a real application.
>>>>>>> ca958fb (Add Assignment 7 E-Commerce Product & Cart API by Daksh Ghandat -209)
