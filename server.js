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

      socket.join(roomName);
      roomsMeta.set(roomName, {host: socket.id, guest: null, ready: []});
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

            const roomMeta = roomsMeta.get(roomName); // Assign meta data
            roomMeta.guest = socket.id;

        } else {
            console.log('join room failed');
            socket.emit("join room", "failure");
        }
    })

    socket.on("request room leave", (roomName) => {
      socket.leave(roomName);

      // Meta information

      const roomMeta = roomsMeta.get(roomName);
      
      if (roomMeta.host == socket.id) {
        roomMeta.host = roomMeta.guest; // make the guest the new host
        roomMeta.guest = null;
      }
      if (roomMeta.guest == socket.id) roomMeta.guest=null;
      
      if (!roomMeta.guest && !roomMeta.host) { // delete room if both players aren't in it
        roomsMeta.delete(roomName);
      }

    });

    socket.on("get game role", (roomName) => {
      const roomMeta = roomsMeta.get(roomName);

      if (roomMeta.host == socket.id) {
        socket.emit("receive game role", "host")
      } else if (roomMeta.guest == socket.id) {
        socket.emit("receive game role", "guest")
      }
      
    })

    socket.on("player ready", (roomName) => {
      const room = roomsMeta.get(roomName);

      room.ready.push(socket.id);

      if (room.ready.length == 2) {
        socket.to(roomName).emit("both players ready");
      }
    })

    socket.on("send current cards", (cardList, roomName) => {
      socket.to(roomName).emit("receive current cards", cardList);
    })

    socket.on("correct answer", (roomName, userID) => {
        
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
