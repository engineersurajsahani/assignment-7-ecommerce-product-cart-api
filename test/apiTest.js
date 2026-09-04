const http = require('http');
const app = require('../server');
const fs = require('fs/promises');
const path = require('path');

let server;
const PORT = 3999;
const BASE_URL = `http://localhost:${PORT}`;

let sessionCookie = '';

// Helper to make HTTP requests with cookie support
const request = (method, pathUrl, body = null, extraHeaders = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(pathUrl, BASE_URL);
    const headers = {
      'Content-Type': 'application/json',
      ...extraHeaders
    };

    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      
      // Capture set-cookie header if present
      const setCookie = res.headers['set-cookie'];
      if (setCookie) {
        sessionCookie = setCookie.map(c => c.split(';')[0]).join('; ');
      }

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = data ? JSON.parse(data) : {};
        } catch (e) {
          json = { raw: data };
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json
        });
      });
    });

    req.on('error', reject);

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const assert = (condition, message) => {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Test assertion failed: ${message}`);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
};

const runTests = async () => {
  console.log('🚀 Starting Integration Tests for E-Commerce API...\n');

  // Start test server
  server = app.listen(PORT);

  try {
    // 1. Root Endpoint
    const rootRes = await request('GET', '/');
    assert(rootRes.status === 200, 'Root endpoint responds with 200 OK');

    // 2. Unauthenticated Cart Request should fail with 401
    const unauthCartRes = await request('GET', '/api/cart');
    assert(unauthCartRes.status === 401, 'Unauthenticated GET /api/cart returns 401 Unauthorized');

    // 3. User Registration
    const regRes = await request('POST', '/api/auth/register', {
      username: 'alex',
      email: 'alex@shop.com',
      password: 'password123'
    });
    assert(regRes.status === 201, 'POST /api/auth/register returns 201 Created');
    assert(regRes.body.user.email === 'alex@shop.com', 'Registered user email matches');
    assert(regRes.body.user.password === undefined, 'Password is not exposed in registration response');

    // Duplicate Registration should fail
    const dupRegRes = await request('POST', '/api/auth/register', {
      username: 'alex',
      email: 'alex@shop.com',
      password: 'password123'
    });
    assert(dupRegRes.status === 400, 'Duplicate registration returns 400 Bad Request');

    // 4. User Login
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'alex@shop.com',
      password: 'password123'
    });
    assert(loginRes.status === 200, 'POST /api/auth/login returns 200 OK');
    assert(sessionCookie !== '', 'Session cookie captured');

    // Invalid Login
    const invalidLoginRes = await request('POST', '/api/auth/login', {
      email: 'alex@shop.com',
      password: 'wrongpassword'
    });
    assert(invalidLoginRes.status === 401, 'Invalid password login returns 401 Unauthorized');

    // 5. Product Catalog Testing
    const productsRes = await request('GET', '/api/products');
    assert(productsRes.status === 200, 'GET /api/products returns 200 OK');
    assert(productsRes.body.products.length >= 5, 'At least 5 seed products returned');

    // Filtering by category & sorting
    const filterRes = await request('GET', '/api/products?category=Electronics&minPrice=1000&maxPrice=5000&sort=price_asc');
    assert(filterRes.status === 200, 'Filtered GET /api/products returns 200 OK');
    assert(filterRes.body.products.every(p => p.category === 'Electronics' && p.price >= 1000 && p.price <= 5000), 'All filtered items match criteria');

    // Validation Middleware Test for Product Creation
    const invalidProdRes = await request('POST', '/api/products', {
      name: 'Bad Product',
      category: 'Electronics',
      price: -50,
      stock: 10
    });
    assert(invalidProdRes.status === 400, 'POST /api/products with negative price returns 400 Bad Request');

    // Valid Product Creation
    const newProdRes = await request('POST', '/api/products', {
      name: 'Wireless Gaming Mouse',
      category: 'Electronics',
      price: 1499,
      stock: 20,
      rating: 4.5
    });
    assert(newProdRes.status === 201, 'POST /api/products creates product with 201 Created');
    const newProdId = newProdRes.body.product.id;

    // Fetch Single Product
    const singleProdRes = await request('GET', `/api/products/${newProdId}`);
    assert(singleProdRes.status === 200, `GET /api/products/${newProdId} returns 200 OK`);

    // 6. Shopping Cart & Stock Validation
    const emptyCartRes = await request('GET', '/api/cart');
    assert(emptyCartRes.status === 200, 'Authenticated GET /api/cart returns 200 OK');
    assert(emptyCartRes.body.items.length === 0, 'Cart is initially empty');

    // Attempting to add quantity > stock (prod_105 has stock: 3)
    const overStockRes = await request('POST', '/api/cart/items', {
      productId: 'prod_105',
      quantity: 10
    });
    assert(overStockRes.status === 400, 'Adding quantity > available stock returns 400 Bad Request / Out of Stock');

    // Add valid item (prod_101 qty: 2, unitPrice: 2999)
    const addRes1 = await request('POST', '/api/cart/items', {
      productId: 'prod_101',
      quantity: 2
    });
    assert(addRes1.status === 200, 'POST /api/cart/items returns 200 OK');
    assert(addRes1.body.cart.cartTotal === 5998, 'Cart total calculated correctly (2 * 2999 = 5998)');

    // Add second item (prod_102 qty: 1, unitPrice: 1899)
    const addRes2 = await request('POST', '/api/cart/items', {
      productId: 'prod_102',
      quantity: 1
    });
    assert(addRes2.status === 200, 'Adding second product returns 200 OK');
    assert(addRes2.body.cart.cartTotal === 5998 + 1899, 'Cart total updated correctly');

    // Remove item prod_102
    const removeRes = await request('DELETE', '/api/cart/items/prod_102');
    assert(removeRes.status === 200, 'DELETE /api/cart/items/prod_102 returns 200 OK');
    assert(removeRes.body.cart.items.length === 1, 'One item remains in cart');

    // 7. Checkout & Stock Decrement Verification
    // Current stock of prod_101 before checkout: 15
    const checkoutRes = await request('POST', '/api/cart/checkout');
    assert(checkoutRes.status === 200, 'POST /api/cart/checkout returns 200 OK');
    assert(checkoutRes.body.cart.items.length === 0, 'User cart is cleared after checkout');

    // Verify prod_101 stock decremented from 15 to 13
    const prodAfterCheckoutRes = await request('GET', '/api/cart/../products/prod_101');
    assert(prodAfterCheckoutRes.body.stock === 13, 'Product stock automatically decremented from 15 to 13');

    // Attempting checkout with empty cart should fail
    const emptyCheckoutRes = await request('POST', '/api/cart/checkout');
    assert(emptyCheckoutRes.status === 400, 'Checkout on empty cart returns 400 Bad Request');

    // 8. Logout
    const logoutRes = await request('POST', '/api/auth/logout');
    assert(logoutRes.status === 200, 'POST /api/auth/logout returns 200 OK');

    console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 💯');
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
  }
};

runTests();
