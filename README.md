# 🛒 E-Commerce Product & Shopping Cart API (Assignment 7)

🚀 **Live Deployment Links:**
- **Render:** [https://samarth-assignment-7-ecommerce-product-cart-api.onrender.com](https://samarth-assignment-7-ecommerce-product-cart-api.onrender.com)
- **Vercel:** [https://samarth-assignment-7-ecommerce-prod.vercel.app](https://samarth-assignment-7-ecommerce-prod.vercel.app)

---

- **Name:** Samarth Navale
- **Roll No:** 150096725148
- **Cohort:** Sam Altman

---

A production-ready, lightweight RESTful API for an **E-Commerce Product Catalog & Shopping Cart System** built with **Node.js**, **Express.js**, **Session Authentication**, and **Asynchronous JSON File-System Persistence (`fs/promises`)**.

Includes Multi-criteria Search & Filtering, Stateful User Cart Management, Real-time Stock Availability Validation, Order Checkout with Auto-Inventory Decrement, OpenAPI 3.0 (Swagger UI) Documentation, Request Logging, and Error Handling.

---

## 🚀 Features

- 🔐 **Session Authentication & Password Security**: Secure customer registration and login with `bcryptjs` password hashing and stateful session management via `express-session`.
- 📦 **Dynamic Product Catalog**:
  - Multi-criteria filtering by **Category**, **Price Range (`minPrice`, `maxPrice`)**, and **In-Stock** status.
  - Case-insensitive keyword search on product title and category.
  - Multi-field sorting (`price_asc`, `price_desc`, `rating_desc`, `name_asc`, `newest`).
  - Full CRUD capabilities for store administrators with payload validation.
- 🛍️ **Stateful Shopping Cart & Inventory Validation**:
  - Persistent shopping cart linked to authenticated users.
  - Strict inventory checks preventing users from adding out-of-stock items or exceeding available quantities.
  - Automated item totals (`quantity * unitPrice`) and grand cart total calculations.
  - Remove specific items or clear cart.
- 💳 **Order Checkout & Automatic Stock Deduction**:
  - Validates cart contents against live store inventory.
  - Decrements product inventory stock counts in `products.json` upon order placement.
  - Generates an order confirmation receipt with timestamp and order ID.
- 🗄️ **Asynchronous JSON File Storage**: High-performance asynchronous file I/O operations using Node's native `fs/promises` (`readFile`, `writeFile`).
- 📊 **Interactive Swagger Documentation**: OpenAPI 3.0 specification available at `/api-docs`.
- 📮 **Postman Collection Included**: Ready-to-import Postman collection with test cases and preconfigured requests.
- 📝 **Logging & Global Error Handling**: Custom timestamped request logger and clean JSON error responses.

---

## 📁 Project Folder Structure

```text
📂 Assignment7/
├── 📄 render.yaml                                    # Root Render Deployment Config
├── 📄 vercel.json                                    # Root Vercel Serverless Config
├── 📄 Assignment 7.txt                               # Original Assignment Specification
├── 📄 README.md                                      # Main Project Documentation
└── 📂 Samarth_Navale_150096725148/                   # Student Project Directory
    ├── 📄 server.js                                  # Express Server Entry Point
    ├── 📄 package.json                               # Project Dependencies & Scripts
    ├── 📄 .env                                       # Environment Variables
    ├── 📄 .env.example                               # Environment Template
    ├── 📄 .gitignore                                 # Git Ignore Rules
    ├── 📄 render.yaml                                # Project-level Render Config
    ├── 📄 vercel.json                                # Project-level Vercel Config
    ├── 📄 README.md                                  # Internal Project Documentation
    ├── 📂 data/                                      # JSON Persistence Storage
    │   ├── 📄 products.json                          # Seeded Products Catalog
    │   ├── 📄 users.json                             # Seeded User Store
    │   └── 📄 carts.json                             # Seeded User Carts
    ├── 📂 src/
    │   ├── 📂 config/
    │   │   └── 📄 swagger.js                         # Swagger UI Setup
    │   ├── 📂 utils/
    │   │   └── 📄 fileHelper.js                      # fs/promises readData & writeData
    │   ├── 📂 middleware/
    │   │   ├── 📄 authGuard.js                       # Session & Auth Header Guard
    │   │   ├── 📄 logger.js                          # Custom Request Logger
    │   │   ├── 📄 validateProduct.js                 # Product Input Validation
    │   │   └── 📄 errorHandler.js                    # Global Error Handler
    │   ├── 📂 controllers/
    │   │   ├── 📄 authController.js                  # Register, Login, Logout, Profile
    │   │   ├── 📄 productController.js               # Search, Filter, Sort & CRUD
    │   │   └── 📄 cartController.js                  # View Cart, Add/Remove Items, Checkout
    │   └── 📂 routes/
    │       ├── 📄 authRoutes.js                      # /api/auth Endpoints
    │       ├── 📄 productRoutes.js                   # /api/products Endpoints
    │       └── 📄 cartRoutes.js                      # /api/cart Endpoints
    └── 📂 docs/
        ├── 📄 swagger.yaml                           # OpenAPI 3.0 Specification
        └── 📄 Ecommerce_Product_Cart_API.postman_collection.json # Postman Collection
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js** (v16+ recommended)
- **npm** or **yarn**

### 2. Navigate to Project & Install Dependencies
```bash
cd Samarth_Navale_150096725148
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your configuration values inside `.env`:
```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=super_secret_session_key_ecommerce_2026_samarth_navale
```

### 4. Run Locally
```bash
# Start in production mode
npm start

# Or start in development mode with nodemon
npm run dev
```

The API will start at: `http://localhost:5000`  
Swagger Documentation UI: `http://localhost:5000/api-docs`

---

## 📋 API Endpoints Reference

### 🔐 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Request Body Example | Status Codes |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register new customer with bcrypt hash | `{"username":"alex","email":"alex@shop.com","password":"password123"}` | `201 Created`<br>`400 Bad Request` |
| `POST` | `/api/auth/login` | Authenticate customer & create session | `{"email":"alex@shop.com","password":"password123"}` | `200 OK`<br>`401 Unauthorized` |
| `POST` | `/api/auth/logout` | Terminate session & clear cookies | None | `200 OK` |
| `GET` | `/api/auth/me` | Fetch currently logged in user profile | None | `200 OK`<br>`401 Unauthorized` |

---

### 📦 2. Product Catalog Endpoints (`/api/products`)

| Method | Endpoint | Query Parameters | Description | Request Body Example | Status Codes |
|---|---|---|---|---|---|
| `GET` | `/api/products` | `?category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc` | Filter, search & sort products | None | `200 OK` |
| `GET` | `/api/products/:id` | None | Fetch single product by ID | None | `200 OK`<br>`404 Not Found` |
| `POST` | `/api/products` | None | Add a new product to catalog | `{"name":"Mechanical Keyboard","category":"Electronics","price":1899,"stock":25,"rating":4.5}` | `201 Created`<br>`400 Bad Request` |
| `PUT` | `/api/products/:id` | None | Update price, stock, or info | `{"price":1799,"stock":30}` | `200 OK`<br>`404 Not Found` |
| `DELETE` | `/api/products/:id` | None | Remove product from store | None | `200 OK`<br>`404 Not Found` |

#### Supported Filter & Sort Query Parameters:
- `category` — Case-insensitive filter (e.g., `?category=Electronics`)
- `minPrice` & `maxPrice` — Numeric range filtering (e.g., `?minPrice=500&maxPrice=3000`)
- `inStock` — `?inStock=true` (stock > 0) or `?inStock=false`
- `search` — Keyword matching on title or category (e.g., `?search=keyboard`)
- `sort` — `price_asc`, `price_desc`, `rating_desc`, `name_asc`, `name_desc`, `newest`

---

### 🛒 3. Shopping Cart Endpoints (`/api/cart` - Authenticated)

| Method | Endpoint | Description | Request Body Example | Status Codes |
|---|---|---|---|---|
| `GET` | `/api/cart` | View current user's cart with calculated total | None | `200 OK`<br>`401 Unauthorized` |
| `POST` | `/api/cart/items` | Add product to cart (Validates stock availability) | `{"productId":"prod_101","quantity":2}` | `200 OK`<br>`400 Insufficient Stock`<br>`404 Product Not Found` |
| `DELETE` | `/api/cart/items/:productId` | Remove specific product from cart | None | `200 OK`<br>`404 Not in Cart` |
| `POST` | `/api/cart/checkout` | Checkout order, decrement product stock & clear cart | None | `200 OK`<br>`400 Empty Cart / Stock Changed` |

---

## 🧪 Testing & Verification Guide

### 1. Register & Login
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alex","email":"alex@shop.com","password":"password123"}'

# Login (stores cookie in session.txt)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c session.txt \
  -d '{"email":"alex@shop.com","password":"password123"}'
```

### 2. Search & Filter Products
```bash
# Filter Electronics between 1000 and 5000 sorted by price
curl "http://localhost:5000/api/products?category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc"

# Search keyword
curl "http://localhost:5000/api/products?search=keyboard"
```

### 3. Shopping Cart & Stock Validation
```bash
# View Cart
curl -b session.txt http://localhost:5000/api/cart

# Add Item to Cart
curl -X POST http://localhost:5000/api/cart/items \
  -b session.txt \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_101","quantity":2}'

# Test Insufficient Stock Rejection (400 Bad Request)
curl -X POST http://localhost:5000/api/cart/items \
  -b session.txt \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_101","quantity":9999}'
```

### 4. Checkout Order
```bash
# Checkout order (automatically decrements stock in products.json)
curl -X POST http://localhost:5000/api/cart/checkout -b session.txt
```

---

## 🌐 Deployment Configuration

### Render Setup (`render.yaml`)
Configured to automatically install dependencies and start the Express server:
```yaml
services:
  - type: web
    name: samarth-assignment-7-ecommerce-product-cart-api
    env: node
    buildCommand: cd Samarth_Navale_150096725148 && npm install
    startCommand: cd Samarth_Navale_150096725148 && npm start
```

### Vercel Setup (`vercel.json`)
Configured with serverless function routing:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "Samarth_Navale_150096725148/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "Samarth_Navale_150096725148/server.js"
    }
  ]
}
```
