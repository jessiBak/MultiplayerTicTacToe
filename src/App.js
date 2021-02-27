import logo from './logo.svg';
import './App.css';
import {Board, Box} from './Board.js';
import {Login} from './LoginScreen.js';
import './Board.css'
import './LoginScreen.css'
import {useState, useRef, useEffect} from 'react';
import io from 'socket.io-client';

const socket = io(); // Connects to socket connection 

function App() 
{
  const [board, setBoard] = useState(Array(9).fill(null)); //initially an empty array with 9 elements
  const [isX, setX] = useState(0);
  const [isLogged, setLogin] = useState(false);
  const [userName, setUserName] = useState(null);
  const [userTypes, setUserTypes] = useState({});
  const inputRef = useRef(null);
  const [isTurn, setTurn] = useState(false);
  const [gameOver, setGame] = useState(false);
  
//These are provided by the server upon connect
   let userType;
   let bval;

  socket.on('new-user-notice', (data) =>
  {
    console.log("New user: " + data.username);
  });
  
  
    function calculateWinner(squares) 
    {
    const lines = 
    [
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
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
    }
      
  const boxClick = (index) =>
  {
      console.log(userName + " clicked a box");
      let boxdata;
      let newBoard = [...board];
      
      if(userTypes[userName] === "Player1" && isTurn && board[index] === null)
      {
        console.log(userName + " is " + userTypes[userName]); 
        newBoard[index] = "X";
        setBoard(newBoard);
        socket.emit('box-clicked', { boxIndex: index, playerType: userTypes[userName]});
        setTurn(false);
      }
      else if(userTypes[userName] === "Player2" && isTurn && board[index] === null)
      {
        console.log(userName + " is " + userTypes[userName]); 
        newBoard[index] = "O";
        setBoard(newBoard);
        socket.emit('box-clicked', { boxIndex: index,  playerType: userTypes[userName]});
        setTurn(false);
      } 
      else if(userTypes[userName].includes("Spectator"))
      {
        console.log("Spectators cannot change the state of the board."); 
      }
      else
      {
        if(board[index] != null)
        {
          console.log("This box has already been filled!");
        }
        else
        {
          console.log("Please wait for your turn!");
        }
      }
      //checking to see if there's a winner yet (or if it's a tie)
      let winner_status = calculateWinner(newBoard);
      if(winner_status)
      {
        if(winner_status === "X")
        {
          console.log("Player1 wins!");
        }
        else if(winner_status === "O")
        {
          console.log("Player2 wins!");
        }
      }
      else
      {
        console.log("No winner yet");
      }
  };
  
  
  
  const loginClick = () =>
  {
    if(inputRef != null)
    {
      const uName = inputRef.current.value;
      setUserName(uName);
      setLogin(true);
      socket.emit('login_success', {'username': uName}); 
    }
  }
  
  useEffect(() => 
      {
        socket.on('box-clicked', (data) => 
        {
          let newBoard = [...board];
          if(data.playerType === "Player1") 
          {
            newBoard[data.boxIndex] = "X";
            setBoard(newBoard);
          }
          else if(data.playerType === "Player2")
          {
            newBoard[data.boxIndex] = "O";
            setBoard(newBoard);
          }
          
          if(userTypes[userName] === "Player1" || userTypes[userName] === "Player2")
          {
            setTurn(true);
          }
          
        });
        
        socket.on('user-type-granted', (data) =>
        {
          userType = data.userInfo.uType;
          bval = data.userInfo.bval;
          setUserTypes(data.client_info);
          if(userTypes[userName] === "Player1")
          {
            setTurn(true);
          }
        });  
      }, [board, userTypes]); 
      
  if(isLogged)
  {
    return (
    <div>
      <Board board={board} handleClick={boxClick}/>
    </div>
    );
  }
  
  return (
    <div>
      <Login iRef={inputRef}login_click={loginClick}/>
    </div>
  );
};

export default App;
