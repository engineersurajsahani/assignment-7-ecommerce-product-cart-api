# Assignment 07: E-Commerce Product & Shopping Cart API

A lightweight, production-structured E-Commerce Product Catalog & Shopping Cart REST API built using **Node.js** and **Express.js**, persisting data directly in structured JSON files via Node's asynchronous file system module (`fs/promises`).

---

## 🚀 Tech Stack & Dependencies

- **Runtime Environment:** Node.js
- **Web Framework:** Express.js
- **Data Persistence:** File-System JSON storage (`fs/promises`)
- **Authentication:** `bcryptjs` (Password Hashing) & `express-session` (Session Management)
- **Utilities:** `uuid`, `dotenv`
- **Development Tool:** `nodemon`

---

## 🗄️ JSON Data Schemas

### 📦 Product Entity (`data/products.json`)
```json
[
  {
    "id": "prod_101",
    "name": "Wireless Noise-Canceling Headphones",
    "category": "Electronics",
    "price": 2999,
    "stock": 15,
    "rating": 4.6,
    "createdAt": "2026-03-01T10:00:00.000Z"
  }
]
```

### 🛍️ Cart Entity (`data/carts.json`)
```json
[
  {
    "userId": "usr_001",
    "items": [
      {
        "productId": "prod_101",
        "name": "Wireless Noise-Canceling Headphones",
        "unitPrice": 2999,
        "quantity": 2,
        "itemTotal": 5998
      }
    ],
    "cartTotal": 5998,
    "updatedAt": "2026-03-01T11:30:00.000Z"
  }
]
```

---

## 🏗️ Project Architecture

```
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
│   ├── authGuard.js         # Check req.session.user exists
│   ├── logger.js            # Request logger
│   └── validateProduct.js   # Verify price > 0, stock >= 0
├── routes/
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   └── productRoutes.js
├── utils/
│   └── fileHelper.js        # readData, writeData wrappers
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## 📋 API Endpoints Specification

### 🔐 User Authentication
| Method | Endpoint | Description | Request Body Example | Status Codes |
|---|---|---|---|---|
| POST | `/api/auth/register` | Register customer with hashed password | `{"username":"alex","email":"alex@shop.com","password":"password123"}` | `201 Created`, `400 Bad Request` |
| POST | `/api/auth/login` | Authenticate customer and create session | `{"email":"alex@shop.com","password":"password123"}` | `200 OK`, `401 Unauthorized` |
| POST | `/api/auth/logout` | Terminate session | None | `200 OK` |

### 📦 Product Catalog Management
| Method | Endpoint | Query Parameters | Description | Request Body Example | Status Codes |
|---|---|---|---|---|---|
| GET | `/api/products` | `?category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc` | Filter & search products | None | `200 OK` |
| GET | `/api/products/:id` | None | Fetch single product by ID | None | `200 OK`, `404 Not Found` |
| POST | `/api/products` | None | Add a new product (Admin route) | `{"name":"Mechanical Keyboard","category":"Electronics","price":1899,"stock":25,"rating":4.5}` | `201 Created`, `400 Bad Request` |
| PUT | `/api/products/:id` | None | Update price or stock count | `{"stock":30,"price":1799}` | `200 OK`, `404 Not Found`, `400 Bad Request` |
| DELETE | `/api/products/:id` | None | Remove product from store | None | `200 OK`, `404 Not Found` |

### 🛒 Shopping Cart System (Authenticated)
| Method | Endpoint | Description | Request Body Example | Status Codes |
|---|---|---|---|---|
| GET | `/api/cart` | View current user's cart with calculated total | None | `200 OK`, `401 Unauthorized` |
| POST | `/api/cart/items` | Add product to cart (Validates stock availability) | `{"productId":"prod_101","quantity":1}` | `200 OK`, `400 Out of Stock / Bad Request` |
| DELETE | `/api/cart/items/:productId` | Remove specific product from cart | None | `200 OK`, `404 Not in Cart` |
| POST | `/api/cart/checkout` | Simulate order placement & decrement product stock | None | `200 OK`, `400 Empty Cart / Insufficient Stock` |

---

## 🛠️ Installation & Setup

1. **Clone & Navigate:**
   ```bash
   cd assignment-07-ecommerce-api
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```
4. **Run Server:**
   - Development Mode:
     ```bash
     npm run dev
     ```
   - Production Mode:
     ```bash
     npm start
     ```
5. **Run Integration Test Suite:**
   ```bash
   npm test
   ```
