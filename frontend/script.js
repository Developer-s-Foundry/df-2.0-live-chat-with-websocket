  
function toggleForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    const loginDisplay = window.getComputedStyle(loginForm).display;
    const registerDisplay = window.getComputedStyle(registerForm).display;

    loginForm.style.display = loginDisplay === 'none' ? 'block' : 'none';
    registerForm.style.display = registerDisplay === 'none' ? 'block' : 'none';
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    // get form data and handle login
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            alert(error.message || 'Login failed');
        } else {
            window.location.href = '/chat.html';
        }
    } catch (error) {
        console.error('Login error:', error);
    }
    console.log('Login submitted');
});

document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Register submitted');
});
