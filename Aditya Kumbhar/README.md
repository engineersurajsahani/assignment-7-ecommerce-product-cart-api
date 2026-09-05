# E-Commerce Product Catalog & Shopping Cart REST API

A lightweight, production-structured E-Commerce Product Catalog and Shopping Cart REST API built with Node.js and Express.js. Data is persisted directly in structured JSON files using Node's asynchronous file system module (`fs/promises`).

---

## Features

- **Asynchronous File Persistence:** Complete CRUD operations with non-blocking `fs/promises` reads and writes.
- **User Authentication & Session Management:** Password hashing via `bcryptjs` and session-based state management using `express-session`.
- **Product Catalog Management:** Multi-criteria filtering (category, price range, stock availability), search keywords, and sorting (`price_asc`, `price_desc`, `rating_desc`, `newest`).
- **Shopping Cart System:** Real-time stock validation, automated total calculations, item removal, and checkout with automatic inventory decrement.
- **Custom Middleware:** Centralized request logging, product validation, and session route guards.

---

## Project Structure

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
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## Tech Stack & Dependencies

- **Runtime:** Node.js
- **Framework:** Express.js
- **Security & Sessions:** bcryptjs, express-session
- **Utilities:** uuid, dotenv
- **Development Tool:** nodemon

---

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file based on `.env.example`:
   ```env
   PORT=5001
   SESSION_SECRET=ecommerce_super_secret_key_2026
   ```

3. **Run the server:**
   - Development mode:
     ```bash
     npm run dev
     ```
   - Production / Start mode:
     ```bash
     npm start
     ```

Server will be running at `http://localhost:5001`.

---

## API Endpoints Specification

### 1. User Authentication (`/api/auth`)

| Method | Endpoint | Description | Request Body Example | Status Codes |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register customer with hashed password | `{"username":"alex","email":"alex@shop.com","password":"password123"}` | `201 Created`, `400 Bad Request` |
| `POST` | `/api/auth/login` | Authenticate customer and create session | `{"email":"alex@shop.com","password":"password123"}` | `200 OK`, `401 Unauthorized` |
| `POST` | `/api/auth/logout` | Terminate session | None | `200 OK` |

### 2. Product Catalog (`/api/products`)

| Method | Endpoint | Query Parameters | Description | Request Body Example | Status Codes |
|---|---|---|---|---|---|
| `GET` | `/api/products` | `?category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc&inStock=true&search=Headphones` | Filter, search & sort products | None | `200 OK` |
| `GET` | `/api/products/:id` | None | Fetch single product by ID | None | `200 OK`, `404 Not Found` |
| `POST` | `/api/products` | None | Add a new product (Validated) | `{"name":"Mechanical Keyboard","category":"Electronics","price":1899,"stock":25,"rating":4.5}` | `201 Created`, `400 Bad Request` |
| `PUT` | `/api/products/:id` | None | Update product details | `{"price":1799,"stock":30}` | `200 OK`, `404 Not Found`, `400 Bad Request` |
| `DELETE` | `/api/products/:id` | None | Remove product from store | None | `200 OK`, `404 Not Found` |

### 3. Shopping Cart (`/api/cart` - Protected by Auth)

| Method | Endpoint | Description | Request Body Example | Status Codes |
|---|---|---|---|---|
| `GET` | `/api/cart` | View current authenticated user's cart with calculated total | None | `200 OK`, `401 Unauthorized` |
| `POST` | `/api/cart/items` | Add item to cart with stock validation | `{"productId":"prod_101","quantity":2}` | `200 OK`, `400 Insufficient Stock`, `404 Not Found` |
| `DELETE` | `/api/cart/items/:productId` | Remove specific product from cart | None | `200 OK`, `404 Not in Cart` |
| `POST` | `/api/cart/checkout` | Process order and decrement inventory in `products.json` | None | `200 OK`, `400 Empty Cart / Out of Stock` |

---

## Testing Scenarios

1. **User Registration & Login:**
   - Send `POST` to `/api/auth/register` with `username`, `email`, and `password`.
   - Send `POST` to `/api/auth/login` to establish the user session.

2. **Browsing & Filtering Products:**
   - Send `GET` to `/api/products?category=Electronics&sort=price_asc` to view filtered products.

3. **Stock Validation in Cart:**
   - Attempt to add an item to the cart with quantity exceeding the available stock in `products.json`.
   - The API will respond with `400 Bad Request` and an insufficient stock message.

4. **Cart Checkout & Inventory Deduction:**
   - Add a valid quantity of an item to the cart.
   - Send `POST` to `/api/cart/checkout`.
   - Check `data/products.json` to confirm that the product's stock count has been decremented accordingly.
