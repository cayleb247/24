import styles from "./Play.module.css";
import Cards from "./Card";
import { useEffect, useState, useRef } from "react";
import { SOLVABLE_SETS } from "@/constants/data";
import { evaluate } from "mathjs";
import { useRouter } from "next/navigation";

export default function Play() {
  const router = useRouter();

  const [currentCards, setCurrentCards] = useState([]);
  const [answerError, setAnswerError] = useState(null);
  const [gameWon, setGameWon] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);

  const formRef = useRef();

  const answerRegex = /^[0-9+\-*()/]+$/;

  function haveSameElements(a, b) {
    // console.log("in function", a, b);
    let stringA = a.map((number) => number.toString());
    let stringB = b.map((number) => number.toString());
    // console.log("in function", stringA, stringB);
    const setA = new Set(stringA);
    const setB = new Set(stringB);
    return [...setA].every((elem) => setB.has(elem));
  }

  //   function evaluateLeftRight(numArray, opArray) {
  //     // Evaluates without order of operations using an array of numbers (len four) and an array of operations (len three)
  //     console.log(numArray, opArray);

  //     let expressionOne = numArray[0].concat(opArray[0], numArray[1]);
  //     console.log("expression one", expressionOne);
  //     let expressionTwo = numArray[2].concat(opArray[2], numArray[3]);
  //     console.log("expression two", expressionTwo);
  //     let resultOne = evaluate(expressionOne).toString();
  //     let resultTwo = evaluate(expressionTwo).toString();
  //     let expressionThree = resultOne.concat(opArray[1], resultTwo);

  //     return evaluate(expressionThree);
  //   }

  function newCards() {
    const randomIndex = Math.floor(Math.random() * SOLVABLE_SETS.length);
    const randomCardSet = SOLVABLE_SETS[randomIndex];
    setCurrentCards(randomCardSet);
  }

  function checkAnswer(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const rawAnswer = formData.get("answer"); // answer with parenthesis
    let answer = rawAnswer.replaceAll("(", "").replaceAll(")", "");

    console.log(answer);
    console.log(rawAnswer);

    if (!answerRegex.test(answer)) {
      // if answer contains chracters outside of 0-9 and + - / *
      setAnswerError("Invalid Characters");
      return;
    }

    const numbers = answer.split(/[+\-*/]/);

    if (numbers.length > 4) {
      setAnswerError("Too many numbers");
      return;
    } else if (numbers.length < 4) {
      setAnswerError("Too few numbers");
      return;
    }

    const operations = answer.split(/\d+/).filter(Boolean);

    if (operations.length > 3) {
      setAnswerError("Too many operations");
      return;
    } else if (operations.length < 3) {
      setAnswerError("Not enough operations");
      return;
    }

    console.log(numbers, operations);

    if (!haveSameElements(numbers, currentCards)) {
      setAnswerError("Wrong numbers");
      return;
    }

    console.log("numbers were right!");
    console.log(rawAnswer);

    if (evaluate(rawAnswer) == 24) {
      newCards();
      setCurrentScore(currentScore + 1);
      formRef.current.reset();
    } else {
      setAnswerError("Incorrect Answer");
      return;
    }
  }

  useEffect(() => {
    newCards();
  }, []);

  useEffect(() => {
    if (currentScore == 3) {
      setGameWon(true);
    }
  }, [currentScore]);

  return (
    <div className={styles.playContainer}>
      <div className={styles.playerScore}>
        <h1>{currentScore}</h1>
      </div>
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

      <form onSubmit={checkAnswer} autoComplete="off" ref={formRef}>
        <div className={styles.answerContainer}>
          <input type="text" name="answer" />
          <h3>=</h3>
          <h3>24</h3>
        </div>
        <input type="submit" className={styles.submitButton} />
      </form>
      {gameWon && (
        <div className={styles.gameWon}>
          <h1>You Won!</h1>
          <button onClick={() => router.push('/')}>Return Home</button>
        </div>
      )}
    </div>
  );
}
