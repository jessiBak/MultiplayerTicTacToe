# Project 2: Multiplayer Tic-Tac-Toe!


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
1. Ensure that there are no heroku apps in the project directory (to check: `git remote -v` to remove: `git remote rm heroku`)
2. Create a Heroku app: `heroku create --buildpack heroku/python`
2. Add nodejs buildpack: `heroku buildpacks:add --index 1 heroku/nodejs`
3. Push to Heroku: `git push heroku main`
    * (There are multiple alerts for events. If you keep clicking OK, eventually you'll be able to continue.)
        * (I'm so sorry)

## Technical Issues
1. Whenever a new user logged in or if a new user was returning, the database would not be updated with their information.
* These lines in the login-successful event were the issue:
```
player_exists = models.Player.query.filter_by(username=data['username'])
    if not player_exists:
```
* `player_exists` was being set to a query instead an object, so `not player_exists` always evaluated to true, which prevented the database from updating.
* Using this line resolved the issue since it returned an object that was received from the query: `player_exists = models.Player.query.filter_by(username=data['username']).first()`
2. Attempting to print out the leaderboard information received from the database would result in an AttributeError and nothing would be displayed.
    * This is because I was attempting to print out the query itself instead of the results of the query.
    * Setting a new variable to `leaderboard_query.all()` and printing that variable allowed me to see the information needed.
3. When I was converting the results of the database query to a list of dictionaries, the resulting list would consist of the last row repeated multiple times.
    * These answers on StackOverflow helped me realize that with each iteration of my for loop, I was overwriting each key's value with the next row's data:
        * https://stackoverflow.com/questions/17717877/convert-sqlalchemy-query-result-to-a-list-of-dicts/17718711 
        * https://stackoverflow.com/questions/54069509/not-json-serializable-python-flask-sqlalchemy
    * I used the StackOverflow answer to create a function that converts the results of a query to a list of dictionaries and call that function when needed.

## Known Issues
- [x]  If a player logs in after other players, on their user list, each other player's user type would be listed as 'undefined', additionally, each new user would only see their username and the usernames of anyone who logs in after them
    * I will attempt to fix this by re-evaluating my new-user-notice event
- [x] If a player logs in first, then their user list would display everyone else's user type as undefined, even though other users correctly have Player2/Spectator behaviors
    * I will attempt to fix this by going over the methods I used to display the user list and assign user types 
- [ ] If the restart button is clicked, and a new game is started, nothing happens when a player wins or if the board is filled and it's a tie
    * I will attempt to fix this by going over the reset, box-clicked and calculateWinner functions
- [ ] When the restart button is clicked, users receive multiple alerts saying that the game will be reset and that the game has been reset.
    * I will attempt to fix this by going over all the events related to restarting the board.
