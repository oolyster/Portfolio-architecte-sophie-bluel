// variables
const gallery = document.querySelector(".gallery");
const categoriesContainer = document.getElementById("categories");
const API = "http://localhost:5678/api";
let allCategories = [];
let dataWorks = [];

// appel API pour récupérer dynamiquement les travaux de l'architechte
const fetchAllWorks = async () => {
  // appel API pour récupérer les travaux
  try {
    const result = await fetch(`${API}/works`);
    // vérification si la requête a réussi
    if (!result.ok) {
      console.error("erreur API");
    }
    // récupération des données JSON
    dataWorks = await result.json();
    // affichage des travaux dans la galerie
    displayGallery(dataWorks);
    // affichage dans la console pour vérification
    console.log("affichage des works récupérés de l'API", dataWorks);
  } catch (error) {
    console.error("erreur lors de la récupération", error);
  }
  return dataWorks;
};

// appel de la fonction pour récupérer les travaux
fetchAllWorks();

// fonction pour afficher les travaux dans la galerie
const displayGallery = (works) => {
  gallery.innerHTML = "";
  works.forEach((work) => {
    const figureRecup = figureWork(work);
    gallery.appendChild(figureRecup);
  });
};

// fonction pour créer un élément figure pour chaque travail
const figureWork = (work) => {
  const figure = document.createElement("figure");
  const image = document.createElement("img");
  image.src = work.imageUrl;
  image.alt = work.title;
  figure.appendChild(image);
  const figureCaption = document.createElement("figcaption");
  figureCaption.textContent = work.title;
  figure.appendChild(figureCaption);
  return figure;
};

// appel API pour récupérer dynamiquement les catégories des travaux
const fetchAllCategories = async () => {
  try {
    const result = await fetch(`${API}/categories`);
    if (!result.ok) {
      console.error("erreur API");
    }
    const dataCategories = await result.json();
    dataCategories.unshift({
      id: 0,
      name: "Tous",
    });
    allCategories = dataCategories;
    for (let category of dataCategories) {
      const button = document.createElement("button");
      button.innerHTML = category.name;
      button.setAttribute("data-category", category.id);
      categoriesContainer.appendChild(button);
      // le bouton "Tous" est activé par défaut
      if (category.id === 0) {
        button.classList.add("active-filter");
      }
    }
    console.log("affichage des catégories récupérés de l'API", dataCategories);
  } catch (error) {
    console.error("erreur lors de la récupération des catégories", error);
  }
};
fetchAllCategories();

// gestion du clic sur les boutons de filtre

const filteredCategoryButton = (e) => {
  const allButtons = document.querySelectorAll("#categories button");
  if (e.target.getAttribute("data-category")) {
    allButtons.forEach((button) => {
      button.classList.remove("active-filter");
    });
    const categoryId = parseInt(e.target.getAttribute("data-category"));
    console.log("au clic sur le bouton", categoryId);
    e.target.classList.add("active-filter");
    const filteredWorks =
      categoryId === 0
        ? dataWorks
        : dataWorks.filter((work) => work.categoryId === categoryId);
    console.log("filteredWorks", filteredWorks);
    displayGallery(filteredWorks);
  }
};

categoriesContainer.addEventListener("click", filteredCategoryButton);

/*
Gestion du mode connecté
*/

// je récupère les éléments dont j'ai besoin
const loginLink = document.getElementById("login-link");
const editBanner = document.getElementById("edit-banner");
const editButton = document.getElementById("edit-button");
const categories = document.getElementById("categories");

// je récupère le token (null s'il n'existe pas)
const token = localStorage.getItem("token");

// SI le token existe : mode connecté
if (token) {
  loginLink.textContent = "logout"; // je change le texte
  loginLink.addEventListener("click", () => {
    // au clic :
    localStorage.removeItem("token"); //   je supprime le token
    window.location.reload(); //   je recharge la page
  });

  editBanner.hidden = false; // j'affiche le bandeau
  editButton.hidden = false; // j'affiche "modifier"
  categories.hidden = true; // je masque les filtres
} else {
  // SINON : mode visiteur
  loginLink.addEventListener("click", () => {
    window.location.href = "login.html"; // redirection
  });

  editBanner.hidden = true;
  editButton.hidden = true;
  categories.hidden = false;
}
