import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
	getDatabase,
	ref,
	push,
	set,
	onValue,
	onChildAdded,
	remove,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// ⚠️ Mets ici ta config Firebase
const firebaseConfig = {
	apiKey: "AIzaSyA181_gZwR6YfqhFiZkJ7IZKVSi9Qn1A8s",
	authDomain: "loup-garou-b0b31.firebaseapp.com",
	databaseURL:
		"https://loup-garou-b0b31-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "loup-garou-b0b31",
	storageBucket: "loup-garou-b0b31.firebasestorage.app",
	messagingSenderId: "559349895784",
	appId: "1:559349895784:web:0caac5eda9d13bc48521dd",
	measurementId: "G-0G25P8RGFW",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let roomId = null;
let username = null;
let playerKey = null;
let playerList = []; // tableau global des joueurs
const baseRoles = [
	"Loup-Garou",
	"Loup-Garou",
	"Villageois",
	"Villageois",
	"Sorcière",
	"Voyante",
	"Petite Fille",
	"Chasseur",
];

// Génère un code de room style LG-XXXXXX
function generateRoomCode() {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let code = "";
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return "LG-" + code;
}

let isCreator = false;

// Créer une partie
function createGame() {
	username = document.getElementById("username").value.trim();
	if (!username) return alert("Choisis un pseudo !");

	roomId = generateRoomCode();
	isCreator = true;
	document.getElementById("startGame").style.display = "inline-block";

	document.getElementById(
		"roomInfo"
	).innerHTML = `<b>Code de ta partie :</b> ${roomId}<br>Partage-le avec tes amis !`;

	joinRoom();
}

// Démarrer la partie
function startGame() {
	if (!isCreator) return;

	if (playerList.length < 8) {
		alert("Il faut au moins 8 joueurs pour démarrer la partie !");
		return;
	}

	// Mélanger les rôles
	let roles = [...baseRoles];
	roles.sort(() => Math.random() - 0.5);

	const playersRef = ref(db, `rooms/${roomId}/players`);

	// Assigner les rôles aux joueurs
	onValue(
		playersRef,
		(snapshot) => {
			const players = snapshot.val() || {};
			const playerKeys = Object.keys(players);

			playerKeys.forEach((key, index) => {
				const role = roles[index] || "Villageois"; // sécurité si +8 joueurs
				set(ref(db, `rooms/${roomId}/players/${key}`), {
					name: players[key],
					role: role,
				});
			});
		},
		{ onlyOnce: true }
        
	);
      alert("🎲 La partie commence ! Les rôles ont été distribués.");

	// Distribue les rôles dans Firebase
	set(playersRef, {}); // reset joueurs
	playerList.forEach((player, index) => {
		const playerKey = "p" + index; // tu peux garder ta logique push()
		set(ref(db, `rooms/${roomId}/roles/${playerKey}`), rolesPool[index]);
	});

	// Lancer la phase jour
	set(ref(db, `rooms/${roomId}/phase`), {
		type: "day",
		phaseEnd: Date.now() + 3 * 60 * 1000, // 3 minutes
	});
}

// Récupère mon rôle
function listenForRole() {
  const playerRef = ref(db, `rooms/${roomId}/players/${playerKey}`);

  onValue(playerRef, (snapshot) => {
    const data = snapshot.val();
    if (data && data.role) {
      alert("Ton rôle est : " + data.role + " 🎭");
    }
  });
}

// Rejoindre une partie existante
function joinGame() {
	username = document.getElementById("username").value.trim();
	roomId = document.getElementById("roomInput").value.trim().toUpperCase();
	if (!username || !roomId)
		return alert("Entre ton pseudo et un code de partie !");

	document.getElementById(
		"roomInfo"
	).innerHTML = `<b>Tu as rejoint la partie :</b> ${roomId}`;

	joinRoom();
}

function joinRoom() {
	const playersRef = ref(db, `rooms/${roomId}/players`);
	const newPlayer = push(playersRef);
	set(newPlayer, username);
	playerKey = newPlayer.key;

	// Stocker les joueurs dans un tableau + afficher
	onValue(playersRef, (snapshot) => {
		const players = snapshot.val() || {};
		playerList = Object.values(players);
		document.getElementById("players").innerHTML = playerList.join("<br>");
	});

	// Chat en live
	const chatRef = ref(db, `rooms/${roomId}/messages`);
	onChildAdded(chatRef, (snapshot) => {
		const msg = snapshot.val();
		const chatBox = document.getElementById("chat");
		chatBox.innerHTML += `<div><b>${msg.username}:</b> ${msg.message}</div>`;
		chatBox.scrollTop = chatBox.scrollHeight;
	});

	// Supprimer joueur à la déconnexion
	window.addEventListener("beforeunload", () => {
		if (playerKey) {
			remove(ref(db, `rooms/${roomId}/players/${playerKey}`));
		}
	});
}

// Envoyer message
function sendMessage() {
	const message = document.getElementById("message").value.trim();
	if (!message || !username || !roomId) return;
	const chatRef = ref(db, `rooms/${roomId}/messages`);
	push(chatRef, { username, message });
	document.getElementById("message").value = "";
}

// Debug : afficher la liste en console
function debugPlayers() {
	console.log("Liste actuelle des joueurs :", playerList);
}

// Terminer la partie (supprimer la room)
function endGame() {
	if (!roomId) return alert("Aucune partie à supprimer !");

	if (confirm("Es-tu sûr de vouloir supprimer la partie ?")) {
		remove(ref(db, `rooms/${roomId}`));
		alert("La partie a été supprimée !");

		// Reset local
		roomId = null;
		playerKey = null;
		playerList = [];
		document.getElementById("players").innerHTML = "";
		document.getElementById("chat").innerHTML = "";
		document.getElementById("roomInfo").innerHTML = "";
	}

    if (isCreator) {
    remove(ref(db, `rooms/${roomId}`));
    alert("La partie a été terminée !");
  } else {
    alert("❌ Seul le créateur peut terminer la partie !");
  }
}

function updateEndGameButton() {
  const endBtn = document.getElementById("endGameBtn");
  if (isCreator) {
    endBtn.style.display = "inline-block";
  } else {
    endBtn.style.display = "none";
  }
}

updateEndGameButton();

// Envoi du message avec Entrée
document.getElementById("message").addEventListener("keypress", (e) => {
	if (e.key === "Enter") {
		sendMessage();
	}
});

// Rendre accessible depuis HTML
window.createGame = createGame;
window.joinGame = joinGame;
window.sendMessage = sendMessage;
window.debugPlayers = debugPlayers;
window.endGame = endGame;
window.startGame = startGame;
window.listenForRole = listenForRole;
