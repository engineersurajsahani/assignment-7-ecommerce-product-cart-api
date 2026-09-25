// Pages are served by the API itself, so every call is same-origin and the
// browser sends the session cookie automatically. No token in localStorage.

// fetch wrapper: returns { response, data }
function callApi(path, method, body) {
  return fetch(`/api${path}`, {
    method: method || "GET",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }).then((response) => response.json().then((data) => ({ response, data })));
}

function showError(text) {
  Swal.fire({ icon: "error", title: "Oops...", text });
}

function showSuccess(text) {
  return Swal.fire({ icon: "success", title: "Success", text });
}

function rupees(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

// the logged-in user object from the server session, or null
function getUser() {
  return callApi("/auth/me")
    .then(({ data }) => data.user)
    .catch(() => null);
}

// session missing or expired -> back to login
function handleUnauthorized(response, data) {
  if (response.status === 401) {
    Swal.fire({ icon: "error", title: "Oops...", text: data.message }).then(
      () => {
        location.href = "login.html";
      },
    );
    return true;
  }
  return false;
}

function handleLogout() {
  callApi("/auth/logout", "POST").finally(() => {
    location.href = "index.html";
  });
}

// top nav changes with who is looking
function renderNav(user) {
  const nav = document.getElementById("nav");
  if (!nav) return;

  const home = `<button onclick="location.href='index.html'">SHOP</button>`;

  if (!user) {
    nav.innerHTML = `${home}
      <button onclick="location.href='login.html'">LOGIN</button>
      <button onclick="location.href='register.html'">REGISTER</button>`;
    return;
  }

  let links = `${home}
    <button onclick="location.href='cart.html'">MY CART</button>
    <button onclick="location.href='orders.html'">MY ORDERS</button>`;
  if (user.role === "admin") {
    links += `<button onclick="location.href='product-form.html'">ADD PRODUCT</button>`;
  }
  links += `<button onclick="handleLogout()">LOGOUT</button>`;
  nav.innerHTML = links;

  // username is typed by the user -> textContent, never innerHTML
  const who = document.createElement("span");
  who.textContent = ` logged in as ${user.username} (${user.role})`;
  nav.appendChild(who);
}

function makeButton(label, onClick, disabled) {
  const button = document.createElement("button");
  button.textContent = label;
  button.onclick = onClick;
  if (disabled) button.disabled = true;
  return button;
}
