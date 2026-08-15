const views = {
  login: document.querySelector("#loginView"),
  admin: document.querySelector("#appView"),
  student: document.querySelector("#studentView"),
  payment: document.querySelector("#paymentView"),
  token: document.querySelector("#tokenView"),
  loader: document.querySelector("#loaderView"),
};

const loginForm = document.querySelector("#loginForm");
const username = document.querySelector("#username");
const password = document.querySelector("#password");
const usernameGroup = username.closest(".input-group");
const passwordGroup = password.closest(".input-group");
const confirmPassword = document.querySelector("#confirmPassword");
const confirmPasswordGroup = document.querySelector("#confirmPasswordGroup");
const adminKey = document.querySelector("#adminKey");
const adminKeyGroup = document.querySelector("#adminKeyGroup");
const modeToggleBtn = document.querySelector("#modeToggleBtn");
const loginSubmitBtn = document.querySelector("#loginSubmitBtn");
const loginHelper = document.querySelector("#loginHelper");
const accountChoicePanel = document.querySelector("#accountChoicePanel");
const studentSignupBtn = document.querySelector("#studentSignupBtn");
const adminSignupBtn = document.querySelector("#adminSignupBtn");
const backToChoiceBtn = document.querySelector("#backToChoiceBtn");
const choiceBackBtn = document.querySelector("#choiceBackBtn");
const loginError = document.querySelector("#loginError");
const signupSuccess = document.querySelector("#signupSuccess");
const passwordToggle = document.querySelector("#passwordToggle");
const themeToggle = document.querySelector("#themeToggle");
const addFoodForm = document.querySelector("#addFoodForm");
const menuGrid = document.querySelector("#menuGrid");
const studentMenuGrid = document.querySelector("#studentMenuGrid");
const cartItems = document.querySelector("#studentCartItems");
const subtotalText = document.querySelector("#studentSubtotal");
const totalText = document.querySelector("#studentTotal");
const checkoutBtn = document.querySelector("#studentCheckoutBtn");
const paymentItems = document.querySelector("#paymentItems");
const paymentTotal = document.querySelector("#paymentTotal");
const paymentUsername = document.querySelector("#paymentUsername");
const paymentPhone = document.querySelector("#paymentPhone");
const backToCartBtn = document.querySelector("#backToCartBtn");
const confirmPaymentBtn = document.querySelector("#confirmPaymentBtn");
const paymentTokenMessage = document.querySelector("#paymentTokenMessage");
const tokenNumber = document.querySelector("#orderTokenNumber");
const tokenOrderItems = document.querySelector("#tokenOrderItems");
const tokenOrderTotal = document.querySelector("#tokenOrderTotal");
const smsStatus = document.querySelector("#smsStatus");
const sendSmsBtn = document.querySelector("#sendSmsBtn");
const backToMenuBtn = document.querySelector("#backToMenuBtn");
const foodStatus = document.querySelector("#foodStatus");
const analyticsCards = document.querySelector("#analyticsCards");
const analyticsStatus = document.querySelector("#analyticsStatus");
const downloadExcelBtn = document.querySelector("#downloadExcelBtn");

const fallbackImages = {
  Breakfast: "linear-gradient(135deg, #ffbf69, #fff1c1)",
  Lunch: "linear-gradient(135deg, #3a86ff, #9bf6ff)",
  Snacks: "linear-gradient(135deg, #ff6b6b, #ffd166)",
  Drinks: "linear-gradient(135deg, #06d6a0, #caf0f8)",
  Desserts: "linear-gradient(135deg, #b5179e, #ffc8dd)",
};

let signupMode = false;
let signupRole = "student";
let activeCategory = "All";
let currentUser = "";
let cart = [];
let lastSmsLink = "";
let databaseReady = false;

let foods = (JSON.parse(localStorage.getItem("feastFlowFoods")) || []).filter((food) => ![1, 2, 3, 4].includes(Number(food.id)));
// Remove credentials saved by older versions of the app from this browser.
localStorage.removeItem("feastFlowUsers");

function saveLocalData() {
  localStorage.setItem("feastFlowFoods", JSON.stringify(foods));
}

async function loadDatabaseData() {
  try {
    const response = await fetch("/api/bootstrap");
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data.foods)) foods = data.foods;
    databaseReady = true;
    saveLocalData();
  } catch (error) {
    databaseReady = false;
  }
}

async function saveDatabaseData() {
  if (!databaseReady) return;
  try {
    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foods }),
    });
  } catch (error) {
    databaseReady = false;
  }
}

function saveData() {
  saveLocalData();
  saveDatabaseData();
}

function showView(name) {
  Object.values(views).forEach((view) => view.classList.add("hidden"));
  views[name].classList.remove("hidden");
}

function showLoader(nextView) {
  showView("loader");
  window.setTimeout(() => showView(nextView), 650);
}

function money(value) {
  return `Rs. ${Number(value).toFixed(2)}`;
}

function isValidPhoneNumber(value) {
  const cleaned = value.replace(/[\s-]/g, "");
  return /^(?:\+91|91)?[6-9]\d{9}$/.test(cleaned);
}

function formatPhoneForSms(value) {
  const cleaned = value.replace(/[\s-]/g, "");
  if (cleaned.startsWith("+91")) return cleaned;
  if (cleaned.startsWith("91")) return `+${cleaned}`;
  return `+91${cleaned}`;
}

function buildOrderMessage(token, customerName) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemLines = cart.map((item) => `${item.name} - Qty ${item.qty} - ${money(item.price * item.qty)}`).join("\n");
  return `NGP Canteen Order\nName: ${customerName}\nToken: ${token}\n\nFood Items:\n${itemLines}\n\nTotal: ${money(total)}\nPlease show this token while collecting your food.`;
}

function openSmsApp() {
  if (lastSmsLink) window.location.href = lastSmsLink;
}

function resetAuthMessages() {
  loginError.classList.add("hidden");
  signupSuccess.classList.add("hidden");
}

function setLoginMode() {
  signupMode = false;
  signupRole = "student";
  usernameGroup.classList.remove("hidden");
  passwordGroup.classList.remove("hidden");
  confirmPasswordGroup.classList.add("hidden");
  adminKeyGroup.classList.add("hidden");
  confirmPassword.required = false;
  adminKey.required = false;
  accountChoicePanel.classList.add("hidden");
  backToChoiceBtn.classList.add("hidden");
  choiceBackBtn.classList.add("hidden");
  loginSubmitBtn.textContent = "Login";
  loginSubmitBtn.classList.remove("hidden");
  modeToggleBtn.textContent = "Create new user";
  modeToggleBtn.classList.remove("hidden");
  loginHelper.textContent = "";
  loginHelper.classList.add("hidden");
  username.placeholder = "Enter username";
  password.placeholder = "Enter password";
  resetAuthMessages();
}

function setStudentSignupMode() {
  signupMode = true;
  signupRole = "student";
  usernameGroup.classList.remove("hidden");
  passwordGroup.classList.remove("hidden");
  confirmPasswordGroup.classList.remove("hidden");
  adminKeyGroup.classList.add("hidden");
  confirmPassword.required = true;
  adminKey.required = false;
  accountChoicePanel.classList.add("hidden");
  backToChoiceBtn.classList.remove("hidden");
  choiceBackBtn.classList.add("hidden");
  loginSubmitBtn.textContent = "Create student account";
  loginSubmitBtn.classList.remove("hidden");
  modeToggleBtn.classList.add("hidden");
  loginHelper.textContent = "";
  loginHelper.classList.add("hidden");
  username.placeholder = "Create student username";
  password.placeholder = "Create password";
  resetAuthMessages();
}

function setAdminSignupMode() {
  signupMode = true;
  signupRole = "admin";
  usernameGroup.classList.remove("hidden");
  passwordGroup.classList.remove("hidden");
  confirmPasswordGroup.classList.remove("hidden");
  adminKeyGroup.classList.remove("hidden");
  confirmPassword.required = true;
  adminKey.required = true;
  accountChoicePanel.classList.add("hidden");
  backToChoiceBtn.classList.remove("hidden");
  choiceBackBtn.classList.add("hidden");
  loginSubmitBtn.textContent = "Create admin account";
  loginSubmitBtn.classList.remove("hidden");
  modeToggleBtn.classList.add("hidden");
  loginHelper.textContent = "";
  loginHelper.classList.add("hidden");
  username.placeholder = "Create admin username";
  password.placeholder = "Create password";
  adminKey.value = "";
  resetAuthMessages();
}

function showAccountChoices() {
  signupMode = false;
  signupRole = "student";
  usernameGroup.classList.add("hidden");
  passwordGroup.classList.add("hidden");
  confirmPasswordGroup.classList.add("hidden");
  adminKeyGroup.classList.add("hidden");
  confirmPassword.required = false;
  adminKey.required = false;
  accountChoicePanel.classList.toggle("hidden");
  backToChoiceBtn.classList.add("hidden");
  choiceBackBtn.classList.toggle("hidden", accountChoicePanel.classList.contains("hidden"));
  loginSubmitBtn.textContent = "Login";
  loginSubmitBtn.classList.toggle("hidden", !accountChoicePanel.classList.contains("hidden"));
  modeToggleBtn.textContent = "Create new user";
  modeToggleBtn.classList.toggle("hidden", !accountChoicePanel.classList.contains("hidden"));
  loginHelper.textContent = "";
  loginHelper.classList.add("hidden");
  resetAuthMessages();
  if (!accountChoicePanel.classList.contains("hidden")) studentSignupBtn.focus();
}

function makeFoodCard(food, mode) {
  const imageContent = food.image
    ? `<img src="${food.image}" alt="${food.name}" />`
    : `<div class="food-art" style="background:${fallbackImages[food.category] || fallbackImages.Snacks}"><span>${food.category}</span></div>`;
  return `
    <article class="food-card ${food.quantity <= 5 ? "low-stock" : ""}">
      ${imageContent}
      <div class="food-card-body">
        <div class="food-meta"><span>${food.category}</span><strong>${money(food.price)}</strong></div>
        <h4>${food.name}</h4>
        <p>${food.quantity} items available</p>
        ${mode === "admin"
          ? `<button class="edit-btn" type="button" data-remove="${food.id}">Remove</button>`
          : `<button class="primary-btn" type="button" data-add-cart="${food.id}" ${food.quantity < 1 ? "disabled" : ""}>Add to cart</button>`}
      </div>
    </article>`;
}

function renderAdminMenu() {
  const visibleFoods = activeCategory === "All" ? foods : foods.filter((food) => food.category === activeCategory);
  menuGrid.innerHTML = visibleFoods.length ? visibleFoods.map((food) => makeFoodCard(food, "admin")).join("") : `<p class="empty-state wide">No food available in this category.</p>`;
}

async function loadAnalytics() {
  try {
    const response = await fetch("/api/analytics");
    if (!response.ok) throw new Error("Analytics unavailable");
    const data = await response.json();
    analyticsCards.innerHTML = `
      <div class="analytics-card"><span>Total orders</span><strong>${data.totalOrders}</strong></div>
      <div class="analytics-card"><span>Food items sold</span><strong>${data.units}</strong></div>
      <div class="analytics-card"><span>Total sales</span><strong>${money(data.revenue)}</strong></div>
      <div class="analytics-card"><span>Top food</span><strong>${data.topFood}</strong></div>`;
  } catch (error) {
    analyticsCards.innerHTML = `<p class="empty-state wide">Order analytics will appear after the first order.</p>`;
  }
}

async function saveOrder(order) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  if (!response.ok) throw new Error("Unable to save order");
}

function renderStudentMenu() {
  studentMenuGrid.innerHTML = foods.length ? foods.map((food) => makeFoodCard(food, "student")).join("") : `<p class="empty-state wide">The canteen has not added food yet.</p>`;
}

function renderCart() {
  if (!cart.length) {
    cartItems.innerHTML = `<p class="empty-state">Your cart is empty. Add food to place an order.</p>`;
  } else {
    cartItems.innerHTML = cart.map((item) => `
      <div class="cart-item">
        <div><strong>${item.name}</strong><span>${item.qty} x ${money(item.price)}</span></div>
        <div class="quantity-control" aria-label="Quantity for ${item.name}">
          <button type="button" data-cart-minus="${item.id}" aria-label="Decrease quantity">-</button>
          <strong>${item.qty}</strong>
          <button type="button" data-cart-plus="${item.id}" aria-label="Increase quantity">+</button>
        </div>
        <button type="button" class="cart-remove" data-remove-cart="${item.id}">Remove</button>
      </div>`).join("");
  }
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  subtotalText.textContent = money(total);
  totalText.textContent = money(total);
}

function renderPayment() {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  paymentItems.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <div><strong>${item.name}</strong><span>${item.qty} x ${money(item.price)}</span></div>
      <strong>${money(item.price * item.qty)}</strong>
    </div>`).join("");
  paymentTotal.textContent = money(total);
  paymentUsername.value = currentUser;
  paymentPhone.value = "";
}

function renderToken(token, customerName, phone) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  tokenNumber.textContent = token;
  tokenOrderItems.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <div><strong>${item.name}</strong><span>${item.qty} item ordered</span></div>
      <strong>${money(item.price * item.qty)}</strong>
    </div>`).join("");
  tokenOrderTotal.textContent = money(total);
  lastSmsLink = `sms:${formatPhoneForSms(phone)}?body=${encodeURIComponent(buildOrderMessage(token, customerName))}`;
  smsStatus.textContent = "SMS message is ready with order details and token number.";
}

function addToCart(foodId) {
  const food = foods.find((item) => item.id === foodId);
  if (!food || food.quantity < 1) return;
  const existing = cart.find((item) => item.id === foodId);
  if (existing) {
    if (existing.qty < food.quantity) existing.qty += 1;
  } else {
    cart.push({ id: food.id, name: food.name, price: food.price, qty: 1 });
  }
  renderCart();
}

themeToggle.addEventListener("change", () => document.body.classList.toggle("dark", themeToggle.checked));

passwordToggle.addEventListener("click", () => {
  const isPassword = password.type === "password";
  password.type = isPassword ? "text" : "password";
  passwordToggle.textContent = isPassword ? "Hide" : "Show";
});

modeToggleBtn.addEventListener("click", () => {
  if (signupMode) {
    setLoginMode();
    return;
  }
  showAccountChoices();
});

studentSignupBtn.addEventListener("click", setStudentSignupMode);
adminSignupBtn.addEventListener("click", setAdminSignupMode);
backToChoiceBtn.addEventListener("click", showAccountChoices);
choiceBackBtn.addEventListener("click", setLoginMode);

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = username.value.trim();
  const pass = password.value.trim();
  resetAuthMessages();

  if (signupMode) {
    // Keep the chosen role before returning the form to login mode.
    // setLoginMode() resets signupRole to "student" for the next use.
    const createdRole = signupRole;
    if (pass !== confirmPassword.value.trim()) {
      loginError.textContent = "Passwords do not match.";
      loginError.classList.remove("hidden");
      return;
    }
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: name, password: pass, role: createdRole, adminKey: adminKey.value.trim() }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      loginError.textContent = result.error || "Unable to create account.";
      loginError.classList.remove("hidden");
      return;
    }
    setLoginMode();
    loginForm.reset();
    signupSuccess.textContent = createdRole === "admin" ? "Admin account created." : "Student account created.";
    signupSuccess.classList.remove("hidden");
    return;
  }

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: name, password: pass }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    loginError.textContent = result.error || "Incorrect username or password.";
    loginError.classList.remove("hidden");
    return;
  }

  currentUser = result.username;
  cart = [];
  renderAdminMenu();
  loadAnalytics();
  renderStudentMenu();
  renderCart();
  showLoader(result.role === "admin" ? "admin" : "student");
});

addFoodForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const imageFile = document.querySelector("#foodImage").files[0];
  const newFood = {
    id: Date.now(),
    name: document.querySelector("#foodName").value.trim(),
    category: document.querySelector("#foodCategory").value,
    price: Number(document.querySelector("#foodPrice").value),
    quantity: Number(document.querySelector("#foodQuantity").value),
    image: "",
  };
  const finish = () => {
    foods.unshift(newFood);
    saveData();
    addFoodForm.reset();
    foodStatus.classList.remove("hidden");
    window.setTimeout(() => foodStatus.classList.add("hidden"), 1800);
    renderAdminMenu();
    renderStudentMenu();
  };
  if (imageFile) {
    const reader = new FileReader();
    reader.onload = () => {
      newFood.image = reader.result;
      finish();
    };
    reader.readAsDataURL(imageFile);
  } else {
    finish();
  }
});

document.querySelector(".pill-row").addEventListener("click", (event) => {
  const button = event.target.closest(".pill");
  if (!button) return;
  document.querySelectorAll(".pill").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  activeCategory = button.dataset.category;
  renderAdminMenu();
});

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-cart]");
  const removeFoodButton = event.target.closest("[data-remove]");
  const removeCartButton = event.target.closest("[data-remove-cart]");
  const cartMinusButton = event.target.closest("[data-cart-minus]");
  const cartPlusButton = event.target.closest("[data-cart-plus]");
  const logoutButton = event.target.closest("[data-logout]");
  const backLoginButton = event.target.closest("[data-back-login]");
  const backStudentButton = event.target.closest("[data-back-student]");

  if (addButton) addToCart(Number(addButton.dataset.addCart));

  if (removeFoodButton) {
    foods = foods.filter((food) => food.id !== Number(removeFoodButton.dataset.remove));
    cart = cart.filter((item) => foods.some((food) => food.id === item.id));
    saveData();
    renderAdminMenu();
    renderStudentMenu();
    renderCart();
  }

  if (removeCartButton) {
    cart = cart.filter((item) => item.id !== Number(removeCartButton.dataset.removeCart));
    renderCart();
  }

  if (cartMinusButton) {
    const item = cart.find((cartItem) => cartItem.id === Number(cartMinusButton.dataset.cartMinus));
    if (item) {
      item.qty -= 1;
      if (item.qty <= 0) cart = cart.filter((cartItem) => cartItem.id !== item.id);
      renderCart();
    }
  }

  if (cartPlusButton) {
    const item = cart.find((cartItem) => cartItem.id === Number(cartPlusButton.dataset.cartPlus));
    const food = foods.find((foodItem) => foodItem.id === Number(cartPlusButton.dataset.cartPlus));
    if (item && food && item.qty < food.quantity) {
      item.qty += 1;
      renderCart();
    }
  }

  if (logoutButton || backLoginButton) {
    loginForm.reset();
    setLoginMode();
    showView("login");
  }

  if (backStudentButton) showView("student");
});

checkoutBtn.addEventListener("click", () => {
  if (!cart.length) return;
  renderPayment();
  showLoader("payment");
});

backToCartBtn.addEventListener("click", () => showView("student"));

confirmPaymentBtn.addEventListener("click", async () => {
  if (!paymentUsername.value.trim()) {
    paymentTokenMessage.textContent = "Please type the user name before payment.";
    paymentTokenMessage.classList.remove("hidden");
    return;
  }
  const phone = paymentPhone.value.trim();
  if (!phone) {
    paymentTokenMessage.textContent = "Please type the phone number before payment.";
    paymentTokenMessage.classList.remove("hidden");
    return;
  }
  if (!isValidPhoneNumber(phone)) {
    paymentTokenMessage.textContent = "Please enter a valid 10-digit mobile number.";
    paymentTokenMessage.classList.remove("hidden");
    return;
  }
  const token = `NGP${Math.floor(1000 + Math.random() * 9000)}`;
  const orderItems = cart.map((item) => {
    const food = foods.find((foodItem) => foodItem.id === item.id);
    return { ...item, category: food?.category || "Other" };
  });
  const order = {
    token,
    customerName: paymentUsername.value.trim(),
    phone,
    paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
    items: orderItems,
    total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
  };
  try {
    await saveOrder(order);
  } catch (error) {
    paymentTokenMessage.textContent = "Order could not be saved. Please try again.";
    paymentTokenMessage.classList.remove("hidden");
    return;
  }
  cart.forEach((cartItem) => {
    const food = foods.find((item) => item.id === cartItem.id);
    if (food) food.quantity = Math.max(0, food.quantity - cartItem.qty);
  });
  saveData();
  renderToken(token, paymentUsername.value.trim(), phone);
  paymentTokenMessage.classList.add("hidden");
  showLoader("token");
  window.setTimeout(openSmsApp, 900);
});

downloadExcelBtn.addEventListener("click", () => {
  window.location.href = "/api/orders/excel";
  analyticsStatus.textContent = "Your Excel order report is downloading.";
  analyticsStatus.classList.remove("hidden");
});

sendSmsBtn.addEventListener("click", openSmsApp);

backToMenuBtn.addEventListener("click", () => {
  cart = [];
  renderStudentMenu();
  renderCart();
  showView("student");
});

async function startApp() {
  await loadDatabaseData();
  renderAdminMenu();
  renderStudentMenu();
  renderCart();
}

startApp();
