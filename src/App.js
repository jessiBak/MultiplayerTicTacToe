//import logo from './logo.svg';
import "./App.css";
import { Board } from "./Board.js";
import { Login } from "./LoginScreen.js";
import { GameOver } from "./GameOver.js";
import { LeaderBoard } from "./LeaderBoard.js";
import "./Board.css";
import "./LoginScreen.css";
import "./GameOver.css";
import "./LeaderBoard.css";
import { useState, useRef, useEffect } from "react";
import io from "socket.io-client";

const socket = io(); // Connects to socket connection

function App() {
  const [board, setBoard] = useState(Array(9).fill(null)); //initially an empty array with 9 elements
  const [isLogged, setLogin] = useState(false);
  const [userName, setUserName] = useState(null);
  const [userTypes, setUserTypes] = useState({
    Player1: "",
    Player2: "",
    Spectators: [],
  });
  const inputRef = useRef(null);
  const [isTurn, setTurn] = useState(false);
  const [isGameOver, setGameOver] = useState(false);
  const [results, setResults] = useState(<div></div>);
  const [userList, setList] = useState([]);
  const [confetti_image, setConfetti] = useState(<div></div>);
  const [leaderboardInfo, setLeaderBoardInfo] = useState([]);
  const [showLdrBoard, setShowLdrBoard] = useState(false);
  let leaderboard_render = <div></div>;

  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }

    return null;
  }

  const loginClick = () => {
    if (inputRef !== null && inputRef.current.value.trim() !== "") {
      const uName = inputRef.current.value;
      setUserName(uName);
      let users = { ...userTypes };
      if (users["Player1"] === "") {
        users["Player1"] = uName;
      } else if (users["Player2"] === "") {
        users["Player2"] = uName;
      } else {
        users["Spectators"].push(uName);
      }
      setUserTypes(users);
      setLogin(true);
      socket.emit("login_success", { username: uName, users_data: users });
    }
  };

  const boxClick = (index) => {
    console.log(userName + " clicked a box");
    let newBoard = [...board];
    let userType = Object.keys(userTypes).find(
      (key) => userTypes[key] === userName
    );
    if (
      userType === "Player1" &&
      isTurn &&
      board[index] === null &&
      !isGameOver
    ) {
      console.log(userName + " is " + userType);
      newBoard[index] = "X";
      setBoard(newBoard);
      socket.emit("box-clicked", newBoard);
      setTurn(false);
    } else if (
      userType === "Player2" &&
      isTurn &&
      board[index] === null &&
      !isGameOver
    ) {
      console.log(userName + " is " + userType);
      newBoard[index] = "O";
      setBoard(newBoard);
      socket.emit("box-clicked", newBoard);
      setTurn(false);
    } else if (userTypes.Spectators.includes(userName)) {
      alert("Spectators cannot change the state of the board.");
    } else {
      if (board[index] != null) {
        alert("This box has already been filled!");
        return 0;
      } else if (isGameOver) {
        alert("The game has ended!");
        return 0;
      } else {
        alert("Please wait for your turn!");
        return 0;
      }
    }
    //checking to see if there's a winner yet (or if it's a tie)
    let winner_status = calculateWinner(newBoard);
    console.log("Winner status is: " + winner_status);
    if (winner_status) {
      if (winner_status === "X") {
        let loser = userTypes["Player2"];
        socket.emit("game_over", { winner: userName, loser: loser });
        console.log("Emitting game_over now.");
      } else if (winner_status === "O") {
        let loser = userTypes["Player1"];
        socket.emit("game_over", { winner: userName, loser: loser });
        console.log("Emitting game_over now.");
      }
    } else {
      console.log("Board: " + String(board));
      if (newBoard.every((element) => element != null)) {
        //check to see if the board is full. if it is and there's no winner, the game's a tie
        socket.emit("game_over", {
          winner: "",
          username: "It's a tie! No one",
        });
        console.log("Emitting game_over now.");
      }
      console.log("No winner yet");
    }
  };

  function toggleLeaderBoard() {
    setShowLdrBoard((prevShow) => {
      return !prevShow;
    });
  }

  const reset = () => {
    socket.emit("game_reset_requested");
    console.log("Game reset requested...");
  };

  useEffect(() => {
    socket.on("user_list_update", (data) => {
      console.log("New user: " + data.username);
      console.log("userTypes before:", userTypes);
      setUserTypes(data["users_data"]);
      console.log("userTypes after:", userTypes);
      const listCopy = [...userList];
      if (data["username"] === userName) {
        if (userTypes["Spectators"].includes(userName)) {
          listCopy.push(data.username + ": Spectator (That's you!)");
        } else {
          listCopy.push(
            data.username +
              ": " +
              Object.keys(userTypes).find(
                (key) => userTypes[key] === userName
              ) +
              " (That's you!)"
          );
        }
      } else {
        if (userTypes.Spectators.includes(data.username)) {
          listCopy.push(data.username + ": Spectator");
        } else {
          listCopy.push(data.username);
        }
      }
      setList(listCopy);

      let userType = Object.keys(userTypes).find(
        (key) => userTypes[key] === userName
      );
      if (userType === "Player1") {
        setTurn(true);
        alert("You're Player1! It's your turn now!");
      } else if (userType === "Player2") {
        alert("You're Player 2! Please wait for your turn.");
      } else if (userTypes["Spectators"].includes(userName)) {
        alert("You are a Spectator. Enjoy watching the game!");
      }
    });

    socket.on("board_updated", (data) => {
      let userType = Object.keys(userTypes).find(
        (key) => userTypes[key] === userName
      );
      setBoard(data);
      if (userType === "Player1" || userType === "Player2") {
        setTurn(true);
        if (!isGameOver) {
          alert("It's your turn!");
        }
      }
    });

    socket.on("game_results", (data) => {
      setTurn(false);
      setGameOver(true);
      console.log(data.winner + " wins!");
      const r = (
        <div className="child results">
          <GameOver winner={data.winner} username={data.winner} reset={reset} />
        </div>
      );
      setResults(r);
      let confetti = <img src="https://i.gifer.com/XfQB.gif" alt="confetti" />;
      setConfetti(confetti);
    });

    socket.on("game_reset", () => {
      alert("The game will now reset");
      setBoard(Array(9).fill(null));
      setGameOver(false);
      setResults(<div></div>);
      setConfetti(<div></div>);
      let userType = Object.keys(userTypes).find(
        (key) => userTypes[key] === userName
      );
      if (userType === "Player1") {
        setTurn(true);
        alert("It's your turn!");
      } else {
        setTurn(false);
      }
      alert("Game has been reset");
    });

    socket.on("leaderboard_info_update", (data) => {
      setLeaderBoardInfo(data);
    });
  }, [
    board,
    userTypes,
    userName,
    isGameOver,
    isTurn,
    leaderboardInfo,
    userList,
  ]);

  if (isLogged) {
    let x = 0;

    if (showLdrBoard) {
      leaderboard_render = (
        <LeaderBoard
          info={leaderboardInfo}
          username={userName}
          onClick={() => {
            toggleLeaderBoard();
          }}
        />
      );
    }

    return (
      <div className="container main_div">
        {confetti_image}
        <Board board={board} handleClick={boxClick} />
        <div className="child user_list">
          <h3>Users:</h3>
          {userList.map((item) => (
            <li key={x++}> {item} </li>
          ))}
        </div>
        <div className="child leaderboard">
          <button
            type="button"
            onClick={toggleLeaderBoard}
            class="leaderboard_btn"
          >
            Show/Hide Leaderboard{" "}
          </button>
          {leaderboard_render}
        </div>
        {results}
      </div>
    );
  }
  return (
    <div>
      <Login iRef={inputRef} login_click={loginClick} />
    </div>
  );
}

export default App;
