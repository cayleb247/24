"use client";

import { useState } from "react";
import styles from "./rooms.module.css";
import RoomsList from "@/components/RoomsList";

export default function Rooms() {
  const [search, setSearch] = useState(null);
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Find a Room</h1>

      <div className={styles.roomsContainer}>
        <input
          type="text"
          placeholder="search rooms"
          name="search"
          onChange={(e) => {
            setSearch(e.target.value)
            console.log(search);
        }
        }
        />
        <RoomsList></RoomsList>
      </div>
    </div>
  );
}
