import { useState, useRef, useEffect } from "react";
import styles from "./CreateRoomDialog.module.css";
import { socket } from "@/socket.js";
import { useRouter } from "next/navigation";

export default function CreateRoomDialog(props) {
  const router = useRouter();

  const [isPrivate, togglePrivate] = useState(false);
  const [roomNameTaken, setRoomNameTaken] = useState(false);
  const [roomName, setRoomName] = useState("");

  const dialogRef = useRef();

  if (props.isOpen && dialogRef.current) {
    dialogRef.current.showModal(); // imperative DOM method
  }

  function closeDialog() {
    dialogRef.current.close();
    props.onClose(); // notify parent if needed
  }

  function createRoom(event) {
    setRoomNameTaken(false); // room name isn't taken originally - later to be checked if repeat
    event.preventDefault();
    const formData = new FormData(event.target); // event.target is the <form>
    const name = formData.get("roomName");
    setRoomName(name);
    socket.emit("room creation", name);
  }

  useEffect(() => {
    const handleRoomTaken = () => {
      setRoomNameTaken(true)
    }
    const handleSuccessfulRoom = () => {
      console.log("pushing to room", roomName);
      router.push(`/game/${roomName}`);
    }
    socket.on("room name taken", handleRoomTaken);

    socket.on("room made successfully", handleSuccessfulRoom);

    return () => {
      socket.off("room name taken", handleRoomTaken);
      socket.off("room made successfully", handleSuccessfulRoom);
    }
      
  });

  return (
    <dialog ref={dialogRef} className={styles.dialogContainer}>
      <form onSubmit={createRoom}>
        <div className={styles.inputContainer}>
          <label htmlFor="roomName">Room Name</label>
          <input
            type="text"
            name="roomName"
            id="roomName"
            placeholder="room name"
            autoComplete="off"
          />
          {roomNameTaken && (
            <p style={{ color: "rgb(209, 48, 48)", fontStyle: "italic" }}>
              room name taken
            </p>
          )}
        </div>

        <div className={styles.privacyContainer}>
          <label htmlFor="roomName">Private?</label>
          <input
            type="checkbox"
            onChange={(e) => {
              togglePrivate(e.target.checked);
            }}
          />
        </div>
        {isPrivate && (
          <div className={styles.inputContainer}>
            <label htmlFor="roomCode">Room Code</label>
            <input
              type="text"
              name="roomCode"
              id="roomCode"
              placeholder="room code"
              autoComplete="off"
            />
          </div>
        )}
        <div className={styles.buttonsContainer}>
          <button type="submit">Create Room</button>
          <p className={styles.closeButton} onClick={closeDialog}>
            Close
          </p>
        </div>
      </form>
    </dialog>
  );
}
