'use client';

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import styles from "../game.module.css";
import { socket } from "@/socket.js";

export default function Lose({ params }) {
  const [points, setPoints] = useState(0);

  const { slug } = use(params); // room name

  const router = useRouter();

  useEffect(() => {
    socket.on("get game results", (result, pointsScored) => {
        console.log('results, pointsScored', result, pointsScored)

      if (result == "loss") {
        console.log(`points scored ${pointsScored}`)
        setPoints(pointsScored);
      } else {
        router.push("/");
        socket.emit("send error", "you are not the loser of this room");
      }
    });

    socket.emit("get game results", slug, socket.id);
  }, [router, slug]);

  return (
    <div className={styles.resultContainer}>
      <h1 style={{color: '#F92572', fontStyle: 'italic', fontSize: '3rem'}}>You Lost!</h1>
      <p>You scored: {points} points</p>
      <button onClick={() => {
        socket.emit('request room leave', socket.id);
        router.push('/')
      }}>Return to Menu</button>
    </div>
  );
}