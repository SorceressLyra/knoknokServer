import { Server } from "socket.io";
import http from "http";
import { getMessaging } from "firebase-admin/messaging";
import { initializeFirebase } from "./config/firebase-config";

const server = http.createServer();
const io = new Server(server);

// Initialize Firebase
initializeFirebase();

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("knock_reply", async (event) => {
    console.log('Echoing knock event:', event);
    console.log('Event type:', typeof event);

    io.emit("knock_reply_broadcast", event);

    try {
      const message = {
        data: { 
          eventData: JSON.stringify(event),
        },
        topic: 'knock_reply'
      };

      const response = await getMessaging().send(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error);
    }

  });

  socket.on("knock", async (event) => {
    console.log('Echoing knock event:', event);
    console.log('Event type:', typeof event);

    io.emit("knock_broadcast", event);

    try {
      const message = {
        data: {
          eventData: JSON.stringify(event),
        },
        topic: 'knock'
      };

      const response = await getMessaging().send(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("user disconnected: ", reason);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});