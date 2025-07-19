import styles from "./RoomsList.module.css";
import Room from "./Room.js";
import { socket } from "@/socket.js";
import { useEffect, useState } from "react";

export default function RoomsList(props) {
  const [search, setSearch] = useState(props.search);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    socket.emit("request rooms");
    const handleRooms = (rooms) => {
      console.log("Received rooms:", rooms);
      setRooms(rooms);
    };

    socket.on("send rooms", handleRooms);

    return () => {
      socket.off("send rooms", handleRooms);
    };
  }, []); // Only run once on mount

  const filtered = rooms.filter((roomName) =>
    roomName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.roomsListContainer}>
      <p onClick={() => socket.emit("request rooms")}>refresh</p>
      {filtered.map((room) => (
        <Room key={room} roomName={room} />
      ))}
    </div>
  );
}
