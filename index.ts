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
    socket.broadcast.emit("knock_reply_broadcast", event);

    //Firebase Cloud Messaging
    firebaseCM('knock_reply', event);
  });

  socket.on("knock", async (event) => {
    socket.broadcast.emit("knock_broadcast", event);

    //Firebase Cloud Messaging
    firebaseCM('knock', event);
  });

  socket.on("disconnect", (reason) => {
    console.log("user disconnected: ", reason);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
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