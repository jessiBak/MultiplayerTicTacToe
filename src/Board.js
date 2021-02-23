import React from 'react';

export function Board(props)
{
    function createBox(index)
    {
        return(
        <Box value={props.board[index]} index={index} click={() => props.handleClick(index)}/>   
        );
    }
    return(
    <div className="board">
        {createBox(0)}
        {createBox(1)}
        {createBox(2)}
        {createBox(3)}
        {createBox(4)}
        {createBox(5)}
        {createBox(6)}
        {createBox(7)}
        {createBox(8)}
    </div>
    )
}

export function Box(props)
{
    return <div className="box"index={props.index} onClick={props.click}>{props.value}</div>;
}