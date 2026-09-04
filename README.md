# Assignment 7 - E-Commerce Product Catalog & Shopping Cart REST API
https://saiyashpoojariassignment-7-ecommerce.onrender.com (Render URL)

## Overview

A lightweight E-Commerce Product Catalog and Shopping Cart REST API built using Node.js and Express.js.

The project provides user authentication, product management, shopping cart functionality and checkout operations using asynchronous JSON file-based storage.

## Technologies

- Node.js
- Express.js
- JavaScript
- JSON File-System Storage
- fs/promises
- bcryptjs
- Express Session
- UUID

## Features

- User registration
- User login and logout
- Session-based authentication
- Password hashing with bcrypt
- Product catalog management
- Product creation, updating and deletion
- Product search
- Shopping cart management
- Add products to cart
- Remove products from cart
- Cart total calculation
- Checkout functionality
- Custom request logger
- Authentication middleware
- Product validation middleware
- JSON file-based data persistence
- API testing

## API Endpoints

### Authentication

- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`

### Products

- GET `/api/products`
- GET `/api/products/:id`
- POST `/api/products`
- PUT `/api/products/:id`
- DELETE `/api/products/:id`

### Cart

- GET `/api/cart`
- POST `/api/cart/items`
- DELETE `/api/cart/items/:productId`
- POST `/api/cart/checkout`

## Data Storage

The application uses asynchronous file-system operations with JSON files for data storage.

```text
data/
├── products.json
├── users.json
└── carts.json
