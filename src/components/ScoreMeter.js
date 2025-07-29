import styles from "./ScoreMeter.module.css";

export default function ScoreMeter(props) {
    const opponentScore = props.opponentScore;
    const playerScore = props.playerScore;

    return (
        <div className={styles.scoreMeterContainer}>
            <div className={styles.playerScore} style={{width: `${(playerScore/20)*100}%`}}></div>
            <div className={styles.opponentScore} style={{width: `${(opponentScore/20)*100}%`}}></div>
        </div>
    )

}