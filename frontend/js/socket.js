/*  Carlos Paredes Márquez
    This script helps to separate the flow of the
    UI actions vs the web-sockets methods.
*/

//  Starting a void variable of socket
let socket = null;

/* --------- CONNECT TO LOBBY METHOD --------- */
export function connectToLobby(wsUrl, lobbyCode, onPlayersUpdate) {
  //  This function helps to manage the WebSocket of the lobby  //
  //  connection, while adding some features as update of the   //
  //  players, or showing the state in the console log.         //
  socket = new WebSocket(`${wsUrl}/ws/${lobbyCode}`);

  socket.onopen = () => {
    //  Shows in the console that the WebSocket is CONNECT
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    //  Shows in the console the stage of the WS mesage
    console.log("WS message: ", event.data);

    const data = JSON.parse(event.data);

    if (data.type === "players_update") {
      console.log("Players update: ", data.players);
      onPlayersUpdate(data.players);
    }
  };

  socket.onclose = () => {
    //  Notifies that the WebSocket closed in the console
    console.log("WebSocket closed");
  };
}
//  -----------------------------------------------------     //



/* --------- SEND MESSAGE METHOD --------- */
export function sendMessage(type, payload) {
  //  This function sends a message to the WebSocket      //
  //  in a JSON format, and it returns if theres not ws.  //
  if (!socket) return;
  socket.send(JSON.stringify({ type, payload }));
}
//  -----------------------------------------------------     //
