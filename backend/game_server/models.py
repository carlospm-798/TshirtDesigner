from dataclasses import dataclass
from typing import Dict

@dataclass
class Player:
    id:         str
    name:       str
    is_host:    bool

@dataclass
class Lobby:
    code:       str
    players:    Dict[str, Player]
