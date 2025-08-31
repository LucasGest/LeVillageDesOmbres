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
const displayRoomId = document.getElementById("roomCode");

let roomId = null;
let username = null;
let playerKey = null;
let playerList = [];
let isCreator = false;

// Génère un code de room style LG-XXXXXX
function generateRoomCode() {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let code = "";
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return "LG-" + code;
}

// --------------------
// Créer une partie
// --------------------
function createGame() {
    username = document.getElementById("username").value.trim();
    if (!username) return alert("Choisis un pseudo !");

    roomId = generateRoomCode();
    isCreator = true;

    // On prépare la structure Firebase de la room
    const roomData = {
        createdAt: Date.now(),
        creator: username,
        players: {
            [username]: { username, joinedAt: Date.now() }
        },
        messages: {}
    };

    // Sauvegarde dans Firebase
    set(ref(db, `rooms/${roomId}`), roomData)
        .then(() => {
            console.log("✅ Partie créée dans Firebase :", roomId);
            // Redirection vers la page de jeu
            window.location.href = `menu/game.html?room=${roomId}&username=${encodeURIComponent(username)}`;
			
        })
        .catch((error) => {
            console.error("❌ Erreur création Firebase :", error);
        });
}

// --------------------
// Vérifier si je suis créateur
// --------------------
function checkIfCreator() {
    const roomRef = ref(db, `rooms/${roomId}/creator`);
    onValue(roomRef, (snapshot) => {
        const creatorName = snapshot.val();
        isCreator = (creatorName === username);
    }, { onlyOnce: true });
}

// --------------------
// Rejoindre une partie
// --------------------
function joinGame() {
	username = document.getElementById("username").value.trim();
  roomId = document.getElementById("roomInput").value.trim().toUpperCase();
  if (!username || !roomId) return alert("Entre ton pseudo et un code de partie !");

  // Ajoute le joueur dans Firebase
  const playerRef = ref(db, `rooms/${roomId}/players/${username}`);
  set(playerRef, { username, joinedAt: Date.now() })
    .then(() => {
      // Redirige vers la page de jeu
      window.location.href = `menu/game.html?room=${roomId}&username=${encodeURIComponent(username)}`;
    })
    .catch((err) => console.error("Erreur en rejoignant :", err));

	joinRoom();
}

function joinRoom() {
	const playersRef = ref(db, `rooms/${roomId}/players`);

	// Mise à jour de la liste des joueurs
	onValue(playersRef, (snapshot) => {
		const players = snapshot.val() || {};

		// On récupère la liste des pseudos directement depuis les clés
		playerList = Object.keys(players);

		const playersDiv = document.getElementById("players");
		if (playersDiv) playersDiv.innerHTML = playerList.join("<br>");
	});

	// Chat en live
	const chatRef = ref(db, `rooms/${roomId}/messages`);
	onChildAdded(chatRef, (snapshot) => {
		const msg = snapshot.val();
		const chatBox = document.getElementById("chat");
		if (chatBox) {
			chatBox.innerHTML += `<div><b>${msg.username}:</b> ${msg.message}</div>`;
			chatBox.scrollTop = chatBox.scrollHeight;
		}
	});

	// écouter rôle + créateur
	listenForRole();
	checkIfCreator();

	// Supprimer joueur à la déconnexion
	window.addEventListener("beforeunload", () => {
		remove(ref(db, `rooms/${roomId}/players/${username}`));
	});
}

// function joinRoom() {
// 	const playersRef = ref(db, `rooms/${roomId}/players`);
	// const newPlayer = push(playersRef);
	// set(newPlayer, username);
	// playerKey = newPlayer.key;

	// Mise à jour de la liste des joueurs
	// onValue(playersRef, (snapshot) => {
	// 	const players = snapshot.val() || {};
	// 	playerList = Object.values(players).map(p => p.username);

	// 	const playersDiv = document.getElementById("players");
	// 	if (playersDiv) playersDiv.innerHTML = playerList.join("<br>");
	// });

	// Chat en live
	// const chatRef = ref(db, `rooms/${roomId}/messages`);
	// onChildAdded(chatRef, (snapshot) => {
	// 	const msg = snapshot.val();
	// 	const chatBox = document.getElementById("chat");
	// 	if (chatBox) {
	// 		chatBox.innerHTML += `<div><b>${msg.username}:</b> ${msg.message}</div>`;
	// 		chatBox.scrollTop = chatBox.scrollHeight;
	// 	}
	// });

	// listenForRole();
	// checkIfCreator();

	// Supprimer joueur à la déconnexion
// 	window.addEventListener("beforeunload", () => {
// 		if (playerKey) {
// 			remove(ref(db, `rooms/${roomId}/players/${playerKey}`));
// 		}
// 	});
// }

// --------------------
// Envoyer message
// --------------------
function sendMessage() {
    const msgInput = document.getElementById("message");
    const text = msgInput.value.trim();
    if (!text) return;

    const message = {
        username: username,
        message: text,
        createdAt: Date.now(),
    };

    const msgRef = push(ref(db, `rooms/${roomId}/messages`));
    set(msgRef, message).then(() => {
        msgInput.value = "";
    });

	const boxChat = document.querySelector("#chat");
	boxChat.innerHTML = username + " : " + msgInput.value
}

// --------------------
// Distribuer les rôles et démarrer la partie
// --------------------
function startGame() {
	if (!isCreator) {
		alert("Seul le créateur peut lancer la partie !");
		return;
	}

	if (playerList.length < 8) {
		alert("Il faut au moins 8 joueurs !");
		return;
	}

	// Rôles de base
	let rolesPool = [
		"Ombre",
		"Ombre",
		"Oracle",
		"Enchanteresse",
		"Liant des Âmes",
		"Villageois",
		"Villageois",
		"Âme vengeresse",
	];

	// Mélange
	rolesPool = rolesPool.sort(() => Math.random() - 0.5);

	// Si plus de 8 joueurs → on complète avec des Villageois
	while (rolesPool.length < playerList.length) {
		rolesPool.push("Villageois");
	}

	// Distribue les rôles
	const playersRef = ref(db, `rooms/${roomId}/players`);
	onValue(
		playersRef,
		(snapshot) => {
			const players = snapshot.val() || {};
			let i = 0;
			for (const key in players) {
				const role = rolesPool[i];
				set(ref(db, `rooms/${roomId}/roles/${key}`), role);
				i++;
			}
		},
		{ onlyOnce: true }
	);

	  // Mettre à jour le statut de la partie
            const statusRef = ref(db, `rooms/${roomId}/status`);
            set(statusRef, "started");

	// Phase jour
	set(ref(db, `rooms/${roomId}/phase`), {
		type: "day",
		phaseEnd: Date.now() + 3 * 60 * 1000,
	});
}

// --------------------
// Afficher mon rôle
// --------------------
function listenForRole() {
	    if (!roomId || !username) return;

	const roleRef = ref(db, `rooms/${roomId}/roles/${username}`);
	onValue(roleRef, (snapshot) => {
		const role = snapshot.val();
		if (role) {
			const myRoleDiv = document.getElementById("myRole");
			if (myRoleDiv) {
				myRoleDiv.innerText = "Ton rôle est : " + role;
			}
		}
	});
}

// --------------------
// Supprimer la partie
// --------------------
function endGame() {
	if (!roomId) return alert("Aucune partie à supprimer !");

	if (confirm("Es-tu sûr de vouloir supprimer la partie ?")) {
		remove(ref(db, `rooms/${roomId}`));
		alert("La partie a été supprimée !");

		// Reset local
		roomId = null;
		playerKey = null;
		playerList = [];

		const playersDiv = document.getElementById("players");
		if (playersDiv) playersDiv.innerHTML = "";

		const chatDiv = document.getElementById("chat");
		if (chatDiv) chatDiv.innerHTML = "";

		// ⚠️ Correction : "roomInfo" n'existe pas dans ton HTML → je le retire
	}
}

// --------------------
// Inter
// --------------------

// --------------------
// Rendre accessible depuis HTML
// --------------------
window.createGame = createGame;
window.joinGame = joinGame;
window.sendMessage = sendMessage;
window.endGame = endGame;
window.startGame = startGame;
window.listenForRole = listenForRole;
