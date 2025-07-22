import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
// const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOST || "0.0.0.0"; // "0.0.0.0" works for cloud deployments
// const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

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

      console.log(customRooms);

      socket.emit("send rooms", customRooms)
    });

    socket.on("room creation", (roomName) => {
      const rooms = io.sockets.adapter.rooms;
      let customRooms = [];
      let roomSizes = [];
      for (let [roomName, room] of rooms) {
        // If the room name matches a socket ID, skip it
        if (io.sockets.sockets.get(roomName)) continue;

        customRooms.push(roomName);
        roomSizes.push(io.sockets.adapter.rooms.get(roomName).size)
      }


      console.log(customRooms, roomSizes);
      if (customRooms.includes(roomName)) {
        socket.emit("room name taken");
        return;
      } else {
        socket.emit("room made successfully");
      }

      console.log('right before joining')
      socket.join(roomName);
    });

    socket.on("request room full", (slug) => {

        const room = io.sockets.adapter.rooms.get(slug);
        // console.log('room ', room)

        // console.log(room.size);

        let roomFull;
        if (!room) {
            roomFull = null;
        } else if (room.size > 2) { // room size is compared after room has been joined (room.size = 1 during new room, etc.)
            roomFull = true;
        } else if (room.size <= 2) {
            roomFull= false;
        }
        console.log(roomFull);
        socket.emit("receive room full", roomFull)
    })

    socket.on("request room members", (slug) => {
        const room = io.sockets.adapter.rooms.get(slug);
        socket.emit('return room members', Array.from(room));
    })

    socket.on("request room join", (roomName) => {
        console.log('request for room join received');
        const room = io.sockets.adapter.rooms.get(roomName);
        
        if (room && room.size < 2) {
            console.log('join room success');
            socket.join(roomName);
            socket.emit("join room", "successful");
            socket.to(roomName).emit("start game")
        } else {
            console.log('join room failed');
            socket.emit("join room", "failure");
        }
    })

    socket.on("request room leave", (roomName) => {
      socket.leave(roomName);
    })

    socket.on("correct answer", (roomName, userID) => {
        
    })
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
