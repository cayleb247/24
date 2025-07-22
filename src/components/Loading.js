import styles from "./Loading.module.css";
import { useRouter } from "next/navigation";
import { socket } from "@/socket";

export default function Loading(props) {
  const router = useRouter();

  function leaveRoom() {
    socket.emit("leave room", props.roomName)
    router.push('/')
  }

  return (
    <div className={styles.loadingContainer}>
      <h1>Waiting for Opponent</h1>
      <p>Current Room: {props.roomName}</p>
      <div className={styles.loader}></div>
      <button className={styles.button} onClick={leaveRoom}>Leave Room</button>
    </div>
  );
}
