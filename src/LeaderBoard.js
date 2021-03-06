import React from "react";

function createTable(data, usr) {
  const newTable = data.map((item, index) => {
    if (item.username === usr) {
      return (
        <tr style={{ color: "#b76eff" }}>
          <td>{item.username}</td>
          <td>{item.score}</td>
          <td>{index + 1}</td>
        </tr>
      );
    }
    return (
      <tr>
        <td>{item.username}</td>
        <td>{item.score}</td>
        <td>{index + 1}</td>
      </tr>
    );
  });

  return newTable;
}

export function LeaderBoard(props) {
  return (
    <div>
      <table id="leaderboard-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Score</th>
            <th>Rank</th>
          </tr>
        </thead>
        <tbody>{createTable(props.info, props.username)}</tbody>
      </table>
    </div>
  );
}
