// Tableau pour stocker les joueurs
let players = [];

// Tous les rôles classiques
const roles = [
    {name: "Loup-Garou", description: "Chaque nuit, les loups-garous choisissent une victime."},
    {name: "Loup-Garou", description: "Chaque nuit, les loups-garous choisissent une victime."},
    {name: "Voyante", description: "Chaque nuit, tu peux découvrir le rôle d’un joueur."},
    {name: "Sorcière", description: "Tu as une potion de vie et une potion de mort à utiliser une fois chacune."},
    {name: "Chasseur", description: "Si tu meurs, tu peux éliminer un autre joueur."},
    {name: "Cupidon", description: "Tu choisis deux amoureux qui mourront ensemble."},
    {name: "Petite Fille", description: "Tu peux espionner les loups-garous la nuit, mais attention à ne pas te faire tuer."},
    {name: "Villageois", description: "Tu n’as pas de pouvoir spécial, mais tu votes pour éliminer les loups-garous."}
    // Tu peux ajouter d'autres rôles officiels ici
];

// Stocke les rôles assignés aux joueurs
let playerRoles = {};

// Ajouter un joueur
function addPlayer() {
    const name = prompt("Quel est ton prénom ?");
    if (!name || name.trim() === "") {
        alert("Tu dois entrer un prénom !");
        return;
    }

    players.push(name.trim());
    updatePlayersList();
}

// Met à jour la liste des joueurs dans la page
function updatePlayersList() {
    const list = document.getElementById("players-list");
    list.innerHTML = "";
    players.forEach(player => {
        const li = document.createElement("li");
        li.textContent = player;
        list.appendChild(li);
    });
}

// Tirage aléatoire des rôles
function assignRoles() {
    if (players.length < 8) {
        alert("Il faut au moins 8 joueurs pour commencer !");
        return;
    }

    // Mélanger les rôles
    const shuffledRoles = roles.sort(() => Math.random() - 0.5);

    players.forEach((player, index) => {
        playerRoles[player] = shuffledRoles[index];
    });

    // Afficher chaque joueur et permettre de voir son rôle
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = "";
    players.forEach(player => {
        const li = document.createElement("li");
        li.textContent = `${player} : Clique pour voir ton rôle`;
        li.style.cursor = "pointer";

        li.addEventListener("click", () => {
            alert(`${player}, ton rôle est : ${playerRoles[player].name}\n${playerRoles[player].description}`);
        });

        playersList.appendChild(li);
    });
}

// Événements sur les boutons
document.getElementById("start-btn").addEventListener("click", () => {
    addPlayer();
    document.getElementById("welcome-section").style.display = "none";
    document.getElementById("game-section").style.display = "block";
});

document.getElementById("assign-roles-btn").addEventListener("click", assignRoles);

