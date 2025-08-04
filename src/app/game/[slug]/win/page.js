"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import styles from "../game.module.css";
import { socket } from "@/socket.js";

export default function Win({ params }) {
  const [points, setPoints] = useState(0);

  const { slug } = use(params); // room name

  const router = useRouter();

  useEffect(() => {
    socket.on("get game results", (result, pointsScored) => {
      console.log(result); // logs 'loss' for some reason
      if (result == "win") {
        setPoints(pointsScored);
        console.log(`points scored ${pointsScored}`);
      } else {
        router.push("/");
        socket.emit("send error", "you are not the winner of this room");
      }
    });

    socket.emit("get game results", slug, socket.id);
  }, [router, slug]);

  return (
    <div className={styles.resultContainer}>
      <h1 style={{ color: "gold", fontStyle: "italic", fontSize: "3rem" }}>
        You Win!
      </h1>
      <p>You scored: {points} points</p>
      <button
        onClick={() => {
          socket.emit("request room leave", socket.id);
          router.push("/");
        }}
      >
        Return to Menu
      </button>
    </div>
  );
}
