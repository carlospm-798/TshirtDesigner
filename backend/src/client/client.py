#   -----------------------------------     #
#   Testing the first connections with      #
#   front-end, back-end for the T-Shirt     #
#   Designer game.                          #
#   -----------------------------------     #
from flask import Flask, jsonify
from flask_cors import CORS

#   ----------------------------------      #
#   Enable CORS for local development.      #
#   ----------------------------------      #
app = Flask(__name__)
CORS(app)

@app.route('/api/create_lobby', methods=['GET'])
def create_lobby():
    data = {"message": "Hello from Python backend! Lobby creation."}
    return jsonify(data)

@app.route('/api/enter_lobby', methods=['GET'])
def enter_lobby():
    data = {"message": "Hello from Python backend! Enter to Lobby."}
    return jsonify(data)

if __name__ == '__main__':
    #   --------------------------------------      #
    #   Starting client as a public local host      #
    #   --------------------------------------      #
    app.run(host='0.0.0.0', port=5000, debug=True)
