# Assignment 07: E-Commerce Product & Shopping Cart API

A lightweight E-Commerce Product Catalog and Shopping Cart REST API built using Node.js and Express.js.

This project provides product management, product filtering and sorting, user authentication, shopping cart functionality, stock validation, checkout processing, session-based authentication, and JSON file-system persistence.

## 1. Project Overview

The objective of this project is to build a production-structured backend REST API for an E-Commerce application.

The application allows users to:

- Register an account
- Login and logout using session-based authentication
- View available products
- Search and filter products
- Sort products by price
- View individual product details
- Add products to a shopping cart
- Remove products from the cart
- Validate product stock before adding items
- Calculate cart totals
- Checkout and update product stock
- Persist application data using JSON files

The project uses asynchronous file-system operations for data persistence.

## 2. Technology Stack

- Node.js
- Express.js
- JavaScript
- JSON File-System Storage
- fs/promises
- bcryptjs
- Express-Session
- dotenv
- uuid
- Nodemon

## 3. Project Structure

PallaviSarovar/
└── itm-assignment-07-ecommerce-api/
    ├── controllers/
    │   ├── authController.js
    │   ├── cartController.js
    │   └── productController.js
    │
    ├── data/
    │   ├── carts.json
    │   ├── products.json
    │   └── users.json
    │
    ├── middleware/
    │   ├── adminGuard.js
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
    ├── package-lock.json
    ├── server.js
    └── README.md

## 4. Data Storage

The application stores its data in JSON files.

### Products

Location:

data/products.json

The products file contains product information such as:

- Product ID
- Product name
- Category
- Price
- Stock quantity
- Rating

Sample products include:

- Wireless Headphones
- Mechanical Keyboard
- Running Shoes
- Smart Water Bottle
- Portable SSD 1TB

### Users

Location:

data/users.json

User information is stored in JSON format.

Passwords are securely hashed using bcryptjs before being stored.

### Carts

Location:

data/carts.json

Shopping cart information includes:

- User ID
- Product ID
- Unit price
- Quantity
- Item total
- Cart total

## 5. Installation

Clone or download the project and navigate to the project directory.

Install the required dependencies:

npm install

## 6. Environment Configuration

Create a .env file in the project root based on the provided .env.example file.

The environment configuration contains:

PORT=3000
SESSION_SECRET=change-this-to-a-long-random-secret
ADMIN_KEY=admin123
NODE_ENV=development

Do not commit the .env file to GitHub.

## 7. Running the Application

To start the server normally:

npm start

For development with Nodemon:

npm run dev

The server will run at:

http://localhost:3000

## 8. Health Check

Endpoint:

GET /api/health

This endpoint can be used to verify that the server is running correctly.

## 9. Authentication API

### Register

Endpoint:

POST /api/auth/register

Registers a new user.

Request body:

{
  "name": "Pallavi",
  "email": "pallavi@example.com",
  "password": "password123"
}

### Login

Endpoint:

POST /api/auth/login

Logs a user into the application and creates an authenticated session.

Request body:

{
  "email": "pallavi@example.com",
  "password": "password123"
}

### Logout

Endpoint:

POST /api/auth/logout

Logs the authenticated user out and destroys the session.

## 10. Product API

### Get All Products

Endpoint:

GET /api/products

Returns the complete product catalog.

### Get Product by ID

Endpoint:

GET /api/products/:id

Returns information about a specific product.

Example:

GET /api/products/prod_101

### Product Filtering

Products can be filtered using query parameters.

Example:

GET /api/products?category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc

Supported filters include:

- category
- minPrice
- maxPrice
- inStock
- search
- sort

### Search Products

Example:

GET /api/products?search=keyboard

### Sort Products

Products can be sorted using price sorting options.

Example:

GET /api/products?sort=price_asc

Example:

GET /api/products?sort=price_desc

### Create Product

Endpoint:

POST /api/products

Creating a product requires the admin key.

Request header:

x-admin-key: admin123

### Update Product

Endpoint:

PUT /api/products/:id

Updating a product requires the admin key.

Request header:

x-admin-key: admin123

### Delete Product

Endpoint:

DELETE /api/products/:id

Deleting a product requires the admin key.

Request header:

x-admin-key: admin123

## 11. Shopping Cart API

The shopping cart requires an authenticated user session.

### View Cart

Endpoint:

GET /api/cart

Returns the current user's shopping cart.

### Add Item to Cart

Endpoint:

POST /api/cart/items

Request body:

{
  "productId": "prod_101",
  "quantity": 2
}

The API validates the requested quantity against the available stock.

If the requested quantity is greater than the available stock, the API returns an appropriate error response.

### Remove Item from Cart

Endpoint:

DELETE /api/cart/items/:productId

Removes a product from the authenticated user's cart.

### Checkout

Endpoint:

POST /api/cart/checkout

Processes the current user's cart and updates product stock.

After a successful checkout:

- The order is processed
- Product stock is decreased
- The user's cart is cleared
- The updated data is persisted in the JSON files

## 12. Authentication and Security

The application uses Express-Session for session-based authentication.

Passwords are hashed using bcryptjs instead of storing plain-text passwords.

Protected cart endpoints require an authenticated session.

Administrative product operations use an admin key through the x-admin-key request header.

## 13. Middleware

The project includes several middleware components.

### Logger Middleware

Records incoming API requests for easier debugging and monitoring.

### Authentication Guard

Protects routes that require a logged-in user.

### Product Validation Middleware

Validates product data before creating or updating products.

### Admin Guard

Protects administrative product operations using the configured admin key.

## 14. File-System Persistence

The project uses Node.js fs/promises for asynchronous file operations.

The file helper utility provides functionality for:

- Reading JSON files
- Parsing JSON data
- Writing updated JSON data
- Persisting changes asynchronously

This allows products, users, and carts to remain available even after the server is restarted.

## 15. Error Handling

The API provides appropriate HTTP status codes and error messages for invalid requests.

Examples include:

- 400 Bad Request
- 401 Unauthorized
- 404 Not Found
- 500 Internal Server Error

The application also validates product availability and prevents users from adding quantities greater than the available stock.

## 16. Testing

The API was tested using Thunder Client.

The following functionality was tested:

- Server health check
- Get all products
- Product filtering
- Product search
- Product sorting
- Get product by ID
- User registration
- User login
- View cart
- Add product to cart
- Insufficient stock validation
- Verify cart remains unchanged after a failed stock request
- Remove cart item
- Add cart item again
- Check product stock
- Checkout
- Verify product stock decreases after checkout
- Verify cart is empty after checkout
- User logout
- Verify protected routes return unauthorized after logout
- Admin product creation
- Admin product update
- Admin product deletion

## 17. Sample Stock Validation

The API prevents users from adding more products than are available in stock.

For example, if a product has 15 units available and the user requests 100 units, the API returns an error indicating insufficient stock.

The cart is not modified when the requested quantity exceeds available stock.

## 18. Checkout and Stock Update

During checkout, the API validates the cart items and updates the corresponding product stock.

For example:

Initial stock:

15

Quantity purchased:

2

Stock after checkout:

13

The updated stock is persisted in data/products.json.

The user's cart is cleared after a successful checkout.

## 19. API Architecture

The application follows a modular backend architecture.

The project separates responsibilities into:

- Controllers
- Routes
- Middleware
- Utilities
- Data storage

This structure makes the application easier to maintain, test, and extend.

## 20. Assignment Requirements Covered

This project covers the major assignment requirements:

- Asynchronous file-system persistence
- JSON data storage
- Product catalog
- Product filtering
- Product searching
- Product sorting
- Shopping cart functionality
- Cart calculations
- Stock validation
- Checkout processing
- Session-based authentication
- Password hashing
- Middleware
- Error handling
- Modular project architecture

## 21. Author

Pallavi Sarovar

Assignment 07: E-Commerce Product & Shopping Cart API

## 22. Conclusion

This project demonstrates the development of a backend E-Commerce REST API using Node.js and Express.js.

It implements product management, authentication, shopping cart operations, stock validation, checkout processing, session management, and persistent JSON-based storage while following a modular backend architecture.
