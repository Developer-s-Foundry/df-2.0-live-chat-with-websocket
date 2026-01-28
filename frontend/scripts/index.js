function toggleForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    const loginDisplay = window.getComputedStyle(loginForm).display;
    const registerDisplay = window.getComputedStyle(registerForm).display;

    loginForm.style.display = loginDisplay === 'none' ? 'block' : 'none';
    registerForm.style.display = registerDisplay === 'none' ? 'block' : 'none';
    }


window.onload = () => {

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    // get form data and handle login
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            alert(error.message || 'Login failed');
            return;
        }
        
        const data = await response.json();
        console.log(data.username + " has Login successful:");
        // clear the form
        document.getElementById('login-form').reset();
        // const container = document.getElementById("container");

        // // create paragraph
        // const paragraph = document.createElement("p");
        // paragraph.textContent = `Welcome, ${data.username}!`;

        // // append inside the div (after existing elements)
        // container.appendChild(paragraph);

        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('userId', data.userId);
        window.location.href = '/user.html';
        
    } catch (error) {
        console.error('Login error:', error);
    }
    console.log('Login submitted');
});

document.getElementById('register-form').addEventListener('submit', async(e) => {
    e.preventDefault();
    // get form data and handle registration
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const username = document.getElementById('register-username').value;

    // extra validation on email and password
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    try {
        const response = fetch('http://localhost:3000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, username })
        });
        if (!response.ok) {
            const error = await response.json();
            alert(error.message || 'Registration failed');
        } else {
            alert('Registration successful! Please log in.');
            // clear form
            document.getElementById('register-form').reset();
            toggleForms();
        }
    } catch (error) {
        console.error('Registration error:', error);
    }

    console.log('Register submitted');
});
}
 

