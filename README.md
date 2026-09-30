# E-Commerce Product Catalog & Shopping Cart REST API

A REST API built using Node.js and Express.js for managing products, users, and shopping carts.

## Technologies Used

- Node.js
- Express.js
- JSON files for data storage
- fs/promises for asynchronous file operations
- bcryptjs for password hashing
- express-session for session-based authentication
- dotenv for environment variables

## Project Structure

```text
assignment-7-ecommerce-product-cart-api/
│
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
│   ├── auth.js
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
├── README.md
└── server.js