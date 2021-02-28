import React from 'react';

export function GameOver(props)
{
    if(props.winner === "Player1")
    {
    return(
      <div>
      <h2>The winner is...{props.username}!</h2>
      <button type='button' onClick={props.reset}>Restart</button>
      </div>
    );
    }
    else if(props.winner === "Player2")
    {
    <div>
      <h2>The winner is...{props.username}!</h2>
     </div>
    }
    else
    {
    <div>
      <h2>It's a tie!!</h2>
     </div>
    }
}