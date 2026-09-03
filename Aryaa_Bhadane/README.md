# E-Commerce Product Catalog & Shopping Cart API

Assignment 07 REST API built with Node.js, Express, session authentication, and JSON-file persistence.

## Setup

```bash
cd Aryaa_Bhadane
npm install
cp .env.example .env
npm run dev
```

Set `SESSION_SECRET` in `.env` to a long random value. `PORT` defaults to `5000` locally. Start the production server with `npm start`.

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a user; passwords are bcrypt hashes only. |
| POST | `/api/auth/login` | Authenticate and create a session. |
| POST | `/api/auth/logout` | Destroy the current session. |
| GET | `/api/products` | List products. Supports `category`, `minPrice`, `maxPrice`, `search`, and `sort` (`price_asc`, `price_desc`, `rating_asc`, `rating_desc`, `name_asc`, `name_desc`). |
| GET | `/api/products/:id` | Fetch one product. |
| POST | `/api/products` | Create a product with `name`, `category`, `price`, `stock`, and `rating`. |
| PUT | `/api/products/:id` | Update `price` and/or `stock`. |
| DELETE | `/api/products/:id` | Delete a product. |
| GET | `/api/cart` | Get the signed-in user's cart. |
| POST | `/api/cart/items` | Add `{ "productId", "quantity" }` to the signed-in user's cart. |
| DELETE | `/api/cart/items/:productId` | Remove a cart line item. |
| POST | `/api/cart/checkout` | Verify inventory, decrement stock, and clear the cart. |

Cart endpoints require the session created by login. Product/cart mutations are serialized in-process to prevent concurrent read-modify-write operations from clobbering JSON files. Cart `itemTotal` and `cartTotal` are stored and rewritten every time the cart changes.

## Render deployment

1. Push this repository to GitHub.
2. Create a Render **Web Service** and connect the repository.
3. Set **Root Directory** to `Aryaa_Bhadane`.
4. Use build command `npm install` and start command `node server.js` (or `npm start`).
5. Add a `SESSION_SECRET` environment variable in Render. Do not set `PORT`; Render supplies it.

Deployed URL: `https://your-render-service.onrender.com` (replace after deployment).

### JSON persistence limitation

Render's filesystem is ephemeral. Users, cart changes, stock updates, and checkouts written to `data/*.json` are lost after a restart or redeploy, and are not shared across multiple service instances. This JSON-backed design is appropriate for the assignment/demo, not production persistence.
