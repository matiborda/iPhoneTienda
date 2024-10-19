// API URL
const API_URL = 'http://localhost:3000';

let currentUser = null;

// DOM Elements
const content = document.getElementById('content');
const navItems = document.querySelectorAll('nav a');

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.target.id;
        loadPage(page);
    });
});

function loadPage(page) {
    switch(page) {
        case 'home':
            content.innerHTML = '<h2>Welcome to iPhone Store</h2>';
            break;
        case 'login':
            content.innerHTML = `
                <h2>Login</h2>
                <form id="loginForm">
                    <input type="text" id="loginUsername" placeholder="Username" required>
                    <input type="password" id="loginPassword" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
            `;
            document.getElementById('loginForm').addEventListener('submit', login);
            break;
        case 'register':
            content.innerHTML = `
                <h2>Register</h2>
                <form id="registerForm">
                    <input type="text" id="registerUsername" placeholder="Username" required>
                    <input type="email" id="registerEmail" placeholder="Email" required>
                    <input type="password" id="registerPassword" placeholder="Password" required>
                    <button type="submit">Register</button>
                </form>
            `;
            document.getElementById('registerForm').addEventListener('submit', register);
            break;
        case 'store':
            if (!currentUser) {
                content.innerHTML = '<h2>Please login to view the store</h2>';
                return;
            }
            fetchProducts();
            break;
    }
}

async function login(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok) {
            currentUser = data.user;
            alert('Logged in successfully');
            loadPage('store');
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

async function register(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (response.ok) {
            alert('Registered successfully');
            loadPage('login');
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        let productsHTML = products.map(product => `
            <div class="product">
            <img src="${product.image}" alt="${product.name}" class="product-image"> <!-- Asegúrate de que cada producto tenga una propiedad 'image' -->
                <h3>${product.name}</h3>
                <p>Price: $${product.price}</p>
                <button onclick="buyProduct(${product.id})">Buy</button>
            </div>
        `).join('');
        content.innerHTML = `
            <h2>Store</h2>
            ${productsHTML}
        `;
    } catch (error) {
        console.error('Error:', error);
        content.innerHTML = '<h2>Error loading products</h2>';
    }
}

async function buyProduct(productId) {
    if (!currentUser) {
        alert('Please login to make a purchase');
        return;
    }
    try {
        const response = await fetch(`${API_URL}/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: currentUser.id, productId }),
        });
        const data = await response.json();
        if (response.ok) {
            alert('Purchase successful');
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

// Initial page load
loadPage('home');
