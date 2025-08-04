import styles from "./Play.module.css";
import Cards from "./Card";
import { useEffect, useState, useRef } from "react";
import { SOLVABLE_SETS } from "@/constants/data";
import { evaluate } from "mathjs";
import { useRouter } from "next/navigation";
import { socket } from "@/socket";
import ScoreMeter from "@/components/ScoreMeter";

export default function Play(props) {
  const router = useRouter();

  const [currentCards, setCurrentCards] = useState([]);
  const [answerError, setAnswerError] = useState(null);
  const [currentScore, setCurrentScore] = useState(10);
  const [opponentScore, setOpponentScore] = useState(10);
  const [gameRole, setGameRole] = useState(null); // whether you're the host or the guest
  const [playersReady, setPlayersReady] = useState(false); // state to ensure both players are ready before setting up sockets
  const [pointsScored, setPointsScored] = useState(0);

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
    console.log("sending cards");
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
      setPointsScored(pointsScored + 1);
      setCurrentScore(currentScore + 1); // add to current score
      console.log("points scored", pointsScored);
      socket.emit("send current score", currentScore + 1, props.roomName, socket.id); // send new current score to opponent
      setOpponentScore(opponentScore - 1); // subtract from opponent's score
      formRef.current.reset();
      setAnswerError(null);
    } else {
      setAnswerError("Incorrect Answer");
      return;
    }
  }

  useEffect(() => {
    socket.on("receive opponent score", (score, userID) => {
      console.log('opponent score received', score)
      if (userID !== socket.id) {
        setOpponentScore(score);
        setCurrentScore(20 - score); // your new score
      }
    });
    return () => {
      socket.off("receive opponent score");
    };
  }, []);

  useEffect(() => {
    socket.on("receive game role", (role) => {
      setGameRole(role);
    });
    socket.emit("get game role", props.roomName);
  }, []);

  useEffect(() => {
    console.log("receiving current cards!");
    socket.on("receive current cards", (cardList) => {
      console.log("cards received!");
      setCurrentCards(cardList);
    });

    socket.on("both players ready", () => {
      setPlayersReady(true);
    });

    socket.emit("player ready", props.roomName); // verify both players are ready

    return () => {
      socket.off("receive current cards");
    };
  }, []);

  useEffect(() => {
    if (gameRole === "host") {
      sendCards();
    }
  }, [playersReady]);

  useEffect(() => {
    // win condition

    if (currentScore == 11) {
      router.push(`/game/${props.roomName}/win`);
      console.log("current points scored", pointsScored);
      socket.emit("game finished", props.roomName, 'win', socket.id, pointsScored);
    } else if (opponentScore == 11) {
      router.push(`/game/${props.roomName}/lose`);
      socket.emit("game finished", props.roomName, 'loss', socket.id, pointsScored);
    }

  }, [currentScore]);

  return (
    <div className={styles.playContainer}>
      <div className={styles.playerScore}>
        <h3>Your Score</h3>
        <h1>{currentScore}</h1>
      </div>
      <div className={styles.opponentScore}>
        <h3>Opponent&apos;s Score</h3>
        <h1>{opponentScore}</h1>
      </div>
      <div className={styles.scoreMeterContainer}>
        <h3 style={{ fontStyle: "italic" }}>Race to 20!</h3>
        <ScoreMeter
          opponentScore={opponentScore}
          playerScore={currentScore}
        ></ScoreMeter>
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
        {answerError && (
          <p style={{ color: "rgb(209, 48, 48)", fontStyle: "italic" }}>
            {answerError}
          </p>
        )}
        <input type="submit" className={styles.submitButton} />
      </form>
    </div>
  );
}
