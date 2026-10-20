// ==================================================
// CONSTANTES
// ==================================================
const API = "http://localhost:5678/api";
// token de connexion (null si l'utilisateur n'est pas connecté)
const token = localStorage.getItem("token");
// durée d'affichage du message d'erreur (en millisecondes)
const ERROR_DURATION = 5000;

// ==================================================
// DOM
// ==================================================
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("msg-error");

// ==================================================
// DONNÉES
// ==================================================
// minuteur qui cache le message d'erreur
let errorTimer;

// ==================================================
// REDIRECTION
// ==================================================
// Déjà connecté : la page de connexion est inutile, retour à l'accueil

if (token) {
  window.location.replace("index.html");
}

// ==================================================
// MESSAGE D'ERREUR
// ==================================================

// Cache le message d'erreur
const hideError = () => {
  errorMessage.hidden = true;
};

// Affiche le message d'erreur pendant 5 secondes
const showError = () => {
  errorMessage.hidden = false;
  // annule le minuteur précédent pour que les 5 secondes repartent de zéro
  clearTimeout(errorTimer);
  errorTimer = setTimeout(hideError, ERROR_DURATION);
};

// ==================================================
// CONNEXION
// ==================================================

// Envoie l'e-mail et le mot de passe à l'API. Si ok, enregistre le token et va sur l'accueil, sinon affiche l'erreur
const handleLogin = async (email, password) => {
  try {
    const response = await fetch(`${API}/users/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      console.error(`erreur API : ${response.status}`);
      showError();
      return;
    }
    const data = await response.json();
    if (!data.token) {
      console.error("pas de token dans la réponse");
      showError();
      return;
    }
    localStorage.setItem("token", data.token);
    // en cas de succès redirection vers la page d'accueil
    window.location.href = "index.html";
  } catch (error) {
    console.error("erreur de connexion :", error);
    showError();
  }
};

// ==================================================
// ÉCOUTEURS
// ==================================================

// À l'envoi du formulaire : vérifie que les deux champs sont remplis, puis tente la connexion
loginForm.addEventListener("submit", (e) => {
  // empêche le navigateur de recharger la page
  e.preventDefault();
  // récupération des valeurs du formulaire
  const emailValue = emailInput.value;
  const passwordValue = passwordInput.value;
  if (!emailValue || !passwordValue) {
    showError();
    return;
  }
  // cache une éventuelle erreur précédente avant de retenter
  hideError();
  handleLogin(emailValue, passwordValue);
});
