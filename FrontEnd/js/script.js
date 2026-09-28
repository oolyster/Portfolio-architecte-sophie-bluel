// variables
const gallery = document.querySelector(".gallery");
const API = "http://localhost:5678/api";

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
    const dataWorks = await result.json();
    // affichage des travaux dans la galerie
    displayGallery(dataWorks);
    // affichage dans la console pour vérification
    console.log("affichage des works récupérés de l'API", dataWorks);
  } catch (error) {
    console.error("erreur lors de la récupération", error);
  }
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
