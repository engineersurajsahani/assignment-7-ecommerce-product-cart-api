# E-Commerce Product & Shopping Cart API

REST API for a small online store. Data lives in JSON files under `data/`
(read and written with `fs/promises`), passwords are hashed with bcrypt, and
login uses `express-session` (cookie based, no JWT). Ships with a small plain
HTML frontend in `public/`, served by the same server.

## Live demo

https://assignment-7-ecommerce-product-cart-api-5xit.onrender.com

The shop UI and the API run as one Render web service on the free tier:

- The first visit after a period of inactivity can take up to a minute while
  the server wakes up.
- The free tier has no persistent disk, so `data/*.json` goes back to the
  committed seed data whenever the server restarts, redeploys or wakes up.
  New accounts, carts, orders and product edits are temporary; the seeded
  accounts below always work.
- Sessions are kept in memory, so a restart also logs everyone out.

Deployed with root directory `Ashutosh_Pawar_150096725130`, build
`npm install`, start `npm start`, and `SESSION_SECRET` set in the Render
environment. Render provides `PORT`.

## Setup

```bash
npm install
cp .env.example .env     # then set SESSION_SECRET
npm run dev              # nodemon, auto-restart on change
# or
npm start
```

- Shop UI: `http://localhost:5000`
- API: `http://localhost:5000/api/...`
- Requests to try: `test.http` (VS Code REST Client)

### Seeded accounts

| Role     | Email            | Password      |
| -------- | ---------------- | ------------- |
| Admin    | `admin@shop.com` | `admin123`    |
| Customer | `alex@shop.com`  | `password123` |

`data/products.json` comes with 10 products across 5 categories (one of them
out of stock, one with only 3 left — handy for testing stock checks).

## Endpoints

### Auth

| Method | Path                 | Access | Notes                               |
| ------ | -------------------- | ------ | ----------------------------------- |
| POST   | `/api/auth/register` | Public | `201`, `400` bad input / email used |
| POST   | `/api/auth/login`    | Public | `200` + session cookie, `401`       |
| POST   | `/api/auth/logout`   | Public | `200`, destroys the session         |
| GET    | `/api/auth/me`       | Public | current session user or `null`      |

### Products

| Method | Path                       | Access | Notes                     |
| ------ | -------------------------- | ------ | ------------------------- |
| GET    | `/api/products`            | Public | filters below, `200`      |
| GET    | `/api/products/categories` | Public | distinct category list    |
| GET    | `/api/products/:id`        | Public | `200`, `404`              |
| POST   | `/api/products`            | Admin  | `201`, `400`              |
| PUT    | `/api/products/:id`        | Admin  | `200`, `400`, `404`       |
| DELETE | `/api/products/:id`        | Admin  | `200`, `404`              |

Query parameters for `GET /api/products` (all optional, they stack):

| Param      | Example              | Meaning                                  |
| ---------- | -------------------- | ---------------------------------------- |
| `search`   | `?search=keyboard`   | name or category contains the text       |
| `category` | `?category=Books`    | exact category (case-insensitive)        |
| `minPrice` | `?minPrice=1000`     | price >= value                           |
| `maxPrice` | `?maxPrice=5000`     | price <= value                           |
| `inStock`  | `?inStock=true`      | only products with stock > 0             |
| `sort`     | `?sort=price_asc`    | `price_asc`, `price_desc`, `rating_desc`, `name_asc`, `newest` |

Bad values (`minPrice=abc`, `minPrice > maxPrice`, unknown `sort`) return `400`.

### Cart (logged-in users)

| Method | Path                         | Notes                                        |
| ------ | ---------------------------- | -------------------------------------------- |
| GET    | `/api/cart`                  | items, `cartTotal`, `discount`, `payable`    |
| POST   | `/api/cart/items`            | `{ productId, quantity }`, `400` out of stock |
| DELETE | `/api/cart/items/:productId` | `200`, `404` not in cart                     |
| POST   | `/api/cart/checkout`         | `200` order, `400` empty cart / stock gone   |
| GET    | `/api/cart/orders`           | the user's past orders                       |

Without a session every cart route returns `401`; product writes by a
non-admin return `403`.

## How it works

- **JSON files as the database** (`utils/fileHelper.js`). `readData` parses a
  file (a missing file counts as `[]`; broken JSON throws instead of silently
  wiping data). `writeData` writes to a `.tmp` file and renames it over the
  real one, so a crash mid-write never leaves a half-written file.
- **No lost writes.** Two requests doing read → change → write at the same
  time would overwrite each other. Every write goes through `withLock`, which
  runs them one at a time. Tested: 30 parallel product creates all saved; 10
  parallel "add 1" requests on a product with stock 3 → exactly 3 succeed.
- **Stock validation.** Adding to the cart checks
  `already in cart + new quantity <= stock`. Checkout checks every item again
  against current stock (it may have changed since), and only if all pass
  does it decrement stock in `products.json`, save the order to
  `orders.json`, and empty the cart. All or nothing.
- **Totals** are always recalculated on the server from `unitPrice × quantity`,
  never taken from the client. Orders of ₹5,000 or more get 10% off.
- **Sessions.** Login calls `session.regenerate()` (blocks session fixation)
  and stores `{ id, username, email, role }` in `request.session.user`. The
  cookie is `httpOnly`. `nodemon` ignores `data/` so writes don't restart the
  server (a restart would log everyone out, since sessions are in memory).
- **Middleware.** `authGuard` (login required), `adminOnly`,
  `validateProduct` (price > 0, stock whole number >= 0, rating 0–5), and a
  `logger` printing method, path, status and response time.

## Layout

```text
data/          products.json, users.json, carts.json, orders.json
controllers/   authController, productController, cartController
middleware/    authGuard, logger, validateProduct
routes/        authRoutes, productRoutes, cartRoutes
utils/         fileHelper (readData, writeData, withLock)
public/        HTML frontend (shop, cart, orders, login, register, admin form)
server.js
```
