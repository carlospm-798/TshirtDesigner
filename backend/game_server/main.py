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
from typing import Dict, List



class CreateLobbyRequest(BaseModel):
    username: str

class JoinLobbyRequest(BaseModel):
    username: str
    code: str

connections: Dict[str, List[WebSocket]] = {}


app = FastAPI()

# --- CORS (útil para dev) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Paths ---
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

async def broadcast_players(code: str):
    if code not in connections:
        return

    lobby = lobbies.get(code)
    if not lobby:
        return

    message = {
        "type": "players_update",
        "players": get_players_list(lobby)
    }

    for ws in connections[code]:
        await ws.send_json(message)


@app.get("/")
async def index():
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/config")
async def config():
    return {
        "api_url": "http://localhost:8000",
        "ws_url": "ws://localhost:8000"
    }


@app.websocket("/ws/{code}")
async def websocket(ws: WebSocket, code: str):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            await ws.send_text(f"Echo from lobby {code}")
    except WebSocketDisconnect:
        print("Client disconnected")


@app.websocket("/ws/{code}")
async def websocket_lobby(ws: WebSocket, code: str):
    await ws.accept()

    if code not in connections:
        connections[code] = []

    connections[code].append(ws)

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
        connections[code].remove(ws)


@app.post("/create-lobby")
async def create_lobby_endpoint(req: CreateLobbyRequest):
    lobby, player_id = create_lobby(req.username)

    await broadcast_players(lobby.code)

    return {
        "lobby_code": lobby.code,
        "player_id": player_id,
        "players": get_players_list(lobby)
    }


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
