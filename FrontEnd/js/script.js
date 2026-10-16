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

// appel API pour récupérer dynamiquement les travaux de l'architechte
const fetchAllWorks = async () => {
  // appel API pour récupérer les travaux
  try {
    const result = await fetch(`${API}/works`);
    // vérification si la requête a réussi
    if (!result.ok) {
      throw new Error(`erreur API : ${result.status}`);
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
    dataCategories.unshift({
      id: 0,
      name: "Tous",
    });
    allCategories = dataCategories;
    for (let category of dataCategories) {
      const button = document.createElement("button");
      button.textContent = category.name;
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

// ==================================================
// MODE CONNECTÉ
// ==================================================

// SI le token existe : mode connecté
if (token) {
  loginLink.textContent = "logout"; // je change le texte
  loginLink.setAttribute("href", "index.html");
  loginLink.addEventListener("click", (event) => {
    event.preventDefault();
    // au clic :
    localStorage.removeItem("token"); //   je supprime le token
    window.location.reload(); //   je recharge la page
  });

  editBanner.hidden = false; // j'affiche le bandeau
  editButton.hidden = false; // j'affiche "modifier"
  categoriesContainer.hidden = true; // je masque les filtres
} else {
  // SINON : mode visiteur
  loginLink.addEventListener("click", () => {
    window.location.href = "login.html"; // redirection
  });

  editBanner.hidden = true;
  editButton.hidden = true;
  categoriesContainer.hidden = false;
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
      console.error("erreur lors de l'envoi", response.status);
      formError.hidden = false;
      formError.textContent =
        "Il y a eu une erreur lors de l'envoi. Veuillez réessayer.";
      return;
    }
    const newWork = await response.json();
    dataWorks.push(newWork);
    displayGallery(dataWorks);
    displayModalGallery(dataWorks);
    resetForm();
    showGalleryView();
  } catch (error) {
    console.error("erreur lors de l'envoi", error);
    formError.hidden = false;
    formError.textContent =
      "Il y a eu une erreur lors de l'envoi. Veuillez réessayer.";
  }
};

const checkForm = () => {
  if (
    imageInput.files.length > 0 &&
    titleInput.value.trim() !== "" &&
    categorySelect.value !== ""
  ) {
    modalActionButton.disabled = false;
  } else {
    modalActionButton.disabled = true;
  }
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
    formError.hidden = false;
    formError.textContent =
      "Le fichier attendu doit être au format JPEG ou PNG et faire moins de 4 Mo";
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
  for (let category of categoriesForSelect) {
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

const deleteWork = async (id) => {
  try {
    const result = await fetch(`${API}/works/${id}`, {
      method: "DELETE",
      headers: {
        accept: `*/*`,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!result.ok) {
      console.error("erreur API");
      return;
    }
    dataWorks = dataWorks.filter((work) => work.id !== Number(id));
    displayModalGallery(dataWorks);
    displayGallery(dataWorks);
    console.log("affichage des works récupérés de l'API", dataWorks);
  } catch (error) {
    console.error("erreur lors de la récupération", error);
  }
  return dataWorks;
};

const displayModalGallery = (works) => {
  modalGallery.innerHTML = "";
  works.forEach((work) => {
    const figureRecup = modalFigure(work);
    modalGallery.appendChild(figureRecup);
  });
};

// je crée un élément figure pour chaque travail dans la modale
const modalFigure = (work) => {
  const figure = document.createElement("figure");
  figure.style.position = "relative";
  figure.classList.add("modal-figure");
  const image = document.createElement("img");
  image.src = work.imageUrl;
  image.alt = work.title;
  figure.appendChild(image);
  const trashButton = document.createElement("button");
  trashButton.addEventListener("click", () => deleteWork(work.id));
  trashButton.style.position = "absolute";
  trashButton.style.top = "2px";
  trashButton.style.right = "2px";
  trashButton.dataset.id = work.id;
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
