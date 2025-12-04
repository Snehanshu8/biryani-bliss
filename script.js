// Detect if we are on localhost or live server
const API_URL = window.location.hostname === 'localhost' 
    ? "http://localhost:3000" 
    : ""; // Empty string means "use the current domain"

document.addEventListener('DOMContentLoaded', () => {
    checkGatekeeper(); // 🔒 Run the check immediately
    renderMenu();
    
    // Modal Close Logic
    window.onclick = (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    };
});

// --- 🔒 THE GATEKEEPER ---
function checkGatekeeper() {
    const landingScreen = document.getElementById('landing-screen');
    
    if (currentUser) {
        // User is logged in: Allow access
        landingScreen.classList.add('hidden');
        updateAuthUI();
    } else {
        // Guest: Block access
        landingScreen.classList.remove('hidden');
    }
}

// --- AUTHENTICATION ---

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            closeModal('login-modal');
            checkGatekeeper(); // 🔓 Unlock the gates
            
            alert(`Welcome back, ${currentUser.name}! 🍛`);
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert("Server error. Make sure backend is running!");
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            closeModal('signup-modal');
            checkGatekeeper(); // 🔓 Unlock the gates
            
            alert(`Account created! Welcome, ${currentUser.name}.`);
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("Signup failed. Check server.");
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    window.location.reload(); // Reloads the page, which triggers the Gatekeeper again
}

function updateAuthUI() {
    const guestNav = document.getElementById('guest-nav');
    const userNav = document.getElementById('user-nav');
    const userNameDisplay = document.getElementById('user-name-display');

    // Even if we are inside, we update the nav
    if (currentUser) {
        guestNav.classList.add('hidden');
        userNav.classList.remove('hidden');
        userNameDisplay.innerText = currentUser.name;
    }
}

// --- MODAL HELPERS ---
window.openModal = (id) => document.getElementById(id).classList.remove('hidden');
window.closeModal = (id) => document.getElementById(id).classList.add('hidden');
window.switchModal = (closeId, openId) => {
    closeModal(closeId);
    openModal(openId);
};

// --- MENU & CART ---
const menuItems = [
    { id: 1, name: "Hyderabadi Chicken Dum", price: 1600, desc: "Slow-cooked with saffron.", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
    { id: 2, name: "Kolkata Mutton Biryani", price: 1850, desc: "Classic recipe with potato.", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
    { id: 3, name: "Vegetable Paneer Special", price: 1350, desc: "Loaded with fresh veggies.", image: "https://images.unsplash.com/photo-1642821373181-696a5462e445?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
    { id: 4, name: "Egg Biryani", price: 1200, desc: "Spicy masala rice with eggs.", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }
];
let cart = [];

function renderMenu() {
    const container = document.getElementById('menu-container');
    if(!container) return;
    container.innerHTML = menuItems.map(item => `
        <div class="card">
            <img src="${item.image}" alt="${item.name}">
            <div class="card-content">
                <h3>${item.name}</h3>
                <p>${item.desc}</p>
                <span class="price">¥${item.price.toLocaleString()}</span>
                <button class="add-btn" onclick="addToCart(${item.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

window.addToCart = function(id) {
    const item = menuItems.find(i => i.id === id);
    cart.push({ ...item, uniqueId: Date.now() + Math.random() });
    updateCartUI();
}

window.removeFromCart = function(uid) {
    cart = cart.filter(i => i.uniqueId !== uid);
    updateCartUI();
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const total = cart.reduce((sum, i) => sum + i.price, 0);
    document.getElementById('total-price').innerText = "¥" + total.toLocaleString();
    
    const list = document.getElementById('cart-items');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const checkoutBtn = document.getElementById('checkout-btn');

    if(cart.length === 0) {
        list.innerHTML = '';
        emptyMsg.style.display = 'block';
        checkoutBtn.style.display = 'none';
    } else {
        emptyMsg.style.display = 'none';
        checkoutBtn.style.display = 'block';
        list.innerHTML = cart.map(i => `
            <li class="cart-item">
                <span>${i.name}</span>
                <div>
                    <strong>¥${i.price.toLocaleString()}</strong>
                    <button class="delete-btn" onclick="removeFromCart(${i.uniqueId})">Remove</button>
                </div>
            </li>
        `).join('');
    }
}

// Logic for Dark Mode
const themeToggle = document.getElementById('theme-toggle');
const cartBtn = document.getElementById('cart-btn');
const body = document.body;

if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        themeToggle.textContent = body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });
}
if(cartBtn) cartBtn.onclick = () => openModal('cart-modal');

window.scrollToMenu = () => document.getElementById('menu').scrollIntoView({behavior:'smooth'});