/*  ---------------------------------------------------   #
#   The TShirt-Designer game, by Carlos Paredes Márquez   #
#   ---------------------------------------------------   */

//  These are the main global id to implement the game actions      //
var create_lobby_btn  = document.getElementById("generate_lobby")
var enter_lobby_btn   = document.getElementById("enter_lobby")
var main_window       = document.getElementById("main_window")
//  -------------------------------------------------------------   //


//  These are the main functions to implement the game actions    //
create_lobby_btn.onclick = function () {
  //  This function starts a new lobby and hide the main
  //  Interface of the web page, except the body
  console.log('creating lobby...')
  startLobbyCreation();
  main_window.style.display = 'none';
}
//  ----------------------------------------------------------    //



enter_lobby_btn.onclick = function () {
  //  This function enter to a lobby and hide the main
  //  Interface of the web page, except the body
  console.log('entering to a lobby...')
  enterLobby();
  main_window.style.display = 'none';
}
//  ----------------------------------------------------------    //



async function startLobbyCreation() {
  try {
    const response = await fetch('http://localhost:5000/api/create_lobby');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('There was a problem with the fetch operation: ', error);
  }
}

async function enterLobby() {
  try {
    const response = await fetch('http://localhost:5000/api/enter_lobby');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('There was a problem with the fetch operation: ', error)
  }
}
