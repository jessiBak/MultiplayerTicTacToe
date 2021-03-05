# Project 2: Multiplayer Tic-Tac-Toe (Milestone 2)


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
3. Push to Heroku: `git push heroku milestone_1:main`

## Technical Issues
1. Whenever a new user logged in or if a new user was returning, the database would not be updated with their information
* These lines in the login-successful event were the issue:
```
player_exists = models.Player.query.filter_by(username=data['username'])
    if not player_exists:
```
* `player_exists` was being set to a query instead an object, so `not player_exists` always evaluated to true, which prevented the database from updating
* Using this line resolved the issue since it returned an object that was received from the query: `player_exists = models.Player.query.filter_by(username=data['username']).first()`

## Known Issues
- [ ]  If a player logs in after other players, on their user list, each other player's user type would be listed as 'undefined'
* I will attempt to fix this by re-evaluating my new-user-notice event
- [ ] If a player logs in first, then their user list would declare everyone's user type as "Player1", even though other users correctly have Player2/Spectator behaviors
* I will attempt to fix this by going over the methods I used to display the user list and assign user types 
