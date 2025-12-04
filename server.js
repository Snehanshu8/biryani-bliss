const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); // NEW: Required for serving HTML

const app = express();
const PORT = process.env.PORT || 3000; // NEW: Uses Render's port or 3000

app.use(cors());
app.use(bodyParser.json());

// NEW: Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname))); 

// --- FAKE DATABASE ---
let users = [
    { id: 1, name: "Snehanshu", email: "admin@vibe.com", role: "Admin", password: "admin" },
    { id: 2, name: "Biryani Lover", email: "lover@food.com", role: "Customer", password: "123" }
];

// --- ROUTES ---

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        const { password, ...userWithoutPassword } = user; 
        res.json({ success: true, user: userWithoutPassword });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Signup
app.post('/signup', (req, res) => {
    const { name, email, password, role } = req.body;
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: "User exists" });
    }
    const newUser = {
        id: Date.now(),
        name,
        email,
        password, // In real app, hash this!
        role: role || "Customer" 
    };
    users.push(newUser);
    const { password: pwd, ...userWithoutPassword } = newUser;
    res.json({ success: true, user: userWithoutPassword });
});

// API: Get Users
app.get('/users', (req, res) => {
    res.json(users);
});

// API: Update User
app.put('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users[index] = { ...users[index], ...req.body };
        res.json(users[index]);
    } else {
        res.status(404).json({ message: "Not found" });
    }
});

// API: Delete User
app.delete('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    users = users.filter(u => u.id !== id);
    res.json({ message: "Deleted", id });
});

// NEW: Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🔥 Vibe Server running on port ${PORT}`);
});