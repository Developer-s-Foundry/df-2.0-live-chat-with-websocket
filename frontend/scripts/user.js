//  console.trace("SCRIPT LOADED", location.pathname);

  const API_URL = 'http://localhost:3000/api';
  const SOCKET_URL = 'http://localhost:3000';

  let socket = null;
  let currentUser;
  let allUsers = [];
  let userId
  

     // Check authentication
      const token = sessionStorage.getItem('token');
      currentUser = sessionStorage.getItem('username');
      userId = sessionStorage.getItem('userId');

  // await loadJs();


  async function connectSocket() {

      socket = io(SOCKET_URL)

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
        console.log(`${API_URL}/users/get-all-users/${userId}`)
        const response = await fetch(`${API_URL}/users/get-all-users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          },
          method: 'GET'
        });

        
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          console.log(`response is good`)
          allUsers.push(...data)
          displayUsers(data);
        } else {
          showError('Failed to load users');
        }
      } catch (error) {
        console.error('Error loading users:', error);
        showError('Network error. Please try again.');
      }
    }

    function displayEmptyStateOfUser() {
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>No users yet</h3>
        <p>Be the first to invite someone to chat!</p>
        <button onclick="window.location.href='invite.html'">
          Invite Users
        </button>
      </div>
    `;
    }

    function displayUsers(users) {
      const usersList = document.getElementById('users-list');

      usersList.innerHTML = users.map(user => `
        <div class="user-item " onclick="openChat('${user._id}', '${escapeHtml(user.username)}')">
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
       
      console.log(searchTerm)
      console.log (allUsers)
      const filteredUsers = allUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
      displayUsers(filteredUsers);
       if (searchTerm === '') {
         displayUsers(allUsers); // SHOW ALL
        return;
      }
      
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
      // Store selected user in sessionStorage
      sessionStorage.setItem('chatWithStr', JSON.stringify({
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
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('chatWith');
      window.location.href = 'login.html';
    }



    async function loadJs () {
   

      // if (!token || !currentUser) {
      //   window.location.href = 'http://127.0.0.1:5501/DF-2.0-Live-Chat-With-Websocket/frontend/index.html';
      //   return;
      // }

      
      // Display current user
      document.getElementById('current-user-name').textContent = currentUser;
      document.getElementById('current-user-avatar').textContent = 
        currentUser.charAt(0).toUpperCase();

      // Connect to Socket.io for real-time status
      await connectSocket();

      // Load users
      // await loadUsers();
    
    }

    
      // all usable functions
    