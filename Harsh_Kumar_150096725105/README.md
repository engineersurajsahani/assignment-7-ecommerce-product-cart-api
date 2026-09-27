# 🛒 E-Commerce Product & Shopping Cart API

A lightweight, production-structured E-Commerce Product Catalog & Shopping Cart REST API built with Node.js and Express.js. This project persists data directly in structured JSON files via Node's asynchronous file system module (`fs/promises`), without relying on a full database engine.

## 👨‍🎓 Student Details

**Name:** Harsh Kumar  
**Roll No.:** 150096725105  
**Course:** BTech CSE  
**Assignment:** 7 — E-Commerce Product & Shopping Cart API  

## ✨ Features

- **Product Catalog:** Multi-criteria filtering (category, price range) and sorting (price ASC/DESC).
- **Shopping Cart:** Stateful shopping cart sessions tied to authenticated users.
- **Inventory Management:** Reservation checks before items are added to a cart and stock decrement upon checkout.
- **User Authentication:** Registration and login using `bcryptjs` for password hashing and `express-session`.
- **Data Persistence:** Asynchronous file I/O operations using Node's `fs/promises` (`products.json`, `carts.json`, `users.json`).
- **Middleware:** Reusable validation and logging middleware.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Data Storage:** JSON / File-System Data Storage (`fs/promises`)
- **Authentication:** bcryptjs, express-session
- **Utilities:** uuid, dotenv

## 📁 Project Structure

```text
Harsh-Assignment-7-Ecommerce-Product-Cart-Api/
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
├── .gitignore
├── package.json
└── server.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js installed on your local machine

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/harsh4421/Harsh-Assignment-7-Ecommerce-Product-Cart-Api.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Harsh-Assignment-7-Ecommerce-Product-Cart-Api
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file based on `.env.example` (or simply create one with the following):
   ```env
   PORT=3000
   SESSION_SECRET=your_super_secret_session_key
   ```

5. Start the server:
   ```bash
   npm start
   ```

   For development with nodemon:
   ```bash
   npm run dev
   ```

## 📋 API Endpoints

### 🔐 User Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register customer with hashed password |
| `POST` | `/api/auth/login` | Authenticate customer and create session |
| `POST` | `/api/auth/logout` | Terminate session |

### 📦 Product Catalog

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Filter & search products (e.g., `?category=Electronics&sort=price_asc`) |
| `GET` | `/api/products/:id` | Fetch single product by ID |
| `POST` | `/api/products` | Add a new product (Admin) |
| `PUT` | `/api/products/:id` | Update price or stock count |
| `DELETE` | `/api/products/:id` | Remove product from store |

### 🛒 Shopping Cart (Requires Authentication)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cart` | View current user's cart with calculated total |
| `POST` | `/api/cart/items` | Add product to cart (Validates stock availability) |
| `DELETE` | `/api/cart/items/:productId` | Remove specific product from cart |
| `POST` | `/api/cart/checkout` | Simulate order placement & decrement product stock |

## 🧪 Testing

1. Register and log in a user to establish a session.
2. Retrieve products to find a valid `productId`.
3. Add a product to your cart using `/api/cart/items`.
4. Attempt to add more quantity than `stock` to trigger insufficient stock validation.
5. Checkout using `/api/cart/checkout` and verify that the product's stock decrements in `data/products.json`.
