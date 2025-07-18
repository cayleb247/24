"use client";

import { useState, useEffect } from "react";
import styles from "./rooms.module.css";
import RoomsList from "@/components/RoomsList";
import CreateRoomDialog from "@/components/CreateRoomDialog";
import { socket } from "@/socket.js"

export default function Rooms() {
  const [search, setSearch] = useState(null);
  const [dialogOpen, toggleDialog] = useState(false);

  useEffect(() => {
    console.log("Connected to socket:", socket.id); // might be undefined immediately
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Find a Room</h1>

      <div className={styles.roomsContainer}>
        <input
          type="text"
          placeholder="search rooms"
          name="search"
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <RoomsList search={search}></RoomsList>
        <button onClick={() => toggleDialog(true)} className={styles.createRoomButton}>Create Room</button>
      </div>
      <CreateRoomDialog isOpen={dialogOpen} onClose={() => toggleDialog(false)} />

    </div>
  );
}
