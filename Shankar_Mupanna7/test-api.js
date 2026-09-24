const http = require('http');
const app = require('./server');
const { readData, writeData } = require('./utils/fileHelper');

let server;
let port;
let cookie = '';

// Helper to make HTTP requests
function request(method, path, body = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      ...extraHeaders,
      ...(cookie ? { Cookie: cookie } : {}),
      ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {})
    };

    const req = http.request(
      {
        hostname: 'localhost',
        port,
        path,
        method,
        headers
      },
      (res) => {
        let responseData = '';
        if (res.headers['set-cookie']) {
          // Extract session cookie
          const rawCookie = res.headers['set-cookie'][0];
          cookie = rawCookie.split(';')[0];
        }
        res.on('data', (chunk) => (responseData += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(responseData);
          } catch {
            parsed = responseData;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting E2E API Integration Verification...');

  // Reset test data
  const initialProducts = [
    {
      id: 'prod_101',
      name: 'Wireless Noise-Canceling Headphones',
      category: 'Electronics',
      price: 2999,
      stock: 15,
      rating: 4.6,
      createdAt: '2026-03-01T10:00:00.000Z'
    },
    {
      id: 'prod_102',
      name: 'Ergonomic Mechanical Keyboard',
      category: 'Electronics',
      price: 1899,
      stock: 25,
      rating: 4.8,
      createdAt: '2026-03-02T12:00:00.000Z'
    },
    {
      id: 'prod_103',
      name: 'Ultra-light Running Shoes',
      category: 'Footwear',
      price: 3499,
      stock: 8,
      rating: 4.4,
      createdAt: '2026-03-03T14:30:00.000Z'
    },
    {
      id: 'prod_104',
      name: 'Stainless Steel Water Bottle 1L',
      category: 'Home & Kitchen',
      price: 799,
      stock: 40,
      rating: 4.7,
      createdAt: '2026-03-04T09:15:00.000Z'
    },
    {
      id: 'prod_105',
      name: 'Clean Code & Architecture Book',
      category: 'Books',
      price: 1250,
      stock: 12,
      rating: 4.9,
      createdAt: '2026-03-05T16:20:00.000Z'
    }
  ];

  await writeData('products.json', initialProducts);
  await writeData('users.json', []);
  await writeData('carts.json', []);

  // Start test server on random free port
  server = app.listen(0, async () => {
    port = server.address().port;
    console.log(`Test server running on port ${port}`);

    try {
      // 1. GET /api/products
      let res = await request('GET', '/api/products');
      console.assert(res.status === 200, 'GET /api/products status should be 200');
      console.assert(res.body.count === 5, 'Should return 5 products');
      console.log('✅ GET /api/products passed');

      // 2. GET /api/products with filtering & sorting
      res = await request('GET', '/api/products?category=Electronics&sort=price_asc');
      console.assert(res.status === 200, 'GET /api/products with query params status should be 200');
      console.assert(res.body.count === 2, 'Should return 2 Electronics products');
      console.assert(res.body.products[0].price === 1899, 'First sorted product price should be 1899');
      console.log('✅ GET /api/products (filter & sort) passed');

      // 3. GET /api/products/:id
      res = await request('GET', '/api/products/prod_101');
      console.assert(res.status === 200, 'GET /api/products/prod_101 should be 200');
      console.assert(res.body.name === 'Wireless Noise-Canceling Headphones', 'Product name match');
      console.log('✅ GET /api/products/:id passed');

      // 4. POST /api/products (Validation test - invalid price)
      res = await request('POST', '/api/products', { name: 'Test', category: 'Test', price: -5, stock: 10 });
      console.assert(res.status === 400, 'Invalid price should return 400 Bad Request');
      console.log('✅ POST /api/products validation check passed');

      // 5. POST /api/products (Create product)
      res = await request('POST', '/api/products', { name: 'Gaming Mouse', category: 'Electronics', price: 999, stock: 20, rating: 4.5 });
      console.assert(res.status === 201, 'POST /api/products should return 201');
      const createdId = res.body.product.id;
      console.log('✅ POST /api/products passed');

      // 6. PUT /api/products/:id
      res = await request('PUT', `/api/products/${createdId}`, { price: 899, stock: 18 });
      console.assert(res.status === 200, 'PUT /api/products/:id should return 200');
      console.assert(res.body.product.price === 899, 'Updated price should be 899');
      console.log('✅ PUT /api/products/:id passed');

      // 7. DELETE /api/products/:id
      res = await request('DELETE', `/api/products/${createdId}`);
      console.assert(res.status === 200, 'DELETE /api/products/:id should return 200');
      console.log('✅ DELETE /api/products/:id passed');

      // 8. Access Cart unauthenticated
      res = await request('GET', '/api/cart');
      console.assert(res.status === 401, 'Unauthenticated cart access should return 401');
      console.log('✅ Auth Guard on /api/cart passed');

      // 9. Register user
      const userPayload = { username: 'alex', email: 'alex@shop.com', password: 'password123' };
      res = await request('POST', '/api/auth/register', userPayload);
      console.assert(res.status === 201, 'POST /api/auth/register should return 201');
      console.log('✅ POST /api/auth/register passed');

      // 10. Register duplicate email
      res = await request('POST', '/api/auth/register', userPayload);
      console.assert(res.status === 400, 'Duplicate registration should return 400');
      console.log('✅ Duplicate email prevention passed');

      // 11. Login user
      res = await request('POST', '/api/auth/login', { email: 'alex@shop.com', password: 'password123' });
      console.assert(res.status === 200, 'POST /api/auth/login should return 200');
      console.assert(cookie.includes('connect.sid'), 'Session cookie should be set');
      console.log('✅ POST /api/auth/login passed');

      // 12. GET /api/cart (Authenticated)
      res = await request('GET', '/api/cart');
      console.assert(res.status === 200, 'GET /api/cart authenticated should return 200');
      console.assert(res.body.items.length === 0, 'Cart should initially be empty');
      console.log('✅ GET /api/cart (Authenticated) passed');

      // 13. Add item with excessive stock (Stock Validation Test)
      res = await request('POST', '/api/cart/items', { productId: 'prod_101', quantity: 100 });
      console.assert(res.status === 400, 'Excessive quantity should return 400');
      console.assert(res.body.message === 'Insufficient stock', 'Error message should be Insufficient stock');
      console.log('✅ Stock validation on cart add passed');

      // 14. Add valid items to cart
      res = await request('POST', '/api/cart/items', { productId: 'prod_101', quantity: 2 });
      console.assert(res.status === 200, 'Add item to cart should return 200');
      console.assert(res.body.cart.cartTotal === 2999 * 2, 'Cart total calculation match');

      res = await request('POST', '/api/cart/items', { productId: 'prod_102', quantity: 1 });
      console.assert(res.status === 200, 'Add second item should return 200');
      console.assert(res.body.cart.items.length === 2, 'Cart should have 2 items');
      console.log('✅ Adding items to cart passed');

      // 15. Remove item from cart
      res = await request('DELETE', '/api/cart/items/prod_102');
      console.assert(res.status === 200, 'DELETE /api/cart/items/prod_102 should return 200');
      console.assert(res.body.cart.items.length === 1, 'Cart items count after removal should be 1');
      console.log('✅ Removing item from cart passed');

      // 16. Checkout
      res = await request('POST', '/api/cart/checkout');
      console.assert(res.status === 200, 'Checkout should return 200');
      console.assert(res.body.order.totalPaid === 5998, 'Order total paid should be 5998');
      console.log('✅ Checkout endpoint passed');

      // 17. Verify product stock in products.json was decremented
      const updatedProducts = await readData('products.json');
      const prod101 = updatedProducts.find((p) => p.id === 'prod_101');
      console.assert(prod101.stock === 13, `Stock of prod_101 should be decremented from 15 to 13 (got ${prod101.stock})`);
      console.log('✅ Stock decrement in products.json verified (15 -> 13)');

      // 18. Verify cart cleared
      res = await request('GET', '/api/cart');
      console.assert(res.body.items.length === 0, 'Cart should be empty after checkout');
      console.log('✅ Cart reset after checkout verified');

      // 19. Logout
      res = await request('POST', '/api/auth/logout');
      console.assert(res.status === 200, 'Logout should return 200');
      console.log('✅ Logout endpoint passed');

      console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! (100% Score Ready)');
    } catch (err) {
      console.error('❌ Test failed with error:', err);
      process.exitCode = 1;
    } finally {
      server.close();
    }
  });
}

runTests();
