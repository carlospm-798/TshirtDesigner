from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from lobby_manager import create_lobby, join_lobby, lobbies

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/create-lobby")
async def create(data: dict):
    lobby, player_id = create_lobby(data["username"])
    return {
        "lobby_code": lobby.code,
        "player_id": player_id
    }

@app.post("/join-lobby")
async def join(data: dict):
    lobby, player_id = join_lobby(data["code"], data["username"])
    if not lobby:
        return {"error": "Lobby not found"}

    return {
        "player_id": player_id
    }

@app.websocket("/ws/{code}")
async def websocket_endpoint(ws: WebSocket, code: str):
    await ws.accept()

    try:
        while True:
            data = await ws.receive_text()
            await ws.send_json({
                "players": [
                    {"name": p.name, "is_host": p.is_host}
                    for p in lobbies[code].players.values()
                ]
            })
    except WebSocketDisconnect:
        print("Client diconnected")
