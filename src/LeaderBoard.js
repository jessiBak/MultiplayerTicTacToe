import React from 'react';

function createTable(data, usr)
{
    const newTable = data.map((item, index) =>
    {
        if(item.username === usr)
        {
            return(
                <tr style={{color: '#d0a1ff'}}>
                    <th>{item.username}</th>
                    <th>{item.score}</th>
                    <th>{index + 1}</th>
                </tr>
            )
        }
        return(
            <tr>
                <th>{item.username}</th>
                <th>{item.score}</th>
                <th>{index + 1}</th>
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
