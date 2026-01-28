let agentId;
let token;
let currentUser;
let userId;
let typingTimeout;
let socket;
let otherUser;

window.onload = () => {
  token = localStorage.getItem("token");
  currentUser = localStorage.getItem("username");
  userId = localStorage.getItem("userId");

  if (!token || !currentUser || !userId) {
    window.location.href = "index.html";
    return;
  }

  console.log("Current User:", currentUser);

  agentId = localStorage.getItem("chatWithStr");
  if (!agentId) {
    console.error("No agent selected for chat.");
    window.location.href = "user.html";
    return;
  }
  // Get the message input element
  const messageInput = document.getElementById("message-input");

  // Call handleTyping when user types
  messageInput.addEventListener("input", handleTyping);

  // Also handle Enter key to send message
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendmessage();
    }
  });

  // Update UI with other user's info
  document.getElementById("other-user-name").textContent = agentId.username;

  //connect to socket
  connectToSocket();
  setupMessageLoading();
  //user typing indicators
  socket.on("useris:typing", (data) => {
    if (data.senderId === agentId.id) {
      showTypingIndicator();
    }
  });
  socket.on("userstopped:typing", (data) => {
    if (data.senderId === agentId.id) {
      hideTypingIndicator();
    }
  });

  // send message
  sendmessage();
};

function setupMessageLoading() {
  socket.on("messages:loaded", (data) => {
    console.log("Messages loaded:", data.messages);

    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";

    // Display each message
    data.messages.forEach((message) => {
      const isSent = message.senderId === userId;
      displayMessage(message, isSent);
    });

    // Scroll to bottom after loading all messages
    scrollToBottom();
  });
}

function connectToSocket() {
  socket = io("http://localhost:3000");
  socket.on("connect", () => {
    console.log("Connected to WebSocket server");
    socket.emit("user:connected", { userId, username: currentUser });
  });

  socket.on("receive:message", (data) => {
    console.log("Message received:", data);
    displayMessage(data, false);
  });

  socket.on("message:sent", (data) => {
    console.log("Message sent confirmation:", data);
    // tickOnce();
  });

  // load previous messages
  loadMessages();
}

function displayMessage(data, isSent) {
  const messagesDiv = document.getElementById("messages");

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isSent ? "sent" : "received"}`;

  const time = new Date(data.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  messageDiv.innerHTML = `
            
            ${escapeHtml(data.message)}
            ${time}
            
        `;

  messagesDiv.appendChild(messageDiv);
  scrollToBottom();
}

function scrollToBottom() {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  document.getElementById("typing-user").textContent = otherUser.username;
  indicator.classList.add("show");
  scrollToBottom();
}

function hideTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  indicator.classList.remove("show");
}

function updateUserStatus(isOnline) {
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");

  if (isOnline) {
    statusDot.classList.add("online");
    statusText.textContent = "Online";
  } else {
    statusDot.classList.remove("online");
    statusText.textContent = "Offline";
  }
}

function handleTyping() {
  socket.emit("user:typing", {
    senderId: currentUser.id,
    receiverId: otherUser.id,
  });

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("user:stop-typing", {
      senderId: currentUser.id,
      receiverId: otherUser.id,
    });
  }, 1000);
}

function sendmessage() {
  // get message input when send button is clicked
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");

  sendButton.addEventListener("click", async () => {
    const message = messageInput.value.trim();
    if (!message) return;

    // send message to  server via websocket
    socket.emit("send:message", {
      senderId: userId,
      receiverId: agentId,
      message: message,
    });

    // display sent message in chat window
    displayMessage(
      {
        senderId: userId,
        receiverId: agentId,
        message: message,
        createdAt: new Date(),
      },
      true,
    );

    // clear input field
    messageInput.value = "Type a message...";
  });
}

function loadMessages() {
  if (!socket || !userId || !agentId) {
    console.error("Cannot load messages: missing socket or user data");
    return;
  }

  // Request messages from the server
  socket.emit("load:messages", {
    userId: userId,
    otherUserId: agentId.id || agentId,
  });
}
