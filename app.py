import os
from flask import Flask, send_from_directory, json, session
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__, static_folder='./build/static')

cors = CORS(app, resources={r"/*": {"origins": "*"}})

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    json=json,
    manage_session=False
)
client_types = {}

num_Of_Clients = 0

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
    print("login_success data: " + str(data))
    global num_Of_Clients
    uType = ""
    bValue = ""
    num_Of_Clients+=1
    if(num_Of_Clients == 1):
         uType = "Player1"
         bValue = "X"
    elif(num_Of_Clients == 2):
         uType = "Player2"
         bValue = "O"
    else:
         uType = "Spectator" + str(num_Of_Clients - 2)
         bValue = ""
    uInfo = {'username': data['username'], 'uType': uType, 'bval': bValue }
    client_types[data['username']] = uType
    print("client_types: \n" + str(client_types))
    socketio.emit('user-type-granted', {'userInfo': uInfo, 'client_info': client_types}, broadcast=False, include_self=True)
    socketio.emit('new-user-notice', data, broadcast=True, include_self=True)
    
@socketio.on('game_over')
def on_game_over(data):
    socketio.emit('game_results', data, broadcast=True, include_self=True)
    
@socketio.on('game_reset_requested')
def on_game_reset():
    socketio.emit('game_reset', broadcast=True, include_self=True)

socketio.run(
    app,
    host=os.getenv('IP', '0.0.0.0'),
    port=8081 if os.getenv('C9_PORT') else int(os.getenv('PORT', 8081)),
)