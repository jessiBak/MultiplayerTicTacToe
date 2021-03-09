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


@APP.route('/', defaults={"filename": "index.html"})
@APP.route('/<path:filename>')
def index(filename):
    '''
    function to help with routing
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
    leaderboard_result = models.Player.query.order_by(
        models.Player.score.desc()).limit(10)
    leaderboard_json = rows_2_lst(leaderboard_result)
    player_exists = models.Player.query.filter_by(
        username=data['username']).first()
    if not player_exists:
        new_player = models.Player(username=data['username'], score=100)
        DB.session.add(new_player)
        DB.session.commit()
    SOCKETIO.emit('user_list_update', {
        'username': data['username'],
        'users_data': data['users_data']
    },
                  broadcast=True,
                  include_self=True)
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
        winner = models.Player.query.filter_by(username=data['winner']).first()
        winner.score = winner.score + 1
        DB.session.commit()
        loser = models.Player.query.filter_by(username=data['loser']).first()
        loser.score = loser.score - 1
        DB.session.commit()
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
