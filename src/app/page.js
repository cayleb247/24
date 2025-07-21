"use client";

import { useEffect, useState } from "react";
import { socket } from "../socket";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (socket.connected) {
      socket.on("receive error", (error) => {
        setErrorMessage(error);
      })
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.homeContainer}>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>24</h1>
          <h3 className={styles.subtitle}>Fast Paced Race to Make 24!</h3>
        </div>

        <div className={styles.homeButtons} onClick={() => router.push("/rooms")}>
          <button>Play</button>
        </div>
      </div>
      {errorMessage && <div>{errorMessage}</div>}
    </div>
  );
}
