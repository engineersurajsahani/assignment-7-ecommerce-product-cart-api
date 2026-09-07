# 🛒 Assignment 07 — E-Commerce Product & Shopping Cart API

**Track:** Backend Development  
**Level:** Beginner to Intermediate  
**Tech Stack:** Node.js, Express.js, JSON/File-System Storage (`fs/promises`), bcryptjs, Express-Session

## 1. About the Project

This project implements an E-Commerce Product Catalog and Shopping Cart REST API.

The API uses JSON files instead of a database:

- `data/products.json`
- `data/users.json`
- `data/carts.json`

It demonstrates:

- Asynchronous file I/O using `fs/promises`
- Product filtering, searching and sorting
- User registration and login
- Password hashing with bcryptjs
- Session-based authentication
- Shopping cart management
- Stock validation
- Checkout and stock decrement
- Reusable middleware
- Request logging
- Validation and error handling

## 2. Does the assignment require a frontend?

**No.**

The provided assignment README describes a **Backend Development** assignment and specifies a REST API. Its required project architecture contains `server.js`, controllers, middleware, routes, utilities and JSON data files; it does **not** require a frontend.

So the safest submission is this backend API project without adding a frontend framework.

## 3. Installation

Make sure Node.js and npm are installed.

Inside this project folder:

```bash
npm install
```

The required packages are already listed in `package.json`.

Equivalent manual installation:

```bash
npm init -y
npm install express bcryptjs express-session dotenv uuid
npm install -D nodemon
```

## 4. Environment Variables

Copy `.env.example` to `.env`.

```bash
cp .env.example .env
```

Example:

```env
PORT=3000
SESSION_SECRET=change-this-to-a-long-random-secret
ADMIN_KEY=admin123
NODE_ENV=development
```

Do not commit `.env` to GitHub. It is ignored by `.gitignore`.

## 5. Run the Server

Development mode:

```bash
npm run dev
```

Normal mode:

```bash
npm start
```

You should see:

```text
Server running at http://localhost:3000
```

Health check:

```text
GET http://localhost:3000/api/health
```

## 6. Project Structure

```text
itm-assignment-07-ecommerce-api/
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
├── server.js
└── README.md
```

## 7. API Endpoints

### Authentication

#### Register

```http
POST /api/auth/register
Content-Type: application/json
```

Body:

```json
{
  "username": "alex",
  "email": "alex@shop.com",
  "password": "password123"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json
```

Body:

```json
{
  "email": "alex@shop.com",
  "password": "password123"
}
```

#### Current Session

```http
GET /api/auth/me
```

#### Logout

```http
POST /api/auth/logout
```

### Products

#### Get all products

```http
GET /api/products
```

#### Filter and sort

Example:

```http
GET /api/products?category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc
```

Supported query parameters:

- `category`
- `minPrice`
- `maxPrice`
- `inStock=true`
- `inStock=false`
- `search`
- `sort=price_asc`
- `sort=price_desc`
- `sort=rating_desc`
- `sort=name_asc`

#### Get one product

```http
GET /api/products/prod_101
```

#### Add product

The assignment describes this as an Admin route.

Add this header:

```text
x-admin-key: admin123
```

Request:

```http
POST /api/products
Content-Type: application/json
x-admin-key: admin123
```

Body:

```json
{
  "name": "Gaming Mouse",
  "category": "Electronics",
  "price": 1499,
  "stock": 20,
  "rating": 4.3
}
```

#### Update product

```http
PUT /api/products/prod_101
Content-Type: application/json
x-admin-key: admin123
```

Body:

```json
{
  "price": 2799,
  "stock": 20
}
```

#### Delete product

```http
DELETE /api/products/prod_101
x-admin-key: admin123
```

### Shopping Cart

All cart endpoints require a logged-in session.

#### View cart

```http
GET /api/cart
```

#### Add item

```http
POST /api/cart/items
Content-Type: application/json
```

Body:

```json
{
  "productId": "prod_101",
  "quantity": 1
}
```

If the requested quantity is greater than available stock, the API returns `400` with an `Insufficient stock` message.

#### Remove item

```http
DELETE /api/cart/items/prod_101
```

#### Checkout

```http
POST /api/cart/checkout
```

Checkout:

1. Checks that the cart is not empty.
2. Re-checks stock for every item.
3. Decrements product stock in `products.json`.
4. Creates a simulated order response.
5. Clears the user's cart.

## 8. Testing Order

Use Postman, Thunder Client, Insomnia, or curl.

Recommended sequence:

### Step 1 — Start server

```bash
npm run dev
```

### Step 2 — Check health

```http
GET http://localhost:3000/api/health
```

### Step 3 — View products

```http
GET http://localhost:3000/api/products
```

### Step 4 — Test filtering

```http
GET http://localhost:3000/api/products?category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc
```

### Step 5 — Register

```http
POST http://localhost:3000/api/auth/register
```

Body:

```json
{
  "username": "Pallavi",
  "email": "pallavi@example.com",
  "password": "password123"
}
```

### Step 6 — Login

```http
POST http://localhost:3000/api/auth/login
```

Body:

```json
{
  "email": "pallavi@example.com",
  "password": "password123"
}
```

Keep the session cookie returned by the client.

### Step 7 — Add product to cart

```http
POST http://localhost:3000/api/cart/items
```

Body:

```json
{
  "productId": "prod_101",
  "quantity": 2
}
```

### Step 8 — View cart

```http
GET http://localhost:3000/api/cart
```

### Step 9 — Test insufficient stock

Product `prod_104` has stock `0`, so:

```json
{
  "productId": "prod_104",
  "quantity": 1
}
```

should return `400`.

You can also request more than the available stock for `prod_101`.

### Step 10 — Checkout

```http
POST http://localhost:3000/api/cart/checkout
```

Then open `data/products.json` and verify that the purchased product's stock has decreased.

## 9. Important Note About Admin Routes

The assignment calls product creation/update/delete "Admin routes", but it does not define an admin user schema or an admin authentication endpoint.

To keep the API protected without changing the required user schema, this implementation uses an `x-admin-key` header.

The default key in `.env.example` is:

```text
admin123
```

You can change it in `.env`.

## 10. Assignment Requirements Covered

- [x] Node.js + Express.js
- [x] JSON file persistence
- [x] `fs/promises`
- [x] 5 seeded products
- [x] Product filtering
- [x] Price range filtering
- [x] In-stock filtering
- [x] Search
- [x] Sorting
- [x] Product CRUD
- [x] User registration
- [x] bcrypt password hashing
- [x] Session authentication
- [x] Authenticated cart
- [x] Stock validation
- [x] Cart total calculation
- [x] Checkout
- [x] Automatic stock decrement
- [x] Logging middleware
- [x] Product validation middleware
- [x] Error handling
- [x] Sample JSON data

## 11. Submission

The assignment asks for the GitHub repository:

```text
itm-assignment-07-ecommerce-api
```

Make sure the `data/` directory is committed because the assignment specifically requires sample JSON data ready to test.

Before submitting:

```bash
git status
git add .
git commit -m "Complete Assignment 07 ecommerce API"
git push
```

Then create the required Pull Request according to your course submission process.
