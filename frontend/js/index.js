document.addEventListener("DOMContentLoaded", () => {

  // Botones principales
  const create_lobby_btn = document.getElementById("generate_lobby");
  const enter_lobby_btn  = document.getElementById("enter_lobby");

  // Screens
  const main_window = document.getElementById("main_window");
  const lobby       = document.getElementById("lobby");

  // Formulario
  const form = document.querySelector(".input_form_class");
  const users_form = document.querySelector(".users_form");

  // Inputs
  const uname = document.getElementById("uname");
  const lcode = document.getElementById("lcode");
  const enter_data_btn = document.getElementById("input_username_btn");

  let lobbyMode = null;

  /* ---------------- SCREEN MANAGER ---------------- */

  function show_screen(screen) {
    main_window.classList.add("hidden");
    lobby.classList.add("hidden");
    screen.classList.remove("hidden");
  }

  /* ---------------- BOTONES INICIO ---------------- */

  create_lobby_btn.onclick = () => {
    console.log("creating lobby...");
    lobbyMode = "create";
    show_screen(lobby);
    lcode.value = "----";
    lcode.disabled = true;
  };

  enter_lobby_btn.onclick = () => {
    console.log("entering lobby...");
    lobbyMode = "join";
    show_screen(lobby);
    lcode.value = "";
    lcode.disabled = false;
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
  lcode.addEventListener("input", validate_inputs);

  /* ---------------- SUBMIT ---------------- */

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = uname.value.trim();

    if (username.includes(" ")) {
      alert("Username cannot contain spaces");
      return;
    }

    if (lobbyMode === "create") {
      console.log("Creating lobby for:", username);
    }

    if (lobbyMode === "join") {
      const code = lcode.value.trim().toUpperCase();

      if (code.length !== 4) {
        alert("Invalid lobby code");
        return;
      }

      console.log("Joining lobby:", code, username);
    }

    users_form.classList.add("hidden");
  });

});
