import styles from "./Play.module.css";
import Cards from "./Card";
import { useEffect, useState } from "react";
import { SOLVABLE_SETS } from "@/constants/data";

export default function Play() {
  const [currentCards, setCurrentCards] = useState([]);
  const [answerError, setAnswerError] = useState(null);
  const [gameWon, setgameWon] = useState(false);
  
  const answerRegex = /^[0-9+\-*/]+$/;

  function newCards() {
    const randomIndex = Math.floor(Math.random() * SOLVABLE_SETS.length);
    const randomCardSet = SOLVABLE_SETS[randomIndex];
    setCurrentCards(randomCardSet);
  }

  function checkAnswer(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const answer = formData.get("answer");

    if (!answerRegex.test(answer)) {
      // if answer contains chracters outside of 0-9 and + - / *
      setAnswerError("Invalid Characters");
      return;
    } else {
      newCards();
    }
  }

  useEffect(() => {
    newCards();
  }, []);
  return (
    <div className={styles.playContainer}>
      <div className={styles.cardsContainer}>
        <div className={styles.cardOne}>
          <Cards value={currentCards[0]} />
        </div>
        <div className={styles.cardTwo}>
          <Cards value={currentCards[1]} />
        </div>
        <div className={styles.cardThree}>
          <Cards value={currentCards[2]} />
        </div>
        <div className={styles.cardFour}>
          <Cards value={currentCards[3]} />
        </div>
      </div>

      <form onSubmit={checkAnswer}>
        
        <div className={styles.answerContainer}>
            <input type="text" name="answer" />
          <h3>=</h3>
          <h3>24</h3>
        </div>
        <input type="submit" className={styles.submitButton}/>
      </form>
    </div>
  );
}
