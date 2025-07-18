import styles from './CreateRoomButton.module.css'


export default function CreateRoomButton() {
  function createRoom() {
    
  }


  return (
    <button className={styles.createRoomButton} onClick={createRoom}>
        Create Room
    </button>
  );
}
