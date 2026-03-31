#   -----------------------------------------------------   #
#   Carlos Paredes Márquez                                  #
#   This script is the model generation of all the          #
#   project, to keep a clean and easy way of use.           #
#   -----------------------------------------------------   #
'''     -   IMPORT SECTION   -    '''
from dataclasses import dataclass
from typing import Dict



#   --------------------------------------------------------    #
#   This part, is where the Player/Lobby classes are defined    #
#   --------------------------------------------------------    #
@dataclass
class Player:
    id:         str
    name:       str
    is_host:    bool

@dataclass
class Lobby:
    code:       str
    players:    Dict[str, Player]
#   --------------------------------------------------------    #
