// --- Import Firebase ---
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

// --- Config Firebase ---
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

// --- Variables globales ---
let roomId = null;
let username = null;
let playerKey = null;
let playerList = [];

// --- Liste des rôles ---
const roles = [
	{
		code: "CUP",
		nom: "Cupidon",
		description:
			"Au début de la partie, Cupidon désigne deux joueurs amoureux.",
		image: "img/cupidon.png",
	},
	{
		code: "SOR",
		nom: "Sorcière",
		description: "Elle possède deux potions : une pour sauver, une pour tuer.",
		image: "img/soso.png",
	},
	{
		code: "VOY",
		nom: "Voyante",
		description: "Chaque nuit, elle découvre l’identité d’un joueur.",
		image: "img/vovo.png",
	},
	{
		code: "PF",
		nom: "Petite Fille",
		description: "Elle espionne les loups la nuit, discrètement.",
		image: "img/pf.png",
	},
	{
		code: "SV",
		nom: "Simple Villageois",
		description: "Il n’a aucun pouvoir spécial.",
		image: "img/villageois.png",
	},
	{
		code: "LG",
		nom: "Loup Garou",
		description: "Chaque nuit, ils dévorent un joueur.",
		image: "img/lg.png",
	},
];

// --- Affichage des rôles ---
function renderRoles() {
	const grid = document.getElementById("rolesGrid");
	roles.forEach((role) => {
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
async function createGame() {
    const name = document.getElementById("usernameInput").value.trim();

    if (!name) {
        alert("Entre ton pseudo avant de créer une partie !");
        return;
    }

    // Générer un code unique de room
    const roomCode = "LG-" + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Créer la room dans Firestore
    await setDoc(doc(db, "rooms", roomCode), {
        players: [name],
        createdAt: new Date(),
        messages: []
    });

    // Sauvegarder la room actuelle dans le localStorage
    localStorage.setItem("roomCode", roomCode);
    localStorage.setItem("username", name);

    // Afficher l’info de room
    document.getElementById("roomInfo").innerText = `Room : ${roomCode}`;

    // Auto-join la room
    joinRoomRealtime(roomCode);
}


// --- Rejoindre une partie ---
async function joinGame() {
    const name = document.getElementById("usernameInput").value.trim();
    const roomCode = document.getElementById("roomInput").value.trim().toUpperCase();

    if (!name || !roomCode) {
        alert("Entre ton pseudo et un code de room pour rejoindre !");
        return;
    }

    const roomRef = doc(db, "rooms", roomCode);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
        alert("Cette room n’existe pas !");
        return;
    }

    // Ajouter le joueur dans la liste
    const data = roomSnap.data();
    if (!data.players.includes(name)) {
        await updateDoc(roomRef, {
            players: arrayUnion(name)
        });
    }

    // Sauvegarder en local
    localStorage.setItem("roomCode", roomCode);
    localStorage.setItem("username", name);

    // Afficher l’info de room
    document.getElementById("roomInfo").innerText = `Room : ${roomCode}`;

    // Ecouter en temps réel
    joinRoomRealtime(roomCode);
}

	// Suppression du joueur à la fermeture
	window.addEventListener(
		"beforeunload",
		() => {
			if (playerKey) remove(ref(db, `rooms/${roomId}/players/${playerKey}`));
		},
		{ once: true }
	);
// --- Envoyer un message ---
function sendMessage() {
	const text = document.getElementById("message").value.trim();
	if (!roomId || !username || !text) return;

	const messagesRef = ref(db, `rooms/${roomId}/messages`);
	push(messagesRef, {
		username,
		message: text,
		ts: Date.now(),
	});

	document.getElementById("message").value = "";
}

const msgInput = document.getElementById("message");
if (msgInput) {
  msgInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

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

// --- Expose globalement ---
window.createGame = createGame;
window.joinGame = joinGame;
window.sendMessage = sendMessage;
window.endGame = endGame;
