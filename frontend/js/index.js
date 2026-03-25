/*  ---------------------------------------------------   #
#   The TShirt-Designer game, by Carlos Paredes Márquez   #
#   ---------------------------------------------------   */
document.addEventListener("DOMContentLoaded", () => {
  //  These are the main global id to implement the game actions      //
  var create_lobby_btn  = document.getElementById("generate_lobby")
  var enter_lobby_btn   = document.getElementById("enter_lobby")
  var main_window       = document.getElementById("main_window")
  var lobby             = document.getElementById("lobby")
  //  -------------------------------------------------------------   //


  //  These are the main functions to implement the game actions    //
  create_lobby_btn.onclick = function () {
    //  This function starts a new lobby and hide the main
    //  Interface of the web page, except the body
    console.log('creating lobby...')
    show_screan(lobby);
  }
  //  ----------------------------------------------------------    //



  enter_lobby_btn.onclick = function () {
    //  This function enter to a lobby and hide the main
    //  Interface of the web page, except the body
    console.log('entering to a lobby...')
    show_screan(lobby);
  }
  //  ----------------------------------------------------------    //



  function show_screan(screen) {
    //  This function hidde all the windows and show
    //  then the screen that we indicate
    main_window.classList.add("hidden");
    lobby.classList.add("hidden");

    screen.classList.remove("hidden");
  }

});
