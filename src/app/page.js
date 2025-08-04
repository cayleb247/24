"use client";

import { useEffect, useState } from "react";
import { socket } from "../socket";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    setErrorMessage(null);

    const handleErrorMessage = (error) => {
      setErrorMessage(error);
      console.log("current error", error);
    };
    socket.on("request error", handleErrorMessage);

    socket.emit("request error");

    console.log("about to leave all rooms");
    socket.emit("leave all rooms");

    return () => {
      socket.off("request error", handleErrorMessage);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.homeContainer}>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>24</h1>
          <h3 className={styles.subtitle}>Fast Paced Race to Make 24!</h3>
        </div>

        <div
          className={styles.homeButtons}
          onClick={() => router.push("/rooms")}
        >
          <button>Play</button>
        </div>
      </div>
      {errorMessage && <div className={styles.errorMessage}>Oops! {errorMessage}</div>}
    </div>
  );
}
