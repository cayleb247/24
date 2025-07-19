import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const roomsMeta = new Map();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("request rooms", () => {
      const rooms = io.sockets.adapter.rooms;
      let customRooms = [];
      for (let [roomName, room] of rooms) {
        // If the room name matches a socket ID, skip it
        if (io.sockets.sockets.get(roomName)) continue;

        customRooms.push(roomName);
      }

      socket.emit("send rooms", customRooms)
    });

    socket.on("room creation", (roomName) => {
      const rooms = io.sockets.adapter.rooms;
      let customRooms = [];
      for (let [roomName, room] of rooms) {
        // If the room name matches a socket ID, skip it
        if (io.sockets.sockets.get(roomName)) continue;

        customRooms.push(roomName);
      }

      console.log(customRooms);
      if (customRooms.includes(roomName)) {
        socket.emit("room name taken");
        return;
      } else {
        socket.emit("room made successfully");
      }

      socket.join(roomName);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
