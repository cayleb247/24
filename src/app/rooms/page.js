"use client";

import styles from "./rooms.module.css";

export default function Rooms() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Find a Room</h1>

      <div className={styles.roomsContainer}>
        <form action="">
          <input type="text" placeholder="search rooms" />
        </form>
        <div className={styles.roomsList}></div>
      </div>
    </div>
  );
}
