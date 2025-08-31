document.addEventListener("DOMContentLoaded", function () {
  // Initialisation du slider
  new Glide("#slider", {
    type: "carousel",
    perView: 1, // une slide visible à la fois
    focusAt: "center",
    gap: 0,
    autoplay: 3000,
    hoverpause: true,
  }).mount();

  // Infos des cartes
  const cardInfos = {
    villageois: {
      title: "Le villageois",
      text: "Aucun pouvoir, mais participe aux débats et au vote.",
    },
    oracle: {
      title: "L'oracle",
      text: "Chaque nuit, découvre le rôle d’un joueur.",
    },
    amevengeresse: {
      title: "L'âme Vengeresse",
      text: "Si elle est éliminée (par vote ou par attaque nocturne), elle peut, dans un dernier souffle, désigner un joueur à entraîner dans la mort avec elle.",
    },
    eclaireuse: {
      title: "L'éclaireuse",
      text: "Peut espionner la nuit (elle ouvre les yeux discrètement pendant que les Ombres agissent). Mais si le Conteur la surprend à trop regarder, elle risque d’être démasquée par les Ombres !",
    },
    enchanteresse: {
      title: "L'enchanteresse",
      text: "Dispose de 2 potions : Potion de bénédiction : sauve une victime de la nuit (1 seule fois). Potion de nécrose : élimine un joueur de son choix (1 seule fois).",
    },
    eros: {
      title: "Eros",
      text: "La première nuit, il choisit deux joueurs. Ces deux joueurs deviennent âmes liées : si l’un meurt, l’autre meurt immédiatement de chagrin.",
    },
    ombre: {
      title: "L'ombre",
      text: "Chaque nuit, les Ombres se réveillent et désignent une victime. Fait partie du camp des ennemies.",
    },
    villageois: {
      title: "Le villageois",
      text: "Aucun pouvoir, mais participe aux débats et au vote.",
    },
    oracle: {
      title: "L'oracle",
      text: "Chaque nuit, découvre le rôle d’un joueur.",
    },
    cleptomane: {
      title: "Le Cleptomane",
      text: "",
    },
    ombreargente: {
      title: "L'ombre blanche",
      text: "",
    },
    lemedium: {
      title: "Le medium",
      text: "",
    },
    ombredemoniaque: {
      title: "L'ombre démoniaque",
      text: "",
    },
    cartomancien: {
      title: "Le cartomancien",
      text: "Le passé = voir comment personne morte. Le présent = Detertiminer s'il y a un méchant au dessus ou en dessous. Le futur = Savoir qui va mourrir après la fin de la nuit.",
    },
    leprophete: {
      title: "Le prophète",
      text: "Au bout de la troisième nuit, il choisit une personne a sacrifier; Si la personne choisis à la première nuit meut aavant le troisème jour, c'est lui qui meurt à sa place sinon il vit. Si la personne meurt le troisième jour, alors il gagne seul.",
    },
  };

  // Gestion du lightbox
  const links = document.querySelectorAll(".glide__slide a");
  const lightbox = document.getElementById("lightbox");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxText = document.getElementById("lightbox-text");
  const closeBtn = document.querySelector(".lightbox .close");

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const card = this.dataset.card;
      if (cardInfos[card]) {
        lightboxTitle.textContent = cardInfos[card].title;
        lightboxText.textContent = cardInfos[card].text;
        lightbox.style.display = "flex";
      }
    });
  });

  closeBtn.addEventListener("click", () => {
    lightbox.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.style.display = "none";
    }
  });
});
