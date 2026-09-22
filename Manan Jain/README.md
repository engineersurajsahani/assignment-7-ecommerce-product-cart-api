# E-Commerce Product Catalog and Shopping Cart REST API

A modular, lightweight, and beginner-friendly RESTful API for an **E-Commerce Product Catalog and Shopping Cart** built with **Node.js** and **Express.js**. This application uses asynchronous JSON file storage (`fs/promises`) instead of a traditional database, standard `express-session` for stateful authentication, and `bcryptjs` for secure password hashing.

---

Render Link  -   https://assignment-7-ecommerce-product-cart-api-0wa7.onrender.com

## 1. Project Description

This API provides a complete backend system for online stores:
- **User Authentication**: Register, login, and logout using session cookies and password hashing.
- **Product Catalog Management**: Browse, search, filter (by category, price range, stock availability), sort, create, update, and delete products.
- **Shopping Cart System**: User-specific shopping carts to add items, adjust quantities with stock validation, remove items, and perform checkout with automatic inventory updates.

---

## 2. Technologies Used

- **Runtime**: Node.js
- **Framework**: Express.js
- **Data Storage**: Asynchronous Node.js File System (`fs/promises`)
- **Authentication**: `express-session` (Session-based, cookie handling)
- **Password Hashing**: `bcryptjs`
- **Identifier Generation**: `uuid` (v4)
- **Environment Management**: `dotenv`
- **Development Tooling**: `nodemon`

---

## 3. Folder Structure

```text
ecommerce-api/
│
├── config/
│   └── db.js                 # Reusable fs/promises JSON read/write helper
│
├── data/
│   ├── users.json            # Stored user profiles & hashed credentials
│   ├── products.json         # Product catalog seeded data
│   └── carts.json            # User-specific shopping carts
│
├── middleware/
│   ├── authMiddleware.js     # Session validation middleware
│   ├── loggerMiddleware.js   # HTTP request logging middleware
│   └── validateProduct.js    # Product payload validation middleware
│
├── model/
│   ├── userModel.js          # Data access layer for users
│   ├── productModel.js       # Data access layer for products
│   └── cartModel.js          # Data access layer for shopping carts
│
├── router/
│   ├── authRouter.js         # Routes for user register, login, logout
│   ├── productRouter.js      # Routes for product CRUD and filtering
│   └── cartRouter.js         # Routes for cart management & checkout
│
├── .env                      # Environment configuration
├── .env.example              # Example environment configuration
├── .gitignore                # Git ignore configuration
├── package.json              # Project dependencies & scripts
├── server.js                 # Express application entrypoint
└── README.md                 # Project documentation
```

---

## 4. Installation Instructions

1. **Clone or download the repository workspace.**
2. Open your terminal in the project root directory:
   ```bash
   cd "Assignment 7"
   ```
3. Install project dependencies:
   ```bash
   npm install
   ```

---

## 5. Environment Variable Setup

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Configure `.env`:
```env
PORT=8000
SESSION_SECRET=super_secret_ecom_key_12345
NODE_ENV=development
```

---

## 6. How JSON Data Storage Works

Instead of an external relational or NoSQL database, this project uses Node.js asynchronous file system operations (`fs/promises`) inside [`config/db.js`](file:///Users/mananjain/Documents/Assignment%207/config/db.js):

- `readData(filename)` reads the target file asynchronously, parses the JSON string into JavaScript objects, and handles missing file scenarios gracefully.
- `writeData(filename, data)` formats JavaScript objects into nicely formatted JSON (`JSON.stringify(data, null, 2)`) and writes it asynchronously to `data/<filename>`.
- All model files (`userModel.js`, `productModel.js`, `cartModel.js`) abstract data access by invoking `readData` and `writeData`.

---

## 7. Authentication & Session Explanation

- **No JWT**: Authentication relies entirely on `express-session`.
- **Registration**: Passwords are hashed with `bcryptjs` before writing to `users.json`.
- **Login**: When credentials match, user info (`id`, `username`, `email`) is stored in `req.session.user`.
- **Session Cookie**: Express sends an HTTP cookie (`connect.sid`) to the client.
- **Protection**: `authMiddleware.js` verifies `req.session.user`. If absent, a `401 Unauthorized` response is returned.

---

## 8. API Endpoint Documentation

### Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful description",
  "data": {}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Detailed error message"
}
```

---

### Authentication Endpoints

#### 1. Register User
- **Method / Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "Manan",
    "email": "manan@example.com",
    "password": "password123"
  }
  ```
- **Response**: `201 Created`

#### 2. Login User
- **Method / Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "manan@example.com",
    "password": "password123"
  }
  ```
- **Response**: `200 OK`

#### 3. Logout User
- **Method / Endpoint**: `POST /api/auth/logout`
- **Access**: Public / Authenticated
- **Response**: `200 OK`

---

### Product Endpoints

#### 1. Get All Products (With Filters & Sorting)
- **Method / Endpoint**: `GET /api/products`
- **Access**: Public
- **Query Parameters**:
  - `category`: Filter by category (e.g. `?category=Electronics`)
  - `minPrice`: Minimum price (e.g. `?minPrice=1000`)
  - `maxPrice`: Maximum price (e.g. `?maxPrice=5000`)
  - `search`: Search by product name substring (e.g. `?search=headphones`)
  - `inStock`: Filter in-stock items only (`?inStock=true`)
  - `sort`: Sorting option (`?sort=price_asc`, `?sort=price_desc`, `?sort=rating_desc`)
- **Response**: `200 OK`

#### 2. Get Single Product
- **Method / Endpoint**: `GET /api/products/:id`
- **Access**: Public
- **Response**: `200 OK` or `404 Not Found`

#### 3. Create Product
- **Method / Endpoint**: `POST /api/products`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Mechanical Keyboard",
    "category": "Electronics",
    "price": 1899,
    "stock": 25,
    "rating": 4.5
  }
  ```
- **Response**: `201 Created` or `400 Bad Request`

#### 4. Update Product
- **Method / Endpoint**: `PUT /api/products/:id`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "price": 1799,
    "stock": 30
  }
  ```
- **Response**: `200 OK`, `400 Bad Request`, or `404 Not Found`

#### 5. Delete Product
- **Method / Endpoint**: `DELETE /api/products/:id`
- **Access**: Public
- **Response**: `200 OK` or `404 Not Found`

---

### Cart Endpoints (Requires Authentication)

#### 1. View Cart
- **Method / Endpoint**: `GET /api/cart`
- **Access**: Private (Requires Login)
- **Response**: `200 OK`

#### 2. Add Item to Cart
- **Method / Endpoint**: `POST /api/cart/items`
- **Access**: Private (Requires Login)
- **Request Body**:
  ```json
  {
    "productId": "p1a2b3c4-1111-4000-8000-000000000001",
    "quantity": 2
  }
  ```
- **Response**: `200 OK` or `400 Bad Request` (if quantity exceeds stock)

#### 3. Remove Item from Cart
- **Method / Endpoint**: `DELETE /api/cart/items/:productId`
- **Access**: Private (Requires Login)
- **Response**: `200 OK` or `404 Not Found`

#### 4. Checkout Cart
- **Method / Endpoint**: `POST /api/cart/checkout`
- **Access**: Private (Requires Login)
- **Logic**: Validates stock for all cart items, decreases stock in `products.json`, clears cart, returns order receipt.
- **Response**: `200 OK` or `400 Bad Request`

---

## 9. How to Run the Project

### Production Mode
```bash
npm start
```

### Development Mode (with Nodemon auto-reload)
```bash
npm run dev
```

---

## 10. How to Test the API

You can test the API using cURL or Postman (ensure cookies are maintained for session authentication).

### Sample cURL Commands

1. **Register a User**:
   ```bash
   curl -X POST http://localhost:8000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "Manan", "email": "manan@example.com", "password": "password123"}'
   ```

2. **Login & Save Cookie**:
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -c cookies.txt \
     -d '{"email": "manan@example.com", "password": "password123"}'
   ```

3. **Get Products with Filtering & Sorting**:
   ```bash
   curl "http://localhost:8000/api/products?category=Electronics&minPrice=1000&sort=price_asc"
   ```

4. **Add Item to Cart (using saved session cookie)**:
   ```bash
   curl -X POST http://localhost:8000/api/cart/items \
     -H "Content-Type: application/json" \
     -b cookies.txt \
     -d '{"productId": "p1a2b3c4-1111-4000-8000-000000000001", "quantity": 2}'
   ```

5. **View Cart**:
   ```bash
   curl -b cookies.txt http://localhost:8000/api/cart
   ```

6. **Checkout Cart**:
   ```bash
   curl -X POST http://localhost:8000/api/cart/checkout \
     -b cookies.txt
   ```
