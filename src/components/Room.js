import styles from './Room.module.css'


export default function Room(props) {


  return (
    <div className={styles.roomContainer}>
        <h3>{props.roomName}</h3>
    </div>
  );
}
