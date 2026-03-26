let socket = null;

export function connectToLobby(wsUrl, lobbyCode, onPlayersUpdate) {
  socket = new WebSocket(`${wsUrl}/ws/${lobbyCode}`);

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (onPlayersUpdate) {
      onPlayersUpdate(data.players);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket closed");
  };
}

export function sendMessage(type, payload) {
  if (!socket) return;
  socket.send(JSON.stringify({ type, payload }));
}
