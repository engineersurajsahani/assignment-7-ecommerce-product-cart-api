process.env.NODE_ENV = 'test';
const http = require('http');
const app = require('../server');

const PORT = 5001; // Use a dedicated test port
let server;
let cookie = '';

const request = (method, path, data = null, customCookie = null) => {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const headers = {
      'Content-Type': 'application/json'
    };

    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const useCookie = customCookie !== null ? customCookie : cookie;
    if (useCookie) {
      headers['Cookie'] = useCookie;
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          // Extract Set-Cookie if present
          if (res.headers['set-cookie']) {
            cookie = res.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
          }

          let json = null;
          try {
            json = JSON.parse(body);
          } catch (e) {
            json = body;
          }

          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: json
          });
        });
      }
    );

    req.on('error', reject);

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
};

const runTests = async () => {
  console.log('🧪 Starting API Verification Tests...\n');
  server = app.listen(PORT);

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Reason: ${err.message}\n`);
      failed++;
    }
  };

  try {
    // 1. Base Route
    await test('GET / - API root info', async () => {
      const res = await request('GET', '/');
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(res.body.status === 'Healthy', 'Expected Healthy status');
    });

    // 2. Auth Tests
    const testEmail = `tester_${Date.now()}@shop.com`;
    await test('POST /api/auth/register - Register new user', async () => {
      const res = await request('POST', '/api/auth/register', {
        username: `tester_${Date.now()}`,
        email: testEmail,
        password: 'password123'
      });
      assert(res.status === 201, `Expected 201 Created, got ${res.status}`);
      assert(res.body.success === true, 'Expected success true');
      assert(res.body.user.email === testEmail, 'User email matches');
      assert(!res.body.user.password, 'Password hash should NOT be returned');
    });

    await test('POST /api/auth/register - Duplicate user registration returns 400', async () => {
      const res = await request('POST', '/api/auth/register', {
        username: 'alex',
        email: 'alex@shop.com',
        password: 'password123'
      });
      assert(res.status === 400, `Expected 400 Bad Request, got ${res.status}`);
      assert(res.body.success === false, 'Expected success false');
    });

    await test('POST /api/auth/login - Invalid credentials return 401', async () => {
      const res = await request('POST', '/api/auth/login', {
        email: testEmail,
        password: 'wrongpassword'
      });
      assert(res.status === 401, `Expected 401 Unauthorized, got ${res.status}`);
    });

    await test('POST /api/auth/login - Valid login establishes session', async () => {
      const res = await request('POST', '/api/auth/login', {
        email: testEmail,
        password: 'password123'
      });
      assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
      assert(res.body.user.email === testEmail, 'Session user matches email');
      assert(cookie.length > 0, 'Expected session cookie to be set');
    });

    // 3. Product Catalog Tests
    let createdProdId = '';
    await test('GET /api/products - List all products', async () => {
      const res = await request('GET', '/api/products');
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(Array.isArray(res.body.products), 'Expected products array');
      assert(res.body.products.length >= 5, 'Expected at least 5 seeded products');
    });

    await test('GET /api/products?category=Electronics - Filter by category', async () => {
      const res = await request('GET', '/api/products?category=Electronics');
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(
        res.body.products.every((p) => p.category.toLowerCase() === 'electronics'),
        'All products must belong to Electronics'
      );
    });

    await test('GET /api/products?minPrice=1000&maxPrice=3000 - Filter by price range', async () => {
      const res = await request('GET', '/api/products?minPrice=1000&maxPrice=3000');
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(
        res.body.products.every((p) => p.price >= 1000 && p.price <= 3000),
        'All products must be between 1000 and 3000'
      );
    });

    await test('GET /api/products?sort=price_asc - Sort by price ascending', async () => {
      const res = await request('GET', '/api/products?sort=price_asc');
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      for (let i = 0; i < res.body.products.length - 1; i++) {
        assert(
          res.body.products[i].price <= res.body.products[i + 1].price,
          'Products must be sorted ascending by price'
        );
      }
    });

    await test('GET /api/products?inStock=true - Filter in-stock items', async () => {
      const res = await request('GET', '/api/products?inStock=true');
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(
        res.body.products.every((p) => p.stock > 0),
        'All returned products must have stock > 0'
      );
    });

    await test('POST /api/products - Create new product with validation', async () => {
      const res = await request('POST', '/api/products', {
        name: 'Smart Fitness Tracker Watch',
        category: 'Electronics',
        price: 2499,
        stock: 20,
        rating: 4.7
      });
      assert(res.status === 201, `Expected 201 Created, got ${res.status}`);
      assert(res.body.product.id.startsWith('prod_'), 'Product ID starts with prod_');
      createdProdId = res.body.product.id;
    });

    await test('POST /api/products - Invalid product payload returns 400', async () => {
      const res = await request('POST', '/api/products', {
        name: '',
        price: -50,
        stock: 'invalid'
      });
      assert(res.status === 400, `Expected 400 Bad Request, got ${res.status}`);
      assert(res.body.errors.length > 0, 'Expected validation error messages');
    });

    await test('GET /api/products/:id - Fetch single product', async () => {
      const res = await request('GET', `/api/products/${createdProdId}`);
      assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
      assert(res.body.product.id === createdProdId, 'Product ID matches');
    });

    await test('PUT /api/products/:id - Update product stock and price', async () => {
      const res = await request('PUT', `/api/products/${createdProdId}`, {
        price: 2299,
        stock: 18
      });
      assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
      assert(res.body.product.price === 2299, 'Updated price matches');
      assert(res.body.product.stock === 18, 'Updated stock matches');
    });

    // 4. Cart Tests (Authenticated)
    await test('GET /api/cart - Unauthenticated access returns 401', async () => {
      const res = await request('GET', '/api/cart', null, 'dummy_cookie=none');
      assert(res.status === 401, `Expected 401 Unauthorized, got ${res.status}`);
    });

    await test('GET /api/cart - View empty cart', async () => {
      const res = await request('GET', '/api/cart');
      assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
      assert(res.body.cart.cartTotal === 0, 'Cart total should be 0 initially');
    });

    await test('POST /api/cart/items - Add product to cart within available stock', async () => {
      const res = await request('POST', '/api/cart/items', {
        productId: createdProdId,
        quantity: 2
      });
      assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
      assert(res.body.cart.items.length === 1, 'Cart has 1 item');
      assert(res.body.cart.items[0].quantity === 2, 'Item quantity is 2');
      assert(res.body.cart.cartTotal === 2299 * 2, `Cart total should be ${2299 * 2}`);
    });

    await test('POST /api/cart/items - Exceeding stock returns 400 Bad Request', async () => {
      // Stock is 18, 2 is already in cart, requesting 20 more will exceed available stock
      const res = await request('POST', '/api/cart/items', {
        productId: createdProdId,
        quantity: 20
      });
      assert(res.status === 400, `Expected 400 Bad Request, got ${res.status}`);
      assert(res.body.message.includes('Insufficient stock'), 'Error mentions Insufficient stock');
    });

    await test('DELETE /api/cart/items/:productId - Remove product from cart', async () => {
      const res = await request('DELETE', `/api/cart/items/${createdProdId}`);
      assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
      assert(res.body.cart.items.length === 0, 'Cart is now empty');
      assert(res.body.cart.cartTotal === 0, 'Cart total is 0');
    });

    // 5. Checkout & Stock Decrement Test
    await test('POST /api/cart/checkout - Empty cart returns 400', async () => {
      const res = await request('POST', '/api/cart/checkout');
      assert(res.status === 400, `Expected 400 Bad Request, got ${res.status}`);
    });

    await test('POST /api/cart/checkout - Successful checkout decrements stock and clears cart', async () => {
      // Add 3 units of created product (current stock = 18)
      await request('POST', '/api/cart/items', {
        productId: createdProdId,
        quantity: 3
      });

      const checkoutRes = await request('POST', '/api/cart/checkout');
      assert(checkoutRes.status === 200, `Expected 200 OK, got ${checkoutRes.status}`);
      assert(checkoutRes.body.order.status === 'Completed', 'Order status Completed');
      assert(checkoutRes.body.order.orderTotal === 2299 * 3, 'Order total matches');

      // Verify product stock in DB was decremented from 18 to 15
      const prodRes = await request('GET', `/api/products/${createdProdId}`);
      assert(prodRes.body.product.stock === 15, `Expected stock 15, got ${prodRes.body.product.stock}`);

      // Verify cart is now empty
      const cartRes = await request('GET', '/api/cart');
      assert(cartRes.body.cart.items.length === 0, 'Cart is empty after checkout');
      assert(cartRes.body.cart.cartTotal === 0, 'Cart total is 0');
    });

    // 6. Cleanup: Delete created product
    await test('DELETE /api/products/:id - Delete product', async () => {
      const res = await request('DELETE', `/api/products/${createdProdId}`);
      assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
    });

    // 7. Auth Logout
    await test('POST /api/auth/logout - Logout terminates session', async () => {
      const res = await request('POST', '/api/auth/logout');
      assert(res.status === 200, `Expected 200 OK, got ${res.status}`);

      // Now cart access should fail with 401
      const cartRes = await request('GET', '/api/cart');
      assert(cartRes.status === 401, 'Expected 401 Unauthorized after logout');
    });

  } finally {
    server.close();
  }

  console.log(`\n📊 Test Summary: ${passed} Passed, ${failed} Failed\n`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All API verification tests passed successfully!');
  }
};

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  if (server) server.close();
  process.exit(1);
});
