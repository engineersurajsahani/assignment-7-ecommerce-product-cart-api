# 🛒 E-Commerce Product & Shopping Cart API

A RESTful **E-Commerce API** built using **Node.js, Express.js, JSON File-System Storage, bcryptjs, and Express-Session**.

## 🚀 Live Deployment

[**https://assignment-7-ecommerce-product-cart-api-87cg.onrender.com**](https://assignment-7-ecommerce-product-cart-api-87cg.onrender.com)

## 🛠️ Tech Stack

* Node.js
* Express.js
* JSON / File-System Data Storage
* bcryptjs
* Express-Session
* dotenv

## ✨ Features

* User registration and login
* Session-based authentication
* Product catalog management
* Product search, filtering and sorting
* Shopping cart management
* Stock availability validation
* Cart total calculation
* Checkout functionality
* Request logging and validation middleware

## 📌 Main API Routes

| Method | Endpoint                     | Description              |
| ------ | ---------------------------- | ------------------------ |
| POST   | `/api/auth/register`         | Register a user          |
| POST   | `/api/auth/login`            | Login                    |
| POST   | `/api/auth/logout`           | Logout                   |
| GET    | `/api/products`              | View and filter products |
| GET    | `/api/products/:id`          | View product details     |
| POST   | `/api/products`              | Add a product            |
| PUT    | `/api/products/:id`          | Update a product         |
| DELETE | `/api/products/:id`          | Delete a product         |
| GET    | `/api/cart`                  | View cart                |
| POST   | `/api/cart/items`            | Add item to cart         |
| DELETE | `/api/cart/items/:productId` | Remove item from cart    |
| POST   | `/api/cart/checkout`         | Checkout cart            |

## 📂 Data Storage

The API stores data using JSON files:

* `products.json`
* `users.json`
* `carts.json`

## 👨‍💻 Assignment

**Assignment 07 – E-Commerce Product & Shopping Cart API**

Backend Development Assignment.
