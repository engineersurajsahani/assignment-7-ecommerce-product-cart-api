# 🛒 E-Commerce Product & Shopping Cart API

A lightweight **E-Commerce Product Catalog & Shopping Cart REST API** built using **Node.js** and **Express.js**. The project uses JSON files for data persistence through Node.js `fs/promises`, along with password hashing and session-based authentication.

---

## 👩‍💻 Author

**Name:** Jui Tawde
**Folder:** JUI_TAWDE
**Project:** Assignment 07 – E-Commerce Product & Shopping Cart API

---

## 📌 Project Overview

This project implements a backend REST API for a basic e-commerce application.

The API provides:

* User registration and login
* Password hashing using `bcryptjs`
* Session-based authentication using `express-session`
* Product catalog management
* Product search and filtering
* Product sorting
* Shopping cart management
* Stock availability validation
* Checkout functionality
* Automatic stock deduction after checkout
* Asynchronous JSON file-based data persistence
* Request logging middleware
* Product validation middleware

No external database is required. All application data is stored in JSON files.

---

## 🛠️ Tech Stack

* **Node.js**
* **Express.js**
* **JavaScript**
* **fs/promises**
* **JSON**
* **bcryptjs**
* **express-session**
* **dotenv**
* **uuid**
* **Nodemon**

---

## 📁 Project Structure

```text
JUI_TAWDE/
│
├── data/
│   ├── carts.json
│   ├── products.json
│   └── users.json
│
├── controllers/
│   ├── authController.js
│   ├── cartController.js
│   └── productController.js
│
├── middleware/
│   ├── authGuard.js
│   ├── logger.js
│   └── validateProduct.js
│
├── routes/
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   └── productRoutes.js
│
├── utils/
│   └── fileHelper.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/juitawde/ecommerce-product-cart-api.git
```

### 2. Navigate to the project folder

```bash
cd ecommerce-product-cart-api/JUI_TAWDE
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create the `.env` file

Create a file named `.env` inside the `JUI_TAWDE` folder.

Add:

```env
PORT=3000
SESSION_SECRET=JUI_TAWDE_ecommerce_secret_2026
```

### 5. Start the server

For normal mode:

```bash
npm start
```

For development mode with Nodemon:

```bash
npm run dev
```

The server will start at:

```text
http://localhost:3000
```

---

# 🔐 Authentication API

## Register User

**POST**

```text
/api/auth/register
```

Full URL:

```text
http://localhost:3000/api/auth/register
```

### Request Body

```json
{
  "username": "jui",
  "email": "jui@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "message": "User registered successfully.",
  "user": {
    "id": "usr_...",
    "username": "jui",
    "email": "jui@example.com"
  }
}
```

Passwords are securely hashed using `bcryptjs` before being stored.

---

## Login User

**POST**

```text
/api/auth/login
```

Full URL:

```text
http://localhost:3000/api/auth/login
```

### Request Body

```json
{
  "email": "jui@example.com",
  "password": "password123"
}
```

### Response

```json
{
  "message": "Login successful.",
  "user": {
    "id": "usr_...",
    "username": "jui",
    "email": "jui@example.com"
  }
}
```

A session is created after successful login.

---

## Logout

**POST**

```text
/api/auth/logout
```

Full URL:

```text
http://localhost:3000/api/auth/logout
```

This destroys the current user session.

---

# 📦 Product API

## Get All Products

**GET**

```text
/api/products
```

Full URL:

```text
http://localhost:3000/api/products
```

Returns all available products.

---

## Search Products

**GET**

```text
/api/products?search=keyboard
```

The search checks product names for the provided keyword.

---

## Filter by Category

**GET**

```text
/api/products?category=Electronics
```

Returns products belonging to the specified category.

---

## Filter by Price Range

**GET**

```text
/api/products?minPrice=1000&maxPrice=5000
```

Returns products within the specified price range.

---

## Filter Products in Stock

**GET**

```text
/api/products?inStock=true
```

Returns products whose stock is greater than zero.

---

## Sort Products by Price

### Lowest to Highest

```text
/api/products?sort=price_asc
```

### Highest to Lowest

```text
/api/products?sort=price_desc
```

---

## Sort by Rating

```text
/api/products?sort=rating_desc
```

---

## Get Product by ID

**GET**

```text
/api/products/:id
```

Example:

```text
http://localhost:3000/api/products/prod_101
```

---

## Create Product

**POST**

```text
/api/products
```

### Request Body

```json
{
  "name": "Gaming Mouse",
  "category": "Electronics",
  "price": 1499,
  "stock": 20,
  "rating": 4.4
}
```

### Response

A new product is created and stored in `data/products.json`.

---

## Update Product

**PUT**

```text
/api/products/:id
```

Example:

```text
http://localhost:3000/api/products/prod_101
```

### Request Body

```json
{
  "price": 2799,
  "stock": 20
}
```

Only the supplied product fields are updated.

---

## Delete Product

**DELETE**

```text
/api/products/:id
```

Example:

```text
http://localhost:3000/api/products/prod_105
```

The selected product is removed from `data/products.json`.

---

# 🛒 Shopping Cart API

Cart endpoints require the user to be logged in.

The API uses the authenticated user's session to identify their cart.

---

## View Cart

**GET**

```text
/api/cart
```

Full URL:

```text
http://localhost:3000/api/cart
```

Example response:

```json
{
  "userId": "usr_...",
  "items": [
    {
      "productId": "prod_101",
      "name": "Wireless Noise-Canceling Headphones",
      "unitPrice": 2999,
      "quantity": 2,
      "itemTotal": 5998
    }
  ],
  "cartTotal": 5998
}
```

---

## Add Item to Cart

**POST**

```text
/api/cart/items
```

### Request Body

```json
{
  "productId": "prod_101",
  "quantity": 2
}
```

The API checks whether the requested quantity is available in stock before adding the product.

---

## Insufficient Stock Validation

If the requested quantity is greater than the available stock, the API returns:

```json
{
  "message": "Insufficient stock.",
  "availableStock": 15
}
```

This prevents users from adding unavailable quantities to their cart.

---

## Remove Item from Cart

**DELETE**

```text
/api/cart/items/:productId
```

Example:

```text
http://localhost:3000/api/cart/items/prod_101
```

Removes the selected product from the current user's cart.

---

## Checkout

**POST**

```text
/api/cart/checkout
```

No request body is required.

During checkout:

1. The cart is checked.
2. Product stock is verified.
3. Product stock is decreased.
4. An order is generated.
5. The cart is emptied.
6. Updated data is saved to the JSON files.

Example response:

```json
{
  "message": "Checkout successful.",
  "order": {
    "orderId": "order_...",
    "userId": "usr_...",
    "items": [],
    "total": 5998,
    "placedAt": "2026-..."
  }
}
```

---

# 💾 Data Storage

The application does not use MongoDB, PostgreSQL, MySQL, or another external database.

Data is stored using JSON files:

```text
data/
├── products.json
├── users.json
└── carts.json
```

The project uses Node.js `fs/promises` to asynchronously read and write these files.

---

# 🧩 Middleware

## Logger Middleware

`middleware/logger.js`

Logs:

* HTTP method
* Request URL
* Response status
* Request duration

Example:

```text
GET /api/products - 200 - 4ms
```

---

## Authentication Guard

`middleware/authGuard.js`

Protects shopping cart routes and ensures that the user has an active session.

Unauthenticated users receive:

```json
{
  "message": "Unauthorized. Please login first."
}
```

---

## Product Validation

`middleware/validateProduct.js`

Validates:

* Product name
* Category
* Price
* Stock
* Rating

For example:

* Price must be greater than `0`
* Stock must be a non-negative integer
* Rating must be between `0` and `5`

---

# 🧪 Testing

The API can be tested using:

* Postman
* Thunder Client
* Insomnia
* curl

Recommended testing flow:

```text
1. Start the server
       ↓
2. Register a user
       ↓
3. Login
       ↓
4. Get products
       ↓
5. Search/filter/sort products
       ↓
6. Add a product to cart
       ↓
7. View cart
       ↓
8. Test insufficient stock
       ↓
9. Checkout
       ↓
10. Verify stock decreased in products.json
```

---

# 📋 API Endpoint Summary

| Method | Endpoint                     | Description                |
| ------ | ---------------------------- | -------------------------- |
| POST   | `/api/auth/register`         | Register a user            |
| POST   | `/api/auth/login`            | Login user                 |
| POST   | `/api/auth/logout`           | Logout user                |
| GET    | `/api/products`              | Get/filter/search products |
| GET    | `/api/products/:id`          | Get product by ID          |
| POST   | `/api/products`              | Create product             |
| PUT    | `/api/products/:id`          | Update product             |
| DELETE | `/api/products/:id`          | Delete product             |
| GET    | `/api/cart`                  | View current user's cart   |
| POST   | `/api/cart/items`            | Add item to cart           |
| DELETE | `/api/cart/items/:productId` | Remove item from cart      |
| POST   | `/api/cart/checkout`         | Checkout and update stock  |

---

# 🎯 Assignment Requirements Covered

This project covers the major requirements of the assignment:

* ✅ Asynchronous file I/O using `fs/promises`
* ✅ JSON-based data persistence
* ✅ Product filtering
* ✅ Product searching
* ✅ Product sorting
* ✅ Product CRUD operations
* ✅ Shopping cart management
* ✅ Cart total calculation
* ✅ Stock validation
* ✅ Checkout functionality
* ✅ Automatic stock deduction
* ✅ User registration
* ✅ Password hashing
* ✅ Session authentication
* ✅ Authentication middleware
* ✅ Request logging middleware
* ✅ Product validation middleware
* ✅ Structured backend architecture

---

# 👩‍💻 Author

**Jui Tawde**

**Assignment:** 07 – E-Commerce Product & Shopping Cart API

**Repository:** `ecommerce-product-cart-api`

**Student Folder:** `JUI_TAWDE`
