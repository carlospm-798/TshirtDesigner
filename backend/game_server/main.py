#   -----------------------------------------------------   #
#   Carlos Paredes Márquez                                  #
#   This script is the main file to start the server game   #
#   it manages the fast api methods, the websockets, etc.   #
#   -----------------------------------------------------   #
'''     -   IMPORT SECTION   -    '''
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from .lobby_manager import (
    create_lobby,
    join_lobby,
    lobbies,
    get_players_list
)
from pydantic import BaseModel
from typing import Dict


#   ------------------------------------------      #
#   Starting the base model requests classes        #
#   to manage the POST methods in the project.      #
#   ------------------------------------------      #
class CreateLobbyRequest(BaseModel):
    username: str

class JoinLobbyRequest(BaseModel):
    username: str
    code: str
#   ------------------------------------------      #
'''     -   CONNECTIONS DICTIONARY   -      '''
#   code -> player_id -> websocket
connections: Dict[str, Dict[str, WebSocket]] = {}


'''     -   APP START AS FAST API INSTANCE   -    '''
app = FastAPI()


'''     -   CORS STARTING TO AVOID CONFLICTS    -   '''
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

#   ---------------------------------------------------     #
#   This part handles the static components of the UI       #
#   to avoid conflics while using fast API methods, and     #
#   web socket methods in the same project.                 #
#   ---------------------------------------------------     #
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "../frontend"

app.mount(
    "/css",
    StaticFiles(directory=FRONTEND_DIR / "css"),
    name="css"
)

app.mount(
    "/js",
    StaticFiles(directory=FRONTEND_DIR / "js"),
    name="js"
)

app.mount(
    "/assets",
    StaticFiles(directory=FRONTEND_DIR / "assets"),
    name="assets"
)

app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR),
    name="static"
)
#   ---------------------------------------------------     #



#   ----------------------------------------------------------      #
#   This part manage the async functions all over the project.      #
#   ----------------------------------------------------------      #
async def broadcast_players(code: str):

    lobby = lobbies.get(code)
    if not lobby:
        #   Return if there's not a lobby in
        #   the websocket dictionary
        return

    message = {
        "type": "players_update",
        "players": get_players_list(lobby)
    }

    for ws in connections.get(code, {}).values():
        #   await until sending a message to the lobby
        await ws.send_json(message)
#   ----------------------------------------------------------      #



#   ---------------------   #
#   Initial configuration   #
#   ---------------------   #
@app.get("/")
async def index():
    #   Gets the frontend direction
    return FileResponse(FRONTEND_DIR / "index.html")
#   ------------------------------------------------    #

@app.get("/config")
async def config():
    #   Returns the api/ws url
    return {
        "api_url": "",
        "ws_url": ""
    }
#   ------------------------------------------------    #



#   ----------------------------------------------      #
#   Lobby websocket, this part handles the players      #
#   update, as the list of members in the fron-end      #
#   ----------------------------------------------      #
@app.websocket("/ws/{code}")
async def websocket_lobby(ws: WebSocket, code: str):

    player_id = ws.query_params.get("player_id")

    if not player_id:
        #   Not accept the connection
        #   Policy violation
        await ws.close(code=1008)
        return

    await ws.accept()

    if code not in connections:
        #   Handle the list in case that doesn't exists
        connections[code] = {}

    #   appends the websocket in the list
    connections[code][player_id] = ws

    try:
        lobby = lobbies.get(code)

        if lobby:
            # Send initial state
            await ws.send_json({
                "type": "players_update",
                "players": get_players_list(lobby)
            })

        while True:
            await ws.receive_text()

    except WebSocketDisconnect:

        #   Shows a print in the terminal
        print(f'Player {player_id} disconnected from lobby {code}')
        #   disconnect the websocket in case of fails
        lobby_connections = connections.get(code)
        if lobby_connections:
            connections[code].pop(player_id, None)

        #   return if there's no lobby
        lobby = lobbies.get(code)
        if not lobby:
            return

        #   Remove player
        removed_player = lobby.players.pop(player_id, None)
        if not removed_player:
            return

        #   Destroy the lobby if the HOST leaves
        if removed_player.is_host:
            for ws in connections[code].values() if lobby_connections else []:
                await ws.send_json({"type": "lobby_closed"})

            connections.pop(code, None)
            lobbies.pop(code, None)
            return

        #   update players
        await broadcast_players(code)
#   ----------------------------------------------      #



#   --------------------------------------------    #
#   Back-end manage of the creation of the lobby    #
#   --------------------------------------------    #
@app.post("/create-lobby")
async def create_lobby_endpoint(req: CreateLobbyRequest):
    lobby, player_id = create_lobby(req.username)

    await broadcast_players(lobby.code)

    return {
        "lobby_code": lobby.code,
        "player_id": player_id,
        "players": get_players_list(lobby)
    }
#   --------------------------------------------    #



#   --------------------------------------------    #
#   Back-end manage of the joining of a lobby       #
#   --------------------------------------------    #
@app.post("/join-lobby")
async def join_lobby_endpoint(req: JoinLobbyRequest):
    lobby, player_id = join_lobby(req.code, req.username)

    if lobby is None:
        return {"error": "Lobby not found"}

    await broadcast_players(lobby.code)

    return {
        "lobby_code": lobby.code,
        "player_id": player_id,
        "players": get_players_list(lobby)
    }
#   --------------------------------------------    #
