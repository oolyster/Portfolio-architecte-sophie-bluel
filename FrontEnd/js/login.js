const API_LOGIN = "http://localhost:5678/api/users/login";
const loginForm = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const msgErreur = document.getElementById("msg-error");

// fonction pour afficher le message d'erreur
const showError = () => {
  if (msgErreur) {
    msgErreur.style.display = "flex";
    setTimeout(() => {
      msgErreur.style.display = "none";
    }, 5000);
  }
};

const hideError = () => {
  if (msgErreur) {
    msgErreur.style.display = "none";
  }
};

// fonction pour gérer la soumission du formulaire de connexion
const handleLogin = async (email, password) => {
  try {
    const response = await fetch(API_LOGIN, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la connexion");
    }
    const data = await response.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      // en cas de succès redirection vers la page HTML
      window.location.href = "index.html";
    } else {
      // si pas de token, affiche message erreur
      showError();
    }
  } catch (error) {
    console.error("erreur de connexion :", error);
    showError();
  }
};

// gestion form
document.addEventListener("DOMContentLoaded", () => {
  //masque message erreur au chargement de la page
  hideError();
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // récupération des valeurs du formulaire
    const emailValue = email.value;
    const passwordValue = password.value;
    if (!emailValue || !passwordValue) {
      showError();
      return;
    }
    // masquer l'erreur avant de tenter la connexion
    hideError();
    handleLogin(emailValue, passwordValue);
  });
});
