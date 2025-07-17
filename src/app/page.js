"use client";

import { useEffect, useState } from "react";
import { socket } from "../socket";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
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
    </div>
  );
}
