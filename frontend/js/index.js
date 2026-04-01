/*  Carlos Paredes Márquez                          #
#   This JavaScript is the one that must manage     #
#   The main behaviour of the web-page game.       */
//  This import take the web-sockets actions, and helps us
//  to separate the main actions vs the socket actions, letting
//  cleaner scripts, easily to maintain.
import { connectToLobby } from "./socket.js?v=1.0.3";



//  --------------------------------------------------------------------  //
//  ---   FUNTIONS THAT CAN BE OUT OF THE DOM CONTENT LOADED METHOD   --  //
//  Pure Functions, Logic helpers, Fetch/API functions, and the Creation  //
//  of DOM elements can be used here.                                     //
//  --------------------------------------------------------------------  //



/* --------- IS VALID USERNAME MANAGER --------- */
function isValidUsername(username) {
  //  This function returns a bool based in a correct
  //  username without blank spaces
  return username && !username.includes(" ");
}
//  -----------------------------------------------------     //



/* -----  CREATE PLAYER NAME  -----*/
function createPlayerName(name) {
  //  This function manage the creation of player name
  //  to refactor and clean the flow of the game.
  const span = document.createElement("span");
  span.textContent = name;
  span.classList.add("player_name");
  return span;
}
//  -----------------------------------------------------     //



/* -----  CREATE HOST BADGE  -----*/
function createHostBadge() {
  //  This function manage the creation of a badge
  //  to easily identify the HOST of the seasion.
  const badge = document.createElement("span");
  badge.textContent = "HOST";
  badge.classList.add("host_badge");
  return badge;
}
//  -----------------------------------------------------     //



/* --------- CREATE LOBBY MANAGER --------- */
async function createLobby(apiUrl, username) {
  //  This function manage the creation of the api to create
  //  a lobby, based in the host username.
  const response = await fetch(`${apiUrl}/create-lobby`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });
  return response.json();
}
//  -----------------------------------------------------     //



/* -----  CREATE PLAYER ITEM  -----*/
function createPlayerItem(player) {
  //  This function manage the creation of a HTML
  //  li element of the players, based in its
  //  conditions as normal/host player, then it
  //  returns a li html element.
  const li = document.createElement("li");

  if (player.is_host) {
    //  invoke the host function badge and
    //  append it to the li element.
    li.appendChild(createHostBadge());
  }

  //  append the player name to the li element
  li.appendChild(createPlayerName(player.name));
  return li;
}
//  -----------------------------------------------------     //



/* --------- UI UPDATE --------- */
function updateUsersList(userListElement, players) {
  userListElement.innerHTML = "";

  players.forEach(player => {
    userListElement.appendChild(createPlayerItem(player));
  });
}
//  -----------------------------------------------------     //



/* --------- VALID LOBBY CONDITION --------- */
function isValidLobby(players) {
  //  This function validates the minimum number
  //  of players in the game.
  return players.length >= 3;
}
//  -----------------------------------------------------     //



//  --------------------------------------------------------  //
//  We start the script by adding a Content Loaded condition  //
//  to avoid any conflic, as for example, fail while trying   //
//  to load a JS action or component.                         //
//  --------------------------------------------------------  //
//  Functions/elements with access with querySelector, and    //
//  code that execute instantly when the web page is open.    //
//  --------------------------------------------------------  //
document.addEventListener("DOMContentLoaded", async () => {
  // Principal buttons
  const create_lobby_btn = document.getElementById("generate_lobby");
  const enter_lobby_btn  = document.getElementById("enter_lobby");
  // Screens
  const main_window = document.getElementById("main_window");
  const lobby = document.getElementById("lobby");
  const game_drawn = document.getElementById("game_drawn");
  // Forms
  const form = document.querySelector(".input_form_class");
  const users_list = document.querySelector(".users_list");
  // Inputs
  const uname = document.getElementById("uname");
  const lcode = document.getElementById("lcode");
  const enter_data_btn = document.getElementById("input_username_btn");
  const start_game_btn = document.getElementById("start_game_btn");
  //  Global variables
  let lobbyMode = null;
  let playerId = null;
  let API_URL = "";
  let WS_URL = "";
  //  LOAD CONFIG FIRST
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.host;
  API_URL = `${window.location.origin}`;
  WS_URL = `${protocol}://${host}`;
  //  --------------------------------------------------------------- //



  /* --------- SCREEN MANAGER --------- */
  function show_screen(screen) {
    //  This script add the hidden property to all the screans    //
    //  but, at the end it removes to class based in the screan   //
    //  that was sended as the parameter.                         //
    main_window.classList.add("hidden");
    lobby.classList.add("hidden");
    game_drawn.classList.add("hidden");
    screen.classList.remove("hidden");
  }
  /* ----------------------------------------------------------  */



  /* --------- CREATE LOBBY BUTTON MANAGER --------- */
  create_lobby_btn.onclick = () => {
    //  This function manage the create lobby actions of The    //
    //  main screen, by lock the lobby code form, to show the   //
    //  lobby code for the users in that same space.            //
    lobbyMode = "create";
    show_screen(lobby);
    lcode.disabled = true;
    lcode.value = "----";
  };
  //  -----------------------------------------------------     //



  /* --------- ENTER LOBBY BUTTON MANAGER --------- */
  enter_lobby_btn.onclick = () => {
    //  This function manage the enter lobby actions of The     //
    //  main screen, by unlock the lobby code form, to input    //
    //  the lobby code for the users in that space.             //
    lobbyMode = "join";
    show_screen(lobby);
    lcode.disabled = false;
    lcode.value = "";
  };
  //  -----------------------------------------------------     //



  /* --------- START GAME BUTTON MANAGER --------- */
  start_game_btn.onclick = () => {
    //  This function manage the create lobby actions of The    //
    //  start game mode, in the drawn menu.                     //
    show_screen(game_drawn);
    alert("button working");
    /*  TO DO:
          - Update all users screan when start game is clicked.
          - There's a bug, if a user click again the Enter button.
    */
  };
  //  -----------------------------------------------------     //



  /* --------- LOCK LOBBY BUTTON CONDITION --------- */
  function lockLobbyEntry() {
    //  This function locks the main forms of the
    //  lobby, to avoid stable issues when user joins
    //  a lobby.
    uname.disabled = true;
    lcode.disabled = true;
    enter_data_btn.disabled = true;
  }
  //  -----------------------------------------------------     //



  /* ---------------- VALIDATION ---------------- */
  function validate_inputs() {
    //  This function check that all the inputs are being       //
    //  used at the correct way, hadling a special mode while   //
    //  the user is creating a new lobby as "create" variable.  //
    if (lobbyMode === "create") {
      enter_data_btn.disabled = !uname.value.trim();
    } else {
      enter_data_btn.disabled = !(
        uname.value.trim() &&
        lcode.value.trim().length === 4
      );
    }
  }

  //  This listener helps to apply all in upper case
  //  whithout clicking the upper case key, in the
  //  lobby code, making easier their usage.
  uname.addEventListener("input", validate_inputs);
  lcode.addEventListener("input", () => {
    lcode.value = lcode.value.toUpperCase();
    validate_inputs();
  });
  //  -----------------------------------------------------     //



  /* --------- JOIN LOBBY MANAGER --------- */
  async function joinLobby(username, code) {
    //  This function manage the join in a lobby, based
    //  in the username and the code of the host lobby.
    const response = await fetch(`${API_URL}/join-lobby`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, code })
    });
    return response.json();
  }
  //  -----------------------------------------------------     //



  /* --------- SUBMIT --------- */
  form.addEventListener("submit", async (e) => {
    //  This function helps to avoid issues as for example, adding        //
    //  blank spaces to the username, and it also do the POST methods     //
    //  to communicate with the back-end and start managing the logic.    //
    e.preventDefault();

    const username = uname.value.trim();
    if (!isValidUsername(username)) {
      //  Alert in case of blank spaces usage
      alert("Invalid username");
      return;
    }

    //  Local variables to save code and messages
    let data; let lobbyCode;

    if (lobbyMode === "create") {
      //  Check the page logic in case of HOST
      data = await createLobby(API_URL, username);
      lobbyCode = data.lobby_code;
      playerId = data.player_id;
      lcode.value = lobbyCode;
      start_game_btn.removeAttribute("hidden");
    }

    if (lobbyMode === "join") {
      //  Check the page logic and join in case of user
      lobbyCode = lcode.value.trim().toUpperCase();

      try {
        data = await joinLobby(username, lobbyCode);
        playerId = data.player_id;
        updateUsersList(users_list, data.players);
      } catch (err) {
        alert("Invalid lobby code or username already taken");
        return;
      }
    }

    //  Connect/Disconnect to lobby and show the next screen stage
    const onPlayersUpdate = (players) => {
      updateUsersList(users_list, players);

      //  Validate the button when all the players are available
      if (isValidLobby(players) && lobbyMode === "create") {
        start_game_btn.hidden = false;
        start_game_btn.disabled = false;
      }
    };

    //  lock the lobby entry button to avoid conflics. Then it connects to
    //  the lobby, and shows the lobby screen.
    lockLobbyEntry();
    connectToLobby(WS_URL, lobbyCode, playerId, onPlayersUpdate, handleLobbyClosed);
    show_screen(lobby);
  });
  //  -----------------------------------------------------     //



  /* --------- HANDLE LOBBY CLOSED --------- */
  function handleLobbyClosed() {
    //  This function alert all the members that the  //
    //  HOST leave the game, and returns all to the   //
    //  main windows.                                 //
    alert("The HOST left. Lobby closed.");
    location.reload();
  }
  //  -----------------------------------------------------     //

});
