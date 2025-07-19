import styles from "./Loading.module.css";


export default function Loading() {

  return (
    <div className={styles.loadingContainer}>
      <h1>Waiting for Opponent</h1>
      <span className={styles.loader}></span>
      <button className={styles.button}>Leave Room</button>
    </div>
  );
}
