// import { baseUrl } from "./baseUrl.js";

// console.log(baseUrl)

const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const closeBtn = document.querySelector('.close');

function showModal(message) {
    modalMessage.textContent = message;
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

closeBtn.onclick = closeModal;
window.onclick = (event) => {
    if (event.target === modal) {
        closeModal();
    }
};

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Handle Login
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Validation
        if (!validateEmail(email)) {
            showModal('Please enter a valid email address');
            return;
        }

        if (!validatePassword(password)) {
            showModal('Password must be at least 6 characters long');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/users');
            const users = await response.json();
            
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                showModal('Login successful!');
                if (user.role === 'admin') {
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 1500);
                } else {
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                }
            } else {
                showModal('Invalid email or password');
            }
        } catch (error) {
            showModal('Error connecting to server');
        }
    });
}

if (document.getElementById('signupForm')) {
    const signupForm = document.getElementById('signupForm');
    
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (name.trim().length < 2) {
            showModal('Name must be at least 2 characters long');
            return;
        }

        if (!validateEmail(email)) {
            showModal('Please enter a valid email address');
            return;
        }

        if (!validatePassword(password)) {
            showModal('Password must be at least 6 characters long');
            return;
        }

        try {
            const checkResponse = await fetch('http://localhost:3000/users');
            const existingUsers = await checkResponse.json();
            
            if (existingUsers.some(user => user.email === email)) {
                showModal('Email already exists');
                return;
            }

            const response = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role:'user'
                }),
            });

            if (response.ok) {
                showModal('Sign up successful! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                showModal('Error creating account');
            }
        } catch (error) {
            showModal('Error connecting to server');
        }
    });
}