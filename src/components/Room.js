import { redirect } from "next/navigation";
import styles from "./Room.module.css";
import { socket } from "@/socket";
import { useEffect } from "react";

export default function Room(props) {

  useEffect(() => {
    socket.on("join room", (status) => {
      if (status == "successful") {
        redirect(`/game/${props.roomName}`);
      } else if (status == "failure") {
        socket.emit("join room error", "room full");
        redirect("/");
      }
    });
  }, [props.roomName]);

  return (
    <div className={styles.roomContainer}>
      <h3>{props.roomName}</h3>
      <button onClick={() => socket.emit("request room join", props.roomName)}>
        Join
      </button>
    </div>
  );
}
