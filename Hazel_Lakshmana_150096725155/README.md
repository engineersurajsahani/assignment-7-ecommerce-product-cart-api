# Assignment 07 - E-Commerce Product & Shopping Cart API

A lightweight E-Commerce REST API built with Node.js and Express.js using JSON files for persistent storage.

## Live Link

**https://itm-assignment-07-ecommerce-api.onrender.com/**

## Technologies Used

- Node.js
- Express.js
- fs/promises
- bcryptjs
- express-session
- dotenv
- uuid
- nodemon

## Features

- User registration with hashed passwords
- Login and logout using sessions
- Product CRUD operations
- Product filtering by category
- Product filtering by minimum and maximum price
- In-stock filtering
- Product search
- Product sorting
- Add products to shopping cart
- Stock validation before adding items
- Remove items from cart
- Checkout and stock decrement
- Request logging middleware
- Product validation middleware

## Installation

```bash
npm install
```

Create a `.env` file:

```env
PORT=3000
SESSION_SECRET=your_secret_key
```

Run in development mode:

```bash
npm run dev
```

Or:

```bash
npm start
```

Base URL:

```text
http://localhost:3000
```

## API Endpoints

### Authentication

- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`

### Products

- GET `/api/products`
- GET `/api/products/:id`
- POST `/api/products`
- PUT `/api/products/:id`
- DELETE `/api/products/:id`

Filtering example:

```text
GET /api/products?category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc
```

Search example:

```text
GET /api/products?search=keyboard
```

In-stock example:

```text
GET /api/products?inStock=true
```

### Cart

Login first before testing cart routes.

- GET `/api/cart`
- POST `/api/cart/items`
- DELETE `/api/cart/items/:productId`
- POST `/api/cart/checkout`

## Sample Register Body

```json
{
  "username": "alex",
  "email": "alex@shop.com",
  "password": "password123"
}
```

## Sample Login Body

```json
{
  "email": "alex@shop.com",
  "password": "password123"
}
```

## Sample Add-to-Cart Body

```json
{
  "productId": "prod_101",
  "quantity": 1
}
```

## Sample Add Product Body

```json
{
  "name": "Mechanical Mouse",
  "category": "Electronics",
  "price": 1299,
  "stock": 18,
  "rating": 4.3
}
```

## Important Testing Note

Because authentication uses Express Session, test register/login/cart requests in the same Postman session so that the session cookie is retained.

## Submission

Push this project to a GitHub repository named:

`itm-assignment-07-ecommerce-api`
