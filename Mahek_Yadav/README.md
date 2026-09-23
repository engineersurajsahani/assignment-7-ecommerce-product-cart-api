# 🛒 E-Commerce Product & Shopping Cart API

A lightweight RESTful E-Commerce backend API built using Node.js and Express.js. The API provides product catalog management, user authentication, shopping cart functionality, stock validation, and checkout operations.

The project uses JSON files with Node.js `fs/promises` for asynchronous data persistence instead of a traditional database.


---
## 🚀 Live API

**Render Deployment:**
https://itm-assignment-07-ecommerce-api.onrender.com

## 📌 Project Overview

This project is developed as part of **Assignment 07 – E-Commerce Product & Shopping Cart API**.

The API allows users to:

* Register and log in securely
* Manage products
* Search and filter products
* Sort products by price
* Add products to a shopping cart
* Validate product stock before adding items
* Remove products from the cart
* Calculate cart totals
* Checkout and automatically update product stock
* Maintain authenticated user sessions

All application data is stored in structured JSON files.

---

## 🛠️ Tech Stack

* **Node.js**
* **Express.js**
* **JavaScript**
* **JSON / File-System Storage**
* **fs/promises**
* **bcryptjs**
* **Express-Session**
* **dotenv**
* **UUID**
* **Nodemon**

---

## 📁 Project Structure

```text
assignment-07-ecommerce-api/
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
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mahek-yadav/itm-assignment-07-ecommerce-api.git
```

### 2. Navigate to the Project

```bash
cd itm-assignment-07-ecommerce-api
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory.

```env
PORT=3000
SESSION_SECRET=your_session_secret
```

### 5. Start the Server

For development:

```bash
npm run dev
```

Or:

```bash
node server.js
```

The API will run at:

```text
http://localhost:3000
```

---

# 🔐 Authentication APIs

## Register User

**POST**

```text
/api/auth/register
```

### Request Body

```json
{
  "username": "alex",
  "email": "alex@shop.com",
  "password": "password123"
}
```

### Response

```text
201 Created
```

Passwords are securely hashed using `bcryptjs`.

---

## Login User

**POST**

```text
/api/auth/login
```

### Request Body

```json
{
  "email": "alex@shop.com",
  "password": "password123"
}
```

A session is created after successful authentication.

---

## Logout User

**POST**

```text
/api/auth/logout
```

Terminates the current user session.

---

# 📦 Product APIs

## Get All Products

**GET**

```text
/api/products
```

### Filtering Example

```text
/api/products?category=Electronics&minPrice=1000&maxPrice=5000
```

### Sorting Example

```text
/api/products?sort=price_asc
```

The endpoint supports:

* Category filtering
* Minimum price
* Maximum price
* Stock filtering
* Price sorting
* Product searching

---

## Get Product by ID

**GET**

```text
/api/products/:id
```

Example:

```text
/api/products/prod_101
```

---

## Add Product

**POST**

```text
/api/products
```

### Request Body

```json
{
  "name": "Mechanical Keyboard",
  "category": "Electronics",
  "price": 1899,
  "stock": 25,
  "rating": 4.5
}
```

---

## Update Product

**PUT**

```text
/api/products/:id
```

### Request Body

```json
{
  "stock": 30,
  "price": 1799
}
```

---

## Delete Product

**DELETE**

```text
/api/products/:id
```

Example:

```text
/api/products/prod_101
```

---

# 🛒 Shopping Cart APIs

Cart APIs require the user to be authenticated.

## View Cart

**GET**

```text
/api/cart
```

Returns the current user's cart along with calculated totals.

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
  "quantity": 1
}
```

Before adding an item, the API checks whether sufficient stock is available.

If the requested quantity exceeds available stock, the API returns:

```text
400 Bad Request
```

with an insufficient stock message.

---

## Remove Item from Cart

**DELETE**

```text
/api/cart/items/:productId
```

Example:

```text
/api/cart/items/prod_101
```

---

## Checkout

**POST**

```text
/api/cart/checkout
```

The checkout process:

1. Checks whether the cart is empty.
2. Validates product availability.
3. Calculates the order total.
4. Decreases product stock.
5. Completes the checkout.
6. Updates the cart data.

---

# 🗄️ Data Storage

This project does not use MongoDB, Firebase, Supabase, or any other database.

Data is stored in JSON files:

```text
data/
├── products.json
├── users.json
└── carts.json
```

The project uses Node.js `fs/promises` for asynchronous reading and writing of JSON data.

Example:

```javascript
const fs = require("fs/promises");
```

This allows the application to persist data without using a traditional database.

---

# 🔒 Middleware

The project contains reusable middleware for different backend requirements.

### Auth Guard

Checks whether a user is authenticated before accessing protected cart routes.

### Logger

Logs incoming API requests for easier monitoring and debugging.

### Product Validation

Validates product information such as:

* Price must be greater than 0
* Stock cannot be negative
* Required product fields must be present

---

# 🧪 API Testing

The API can be tested using tools such as:

* Postman
* Thunder Client
* REST Client
* Browser for GET requests

### Recommended Testing Flow

1. Register a new user.
2. Login using the registered credentials.
3. Fetch the product list.
4. Test product filtering and sorting.
5. Add a product to the cart.
6. Try adding more quantity than available stock.
7. View the cart.
8. Remove an item from the cart.
9. Add an item again.
10. Checkout.
11. Verify that the product stock has decreased in `products.json`.

---

# 📊 Assignment Requirements Covered

| Requirement            | Implemented |
| ---------------------- | ----------- |
| Node.js & Express.js   | ✅           |
| REST API               | ✅           |
| JSON File Storage      | ✅           |
| `fs/promises`          | ✅           |
| User Registration      | ✅           |
| Password Hashing       | ✅           |
| Session Authentication | ✅           |
| Product CRUD           | ✅           |
| Product Filtering      | ✅           |
| Product Sorting        | ✅           |
| Shopping Cart          | ✅           |
| Stock Validation       | ✅           |
| Checkout               | ✅           |
| Custom Middleware      | ✅           |
| Error Handling         | ✅           |
| Render Deployment      | ✅           |

---

# 🌐 Deployment

The backend API is deployed using **Render**.

### Live API

```text
[PASTE YOUR RENDER LINK HERE]
```

---

# 👩‍💻 Author

**Mahek Yadav**

B.Tech CSE
ITM Skills University

GitHub: `mahek-yadav`

---

## 📚 Assignment

**Assignment 07: E-Commerce Product & Shopping Cart API**

**Track:** Backend Development
**Level:** Beginner to Intermediate
**Technology:** Node.js + Express.js + JSON File Storage
