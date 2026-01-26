  
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
        const response = await fetch('http://localhost:3000/users/login', {
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

document.getElementById('register-form').addEventListener('submit', async(e) => {
    e.preventDefault();
    // get form data and handle registration
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = fetch('http://localhost:3000/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            alert(error.message || 'Registration failed');
        } else {
            alert('Registration successful! Please log in.');
            toggleForms();
        }
    } catch (error) {
        console.error('Registration error:', error);
    }

    console.log('Register submitted');
});

let agentId;

window.onload = () => {
    // get the id of user from local storage
  const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = '/index.html';
        return
    }

    //connect to socket
    connectToSocket()

    // findAvalableAgent()
    findAvalableAgent()

    // load previous messages
    loadMessages();


    // send message
    sendmessage()


    function connectToSocket() {
        const socket = io('http://localhost:3000');

        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
             socket.emit('user:connected', (userId) => {
            console.log(`User connected: ${userId}`);
        });
        });
       
        socket.on('receive:message', (data) => {
            console.log('Message received:', data);
            displayMessage(data);
        })

        socket.on('message:sent', (data) => { 
            console.log('Message sent confirmation:', data);
            tickOnce();
        })

        socket.emit('typing', (recieverId) => {
            console.log('Typing indicator received:', recieverId);
            showTypingIndicator(recieverId);
        })
            }
    

    function displayMessage(data, isSent) {
        const messagesDiv = document.getElementById('chat-messages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
        
        const time = new Date(data.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.innerHTML = `
            
            ${escapeHtml(data.message)}
            ${time}
            
        `;

        messagesDiv.appendChild(messageDiv);
        scrollToBottom();
        }

        function scrollToBottom() {
        const messagesDiv = document.getElementById('messages');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
        }

        function showTypingIndicator(recieverId) {
        const input = document.getElementById('message-input');
        input.placeholder = `${recieverId} is typing...`;

        setTimeout(() => {
            input.placeholder = 'Type a message...';
        }, 2000);        
    }

      async function findAvalableAgent() {
        // Placeholder function to find an available agent
        console.log('Finding available agent...');
        // fetch any user with agent role from the server
        try {
            const response = await fetch('http://localhost:3000/users/role/agent', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const error = await response.json();
                console.error('Error finding agent:', error);
            }
            const agent = await response.json();
                agentId = agent._id;
                console.log('Available agent found:', agent);
        } catch (error) {
            console.error('Error finding agent:', error);
        } 
        
    }
  
}

