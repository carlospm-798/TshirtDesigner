var create_lobby_btn = document.getElementById("generate_lobby")
var enter_lobby_btn = document.getElementById("enter_lobby")

create_lobby_btn.onclick = function() {
  console.log('creating lobby...')
}

enter_lobby_btn.onclick = function () {
  console.log('entering to a lobby...')
}

async function startLobbyCreation() {
  try {
    const response = await fetch('http://localhost:5000/api/create_lobby');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data.message);
  } catch (error) {
    console.error('There was a problem with the fetch operation', error);
  }
}

startLobbyCreation();
