// ---------- Storage Helpers ----------
const DB = {
  getUsers() { return JSON.parse(localStorage.getItem('se_users') || '[]'); },
  saveUsers(u) { localStorage.setItem('se_users', JSON.stringify(u)); },
  getCurrentUser() { return JSON.parse(localStorage.getItem('se_current_user') || 'null'); },
  setCurrentUser(u) { localStorage.setItem('se_current_user', JSON.stringify(u)); },
  getCart() { return JSON.parse(localStorage.getItem('se_cart') || '[]'); },
  saveCart(c) { localStorage.setItem('se_cart', JSON.stringify(c)); }
};

const app = document.getElementById('app');
const navbar = document.getElementById('navbar');
document.getElementById('logoBtn').onclick = renderProducts;

// ---------- Navigation ----------
function renderNav() {
  const user = DB.getCurrentUser();
  const cart = DB.getCart();
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  navbar.innerHTML = '';
  navbar.append(navBtn('Products', renderProducts));

  const cartBtn = navBtn('🛒 Cart', renderCart);
  if (cartCount > 0) {
    const badge = document.createElement('span');
    badge.className = 'cart-badge';
    badge.textContent = cartCount;
    cartBtn.appendChild(badge);
  }
  navbar.append(cartBtn);

  if (user) {
    navbar.append(navBtn(`Logout (${user.username})`, () => {
      DB.setCurrentUser(null);
      renderNav();
      renderProducts();
    }));
  } else {
    navbar.append(navBtn('Login / Register', renderAuth));
  }
}

function navBtn(label, onClick) {
  const b = document.createElement('button');
  b.textContent = label;
  b.onclick = onClick;
  return b;
}

// ---------- Products Page ----------
function renderProducts() {
  const categories = ['All', ...new Set(PRODUCTS.map(p => p.category))];

  app.innerHTML = `
    <h2>Browse Products</h2>
    <div class="filters">
      <input type="text" id="searchInput" placeholder="Search products...">
      <select id="categorySelect">
        ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
      </select>
      <select id="sortSelect">
        <option value="default">Sort by</option>
        <option value="low">Price: Low to High</option>
        <option value="high">Price: High to Low</option>
      </select>
    </div>
    <div class="product-grid" id="productGrid"></div>
  `;

  document.getElementById('searchInput').oninput = applyFilters;
  document.getElementById('categorySelect').onchange = applyFilters;
  document.getElementById('sortSelect').onchange = applyFilters;

  applyFilters();
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categorySelect').value;
  const sort = document.getElementById('sortSelect').value;

  let filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(search) &&
    (category === 'All' || p.category === category)
  );

  if (sort === 'low') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'high') filtered.sort((a, b) => b.price - a.price);

  renderProductGrid(filtered);
}

function renderProductGrid(list) {
  const grid = document.getElementById('productGrid');
  if (list.length === 0) {
    grid.innerHTML = `<p class="empty-msg">No products match your search.</p>`;
    return;
  }
  grid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${escapeHtml(p.name)}">
      <div class="category">${escapeHtml(p.category)}</div>
      <h3>${escapeHtml(p.name)}</h3>
      <div class="price">₹${p.price}</div>
      <button class="primary">Add to Cart</button>
    `;
    card.querySelector('button').onclick = () => addToCart(p.id);
    grid.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Cart Logic ----------
function addToCart(productId) {
  const cart = DB.getCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: productId, qty: 1 });
  }
  DB.saveCart(cart);
  renderNav();
}

function updateQty(productId, delta) {
  let cart = DB.getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  DB.saveCart(cart);
  renderNav();
  renderCart();
}

function removeFromCart(productId) {
  let cart = DB.getCart().filter(i => i.id !== productId);
  DB.saveCart(cart);
  renderNav();
  renderCart();
}

function renderCart() {
  const cart = DB.getCart();
  app.innerHTML = `<h2>Your Cart</h2>`;

  if (cart.length === 0) {
    app.innerHTML += `<p class="empty-msg">Your cart is empty. Go add some products!</p>`;
    return;
  }

  const itemsWrap = document.createElement('div');
  let total = 0;

  cart.forEach(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    if (!product) return;
    const lineTotal = product.price * item.qty;
    total += lineTotal;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${product.img}" alt="${escapeHtml(product.name)}">
      <div class="info">
        <strong>${escapeHtml(product.name)}</strong><br>
        ₹${product.price} each
      </div>
      <div class="qty-controls">
        <button class="dec">-</button>
        <span>${item.qty}</span>
        <button class="inc">+</button>
      </div>
      <div><strong>₹${lineTotal}</strong></div>
      <button class="secondary remove">Remove</button>
    `;
    row.querySelector('.inc').onclick = () => updateQty(item.id, 1);
    row.querySelector('.dec').onclick = () => updateQty(item.id, -1);
    row.querySelector('.remove').onclick = () => removeFromCart(item.id);
    itemsWrap.appendChild(row);
  });

  app.appendChild(itemsWrap);

  const summary = document.createElement('div');
  summary.className = 'cart-summary';
  summary.innerHTML = `
    <div class="row total"><span>Total</span><span>₹${total}</span></div>
    <br>
    <button class="primary" id="checkoutBtn">Proceed to Checkout</button>
  `;
  app.appendChild(summary);

  document.getElementById('checkoutBtn').onclick = () => {
    const user = DB.getCurrentUser();
    if (!user) {
      alert('Please login first to checkout.');
      renderAuth();
    } else {
      renderCheckout(total);
    }
  };
}

// ---------- Auth ----------
function renderAuth() {
  app.innerHTML = `
    <div class="auth-box">
      <h2>Login / Register</h2>
      <label>Username</label>
      <input type="text" id="username" placeholder="Enter username">
      <label>Password</label>
      <input type="password" id="password" placeholder="Enter password">
      <button class="primary" id="loginBtn">Login</button>
      <button class="secondary" id="registerBtn">Register</button>
      <p id="authMsg" style="color:red;"></p>
    </div>
  `;

  document.getElementById('registerBtn').onclick = () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    if (!username || !password) return showAuthMsg('Please fill all fields.');
    const users = DB.getUsers();
    if (users.find(u => u.username === username)) return showAuthMsg('Username already exists.');
    users.push({ username, password });
    DB.saveUsers(users);
    DB.setCurrentUser({ username });
    renderNav();
    renderProducts();
  };

  document.getElementById('loginBtn').onclick = () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const users = DB.getUsers();
    const found = users.find(u => u.username === username && u.password === password);
    if (!found) return showAuthMsg('Invalid username or password.');
    DB.setCurrentUser({ username });
    renderNav();
    renderProducts();
  };
}

function showAuthMsg(msg) {
  document.getElementById('authMsg').textContent = msg;
}

// ---------- Checkout ----------
function renderCheckout(total) {
  app.innerHTML = `
    <div class="checkout-box">
      <h2>Checkout</h2>
      <p>Order Total: <strong>₹${total}</strong></p>
      <label>Full Name</label>
      <input type="text" id="fullName" placeholder="Your name">
      <label>Address</label>
      <input type="text" id="address" placeholder="Shipping address">
      <label>Card Number (demo only)</label>
      <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
      <label>Expiry</label>
      <input type="text" id="expiry" placeholder="MM/YY">
      <button class="primary" id="payBtn">Pay Now</button>
      <p id="checkoutMsg" style="color:red;"></p>
    </div>
  `;

  document.getElementById('payBtn').onclick = () => {
    const fullName = document.getElementById('fullName').value.trim();
    const address = document.getElementById('address').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const expiry = document.getElementById('expiry').value.trim();

    if (!fullName || !address || !cardNumber || !expiry) {
      document.getElementById('checkoutMsg').textContent = 'Please fill in all fields.';
      return;
    }

    // Simulated payment - no real payment is processed.
    DB.saveCart([]);
    renderNav();
    renderOrderSuccess(total);
  };
}

function renderOrderSuccess(total) {
  app.innerHTML = `
    <div class="success-box">
      <h2>✅ Order Placed!</h2>
      <p>Thank you for your purchase. Your order total was <strong>₹${total}</strong>.</p>
      <p>(This is a demo checkout — no real payment was processed.)</p>
      <button class="primary" id="backBtn">Continue Shopping</button>
    </div>
  `;
  document.getElementById('backBtn').onclick = renderProducts;
}

// ---------- Init ----------
renderNav();
renderProducts();
