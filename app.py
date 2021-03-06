import os
from flask import Flask, send_from_directory, json, session
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

app = Flask(__name__, static_folder='./build/static')

# Point SQLAlchemy to your Heroku database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
# Gets rid of a warning
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
import models

cors = CORS(app, resources={r"/*": {"origins": "*"}})

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    json=json,
    manage_session=False
)

client_types = {}
leaderboard_json = []
num_Of_Clients = 0

def rows_2_lst(query):
    return [row.serialize for row in query.all()]

@app.route('/', defaults={"filename": "index.html"})
@app.route('/<path:filename>')
def index(filename):
    return send_from_directory('./build', filename)

@socketio.on('connect')
def on_connect():
    print('User connected!')

@socketio.on('disconnect')
def on_disconnect():
    print('User disconnected!')
    
@socketio.on('box-clicked')
def on_box_clicked(data):
    print(str(data))
    socketio.emit('box-clicked',  data, broadcast=True, include_self=False)

#map client usernames to ID numbers
@socketio.on('login_success')
def on_l_success(data):
    #print('leaderboard_result: ')
    leaderboard_result = models.Player.query.order_by(models.Player.score.desc()).limit(10)
    leaderboard_json = rows_2_lst(leaderboard_result)
        
    #print("leaderboard: " + str(leaderboard_json))
    #print(leaderboard_result)
    #print("login_success data: " + str(data))
    player_exists = models.Player.query.filter_by(username=data['username']).first()
    if not player_exists:
        new_player = models.Player(username=data['username'], score=100)
        db.session.add(new_player)
        db.session.commit()
    
    global num_Of_Clients
    uType = ""
    bValue = ""
    num_Of_Clients += 1
    if(num_Of_Clients == 1):
         uType = "Player1"
         bValue = "X"
    elif(num_Of_Clients == 2):
         uType = "Player2"
         bValue = "O"
    else: 
         uType = "Spectator"
         bValue = ""
    uInfo = {'username': data['username'], 'uType': uType, 'bval': bValue }
    client_types[data['username']] = uType
    print("client_types: \n" + str(client_types))
    socketio.emit('user-type-granted', {'userInfo': uInfo, 'client_info': client_types}, broadcast=False, include_self=True)
    socketio.emit('new-user-notice', data, broadcast=True, include_self=True)
    socketio.emit('leaderboard_info_update', leaderboard_json, broadcast=True, include_self=True)
    
@socketio.on('game_over')
def on_game_over(data):
    if data['winner'] != "":
        winner = models.Player.query.filter_by(username=data['winner']).first()
        winner.score = winner.score + 1
        db.session.merge(winner)
        db.session.commit()
        loser = models.Player.query.filter_by(username=data['loser']).first()
        loser.score = loser.score - 1
        db.session.merge(loser)
        db.session.commit()
        
    leaderboard_result = models.Player.query.order_by(models.Player.score.desc()).limit(10)
    leaderboard_json = rows_2_lst(leaderboard_result)
    socketio.emit('leaderboard_info_update', leaderboard_json, broadcast=True, include_self=True)
    socketio.emit('game_results', data, broadcast=True, include_self=True)
    
@socketio.on('game_reset_requested')
def on_game_reset():
    socketio.emit('game_reset', broadcast=True, include_self=True)

if __name__ == "__main__":
    db.create_all() 
    socketio.run(
        app,
        host=os.getenv('IP', '0.0.0.0'),
        port=8081 if os.getenv('C9_PORT') else int(os.getenv('PORT', 8081)),
    )
