// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue, onChildAdded, remove } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// ⚠️ Mets ici ta config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA181_gZwR6YfqhFiZkJ7IZKVSi9Qn1A8s",
  authDomain: "loup-garou-b0b31.firebaseapp.com",
  databaseURL: "https://loup-garou-b0b31-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "loup-garou-b0b31",
  storageBucket: "loup-garou-b0b31.firebasestorage.app",
  messagingSenderId: "559349895784",
  appId: "1:559349895784:web:0caac5eda9d13bc48521dd",
  measurementId: "G-0G25P8RGFW"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let roomId = null;
let username = null;
let playerKey = null;
let playerList = [];



const roles = [
  {
    code: "CUP",
    nom: "Cupidon",
    description: "Au début de la partie, Cupidon désigne deux joueurs amoureux.",
    image: "img/cupidon.png"
  },
  {
    code: "SOR",
    nom: "Sorcière",
    description: "Elle possède deux potions : une pour sauver, une pour tuer.",
    image: "img/soso.png"
  },
  {
    code: "VOY",
    nom: "Voyante",
    description: "Chaque nuit, elle découvre l’identité d’un joueur.",
    image: "img/vovo.png"
  },
  {
    code: "PF",
    nom: "Petite Fille",
    description: "Elle espionne les loups la nuit, discrètement.",
    image: "img/pf.png"
  },
  {
    code: "SV",
    nom: "Simple Villageois",
    description: "Il n’a aucun pouvoir spécial.",
    image: "img/villageois.png"
  },
  {
    code: "LG",
    nom: "Loup Garou",
    description: "Chaque nuit, ils dévorent un joueur.",
    image: "img/lg.png"
  }
];

function renderRoles() {
  const grid = document.getElementById("rolesGrid");
  roles.forEach(role => {
    const div = document.createElement("div");
    div.className = "role-card";
    div.innerHTML = `
      <img src="${role.image}" alt="${role.nom}">
      <h4>${role.nom} (${role.code})</h4>
      <p>${role.description}</p>
    `;
    grid.appendChild(div);
  });
}
renderRoles();

// --- Génération d'ID LG-xxxxxx ---
function generateRoomId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return "LG-" + id;
}

// --- Créer une partie ---
function createGame() {
  roomId = generateRoomId();
  const roomRef = ref(db, "rooms/" + roomId);
  set(roomRef, { createdAt: Date.now() });

  document.getElementById("roomInfo").innerText = "Code de la partie : " + roomId;
  alert("Nouvelle partie créée ! Code : " + roomId);

  // ✅ Auto-join du créateur
  const name = document.getElementById("playerName").value.trim();
  if (!name) {
    alert("Entre ton pseudo avant de créer la partie !");
    return;
  }
  joinGame(name, roomId);
}

// Variante de joinGame pour l’auto-join
function joinGame(name, code) {
  roomId = code;
  username = name;

  const playersRef = ref(db, `rooms/${roomId}/players`);
  const newPlayerRef = push(playersRef);
  set(newPlayerRef, username);
  playerKey = newPlayerRef.key;

  // Live update des joueurs
  onValue(playersRef, (snapshot) => {
    const players = snapshot.val() || {};
    playerList = Object.values(players);
    document.getElementById("players").innerHTML = playerList.join("<br>");
  });

  // Chat en live
  const messagesRef = ref(db, `rooms/${roomId}/messages`);
  onChildAdded(messagesRef, (snapshot) => {
    const msg = snapshot.val();
    const chatBox = document.getElementById("chat");
    chatBox.innerHTML += `<div><b>${msg.username}:</b> ${msg.message}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  // Suppression du joueur à la fermeture
  window.addEventListener("beforeunload", () => {
    if (playerKey) remove(ref(db, `rooms/${roomId}/players/${playerKey}`));
  });
}

// --- Envoyer un message ---
function sendMessage() {
  const text = document.getElementById("message").value.trim();
  if (!roomId || !username || !text) return;

  const messagesRef = ref(db, `rooms/${roomId}/messages`);
  // ✅ On stocke bien un objet structuré
  push(messagesRef, {
    username: username,
    message: text,
    ts: Date.now()
  });

  // Nettoie le champ
  document.getElementById("message").value = "";
}
// Envoi avec Entrée
document.getElementById("message").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// --- Fin de partie ---
function endGame() {
  if (!roomId) return;
  remove(ref(db, `rooms/${roomId}`));
  alert("La partie est terminée. La room a été supprimée !");
  roomId = null;
  playerList = [];
  document.getElementById("players").innerHTML = "";
  document.getElementById("chat").innerHTML = "";
  document.getElementById("roomInfo").innerHTML = "";
}
