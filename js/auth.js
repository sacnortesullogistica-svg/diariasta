import { signInWithEmailAndPassword, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { auth } from "./firebase.js";

// LOGIN
window.login = async function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    window.location.href = "dashboard.html";
  } catch (e) {
    alert("Email ou senha inválidos");
  }
};

// PROTEÇÃO DE ROTAS
onAuthStateChanged(auth, (user) => {
  const pagina = window.location.pathname;

  if (pagina.includes("dashboard") && !user) {
    window.location.href = "index.html";
  }

  if (pagina.endsWith("index.html") && user) {
    window.location.href = "dashboard.html";
  }
});
