# 🎨 E-Commerce Frontend (React + Vite)


DEPLOY LINK - https://ecommerce-frontend-g4jt.onrender.com/

A modern, responsive, and polished E-Commerce storefront built with **React**, **Vite**, and session-authenticated REST API communication.

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Default `VITE_API_URL` points to `http://localhost:5000/api`.

### 3. Start Development Server
```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 🛠️ Tech Stack & Features

- **React 18** with functional components and modern Hooks
- **Vite** for fast hot module replacement
- **Vanilla CSS Design System** (custom typography, responsive grid, micro-animations, color palette)
- **Lucide Icons** for icons
- **Centralized API Client** with session cookie support (`credentials: "include"`)
- **Stock-Aware Cart System** with live quantity updates and stock limit guards
- **Dynamic Multi-Criteria Filtering** (Category, Price Range, In-Stock Only, Substring Search, Multi-strategy Sorting)
- **Interactive Order Receipt Modal** confirming placed orders
