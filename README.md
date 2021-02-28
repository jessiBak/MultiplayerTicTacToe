# Project 2: Multiplayer Tic-Tac-Toe (Milestone 1)

## Requirements
1. `npm install`
2. `pip install -r requirements.txt`

## Setup
1. Run `echo "DANGEROUSLY_DISABLE_HOST_CHECK=true" > .env.development.local` in the project directory

## Runnning the Application
1. Open a terminal and run this command (in same directory as project): `python app.py`
2. Open another terminal, `cd` into project directory, and run this command: `npm run start`
3. Preview web page in browser '/'

## Deploying to Heroku
1. Create a Heroku app: `heroku create --buildpack heroku/python`
2. Add nodejs buildpack: `heroku buildpacks:add --index 1 heroku/nodejs`
3. Push to Heroku: `git push heroku milestone_1`

## Technical Issues
1. When setting the username for each client and mapping that username to a user type (Player1, Player2, or Spectator), when a new user logged in, the mappings of both clients would swap with each button click.
* I looked up some examples of using useEffect through the React documentation and by rewatching lectures/demos.
* I was able to fix this by moving the user type granted event within the useEffect, and I also pushed the username-usertype mappings from the server to each client so the mapping would be easier to reference.

2. If a user clicked a box that already had a value in it, and if that box would make them win the game, the box's value would change and that user would be declared the winner.
* Using the React Tic-Tac-Toe as a reference, I noticed that there were checks for filled-in squares. I realized that this could be used to prevent a box's value from being overwritten by another player.
* To fix this, I added a check in the box-clicked function to make sure that nothing happens when a box with a non-null value is clicked.

3. After a game ended and a winner was declared on the screen, if a user clicked on a box, the game result message would change and declare them the winner.
* I noticed that the event for emitting a winner would still run after the checks for game completion, clicking a filled box, etc, which meant that a winner would still be calcuated after the game ended.
* I was able to fix this by returning after each of the conditions where clicking a box shouldn't do anything so the rest of the code (that included the calculateWinner function) wouldn't run in the box-click method.

## Known Issues
- [x] When a winner is calculated, or if the board is filled and there's a tie, the game doesn't officially stop. Instead a message gets logged to the console indicating the game's results 
* I will attempt to fix this by emitting events that help to create a 'Game Ended' state. Clients that receive this event would be prevented from making any changes to the board, and would see the game's results on their screens without needing to open the console.
- [x] When isGameOver (state determining whether the game is finished) is true, the GameOver component and the Restart button don't appear.
* I will attempt to fix this by looking over the events emitted when a winner is calculated (game-results and game-over). I would also need to figure out how to check if events that are being emitted are received by the clients/server. 
- [ ] Clicking the restart button doesn't do anything
* I will attempt to fix this by going over the events that reset the values of the board. 