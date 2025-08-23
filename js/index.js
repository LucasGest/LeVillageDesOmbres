    // Import Firebase SDK
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
    import { getDatabase, ref, push, set, onValue, onChildAdded, remove } 
      from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

    // ⚠️ Mets ici la config donnée par Firebase
    const firebaseConfig = {
      apiKey: "xxxx",
      authDomain: "xxxx.firebaseapp.com",
      databaseURL: "https://xxxx.firebaseio.com",
      projectId: "xxxx",
      storageBucket: "xxxx.appspot.com",
      messagingSenderId: "xxxx",
      appId: "xxxx"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    let roomId = null;
    let username = null;
    let playerKey = null; // pour supprimer le joueur à la déconnexion

    // Génère un code de partie style LG-AB12CD
    function generateRoomCode() {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return "LG-" + code;
    }

    // Créer une nouvelle partie
    function createGame() {
      username = document.getElementById("username").value.trim();
      if (!username) return alert("Choisis un pseudo !");
      
      roomId = generateRoomCode();
      document.getElementById("roomInfo").innerHTML = 
        `<b>Code de ta partie :</b> ${roomId}<br>Partage-le avec tes amis !`;

      joinRoom();
    }

    // Rejoindre une partie existante
    function joinGame() {
      username = document.getElementById("username").value.trim();
      roomId = document.getElementById("roomInput").value.trim().toUpperCase();
      if (!username || !roomId) return alert("Entre ton pseudo et un code de partie !");
      
      document.getElementById("roomInfo").innerHTML = 
        `<b>Tu as rejoint la partie :</b> ${roomId}`;

      joinRoom();
    }

    function joinRoom() {
      // Ajouter le joueur dans Firebase
      const playersRef = ref(db, `rooms/${roomId}/players`);
      const newPlayer = push(playersRef);
      set(newPlayer, username);
      playerKey = newPlayer.key;

      // Afficher les joueurs connectés en live
      onValue(playersRef, (snapshot) => {
        const players = snapshot.val() || {};
        document.getElementById("players").innerHTML = Object.values(players).join("<br>");
      });

      // Charger les messages du chat
      const chatRef = ref(db, `rooms/${roomId}/messages`);
      onChildAdded(chatRef, (snapshot) => {
        const msg = snapshot.val();
        const chatBox = document.getElementById("chat");
        chatBox.innerHTML += `<div><b>${msg.username}:</b> ${msg.message}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
      });

      // Supprimer le joueur s'il ferme la page
      window.addEventListener("beforeunload", () => {
        if (playerKey) {
          remove(ref(db, `rooms/${roomId}/players/${playerKey}`));
        }
      });
    }

    function sendMessage() {
      const message = document.getElementById("message").value.trim();
      if (!message || !username || !roomId) return;
      const chatRef = ref(db, `rooms/${roomId}/messages`);
      push(chatRef, { username, message });
      document.getElementById("message").value = "";
    }

    // Rendre les fonctions accessibles
    window.createGame = createGame;
    window.joinGame = joinGame;
    window.sendMessage = sendMessage;
