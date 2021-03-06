import React from 'react';

function createTable(data)
{
    const newTable = data.map((item) =>
    {
        return(
            <tr>
                <th>{item.username}</th>
                <th>{item.score}</th>
            </tr>
        )
    });
    
    console.log(String(newTable));
    return newTable;
}

export function LeaderBoard(props)
{
        
        return(
            <table>
            <tr>
                <th>Username</th>
                <th>Score</th>
            </tr>
            {createTable(props.info)}
            </table>
        )
 }
