import { redirect } from 'next/navigation';
import styles from './Room.module.css'

function joinRoom(roomName) {
    redirect('/play')
}


export default function Room(props) {


  return (
    <div className={styles.roomContainer}>
        <h3>{props.roomName}</h3>
        <button>Join</button>
    </div>
  );
}
