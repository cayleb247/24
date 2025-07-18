import styles from "./RoomsList.module.css";
import Room from "./Room.js";
import { socket } from "@/socket.js"
import { useEffect } from "react";
// import rooms from "../../server.js"

export default function RoomsList({ search }) {
    useEffect(() => {
    console.log("Connected to sdawadocket:", socket.id); // might be undefined immediately
  }, []);
  return <div className={styles.roomsListContainer}>
    <Room></Room>
    <Room></Room>
  </div>;
}
