#   -----------------------------------------------------   #
#   Carlos Paredes Márquez                                  #
#   This script is the lobby manager, in order to keep a    #
#   better structure of the project.                        #
#   -----------------------------------------------------   #
'''     -   IMPORT SECTION   -    '''
import uuid
import random
import string
from .models import Lobby, Player

'''     -   GENERATING LOBBIES DICT     -   '''
lobbies = {}



#   ----------------------------------------------------    #
#   This part manages the lobby functions of the project    #
#   ----------------------------------------------------    #
def generate_code():
    #   ----------------------------------------------------------------    #
    #   This function returns a 4 value UUID to avoid repeatitive tokens    #
    #   along multiple servers for example.                                 #
    #   ----------------------------------------------------------------    #
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
#   --------------------------------------------------------------------    #



def create_lobby(username: str):
    #   -----------------------------------------------------   #
    #   This function manage the creation of a lobby, and the   #
    #   assignation of it's HOST user.                          #
    #   -----------------------------------------------------   #
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
#   ---------------------------------------------------------   #



def join_lobby(code: str, username: str):
    #   -----------------------------------------------------   #
    #   This function let different users to join into a same   #
    #   lobby, and it assing every user an UUID token.          #
    #   -----------------------------------------------------   #
    if code not in lobbies:
        return None, None

    #   Getting the lobby to join
    lobby = lobbies[code]

    #   Validation of non-repeatitive usernames in same lobby
    for player in lobby.players.values():
        if player.name.lower() == username.lower():
            return None, None

    #   Creation of a unique uuid for players
    player_id = str(uuid.uuid4())

    #   Adding the player into the player model class
    lobby.players[player_id] = Player(
        id=player_id,
        name=username,
        is_host=False
    )

    return lobby, player_id
#   ---------------------------------------------------------   #



def get_players_list(lobby):
    #   -------------------------------------------------------     #
    #   This function returns a list of the memebers of a lobby     #
    #   -------------------------------------------------------     #
    return [
        {
            "id": p.id,
            "name": p.name,
            "is_host": p.is_host
        }
        for p in lobby.players.values()
    ]
#   -----------------------------------------------------------     #
