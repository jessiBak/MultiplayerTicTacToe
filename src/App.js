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
    let newBoard = [...board];
    if(isX % 2 === 0)
    {
      newBoard[index] = "X";
      setBoard(newBoard);
      setX(isX + 1);
      boxdata = "X";
    }
    else
    {
      newBoard[index] = "O";
      setBoard(newBoard);
      setX(isX + 1);
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
          let newBoard = [...board];
          console.log('Old board: ' + String(newBoard));
          newBoard[data.boxIndex] = data.boxValue;
          setBoard(newBoard);
          console.log('Updated board: ' + String(newBoard));
          setX(isX + 1);
          
          // console.log("prevBoard before: " + String(board) + "\n");
          // board[data.boxIndex] = data.boxValue;
          // console.log("board after changing index: " + String(board) + "\n");
          // setBoard(prevBoard => [...prevBoard]);
          // console.log("board after setBoard call: " + String(board) + "\n");
          // console.log('Did it work?');
        });
      }, [board]); 
  
  return (
      <Board board={board} handleClick={boxClick}/>
  );
};

export default App;
