# Assignment 07: E-Commerce Product & Shopping Cart API

A lightweight, production-structured E-Commerce Product Catalog & Shopping Cart REST API. Built using Node.js and Express.js, this project demonstrates core backend fundamentals by persisting data directly in structured JSON files via Node's asynchronous file system module (`fs/promises`), completely avoiding the need for a database engine like MongoDB or PostgreSQL.

## 🌐 Live Demo
**[Live API Deployment on Render](https://assignment-7-ecommerce-product-cart-api-laho.onrender.com/)**

## 📌 Features & Learning Outcomes

- **Asynchronous File I/O**: Operations using Node's `fs/promises` (`readFile`, `writeFile`).
- **Dynamic Search & Filtering**: Advanced filtering engine for products (Category, Price Range, Sorting).
- **Session Management**: Stateful shopping cart sessions tied to authenticated users using `express-session`.
- **Inventory Validation**: Pre-reserves stock checks before items are added to a cart or checked out.
- **Custom Middleware**: Designed reusable validation, authentication guard, and request logging middleware.
- **Authentication**: Secure user registration and login using `bcryptjs` password hashing.

---

## 🛠️ Tech Stack & Dependencies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: bcryptjs, express-session
- **Utilities**: uuid, dotenv
- **Development**: nodemon

---

## 🏗️ Project Folder Architecture

```text
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
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## 🚀 Setup & Installation

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Ensure you have a `.env` file in the root directory (you can copy `.env.example`).
   ```env
   PORT=3000
   SESSION_SECRET=your_super_secret_session_key
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The server will start at `http://localhost:3000`.

---

## 📋 API Endpoints Specification

### 🔐 User Authentication

| Method | Endpoint | Description | Request Body Example | Status Codes |
|---|---|---|---|---|
| POST | `/api/auth/register` | Register customer with hashed password | `{"username":"alex","email":"alex@shop.com","password":"password123"}` | 201 Created, 400 Bad Request |
| POST | `/api/auth/login` | Authenticate customer and create session | `{"email":"alex@shop.com","password":"password123"}` | 200 OK, 401 Unauthorized |
| POST | `/api/auth/logout` | Terminate session | None | 200 OK |

### 📦 Product Catalog Management

| Method | Endpoint | Query Parameters | Description | Request Body Example |
|---|---|---|---|---|
| GET | `/api/products` | `?category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc` | Filter & search products | None |
| GET | `/api/products/:id` | None | Fetch single product by ID | None |
| POST | `/api/products` | None | Add a new product (Admin route) | `{"name":"Mechanical Keyboard","category":"Electronics","price":1899,"stock":25,"rating":4.5}` |
| PUT | `/api/products/:id` | None | Update price or stock count | `{"stock":30,"price":1799}` |
| DELETE | `/api/products/:id` | None | Remove product from store | None |

### 🛒 Shopping Cart System (Authenticated)

*Note: All cart endpoints require the user to be logged in (active session).*

| Method | Endpoint | Description | Request Body Example | Status Codes |
|---|---|---|---|---|
| GET | `/api/cart` | View current user's cart with calculated total | None | 200 OK |
| POST | `/api/cart/items` | Add product to cart (Validates stock availability) | `{"productId":"prod_101","quantity":1}` | 200 OK, 400 Out of Stock |
| DELETE | `/api/cart/items/:productId` | Remove specific product from cart | None | 200 OK, 404 Not in Cart |
| POST | `/api/cart/checkout` | Simulate order placement & decrement product stock | None | 200 OK, 400 Empty Cart |

---

## 🧪 Testing Guidelines

1. **Test Products:** Use `GET /api/products` to fetch all products. Add query parameters to test filtering logic (e.g. `?minPrice=1000&category=Electronics`).
2. **Test Authentication:** Register a new user, then log in. The server uses cookies to keep you authenticated.
3. **Test Cart Validation:** Try adding a quantity that exceeds the available stock (e.g., adding 100 headphones). The server will respond with `400 Bad Request: Insufficient stock`.
4. **Test Checkout:** Add items to your cart, hit the checkout endpoint, and verify that your cart is emptied and the inventory counts in `data/products.json` have correctly decremented.
