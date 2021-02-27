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
  
//These are provided by the server upon connect
   let userType;
   let bval;

  socket.on('new-user-notice', (data) =>
  {
    console.log("New user: " + data.username);
  });
      
  const boxClick = (index) =>
  {
      console.log(userName + " clicked a box");
      let boxdata;
      let newBoard = [...board];
      if(userTypes[userName] === "Player1")
      {
        console.log(userName + " is " + userTypes[userName]); 
        newBoard[index] = "X";
        setBoard(newBoard);
        socket.emit('box-clicked', { boxIndex: index, playerType: userTypes[userName]});
      }
      else if(userTypes[userName] === "Player2")
      {
        console.log(userName + " is " + userTypes[userName]); 
        newBoard[index] = "O";
        setBoard(newBoard);
        socket.emit('box-clicked', { boxIndex: index,  playerType: userTypes[userName]});
      } 
      else
      {
        console.log("Spectators cannot change the state of the board."); 
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
        });
        
        socket.on('user-type-granted', (data) =>
        {
          userType = data.userInfo.uType;
          bval = data.userInfo.bval;
          setUserTypes(data.client_info);
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
