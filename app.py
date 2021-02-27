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

clients = {}
num_Of_Clients = 0

@app.route('/', defaults={"filename": "index.html"}, methods=['POST'])
@app.route('/<path:filename>')
def index(filename):
    return send_from_directory('./build', filename)

@socketio.on('connect')
def on_connect():
    print('User connected!')
    global num_Of_Clients
    uType = ""
    num_Of_Clients += 1
    if(num_Of_Clients == 1):
         uType = "Player_1"
    elif(num_Of_Clients == 2):
         uType = "Player_2"
    else:
         uType = "Spectator_" + str(num_Of_Clients - 2)
    uInfo = {'uType': uType, 'client_num': num_Of_Clients}
    socketio.emit('user-type-granted', uInfo, broadcast=False, include_self=True)

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
    print(str(data))
    clients[data.id] = data.userName;
    socketio.emit('new-user-notice', {'new_user': data.userName}, broadcast=True, include_self=False)
    

socketio.run(
    app,
    host=os.getenv('IP', '0.0.0.0'),
    port=8081 if os.getenv('C9_PORT') else int(os.getenv('PORT', 8081)),
)