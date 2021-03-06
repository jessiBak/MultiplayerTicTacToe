import React from 'react';

function createTable(data, usr)
{
    const newTable = data.map((item, index) =>
    {
        if(item.username === usr)
        {
            return(
                <tr style={{color: '#b76eff'}}>
                    <td>{item.username}</td>
                    <td>{item.score}</td>
                    <td>{index + 1}</td>
                </tr>
            )
        }
        return(
            <tr>
                <td>{item.username}</td>
                <td>{item.score}</td>
                <td>{index + 1}</td>
            </tr>
        )
    });
    
    console.log(String(newTable));
    return newTable;
}

export function LeaderBoard(props)
{
        
        return(
            <div>
                <table>
                <tr>
                    <th>Username</th>
                    <th>Score</th>
                    <th>Rank</th>
                </tr>
                {createTable(props.info, props.username)}
                </table>
            </div>
        )
 }
