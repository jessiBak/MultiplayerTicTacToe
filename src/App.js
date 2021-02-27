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
  const inputRef = useRef(null);
  
//These are provided by the server upon connect
  let userType = null;
  let userID = 0;
 
  socket.on('user-type-granted', (info) =>
  {
    userType = info.uType;
    userID = info.client_num;
  });     

  socket.on('new-user-notice', (data) =>
  {
    console.log("New user: " + data.new_user);
  });
  
  const boxClick = (index) =>
  {
    let boxdata;
    let newBoard = [...board];
    
    //alternating between Xs and Os on click
    if(isX % 2 === 0) //(userType == "Player_1")
    {
      newBoard[index] = "X";
      setBoard(newBoard);
      boxdata = "X";
    }
    else //else if(userType == "Player_2")
    {
      newBoard[index] = "O";
      setBoard(newBoard);
      boxdata = "O";
    } // move emit inside if-statements
      setX(isX + 1);
      
      socket.emit('box-clicked', { boxIndex: index, boxValue: boxdata });  
  }
  
  const loginClick = () =>
  {
    if(inputRef != null)
    {
      
      const uName = inputRef.current.value;
      setUserName(uName);
      setLogin(true);
      
      socket.emit('login_success', {username: uName, id: userID});
    }
  }
  
  useEffect(() => 
      {
        socket.on('box-clicked', (data) => 
        {
          console.log('A box was clicked!');
          console.log("box index: " + String(data.boxIndex) + "\nbox value: " + data.boxValue);
          let newBoard = [...board];
          console.log('Old board: ' + String(newBoard));
          newBoard[data.boxIndex] = data.boxValue;
          setBoard(newBoard);
          console.log('Updated board: ' + String(newBoard));
          setX(isX + 1);
        });
      }, [board]); 
      
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
