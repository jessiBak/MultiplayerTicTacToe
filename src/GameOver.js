import React from "react";

export function GameOver(props) {
  if (props.winner !== "") {
    return (
      <div>
        <h2>The winner is...{props.username}!</h2>
        <button type="button" onClick={props.reset} class="reset_btn">
          Restart
        </button>
      </div>
    );
  } else {
    return (
      <div>
        <h2>It's a tie!!</h2>
        <button type="button" onClick={props.reset} class="reset_btn">
          Restart
        </button>
      </div>
    );
  }
}
