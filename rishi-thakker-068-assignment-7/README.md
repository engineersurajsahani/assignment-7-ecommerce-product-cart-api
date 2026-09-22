# Deployed Link - https://assignment-7-ecommerce-product-cart-api-rx9t.onrender.com/

# Name - Rishi Thakker
# Roll No. - 150096725068
# Cohort - Sam Altman

# Assignment 07 - E-Commerce Product & Cart API

Simple REST API made with Node.js + Express. Data is stored in JSON files (no database used, as per assignment).


## API Endpoints

| Method | Endpoint | Description | Body |
|---|---|---|---|
| POST | /api/auth/register | Register new user | `{"username","email","password"}` |
| POST | /api/auth/login | Login user | `{"email","password"}` |
| POST | /api/auth/logout | Logout user | - |
| GET | /api/products | Get all products | - |
| GET | /api/products/:id | Get single product | - |
| POST | /api/products | Add new product | `{"name","category","price","stock","rating"}` |
| PUT | /api/products/:id | Update product | `{"price","stock"}` |
| DELETE | /api/products/:id | Delete product | - |
| GET | /api/cart | View cart (login required) | - |
| POST | /api/cart/items | Add item to cart (login required) | `{"productId","quantity"}` |
| DELETE | /api/cart/items/:productId | Remove item from cart (login required) | - |
| POST | /api/cart/checkout | Checkout cart (login required) | - |

## Test flow

1. Register a user
2. Login (cookie gets saved automatically in Postman)
3. Add product to cart
4. Try adding more quantity than stock available -> should give error
5. Checkout -> stock should reduce in products.json
