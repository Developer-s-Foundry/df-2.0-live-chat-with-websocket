let agentData;
let token;
let currentUser;
let userId;
let typingTimeout;
let socket = null;
let otherUser;



 loadFunction();

function loadFunction () {
  token = sessionStorage.getItem("token");
  currentUser = sessionStorage.getItem("username");
  userId = sessionStorage.getItem("userId");
  agentData = JSON.parse(sessionStorage.getItem("chatWithStr")); 


  console.log(token)
  console.log(currentUser)

  if (!token || !currentUser || !userId) {
    window.location.href = "http://127.0.0.1:5501/DF-2.0-Live-Chat-With-Websocket/frontend/index.html";
    return;
  }

  console.log("Current User:", currentUser);

 
  console.log('agent data' + agentData);
  if (!agentData) {
    console.error("No agent selected for chat.");
    window.location.href = "http://127.0.0.1:5501/DF-2.0-Live-Chat-With-Websocket/frontend/user.html";
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
  document.getElementById("other-user-name").textContent = agentData.username;

  //connect to socket
  connectToSocket();


  // send message
  sendmessage();

  setupMessageLoading();
  //user typing indicators
  socket.on("useris:typing", (data) => {
    if (data.senderId === agentData.id) {
      showTypingIndicator();
    }
  });
  socket.on("userstopped:typing", (data) => {
    if (data.senderId === agentData.id) {
      hideTypingIndicator();
    }
  });

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

  if (socket) return socket

  socket = io("http://localhost:3000");
  socket.on("connect", () => {
    console.log("Connected to WebSocket server");
    socket.emit("user:connected", { userId, username: currentUser });
  });

  socket.on("receive:message", (data) => {
    console.log("Message received:", data);
    displayMessage(data.message, false);
  });

  socket.on("message:sent", (data) => {
    console.log("Message sent confirmation:", data);
    // tickOnce();
  });

  // load previous messages
  loadMessages();
  return socket
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
    senderId: userId,
    receiverId: agentData.id,
  });

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("user:stop-typing", {
      senderId: userId,
    receiverId: agentData.id,
    });
  }, 1000);
}

function sendmessage() {
  // get message input when send button is clicked
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
   console.log('agent data id fire' + agentData.id);

  sendButton.addEventListener("click", async () => {
    const message = messageInput.value.trim();
    if (!message) return;

    // send message to  server via websocket
     console.log('agent data id' + agentData.id);
    socket.emit("send:message", {
      senderId: userId,
      receiverId: agentData.id,
      message: message,
    });

    // display sent message in chat window
    displayMessage(
      {
        senderId: userId,
        receiverId: agentData.id,
        message: message,
        createdAt: new Date(),
      },
      true,
    );

    // clear input field
    messageInput.value = "";
  });
}

function loadMessages() {
  if (!socket || !userId || !agentData) {
    console.error("Cannot load messages: missing socket or user data");
    return;
  }

  // Request messages from the server
  socket.emit("load:messages", {
    userId: userId,
    recieverId: agentData.id,
  });
}
