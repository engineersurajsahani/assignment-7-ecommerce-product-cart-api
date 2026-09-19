const assert = require('assert');
const http = require('http');
const app = require('./server');

const PORT = 5555;
let server;
let sessionCookie = '';
let registeredUserId = '';
let testProductId = '';

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        ...options,
        headers: {
          ...(postData ? { 'Content-Type': 'application/json' } : {}),
          ...(sessionCookie ? { Cookie: sessionCookie } : {}),
          ...(options.headers || {})
        }
      },
      (res) => {
        let body = '';
        if (res.headers['set-cookie']) {
          sessionCookie = res.headers['set-cookie'][0].split(';')[0];
        }
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: body });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Comprehensive Automated Test Suite for Assignment 7...\n');
  server = app.listen(PORT);

  try {
    // 1. Health & Root endpoint
    console.log('Test 1: Health Check (GET /)');
    const rootRes = await request({ path: '/', method: 'GET' });
    assert.strictEqual(rootRes.status, 200);
    assert.strictEqual(rootRes.data.success, true);
    console.log('✅ Health check passed\n');

    // 2. Register New User
    console.log('Test 2: Register User (POST /api/auth/register)');
    const testEmail = `tester_${Date.now()}@shop.com`;
    const regRes = await request(
      { path: '/api/auth/register', method: 'POST' },
      { username: 'tester', email: testEmail, password: 'password123' }
    );
    assert.strictEqual(regRes.status, 201);
    assert.strictEqual(regRes.data.success, true);
    assert.ok(regRes.data.user.id);
    registeredUserId = regRes.data.user.id;
    console.log(`✅ User registered successfully: ${registeredUserId}\n`);

    // 3. Reject Duplicate Email
    console.log('Test 3: Reject Duplicate Email (POST /api/auth/register)');
    const dupRes = await request(
      { path: '/api/auth/register', method: 'POST' },
      { username: 'tester_dup', email: testEmail, password: 'password123' }
    );
    assert.strictEqual(dupRes.status, 400);
    assert.strictEqual(dupRes.data.success, false);
    console.log('✅ Duplicate registration rejected with 400\n');

    // 4. Login User
    console.log('Test 4: Login User (POST /api/auth/login)');
    const loginRes = await request(
      { path: '/api/auth/login', method: 'POST' },
      { email: testEmail, password: 'password123' }
    );
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.data.success, true);
    assert.ok(sessionCookie);
    console.log(`✅ Login successful, session cookie captured: ${sessionCookie}\n`);

    // 5. Invalid Login
    console.log('Test 5: Invalid Password Login (POST /api/auth/login)');
    const badLoginRes = await request(
      { path: '/api/auth/login', method: 'POST' },
      { email: testEmail, password: 'wrongpassword' }
    );
    assert.strictEqual(badLoginRes.status, 401);
    assert.strictEqual(badLoginRes.data.success, false);
    console.log('✅ Invalid login rejected with 401\n');

    // 6. Get Current User Profile
    console.log('Test 6: Get Profile (GET /api/auth/me)');
    const meRes = await request({ path: '/api/auth/me', method: 'GET' });
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.data.user.email, testEmail);
    console.log('✅ Current user profile fetched\n');

    // 7. Get All Products
    console.log('Test 7: List All Products (GET /api/products)');
    const prodRes = await request({ path: '/api/products', method: 'GET' });
    assert.strictEqual(prodRes.status, 200);
    assert.ok(Array.isArray(prodRes.data.data));
    assert.ok(prodRes.data.data.length >= 5);
    console.log(`✅ Fetched ${prodRes.data.data.length} products\n`);

    // 8. Filter Products by Category & Price
    console.log('Test 8: Filter by Category & Price Range (GET /api/products?category=Electronics&minPrice=2000&maxPrice=5000&sort=price_asc)');
    const filterRes = await request({
      path: '/api/products?category=Electronics&minPrice=2000&maxPrice=5000&sort=price_asc',
      method: 'GET'
    });
    assert.strictEqual(filterRes.status, 200);
    filterRes.data.data.forEach((p) => {
      assert.strictEqual(p.category.toLowerCase(), 'electronics');
      assert.ok(p.price >= 2000 && p.price <= 5000);
    });
    console.log(`✅ Filtered products matched criteria (${filterRes.data.data.length} items)\n`);

    // 9. Search Products
    console.log('Test 9: Search Products by Keyword (GET /api/products?search=headphones)');
    const searchRes = await request({ path: '/api/products?search=headphones', method: 'GET' });
    assert.strictEqual(searchRes.status, 200);
    assert.ok(searchRes.data.data.length >= 1);
    console.log(`✅ Search returned ${searchRes.data.data.length} result(s)\n`);

    // 10. Get Product By ID
    console.log('Test 10: Fetch Single Product By ID (GET /api/products/prod_101)');
    const singleRes = await request({ path: '/api/products/prod_101', method: 'GET' });
    assert.strictEqual(singleRes.status, 200);
    assert.strictEqual(singleRes.data.data.id, 'prod_101');
    console.log('✅ Single product fetched successfully\n');

    // 11. Create New Product
    console.log('Test 11: Create New Product (POST /api/products)');
    const createProdRes = await request(
      { path: '/api/products', method: 'POST' },
      {
        name: 'Smart Fitness Tracker Band',
        category: 'Fitness',
        price: 1999,
        stock: 40,
        rating: 4.5
      }
    );
    assert.strictEqual(createProdRes.status, 201);
    assert.ok(createProdRes.data.data.id);
    testProductId = createProdRes.data.data.id;
    console.log(`✅ Product created with ID: ${testProductId}\n`);

    // 12. Update Product
    console.log(`Test 12: Update Product (PUT /api/products/${testProductId})`);
    const updateProdRes = await request(
      { path: `/api/products/${testProductId}`, method: 'PUT' },
      { price: 1799, stock: 35 }
    );
    assert.strictEqual(updateProdRes.status, 200);
    assert.strictEqual(updateProdRes.data.data.price, 1799);
    assert.strictEqual(updateProdRes.data.data.stock, 35);
    console.log('✅ Product updated successfully\n');

    // 13. View Shopping Cart
    console.log('Test 13: View Cart (GET /api/cart)');
    const cartRes = await request({ path: '/api/cart', method: 'GET' });
    assert.strictEqual(cartRes.status, 200);
    assert.strictEqual(cartRes.data.data.userId, registeredUserId);
    console.log('✅ Shopping cart retrieved\n');

    // 14. Add Item to Cart
    console.log('Test 14: Add Item to Cart (POST /api/cart/items)');
    const addCartRes = await request(
      { path: '/api/cart/items', method: 'POST' },
      { productId: 'prod_101', quantity: 2 }
    );
    assert.strictEqual(addCartRes.status, 200);
    assert.strictEqual(addCartRes.data.data.items.length, 1);
    assert.strictEqual(addCartRes.data.data.items[0].quantity, 2);
    assert.strictEqual(addCartRes.data.data.cartTotal, 2999 * 2);
    console.log(`✅ Item added to cart. Cart total: ₹${addCartRes.data.data.cartTotal}\n`);

    // 15. Attempt Exceeding Stock Rejection
    console.log('Test 15: Exceeding Stock Addition Validation (POST /api/cart/items with qty 9999)');
    const overStockRes = await request(
      { path: '/api/cart/items', method: 'POST' },
      { productId: 'prod_101', quantity: 9999 }
    );
    assert.strictEqual(overStockRes.status, 400);
    assert.strictEqual(overStockRes.data.success, false);
    console.log('✅ Over-stock item rejected with 400 Bad Request\n');

    // 16. Remove Item from Cart
    console.log('Test 16: Remove Item from Cart (DELETE /api/cart/items/prod_101)');
    const removeRes = await request({ path: '/api/cart/items/prod_101', method: 'DELETE' });
    assert.strictEqual(removeRes.status, 200);
    assert.strictEqual(removeRes.data.data.items.length, 0);
    assert.strictEqual(removeRes.data.data.cartTotal, 0);
    console.log('✅ Item removed from cart\n');

    // 17. Add Item and Checkout
    console.log('Test 17: Add Item and Checkout Order (POST /api/cart/checkout)');
    // Add product
    await request(
      { path: '/api/cart/items', method: 'POST' },
      { productId: testProductId, quantity: 3 }
    );

    // Initial stock check
    const beforeCheckProd = await request({ path: `/api/products/${testProductId}`, method: 'GET' });
    const initialStock = beforeCheckProd.data.data.stock;

    // Checkout
    const checkoutRes = await request({ path: '/api/cart/checkout', method: 'POST' });
    assert.strictEqual(checkoutRes.status, 200);
    assert.strictEqual(checkoutRes.data.success, true);
    assert.ok(checkoutRes.data.order.orderId);
    assert.strictEqual(checkoutRes.data.order.items.length, 1);
    console.log(`✅ Order placed! Order ID: ${checkoutRes.data.order.orderId}, Total: ₹${checkoutRes.data.order.totalAmount}`);

    // Verify stock decremented
    const afterCheckProd = await request({ path: `/api/products/${testProductId}`, method: 'GET' });
    assert.strictEqual(afterCheckProd.data.data.stock, initialStock - 3);
    console.log(`✅ Product stock automatically decremented from ${initialStock} to ${afterCheckProd.data.data.stock}\n`);

    // Verify cart is cleared
    const postCheckoutCart = await request({ path: '/api/cart', method: 'GET' });
    assert.strictEqual(postCheckoutCart.data.data.items.length, 0);
    assert.strictEqual(postCheckoutCart.data.data.cartTotal, 0);
    console.log('✅ Cart automatically cleared after checkout\n');

    // 18. Delete Test Product
    console.log(`Test 18: Delete Test Product (DELETE /api/products/${testProductId})`);
    const delRes = await request({ path: `/api/products/${testProductId}`, method: 'DELETE' });
    assert.strictEqual(delRes.status, 200);
    console.log('✅ Test product cleaned up\n');

    // 19. Logout
    console.log('Test 19: Logout User (POST /api/auth/logout)');
    const logoutRes = await request({ path: '/api/auth/logout', method: 'POST' });
    assert.strictEqual(logoutRes.status, 200);
    console.log('✅ Logout successful\n');

    console.log('🎉 ALL 19 TESTS PASSED SUCCESSFULLY! 100% VERIFIED.');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTests();
