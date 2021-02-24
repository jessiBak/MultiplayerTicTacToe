import logo from './logo.svg';
import './App.css';
import {Board} from './Board.js';
import './Board.css'
import {useState, useRef, useEffect} from 'react';
import io from 'socket.io-client';

const socket = io(); // Connects to socket connection
export function Box(props)
{
    return <div className="box" click={props.boxclick}>{props.value}</div>;
}

function App() 
{
  const [board, setBoard] = useState(Array(9).fill(null)); //initially an empty array with 9 elements
  const [isX, setX] = useState(0);
        
  const boxClick = (index) =>
  {
    let boxdata;
    if(isX === 0)
    {
      board[index] = "X";
      setBoard(prevBoard => [...prevBoard]);
      setX(isX + 1);
      boxdata = "X";
    }
    else
    {
      board[index] = "O";
      setBoard(prevBoard => [...prevBoard]);
      setX(isX - 1);
      boxdata = "O";
    }
      socket.emit('box-clicked', { boxIndex: index, boxValue: boxdata });  
  }
  
  useEffect(() => 
      {
        socket.on('box-clicked', (data) => 
        {
          console.log('A box was clicked!');
          console.log("box index: " + String(data.boxIndex) + "\nbox value: " + data.boxValue);
          board[data.boxIndex] = data.boxValue;
          setBoard(board => [...board]);
          console.log('Did it work?');
        });
      }, []); 
  
  return (
      <Board board={board} handleClick={boxClick}/>
  );
};

export default App;
