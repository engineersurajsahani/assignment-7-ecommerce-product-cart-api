# 📚 Library Management API

A complete REST API for managing a library system built using Node.js, Express.js, Firebase Firestore, JWT authentication, and role-based access control.



## 📌 Project Overview

The Library Management API is a backend application designed to manage library users, books, borrowing and returning of books, and transactions.

The API uses JWT-based authentication and role-based authorization to provide different permissions to Students and Librarians.

Firebase Firestore is used as the database for storing users, books, and transaction information.

---

## 🛠️ Technologies Used

- Node.js
- Express.js
- Firebase Firestore
- Firebase Admin SDK
- JSON Web Token (JWT)
- bcrypt
- Swagger / OpenAPI
- Express Validator
- Express Rate Limit
- Helmet
- CORS
- Nodemon

---

## ✨ Features

### 🔐 Authentication

- User registration
- User login
- JWT-based authentication
- Password hashing using bcrypt
- Get logged-in user profile
- Update user profile

### 👨‍🎓 Student Features

- View available books
- Search books
- Borrow books
- Return books
- View personal transaction history

### 👩‍🏫 Librarian Features

- Add books
- Update books
- Delete books
- View all transactions
- Manage users
- Update user roles
- Delete users

### 📚 Book Management

- Create books
- View all books
- View individual book details
- Update book details
- Delete books
- Search books by title or author
- Track book availability

### 🔄 Borrow and Return System

- Students can borrow available books
- Due dates are tracked
- Return dates are recorded
- Transaction status is maintained
- Book quantity is updated after borrowing and returning

### 🛡️ Security

- JWT authentication
- Role-based authorization
- bcrypt password hashing
- Rate limiting
- Helmet security middleware
- Input validation
- Global error handling

### 📝 API Documentation

Swagger/OpenAPI documentation is available at:

YOUR_RENDER_LINK/api-docs

---

## 👥 User Roles

### Student

Students can:

- View books
- Search books
- Borrow books
- Return books
- View their transaction history

### Librarian

Librarians can:

- Manage books
- Manage users
- View all transactions
- Update user roles
- Delete users

---

## 📋 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update user profile |

### Books

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/books` | Get all books |
| GET | `/api/books/:id` | Get book by ID |
| POST | `/api/books` | Add a new book |
| PUT | `/api/books/:id` | Update a book |
| DELETE | `/api/books/:id` | Delete a book |
| GET | `/api/books/search` | Search books |

### Borrow / Return

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/books/:id/borrow` | Borrow a book |
| POST | `/api/books/:id/return` | Return a book |
| GET | `/api/transactions` | Get all transactions |
| GET | `/api/transactions/my` | Get user's transactions |

### User Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user details |
| PUT | `/api/users/:id/role` | Update user role |
| DELETE | `/api/users/:id` | Delete user |

---

## 🗄️ Database Structure

The application uses Firebase Firestore with the following collections:

### Users

```text
users
├── userId
├── name
├── email
├── password
├── role
├── createdAt
└── updatedAt
