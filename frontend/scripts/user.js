
    const API_URL = 'http://localhost:3000/api';
    const SOCKET_URL = 'http://localhost:3000';
    
    let socket;
    let currentUser;
    let allUsers = [];
    let userId

    // Initialize
    window.onload = async () => {
      // Check authentication
      const token = localStorage.getItem('token');
      currentUser = localStorage.getItem('username');
      userId = localStorage.getItem('userId');


      if (!token || !currentUser) {
        window.location.href = 'index.html';
        return;
      }

      
      // Display current user
      document.getElementById('current-user-name').textContent = currentUser;
      document.getElementById('current-user-avatar').textContent = 
        currentUser.charAt(0).toUpperCase();

      // Connect to Socket.io for real-time status
      connectSocket();

      // Load users
      await loadUsers();
    };

    function connectSocket() {
      socket = io(SOCKET_URL);

      socket.on('connect', () => {
        socket.emit('user:connected',{
          'username': currentUser,
          'userId': userId
        });
      });

      // Listen for user status changes
      socket.on('user:is-online', (userData) => {
        updateUserStatus(userData.userId, true);
      });

      socket.on('user:is-offline', (userData) => {
        updateUserStatus(userData.userId, false);
      });

      // Listen for new messages (to show unread count)
      // socket.on('receive-message', (data) => {
      //   updateUnreadCount(data.senderId);
      // });
    }


    async function loadUsers() {

      try {
        const response = await fetch(`${API_URL}/users/get-all-users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          method: 'GET'
        });

        const data = await response.json();
        
        if (response.ok) {
          // Filter out current user
          displayUsers(data.allUsers);
        } else {
          showError('Failed to load users');
        }
      } catch (error) {
        console.error('Error loading users:', error);
        showError('Network error. Please try again.');
      }
    }

    function displayUsers(users) {
      const usersList = document.getElementById('users-list');

      if (users.length === 0) {
        usersList.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">👥</div>
            <p>No users found</p>
          </div>
        `;
        return;
      }

      usersList.innerHTML = users.map(user => `
        <div class="user-item " onclick="openChat('${user.id}', '${escapeHtml(user.username)}')">
          <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
          <div class="user-info">
            <div class="user-name">
              ${escapeHtml(user.username)}
              <span class="role-badge ${user.role}">${user.role}</span>
            </div>
            <div class="user-email">${escapeHtml(user.email)}</div>
          </div>
          <div class="user-status">
            <div class="status-dot ${user.isOnline ? 'online' : ''}" id="status-${user._id}"></div>
            <span class="status-text ${user.isOnline ? 'online' : ''}" id="status-text-${user._id}">
              ${user.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      `).join('\n');
    }

    function filterUsers() {
      const searchTerm = document.getElementById('search-input').value.toLowerCase();
      
      const filteredUsers = allUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );

      displayUsers(filteredUsers);
    }

    function updateUserStatus(userId, isOnline) {
      const statusDot = document.getElementById(`status-${userId}`);
      const statusText = document.getElementById(`status-text-${userId}`);

      if (statusDot && statusText) {
        if (isOnline) {
          statusDot.classList.add('online');
          statusText.classList.add('online');
          statusText.textContent = 'Online';
        } else {
          statusDot.classList.remove('online');
          statusText.classList.remove('online');
          statusText.textContent = 'Offline';
        }
      }

      // Update in allUsers array
      const userIndex = allUsers.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        allUsers[userIndex].isOnline = isOnline;
      }
    }

    // function updateUnreadCount(senderId) {
    //   // This would typically fetch from backend
    //   // For now, just increment visually
    //   console.log('New message from:', senderId);
    // }

    function openChat(userId, username) {
      // Store selected user in localStorage
      localStorage.setItem('chatWithStr', JSON.stringify({
        id: userId,
        username: username
      }));

      // Navigate to chat page
      window.location.href = `chat.html?userId=${userId}`;
    }

    function showError(message) {
      const usersList = document.getElementById('users-list');
      usersList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <p>${message}</p>
        </div>
      `;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function logout() {
      if (socket) {
        socket.disconnect();
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('chatWith');
      window.location.href = 'login.html';
    }
