# Assignment 07 — E-Commerce Product & Shopping Cart API

A lightweight REST API built with Node.js and Express.js. Product, user, and cart data are persisted in JSON files using `fs/promises` instead of a database.

## Tech Stack

- Node.js
- Express.js
- fs/promises
- bcryptjs
- express-session
- dotenv
- uuid
- nodemon

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
│   ├── adminGuard.js
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
├── README.md
└── server.js
```

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The API runs on `http://localhost:3000` by default.

## Authentication

Passwords are hashed using bcryptjs before they are stored in `data/users.json`.

Sessions are created after successful login. Authenticated cart routes read the current user from `req.session.user`.

### Admin access

Registration always creates a `customer` account. Product create/update/delete routes require an authenticated session whose `role` is `admin`.

For local testing, after registering a user you can manually change that user's `role` in `data/users.json` from `customer` to `admin`, then log in again. Do not expose this manual role-editing approach in a real production application.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register customer with hashed password |
| POST | `/api/auth/login` | Login and create session |
| POST | `/api/auth/logout` | Destroy session |

### Products

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List, search, filter and sort products |
| GET | `/api/products/:id` | Get one product |
| POST | `/api/products` | Create product; admin only |
| PUT | `/api/products/:id` | Update product; admin only |
| DELETE | `/api/products/:id` | Delete product; admin only |

### Cart

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart` | Get current user's cart and calculated totals |
| POST | `/api/cart/items` | Add item after stock validation |
| DELETE | `/api/cart/items/:productId` | Remove item |
| POST | `/api/cart/checkout` | Place order and decrement stock |

## Product Filtering and Sorting

Examples:

```text
GET /api/products?category=Electronics
GET /api/products?minPrice=1000&maxPrice=5000
GET /api/products?inStock=true
GET /api/products?search=headphones
GET /api/products?sort=price_asc
GET /api/products?sort=price_desc
GET /api/products?sort=rating_desc
GET /api/products?sort=newest
GET /api/products?category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc
```

Supported `sort` values:

- `price_asc`
- `price_desc`
- `rating_desc`
- `newest`

## Cart Calculation

The cart calculates:

- `itemTotal = unitPrice × quantity`
- `subtotal = sum of item totals`
- `discount = 10% when subtotal >= ₹5000`
- `cartTotal = subtotal - discount`

The discount is part of the assignment's cart-calculation requirement and can be changed easily inside `controllers/cartController.js` if your faculty specifies a different rule.

## Required Verification Flow

1. Start the server.
2. Register a user.
3. Log in and keep the same session/cookies in Postman or Thunder Client.
4. Open `GET /api/products`.
5. Add a product to the cart with `POST /api/cart/items`.
6. Try adding more quantity than available stock and confirm `400 Insufficient stock`.
7. View the cart with `GET /api/cart`.
8. Checkout using `POST /api/cart/checkout`.
9. Open `data/products.json` and verify the purchased product's stock has decreased.

## Sample Requests

### Register

```json
{
  "username": "alex",
  "email": "alex@shop.com",
  "password": "password123"
}
```

### Login

```json
{
  "email": "alex@shop.com",
  "password": "password123"
}
```

### Add to cart

```json
{
  "productId": "prod_101",
  "quantity": 2
}
```

### Create product (admin session)

```json
{
  "name": "Mechanical Keyboard Pro",
  "category": "Electronics",
  "price": 1899,
  "stock": 25,
  "rating": 4.5
}
```

## Notes

This project intentionally uses JSON files instead of a database so that the assignment demonstrates asynchronous file persistence with `fs/promises`.

For a real production deployment, the session store and application data should be moved to durable external storage/database infrastructure rather than the default in-memory session store and local JSON files.
