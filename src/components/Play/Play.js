import styles from "./Play.module.css";
import Cards from "./Card";
import { useEffect, useState, useRef } from "react";
import { SOLVABLE_SETS } from "@/constants/data";
import { evaluate } from "mathjs";
import { useRouter } from "next/navigation";
import { socket } from "@/socket";

export default function Play(props) {
  const router = useRouter();

  const [currentCards, setCurrentCards] = useState([]);
  const [answerError, setAnswerError] = useState(null);
  const [gameWon, setGameWon] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [gameRole, setGameRole] = useState(null); // whether you're the host or the guest
  const [playersReady, setPlayersReady] = useState(false); // state to ensure both players are ready before setting up sockets

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

  function sendCards() {
    console.log('sending cards');
    const randomIndex = Math.floor(Math.random() * SOLVABLE_SETS.length);
    const randomCardSet = SOLVABLE_SETS[randomIndex];
    console.log("new cards", randomCardSet);

    setCurrentCards(randomCardSet);
    socket.emit("send current cards", randomCardSet, props.roomName);
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
      console.log(numbers);
      setAnswerError("Too few numbers");
      return;
    } else {
      setAnswerError(null);
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
      sendCards();
      setCurrentScore(currentScore + 1);
      formRef.current.reset();
      setAnswerError(null);
    } else {
      setAnswerError("Incorrect Answer");
      return;
    }
  }

  useEffect(() => {
    socket.on("receive game role", (role) => {
      setGameRole(role);
    });
    socket.emit("get game role", props.roomName);
  }, []);

  useEffect(() => {
    console.log('receiving current cards!');
    socket.on("receive current cards", (cardList) => {
      console.log("cards received!");
      setCurrentCards(cardList);
    });

    socket.on("both players ready", () => {
      setPlayersReady(true);
    })

    socket.emit("player ready", props.roomName) // verify both players are ready

    return () => {
      socket.off("receive current cards");
    };
  }, []);

  useEffect(() => {
    if (gameRole === "host") {
      sendCards();
    }
  }, [playersReady]);

  useEffect(() => { // win condition
    if (currentScore == 10) {
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
          <input type="text" name="answer" autoComplete="off" />
          <h3>=</h3>
          <h3>24</h3>
        </div>
        {answerError && <p style={{color: "rgb(209, 48, 48)", fontStyle: "italic"}}>{answerError}</p>}
        <input type="submit" className={styles.submitButton} />
      </form>
      {gameWon && (
        <div className={styles.gameWon}>
          <h1>You Won!</h1>
          <button onClick={() => router.push("/")}>Return Home</button>
        </div>
      )}
    </div>
  );
}
