import styles from "./RoomsList.module.css";
import Room from "./Room.js";
// import rooms from "../../server.js"

export default function RoomsList({ search }) {
  console.log(search);
  return <div className={styles.roomsListContainer}>
    <Room></Room>
  </div>;
}
