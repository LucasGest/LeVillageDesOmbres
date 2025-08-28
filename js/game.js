// Envoi du message avec Entrée
document.getElementById("message").addEventListener("keypress", (e) => {
	if (e.key === "Enter") {
		sendMessage();
	}
});
