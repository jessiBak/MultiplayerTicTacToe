import logo from './logo.svg';
import './App.css';
import {Board} from './Board.js';
import './Board.css'
import {useState, useRef} from 'react';


export function Box(props)
{
    return <div className="box" click={props.boxclick}>{props.value}</div>;
}

function App() {
  const [board, setBoard] = useState(Array(9).fill(null)); //initially an empty array with 9 elements
  const [isX, setX] = useState(0);
        
  const boxClick = (index) =>
  {
    if(isX === 0)
    {
      board[index] = "X";
      setBoard(prevBoard => [...prevBoard]);
      setX(isX + 1);
    }
    else
    {
      board[index] = "O";
      setBoard(prevBoard => [...prevBoard]);
      setX(isX - 1);
    }
  }
  
  return (
      <Board board={board} handleClick={boxClick}/>
  );
};

export default App;
