import styles from "./Card.module.css"

export default function Cards(props) {
    return (
        <div className={styles.cardsContainer}>
            <h1>{props.value}</h1>
        </div>
    )

}