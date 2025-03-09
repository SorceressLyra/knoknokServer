import { Server } from "socket.io";
import http from "http";
import { getMessaging } from "firebase-admin/messaging";
import { initializeFirebase } from "./config/firebase-config";
import type { ConnectionUser } from "./ConnectionUser";
import path from "path";
import fs from "fs";

const server = http.createServer();
const io = new Server(server, {
  pingTimeout: 60000,
  pingInterval: 25000, 
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// Set up static file serving for HTTP connections

// Basic HTML response for HTTP connections
const staticHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KnoKnok Server</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    h1 {
      color: #2c3e50;
    }
    .status {
      padding: 10px;
      background-color: #e6f7e6;
      border-left: 4px solid #28a745;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Knoknok Server</h1>
    <div class="status">
      <p>✅ Server is running</p>
      <p>Socket.IO is available for WebSocket connections</p>
    </div>
    <p>This is the Knoknok server that handles real-time communication between users.</p>
    <p>Current time: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
`;

// Handle HTTP requests
server.on("request", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.writeHead(200);
  res.end(staticHtml);
});

// Initialize Firebase
initializeFirebase();

let connectedUsers: ConnectionUser[] = [];

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("register", (user: ConnectionUser) => {
    console.log("register event received: ", user);
    connectedUsers.push(user);

    io.emit("connected_users", connectedUsers);
  });

  socket.on("knock_send", async (event) => {
    console.log("knock event received: ", event);

    if (event.isReply) {
      socket.broadcast.emit(`knock_${event.sender}`, event);
    }
    else if (event.receiver === 'BROADCAST_ALL') {
      socket.broadcast.emit("knock", event);
    }
    else {
      const receiver = connectedUsers.find((user) => user.name === event.receiver);
      if (receiver) {
        socket.to(receiver.id).emit("knock", event);
      }
    }


    //Firebase Cloud Messaging
    await firebaseCM('knock', event);
  });

  socket.on("disconnect", (reason) => {
    connectedUsers = connectedUsers.filter((user) => user.id !== socket.id);
    console.log(`${socket.id} user disconnected: `, reason);
  });
});

// Read port from package.json or default to 3000
const packageJsonPath = path.join(process.cwd(), 'package.json');
let port = 3000;
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  port = packageJson.port || port;
} catch (error) {
  console.warn('Could not read port from package.json, using default port 3000');
}

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});


async function firebaseCM(topic: string, event: any) {
  try {
    const message = {
      data: {
        eventData: JSON.stringify(event),
      },
      topic: topic
    };

    const response = await getMessaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}