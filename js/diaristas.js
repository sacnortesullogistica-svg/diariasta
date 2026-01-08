import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";

// ELEMENTOS
const lista = document.getElementById("listaDiaristas");
const nome = document.getElementById("nome");
const telefone = document.getElementById("telefone");
const pix = document.getElementById("pix");
const diaristaId = document.getElementById("diaristaId");

// 🔹 LISTAR DIARISTAS (ORDEM ALFABÉTICA)
async function carregarDiaristas() {
  lista.innerHTML = "";

  const q = query(collection(db, "diaristas"), orderBy("nome"));
  const snapshot = await getDocs(q);

  snapshot.forEach((docSnap) => {
    const d = docSnap.data();

    lista.innerHTML += `
      <tr>
        <td>${d.nome}</td>
        <td>${d.telefone}</td>
        <td>${d.pix}</td>
        <td>
          <button class="btn-editar"
            onclick="editarDiarista(
              '${docSnap.id}',
              '${d.nome}',
              '${d.telefone}',
              '${d.pix}'
            )">
            Alterar
          </button>

          <button class="btn-excluir"
            onclick="excluirDiarista('${docSnap.id}')">
            Excluir
          </button>
        </td>
      </tr>
    `;
  });
}

// 🔹 SALVAR OU ALTERAR
window.salvarDiarista = async function () {

  if (!nome.value || !telefone.value || !pix.value) {
    alert("Preencha todos os campos");
    return;
  }

  // ALTERAR
  if (diaristaId.value) {
    await updateDoc(doc(db, "diaristas", diaristaId.value), {
      nome: nome.value,
      telefone: telefone.value,
      pix: pix.value
    });
  }
  // NOVO
  else {
    await addDoc(collection(db, "diaristas"), {
      nome: nome.value,
      telefone: telefone.value,
      pix: pix.value
    });
  }

  limparFormulario();
  carregarDiaristas();
};

// 🔹 PREENCHER FORMULÁRIO PARA ALTERAR
window.editarDiarista = function (id, n, t, p) {
  diaristaId.value = id;
  nome.value = n;
  telefone.value = t;
  pix.value = p;
};

// 🔹 EXCLUIR
window.excluirDiarista = async function (id) {
  if (confirm("Deseja realmente excluir este diarista?")) {
    await deleteDoc(doc(db, "diaristas", id));
    carregarDiaristas();
  }
};

// 🔹 LIMPAR CAMPOS
function limparFormulario() {
  diaristaId.value = "";
  nome.value = "";
  telefone.value = "";
  pix.value = "";
}

// 🚀 INICIALIZA
carregarDiaristas();

// 📱 FORMATA TELEFONE (SOMENTE NÚMEROS)
window.formatarTelefone = function (input) {
  let valor = input.value.replace(/\D/g, ""); // remove tudo que não é número

  if (valor.length > 11) valor = valor.slice(0, 11);

  if (valor.length >= 2) {
    valor = "(" + valor.substring(0, 2) + ") " + valor.substring(2);
  }

  if (valor.length >= 10) {
    valor = valor.substring(0, 10) + "-" + valor.substring(10);
  }

  input.value = valor;
};
