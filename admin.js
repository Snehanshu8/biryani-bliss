// Detect if we are on localhost or live server
const API_URL = window.location.hostname === 'localhost' 
    ? "http://localhost:3000" 
    : ""; // Empty string means "use the current domain"

// 1. SECURITY CHECK on Load
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
});

function checkAdminAuth() {
    const adminUser = JSON.parse(localStorage.getItem('adminUser'));
    const overlay = document.getElementById('admin-login-screen');
    
    if (adminUser && adminUser.role === 'Admin') {
        // Authorized: Hide overlay, Show dashboard
        overlay.style.display = 'none';
        document.getElementById('admin-name').innerText = adminUser.name;
        fetchUsers(); // Load data only if authorized
    } else {
        // Unauthorized: Show overlay
        overlay.style.display = 'flex';
    }
}

// 2. HANDLE LOGIN
async function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-pass').value;
    const errorMsg = document.getElementById('login-error');

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success && data.user.role === 'Admin') {
            localStorage.setItem('adminUser', JSON.stringify(data.user));
            checkAdminAuth(); // Unlock
        } else if (data.success) {
            errorMsg.innerText = "🚫 Access Denied: Admins Only.";
            errorMsg.style.display = 'block';
        } else {
            errorMsg.innerText = "Invalid Credentials";
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        console.error(err);
        errorMsg.innerText = "Server Error";
        errorMsg.style.display = 'block';
    }
}

function adminLogout() {
    localStorage.removeItem('adminUser');
    window.location.reload();
}

// 3. FETCH USERS
async function fetchUsers() {
    try {
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();
        renderTable(users);
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

// 4. RENDER TABLE
function renderTable(users) {
    const tbody = document.getElementById('user-list');
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <span class="password-mask" onclick="togglePassword(this, '${user.password || '***'}')" style="cursor:pointer; background:#eee; padding:2px 5px; border-radius:3px;">
                    ••••••
                </span>
            </td>
            <td><span style="padding: 4px 8px; border-radius: 10px; background: ${getRoleColor(user.role)}; color: white; font-size: 0.8rem;">${user.role}</span></td>
            <td>
                <button class="action-btn edit-btn" onclick="editUser(${user.id}, '${user.name}', '${user.email}', '${user.role}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function getRoleColor(role) {
    if (role === 'Admin') return '#e74c3c';
    if (role === 'Chef') return '#f39c12';
    return '#3498db'; // Customer
}

window.togglePassword = function(element, password) {
    if (element.innerText === '••••••') {
        element.innerText = password;
    } else {
        element.innerText = '••••••';
    }
};

// 5. SAVE USER (Update Logic)
async function saveUser() {
    const id = document.getElementById('user-id').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    
    if (!name || !email) return alert("Please fill in all fields");

    const userData = { name, email, role };

    // If we are editing, we keep the old password (handled by backend usually, but we simulate here)
    if (!userData.password) userData.password = "123"; 

    if (id) {
        // UPDATE
        await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
    } else {
        // CREATE
        await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...userData, password: "123" })
        });
    }

    resetForm();
    fetchUsers(); // Refresh table immediately
}

// 6. DELETE USER
async function deleteUser(id) {
    if (confirm("Are you sure you want to delete this user?")) {
        await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
        fetchUsers();
    }
}

// 7. POPULATE FORM
window.editUser = function(id, name, email, role) {
    document.getElementById('form-title').innerText = "Edit User";
    document.getElementById('user-id').value = id;
    document.getElementById('name').value = name;
    document.getElementById('email').value = email;
    document.getElementById('role').value = role;
    
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.resetForm = function() {
    document.getElementById('form-title').innerText = "Add New User";
    document.getElementById('user-id').value = "";
    document.getElementById('name').value = "";
    document.getElementById('email').value = "";
    document.getElementById('role').value = "Customer";
}