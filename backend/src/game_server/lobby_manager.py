import uuid
import random
import string
from models import Lobby, Player

lobbies = {}

def generate_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))

def create_lobby(username: str):
    code        =   generate_code()
    player_id   =   str(uuid.uuid4())

    lobby   =   Lobby(code=code, players={})
    lobby.players[player_id] = Player(
        id=player_id,
        name=username,
        is_host=True
    )

    lobbies[code] = lobby
    return lobby, player_id

def join_lobby(code: str, username: str):
    if code not in lobbies:
        return None, None

    player_id = str(uuid.uuid4())
    lobby = lobbies[code]

    lobby.players[player_id] = Player(
        id=player_id,
        name=username,
        is_host=False
    )

    return lobby, player_id
