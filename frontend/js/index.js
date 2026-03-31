import { connectToLobby } from "./socket.js";

document.addEventListener("DOMContentLoaded", async () => {

  // Botones principales
  const create_lobby_btn = document.getElementById("generate_lobby");
  const enter_lobby_btn  = document.getElementById("enter_lobby");

  // Screens
  const main_window = document.getElementById("main_window");
  const lobby       = document.getElementById("lobby");

  // Formulario
  const form = document.querySelector(".input_form_class");
  const users_list = document.querySelector(".users_list");
  // Inputs
  const uname = document.getElementById("uname");
  const lcode = document.getElementById("lcode");
  const enter_data_btn = document.getElementById("input_username_btn");

  let lobbyMode = null;
  let API_URL = "";
  let WS_URL = "";

  /* --------- LOAD CONFIG FIRST --------- */
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.host;

  API_URL = `${window.location.origin}`;
  WS_URL = `${protocol}://${host}`;
  // Fake IP's to test with live-server
  /*API_URL = "http://192.168.1.X:8000";
  WS_URL  = "ws://192.168.1.X:8000";*/

  /* --------- SCREEN MANAGER --------- */
  function show_screen(screen) {
    main_window.classList.add("hidden");
    lobby.classList.add("hidden");
    screen.classList.remove("hidden");
  }

  create_lobby_btn.onclick = () => {
    lobbyMode = "create";
    show_screen(lobby);
    lcode.disabled = true;
    lcode.value = "----";
  };

  enter_lobby_btn.onclick = () => {
    lobbyMode = "join";
    show_screen(lobby);
    lcode.disabled = false;
    lcode.value = "";
  };

  /* ---------------- VALIDACIÓN ---------------- */
  function validate_inputs() {
    if (lobbyMode === "create") {
      enter_data_btn.disabled = !uname.value.trim();
    } else {
      enter_data_btn.disabled = !(
        uname.value.trim() &&
        lcode.value.trim().length === 4
      );
    }
  }

  uname.addEventListener("input", validate_inputs);
  lcode.addEventListener("input", () => {
    lcode.value = lcode.value.toUpperCase();
    validate_inputs();
  });

  /* --------- SUBMIT --------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = uname.value.trim();
    if (!username || username.includes(" ")) {
      alert("Invalid username");
      return;
    }

    let response;
    let lobbyCode;

    if (lobbyMode === "create") {
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
      lobbyCode = lcode.value.trim().toUpperCase();

      response = await fetch(`${API_URL}/join-lobby`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code: lobbyCode })
      });
    }

    connectToLobby(WS_URL, lobbyCode, updateUsersList);
    show_screen(lobby);
  });

  /* --------- UI UPDATE --------- */
  function updateUsersList(players) {
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
