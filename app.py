'''
Handles the server side of a live multiplayer tic tac toe game
'''

import os
from flask import Flask, send_from_directory, json  #, session
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

APP = Flask(__name__, static_folder='./build/static')

# Point SQLAlchemy to your Heroku database
APP.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
# Gets rid of a warning
APP.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

DB = SQLAlchemy(APP)
import models

CORS = CORS(APP, resources={r"/*": {"origins": "*"}})

SOCKETIO = SocketIO(APP,
                    cors_allowed_origins="*",
                    json=json,
                    manage_session=False)


def rows_2_lst(query):
    '''
    function to convert a query into a list of dicts
    '''
    return [row.serialize for row in query.all()]

def add_new_user(usr):
    '''
    function to add a new user to the database
    '''
    player_exists = models.Player.query.filter_by(
        username=usr).first()
    if not player_exists:
        new_player = models.Player(username=usr, score=100)
        DB.session.add(new_player)
        DB.session.commit()
    return models.Player.query.all()

def add_win(usr):
    '''
    function to increase a user's score by 1
    '''
    winner = models.Player.query.filter_by(username=usr).first()
    winner.score = winner.score + 1
    DB.session.commit()

def add_loss(usr):
    '''
    function to decrease a user's score by 1
    '''
    loser = models.Player.query.filter_by(username=usr).first()
    loser.score = loser.score - 1
    DB.session.commit()

def add_new_lst(usr, lst):
    '''
    function to test the logic of add_new_user
    '''
    if usr not in lst:
        lst.append(usr)
    return lst
def change_score(users, usr, winner):
    '''
    function to test the logic of the score changing functions
    '''
    if winner:
        users[usr]['score'] = users[usr]['score'] + 1
    elif not winner:
        users[usr]['score'] = users[usr]['score'] - 1
    return users[usr]


@APP.route('/', defaults={"filename": "index.html"})
@APP.route('/<path:filename>')
def index(filename):
    '''
    function to send a file
    '''
    return send_from_directory('./build', filename)


@SOCKETIO.on('connect')
def on_connect():
    '''
    function to tell server what to do when new user connects
    '''
    print('User connected!')


@SOCKETIO.on('disconnect')
def on_disconnect():
    '''
    function to tell server what to do when a user disconnects
    '''
    print('User disconnected!')


@SOCKETIO.on('box-clicked')
def on_box_clicked(data):
    '''
    function to tell server how to handle box-click events
    '''
    print(str(data))
    SOCKETIO.emit('board_updated', data, broadcast=True, include_self=False)


#map client usernames to ID numbers
@SOCKETIO.on('login_success')
def on_l_success(data):
    '''
    function to tell server how to handle successful login
    '''
    add_new_user(data['username'])
    SOCKETIO.emit('user_list_update', {
        'username': data['username'],
        'users_data': data['users_data']
    },
                  broadcast=True,
                  include_self=True)
    leaderboard_result = models.Player.query.order_by(
        models.Player.score.desc()).limit(10)
    leaderboard_json = rows_2_lst(leaderboard_result)
    SOCKETIO.emit('leaderboard_info_update',
                  leaderboard_json,
                  broadcast=True,
                  include_self=True)


@SOCKETIO.on('game_over')
def on_game_over(data):
    '''
    function to tell server how to handle game ending
    '''
    if data['winner'] != "":
        add_win(data['winner'])
        add_loss(data['loser'])
    leaderboard_result = models.Player.query.order_by(
        models.Player.score.desc()).limit(10)
    leaderboard_json = rows_2_lst(leaderboard_result)
    SOCKETIO.emit('leaderboard_info_update',
                  leaderboard_json,
                  broadcast=True,
                  include_self=True)
    SOCKETIO.emit('game_results', data, broadcast=True, include_self=True)


@SOCKETIO.on('game_reset_requested')
def on_game_reset():
    '''
    function to tell server how to reset game
    '''
    SOCKETIO.emit('game_reset', broadcast=True, include_self=True)


if __name__ == "__main__":
    DB.create_all()
    SOCKETIO.run(
        APP,
        host=os.getenv('IP', '0.0.0.0'),
        port=8081 if os.getenv('C9_PORT') else int(os.getenv('PORT', 8081)),
    )
