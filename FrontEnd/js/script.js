// ==================================================
// CONSTANTES
// ==================================================
const API = "http://localhost:5678/api";
// token de connexion (null si l'utilisateur n'est pas connecté)
const token = localStorage.getItem("token");

// ==================================================
// DOM
// ==================================================
// galerie et filtres
const gallery = document.querySelector(".gallery");
const categoriesContainer = document.getElementById("categories");

// mode connecté
const loginLink = document.getElementById("login-link");
const editBanner = document.getElementById("edit-banner");
const editButton = document.getElementById("edit-button");

// modale
const modal = document.getElementById("modal");
const closeButton = document.getElementById("close-modal");
const modalGallery = document.getElementById("modal-gallery");
const modalTitle = document.getElementById("modal-title");
const modalActionButton = document.getElementById("modal-action-button");
const backButton = document.getElementById("return-modal");
const addForm = document.getElementById("add-form");
const categorySelect = document.getElementById("category-select");
const imageInput = document.getElementById("image-input");
const preview = document.getElementById("preview");
const titleInput = document.getElementById("title-input");
const formError = document.getElementById("form-error");

// ==================================================
// DONNÉES
// ==================================================
// remplies par les appels API, puis utilisées par la galerie, les filtres et la modale
let allCategories = [];
let dataWorks = [];

// ==================================================
// GALERIE
// ==================================================

// Récupère les travaux depuis l'API puis les affiche dans la galerie.
const fetchAllWorks = async () => {
  try {
    const result = await fetch(`${API}/works`);
    if (!result.ok) {
      throw new Error(`erreur API : ${result.status}`);
    }
    dataWorks = await result.json();
    displayGallery(dataWorks);
  } catch (error) {
    console.error("erreur lors de la récupération des travaux", error);
  }
};

// Vide la galerie puis y affiche chaque travail de la liste reçue.
const displayGallery = (works) => {
  gallery.innerHTML = "";
  works.forEach((work) => {
    const figureRecup = figureWork(work);
    gallery.appendChild(figureRecup);
  });
};

// Crée l'image d'un travail (utilisée par la galerie et par la modale).
const createImage = (work) => {
  const image = document.createElement("img");
  image.src = work.imageUrl;
  image.alt = work.title;
  return image;
};

// Crée la figure d'un travail (image + titre) pour la galerie.
const figureWork = (work) => {
  const figure = document.createElement("figure");
  figure.appendChild(createImage(work));
  const figureCaption = document.createElement("figcaption");
  figureCaption.textContent = work.title;
  figure.appendChild(figureCaption);
  return figure;
};

// ==================================================
// FILTRES
// ==================================================

// appel API pour récupérer dynamiquement les catégories des travaux
const fetchAllCategories = async () => {
  try {
    const result = await fetch(`${API}/categories`);
    if (!result.ok) {
      throw new Error(`erreur API : ${result.status}`);
    }
    const dataCategories = await result.json();
    // ajoute une fausse catégorie "Tous" (id 0) en première position pour afficher tous les travaux
    dataCategories.unshift({
      id: 0,
      name: "Tous",
    });
    allCategories = dataCategories;
    for (const category of dataCategories) {
      const button = document.createElement("button");
      button.textContent = category.name;
      button.dataset.category = category.id;
      categoriesContainer.appendChild(button);
      // le bouton "Tous" est activé par défaut
      if (category.id === 0) {
        button.classList.add("active-filter");
      }
    }
  } catch (error) {
    console.error("erreur lors de la récupération des catégories", error);
  }
};

// Filtre la galerie selon le bouton cliqué ("Tous", id 0, affiche tout).
// Un seul écouteur sur le conteneur gère tous les boutons de filtre.
const filteredCategoryButton = (e) => {
  // clic dans le conteneur mais pas sur un bouton : on ne fait rien
  if (!e.target.dataset.category) {
    return;
  }
  const allButtons = categoriesContainer.querySelectorAll("button");
  allButtons.forEach((button) => {
    button.classList.remove("active-filter");
  });
  e.target.classList.add("active-filter");
  const categoryId = Number(e.target.dataset.category);
  const filteredWorks =
    categoryId === 0
      ? dataWorks
      : dataWorks.filter((work) => work.categoryId === categoryId);
  displayGallery(filteredWorks);
};

categoriesContainer.addEventListener("click", filteredCategoryButton);

// ==================================================
// MODE CONNECTÉ
// ==================================================

// Connecté : affiche "logout", le bandeau et le bouton "modifier", masque les filtres.
if (token) {
  loginLink.textContent = "logout";
  loginLink.addEventListener("click", () => {
    // déconnexion : on supprime le token puis on recharge la page en mode visiteur
    localStorage.removeItem("token");
    window.location.reload();
  });
  editBanner.hidden = false;
  editButton.hidden = false;
  categoriesContainer.hidden = true;
} else {
  // Visiteur : le clic sur "login" mène à la page de connexion.
  loginLink.addEventListener("click", () => {
    window.location.href = "login.html";
  });
}

// ==================================================
// MODALE
// ==================================================

const resetForm = () => {
  addForm.reset();
  preview.hidden = true;
  formError.hidden = true;
  preview.src = "";
};

// Affiche un message d'erreur sous le formulaire d'ajout.
const showFormError = (message) => {
  formError.textContent = message;
  formError.hidden = false;
};

// Envoie le nouveau travail à l'API, met à jour les deux galeries et revient à la vue galerie.
const submitForm = async () => {
  const formData = new FormData();
  formData.append("image", imageInput.files[0]);
  formData.append("title", titleInput.value);
  formData.append("category", categorySelect.value);

  try {
    const response = await fetch(`${API}/works`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`erreur API : ${response.status}`);
    }
    const newWork = await response.json();
    dataWorks.push(newWork);
    displayGallery(dataWorks);
    displayModalGallery(dataWorks);
    resetForm();
    showGalleryView();
  } catch (error) {
    console.error("erreur lors de l'envoi", error);
    showFormError("Il y a eu une erreur lors de l'envoi. Veuillez réessayer.");
  }
};

// Active le bouton "Valider" seulement si l'image, le titre et la catégorie sont remplis.
const checkForm = () => {
  const isFormValid =
    imageInput.files.length > 0 &&
    titleInput.value.trim() !== "" &&
    categorySelect.value !== "";
  modalActionButton.disabled = !isFormValid;
};

const handleImageChange = () => {
  const file = imageInput.files[0];
  if (!file) {
    return;
  }
  if (
    ["image/jpeg", "image/png"].includes(file.type) &&
    file.size < 4 * 1024 * 1024
  ) {
    formError.hidden = true;
    preview.src = URL.createObjectURL(file);
    preview.hidden = false;
  } else {
    showFormError(
      "Le fichier attendu doit être au format JPEG ou PNG et faire moins de 4 Mo",
    );
    imageInput.value = "";
    preview.hidden = true;
  }
  checkForm();
};

imageInput.addEventListener("change", handleImageChange);
titleInput.addEventListener("input", checkForm);
categorySelect.addEventListener("change", checkForm);

const fillCategorySelect = () => {
  categorySelect.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Choisissez une catégorie";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  categorySelect.appendChild(defaultOption);
  const categoriesForSelect = allCategories.filter(
    (category) => category.id !== 0,
  );
  for (const category of categoriesForSelect) {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  }
};

const showAddView = () => {
  modalTitle.textContent = "Ajout photo";
  modalActionButton.textContent = "Valider";
  modalActionButton.onclick = submitForm;
  modalGallery.hidden = true;
  addForm.hidden = false;
  backButton.hidden = false;
  fillCategorySelect();
  checkForm();
};

// Supprime un travail via l'API, puis met à jour la galerie et la modale.
const deleteWork = async (id) => {
  try {
    const result = await fetch(`${API}/works/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!result.ok) {
      throw new Error(`erreur API : ${result.status}`);
    }
    dataWorks = dataWorks.filter((work) => work.id !== id);
    displayModalGallery(dataWorks);
    displayGallery(dataWorks);
  } catch (error) {
    console.error("erreur lors de la suppression", error);
  }
};

const displayModalGallery = (works) => {
  modalGallery.innerHTML = "";
  works.forEach((work) => {
    const figureRecup = modalFigure(work);
    modalGallery.appendChild(figureRecup);
  });
};

// Crée la figure d'un travail pour la galerie de la modale, avec un bouton poubelle qui supprime le travail (appel API).
const modalFigure = (work) => {
  const figure = document.createElement("figure");
  figure.classList.add("modal-figure");
  figure.appendChild(createImage(work));
  const trashButton = document.createElement("button");
  trashButton.setAttribute("aria-label", `Supprimer ${work.title}`);
  trashButton.addEventListener("click", () => deleteWork(work.id));
  const trashIcon = document.createElement("i");
  trashIcon.classList.add("fa-solid", "fa-trash-can");
  trashButton.appendChild(trashIcon);
  figure.appendChild(trashButton);
  return figure;
};

const showGalleryView = () => {
  modalTitle.textContent = "Galerie photo";
  modalActionButton.textContent = "Ajouter une photo";
  modalActionButton.disabled = false;
  modalActionButton.onclick = showAddView;
  modalGallery.hidden = false;
  addForm.hidden = true;
  backButton.hidden = true;
};

// j'affiche la modale au clic sur le bouton "modifier"
const openModal = () => {
  modal.hidden = false;
  displayModalGallery(dataWorks);
  showGalleryView();
};
editButton.addEventListener("click", openModal);

// je ferme la modale au clic sur le bouton "fermer"
const closeModal = () => {
  modal.hidden = true;
};

closeButton.addEventListener("click", closeModal);
backButton.addEventListener("click", showGalleryView);

// je ferme la modale au clic en dehors de la modale
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

// ==================================================
// LANCEMENT
// ==================================================
fetchAllWorks();
fetchAllCategories();
