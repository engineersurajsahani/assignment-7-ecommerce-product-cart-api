# Assignment 07 - E-Commerce Product & Shopping Cart API

## Tech Stack
- Node.js
- Express.js
- fs/promises
- JSON file storage
- bcryptjs
- express-session
- dotenv
- uuid

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Server:
`http://localhost:4000`

## Endpoints

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`

### Products
- GET `/api/products`
- GET `/api/products/:id`
- POST `/api/products`
- PUT `/api/products/:id`
- DELETE `/api/products/:id`

Example filter:
`GET /api/products?category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc`

Other filters:
- `search`
- `inStock=true`
- `sort=price_desc`
- `sort=rating_desc`
- `sort=name_asc`
- `sort=newest`

### Cart
Cart routes require a logged-in session:
- GET `/api/cart`
- POST `/api/cart/items`
- DELETE `/api/cart/items/:productId`
- POST `/api/cart/checkout`

## Testing Flow

1. Register a user.
2. Login with the same user.
3. Use the same client/session for cart requests.
4. Add a product.
5. Try a quantity greater than stock and verify `400 Insufficient stock`.
6. Checkout.
7. Open `data/products.json` and verify stock decreased.
8. Verify the cart becomes empty after checkout.

## Important
The assignment describes product create/update/delete as admin routes, but it does not define an admin-registration endpoint or admin credentials. Therefore this implementation keeps those routes available for assignment testing while enforcing authentication only where the specification explicitly requires it: the cart system.
