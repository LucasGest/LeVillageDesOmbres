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
	//document.getElementById("startGame").style.display = "inline-block";

	document.getElementById(
		"roomCode"
	).innerHTML = `<b>Code de ta partie :</b> ${roomId}<br>Partage-le avec tes amis !`;

	joinRoom();
}

// Démarrer la partie
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
        "Loup Garou",
        "Loup Garou",
        "Voyante",
        "Sorcière",
        "Cupidon",
        "Villageois",
        "Villageois",
        "Chasseur",
    ];

    // Mélange
    rolesPool = rolesPool.sort(() => Math.random() - 0.5);

    // Si plus de 8 joueurs → on complète avec des Villageois
    while (rolesPool.length < playerList.length) {
        rolesPool.push("Villageois");
    }

    // Distribue les rôles dans Firebase en utilisant les clés des joueurs
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

    // Phase jour
    set(ref(db, `rooms/${roomId}/phase`), {
        type: "day",
        phaseEnd: Date.now() + 3 * 60 * 1000,
    });

}


// Récupère et affiche mon rôle
function listenForRole() {
    const roleRef = ref(db, `rooms/${roomId}/roles/${playerKey}`);
    onValue(roleRef, (snapshot) => {
        const role = snapshot.val();
        if (role) {
            document.getElementById("myRole").innerText = "Ton rôle est : " + role;
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

    listenForRole();

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
}
// Rendre accessible depuis HTML
window.createGame = createGame;
window.joinGame = joinGame;
window.sendMessage = sendMessage;
window.debugPlayers = debugPlayers;
window.endGame = endGame;
window.startGame = startGame;
window.listenForRole = listenForRole;
