import logo from './logo.svg';
import './App.css';
import {Board, Box} from './Board.js';
import {Login} from './LoginScreen.js';
import {GameOver} from './GameOver.js';
import './Board.css'
import './LoginScreen.css'
import './GameOver.css'
import {useState, useRef, useEffect} from 'react';
import io from 'socket.io-client';

const socket = io(); // Connects to socket connection 

function App() 
{
  const [board, setBoard] = useState(Array(9).fill(null)); //initially an empty array with 9 elements
  const [isLogged, setLogin] = useState(false);
  const [userName, setUserName] = useState(null);
  const [userTypes, setUserTypes] = useState({});
  const inputRef = useRef(null);
  const [isTurn, setTurn] = useState(false);
  const [isGameOver, setGameOver] = useState(false);
  const [results, setResults] = useState((<div></div>));
  const [userList, setList] = useState([]);
  const [confetti_image, setConfetti] = useState(<div></div>);
  
//These are provided by the server upon connect
   let userType;
   let bval;

  socket.on('new-user-notice', (data) =>
  {
    console.log("New user: " + data.username);
    const listCopy = [...userList];
    listCopy.push(data.username);
    setList(listCopy);
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
      
      for (let i = 0; i < lines.length; i++) 
      {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) 
        {
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
      if(userTypes[userName] === "Player1" && isTurn && board[index] === null && !isGameOver)
      {
        console.log(userName + " is " + userTypes[userName]); 
        newBoard[index] = "X";
        setBoard(newBoard);
        socket.emit('box-clicked', { boxIndex: index, playerType: userTypes[userName], uname: userName});
        setTurn(false);
      }
      else if(userTypes[userName] === "Player2" && isTurn && board[index] === null && !isGameOver)
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
          return 0;
        }
        else if(isGameOver)
        {
          console.log("The game has ended!");
          return 0;
        }
        else
        {
          console.log("Please wait for your turn!");
          return 0;
        }
      }
      //checking to see if there's a winner yet (or if it's a tie)
      let winner_status = calculateWinner(newBoard);
      if(winner_status)
      {
        if(winner_status === "X")
        {
          socket.emit('game_over', {winner: "Player1", username: userName});
          //setGameOver(true);
        }
        else if(winner_status === "O")
        {
          socket.emit('game_over', {winner: "Player2", username: userName});
          //setGameOver(true);
        }
      }
      else
      {
        if(!board.some(element => element === null))//check to see if the board is full. if it is and there's no winner, the game's a tie
        {
          socket.emit('game_over', {winner: "Tie", username: "It\'s a tie! No one"});
          //setGameOver(true);
        }
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
  
  const reset = () =>
  {
    socket.emit('game_reset_requested');
    console.log('Game reset requested...');
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
        
        socket.on('game_results', (data) =>
        {
          let i = 0;
          setTurn(false);
          setGameOver(true);
          console.log(data.username + ' wins!');
          const r = (
            <div>
              <GameOver winner={data.winner} username={data.username} reset={reset}/>
            </div>
          );
          setResults(r);
          let confetti = ( <img src="https://i.gifer.com/5Q10.gif"/>);    
          setConfetti(confetti);
        });
        
         socket.on('game_reset', () =>
        {
          console.log("The game will now reset");
          setBoard(Array(9).fill(null));
          setGameOver(false);
          setResults((<div></div>));
          setConfetti(<div></div>);
          if(userTypes[userName] === "Player1" || userTypes[userName] === "Player2")
          {
            setTurn(!isTurn);
          }
          else
          {
            setTurn(false);
          }
          console.log("Game has been reset");
        }); 
        
      }, [board, userTypes, isGameOver, isTurn]); 
      
      
  
  if(isLogged)
  {
    let x = 0;
    return (
    <div class="main_div">
      {confetti_image}
      <Board board={board} handleClick={boxClick}/>
      <div>
          <h3>Other users:</h3>
          {userList.map((item) => (
            <li key={x++}> {item} </li>
          ))}
      </div>
      {results}
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
