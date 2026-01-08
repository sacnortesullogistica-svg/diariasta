import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";

/* ================= ELEMENTOS ================= */
const nomeTipo = document.getElementById("nomeTipo");
const valorTipo = document.getElementById("valorTipo");
const tipoId = document.getElementById("tipoId");
const listaTipos = document.getElementById("listaTipos");

const diaristaSelect = document.getElementById("diaristaSelect");
const tipoSelect = document.getElementById("tipoSelect");
const dataInput = document.getElementById("dataDiaria");
const valorLancamento = document.getElementById("valorLancamento");
const lancamentoId = document.getElementById("lancamentoId");
const listaLancamentos = document.getElementById("listaLancamentos");

/* ================= TIPOS DE DIÁRIA ================= */
async function carregarTipos() {
  listaTipos.innerHTML = "";
  tipoSelect.innerHTML = "<option value=''>Selecione</option>";

  const q = query(collection(db, "tipos_diaria"), orderBy("nome"));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const d = docSnap.data();

    listaTipos.innerHTML += `
      <tr>
        <td>${d.nome}</td>
        <td>R$ ${Number(d.valor).toFixed(2)}</td>
        <td>
          <button class="btn-editar"
            onclick="editarTipo('${docSnap.id}','${d.nome}','${d.valor}')">
            Alterar
          </button>
          <button class="btn-excluir"
            onclick="excluirTipo('${docSnap.id}')">
            Excluir
          </button>
        </td>
      </tr>
    `;

    tipoSelect.innerHTML += `
      <option value="${docSnap.id}" data-valor="${d.valor}">
        ${d.nome}
      </option>
    `;
  });
}

window.salvarTipo = async function () {
  if (!nomeTipo.value || !valorTipo.value) {
    alert("Preencha os campos");
    return;
  }

  const dados = {
    nome: nomeTipo.value,
    valor: Number(valorTipo.value)
  };

  if (tipoId.value) {
    await updateDoc(doc(db, "tipos_diaria", tipoId.value), dados);
  } else {
    await addDoc(collection(db, "tipos_diaria"), dados);
  }

  nomeTipo.value = "";
  valorTipo.value = "";
  tipoId.value = "";
  carregarTipos();
};

window.editarTipo = function (id, nome, valor) {
  tipoId.value = id;
  nomeTipo.value = nome;
  valorTipo.value = valor;
};

window.excluirTipo = async function (id) {
  if (confirm("Excluir tipo de diária?")) {
    await deleteDoc(doc(db, "tipos_diaria", id));
    carregarTipos();
  }
};

/* ================= DIARISTAS ================= */
async function carregarDiaristas() {
  diaristaSelect.innerHTML = "<option value=''>Selecione</option>";

  const q = query(collection(db, "diaristas"), orderBy("nome"));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    diaristaSelect.innerHTML += `
      <option value="${docSnap.id}">
        ${docSnap.data().nome}
      </option>
    `;
  });
}

/* ================= LANÇAMENTO DE DIÁRIA ================= */
window.atualizarValor = function () {
  const opt = tipoSelect.selectedOptions[0];
  valorLancamento.value = opt ? opt.dataset.valor : "";
};

window.salvarLancamento = async function () {
  if (!diaristaSelect.value || !tipoSelect.value || !dataInput.value) {
    alert("Preencha todos os campos");
    return;
  }

  const diaristaId = diaristaSelect.value;
  const diaristaNome =
    diaristaSelect.options[diaristaSelect.selectedIndex].text;

  // 🔹 BUSCAR CHAVE PIX DO DIARISTA
  const diaristaSnap = await getDoc(doc(db, "diaristas", diaristaId));
  const pix = diaristaSnap.exists() ? diaristaSnap.data().pix || "" : "";

  const tipoOpt = tipoSelect.selectedOptions[0];

  const dadosLancamento = {
    diaristaId,
    diaristaNome,
    pix,
    tipoDiariaId: tipoSelect.value,
    tipoDiariaNome: tipoOpt.text,
    valor: Number(tipoOpt.dataset.valor),
    data: dataInput.value
  };

  if (lancamentoId.value) {
    await updateDoc(
      doc(db, "lancamentos_diaria", lancamentoId.value),
      dadosLancamento
    );
  } else {
    await addDoc(collection(db, "lancamentos_diaria"), dadosLancamento);
  }

  limparLancamento();
  carregarLancamentos();
};

async function carregarLancamentos() {
  listaLancamentos.innerHTML = "";

  const q = query(
    collection(db, "lancamentos_diaria"),
    orderBy("data", "desc")
  );

  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const d = docSnap.data();

    listaLancamentos.innerHTML += `
      <tr>
        <td>${d.data.split("-").reverse().join("/")}</td>
        <td>${d.diaristaNome}</td>
        <td>${d.tipoDiariaNome}</td>
        <td>R$ ${Number(d.valor).toFixed(2)}</td>
        <td>
          <button class="btn-editar"
            onclick="editarLancamento(
              '${docSnap.id}',
              '${d.diaristaId}',
              '${d.tipoDiariaId}',
              '${d.data}'
            )">
            Alterar
          </button>
          <button class="btn-excluir"
            onclick="excluirLancamento('${docSnap.id}')">
            Excluir
          </button>
        </td>
      </tr>
    `;
  });
}

window.editarLancamento = function (id, diaristaId, tipoId, data) {
  lancamentoId.value = id;
  diaristaSelect.value = diaristaId;
  tipoSelect.value = tipoId;
  dataInput.value = data;
  atualizarValor();
};

window.excluirLancamento = async function (id) {
  if (confirm("Excluir diária?")) {
    await deleteDoc(doc(db, "lancamentos_diaria", id));
    carregarLancamentos();
  }
};

function limparLancamento() {
  lancamentoId.value = "";
  diaristaSelect.value = "";
  tipoSelect.value = "";
  dataInput.value = "";
  valorLancamento.value = "";
}

/* ================= INIT ================= */
carregarTipos();
carregarDiaristas();
carregarLancamentos();
