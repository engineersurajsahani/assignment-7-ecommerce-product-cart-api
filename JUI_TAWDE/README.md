# Assignment 07 - E-Commerce Product & Shopping Cart API

Backend REST API built using Node.js, Express.js, JSON file storage, bcryptjs and Express Session.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Server:
http://localhost:3000

## API Endpoints

### Authentication

POST `/api/auth/register`

```json
{
  "username": "alex",
  "email": "alex@shop.com",
  "password": "password123"
}
```

POST `/api/auth/login`

```json
{
  "email": "alex@shop.com",
  "password": "password123"
}
```

POST `/api/auth/logout`

### Products

GET `/api/products`

Examples:

`/api/products?category=Electronics`

`/api/products?minPrice=1000&maxPrice=5000`

`/api/products?inStock=true`

`/api/products?sort=price_asc`

`/api/products?search=keyboard`

GET `/api/products/:id`

POST `/api/products`

```json
{
  "name": "Mechanical Keyboard",
  "category": "Electronics",
  "price": 1899,
  "stock": 25,
  "rating": 4.5
}
```

PUT `/api/products/:id`

```json
{
  "stock": 30,
  "price": 1799
}
```

DELETE `/api/products/:id`

### Cart

Cart routes require a logged-in session.

GET `/api/cart`

POST `/api/cart/items`

```json
{
  "productId": "prod_101",
  "quantity": 1
}
```

DELETE `/api/cart/items/:productId`

POST `/api/cart/checkout`

## Testing

Use Postman, Insomnia, Thunder Client or curl.

Recommended flow:

1. Register.
2. Login.
3. Copy/use the same session.
4. View products.
5. Add a product to cart.
6. View cart.
7. Try adding more than available stock.
8. Checkout.
9. Verify `data/products.json` has reduced stock.

## Storage

- `data/users.json`
- `data/products.json`
- `data/carts.json`

No database is required for this assignment.
