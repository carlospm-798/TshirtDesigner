/*  Carlos Paredes Márquez
    This JavaScript is the one that must manage
    The main behaviour of the web-page game.
*/

//  This import take the web-sockets actions, and helps us
//  to separate the main actions vs the socket actions, letting
//  cleaner scripts, easily to maintain.
import { connectToLobby } from "./socket.js";


//  We start the script by adding a Content Loaded condition
//  to avoid any conflic, as for example, fail while trying
//  to load a JS action or component.
document.addEventListener("DOMContentLoaded", async () => {

  // Principal buttons
  const create_lobby_btn = document.getElementById("generate_lobby");
  const enter_lobby_btn  = document.getElementById("enter_lobby");

  // Screens
  const main_window = document.getElementById("main_window");
  const lobby       = document.getElementById("lobby");

  // Forms
  const form = document.querySelector(".input_form_class");
  const users_list = document.querySelector(".users_list");

  // Inputs
  const uname = document.getElementById("uname");
  const lcode = document.getElementById("lcode");
  const enter_data_btn = document.getElementById("input_username_btn");

  //  Global variables
  let lobbyMode = null;
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
    screen.classList.remove("hidden");
  }
  /* ----------------------------------------------------------  */



  /* --------- BUTTONS MANAGER --------- */
  create_lobby_btn.onclick = () => {
    //  This function manage the create lobby actions of The    //
    //  main screan, by lock the lobby code form, to show the   //
    //  lobby code for the users in that same space.            //
    lobbyMode = "create";
    show_screen(lobby);
    lcode.disabled = true;
    lcode.value = "----";
  };

  enter_lobby_btn.onclick = () => {
    //  This function manage the enter lobby actions of The     //
    //  main screan, by unlock the lobby code form, to input    //
    //  the lobby code for the users in that space.             //
    lobbyMode = "join";
    show_screen(lobby);
    lcode.disabled = false;
    lcode.value = "";
  };
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



  /* --------- SUBMIT --------- */
  form.addEventListener("submit", async (e) => {
    //  This function helps to avoid issues as for example, adding        //
    //  blank spaces to the username, and it also do the POST methods     //
    //  to communicate with the back-end and start managing the logic.    //
    e.preventDefault();

    const username = uname.value.trim();
    //  Validation of not blank spaces in the username
    if (!username || username.includes(" ")) {
      alert("Invalid username");
      return;
    }

    let response;
    let lobbyCode;

    if (lobbyMode === "create") {
      //  Validation of the create lobby mode
      response = await fetch(`${API_URL}/create-lobby`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });

      const data = await response.json();
      updateUsersList(data.players);

      lobbyCode = data.lobby_code;

      lcode.value = lobbyCode;
      enter_data_btn.disabled = true;
    }

    if (lobbyMode === "join") {
      //  Validation of the join lobby mode
      lobbyCode = lcode.value.trim().toUpperCase();

      response = await fetch(`${API_URL}/join-lobby`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code: lobbyCode })
      });
    }

    //  Handle the lobby conections and updating the new interface
    connectToLobby(WS_URL, lobbyCode, updateUsersList);
    show_screen(lobby);
  });
  //  -----------------------------------------------------     //



  /* --------- UI UPDATE --------- */
  function updateUsersList(players) {
    //  This function helps to update the user list in the lobby    //
    //  page, by adding new childs to its elements, it also works   //
    //  the distinction of the HOST vs the USERS.                   //
    users_list.innerHTML = "";

    players.forEach(player => {
      const li = document.createElement("li");

      if (player.is_host) {
        const badge = document.createElement("span");
        badge.textContent = "HOST";
        badge.classList.add("host_badge");

        const name = document.createElement("span");
        name.textContent = player.name;
        name.classList.add("player_name");

        li.appendChild(badge);
        li.appendChild(name);
      } else {

        const name = document.createElement("span");
        name.textContent = player.name;
        name.classList.add("player_name");
        li.appendChild(name);
      }

      users_list.appendChild(li);
    });
  }

});
