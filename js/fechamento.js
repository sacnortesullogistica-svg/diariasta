import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= FECHAMENTO ================= */
window.gerarFechamento = async function () {
  const inicio = document.getElementById("dataInicio").value;
  const fim = document.getElementById("dataFim").value;

  const head = document.getElementById("fechamentoHead");
  const body = document.getElementById("resultadoFechamento");

  head.innerHTML = "";
  body.innerHTML = "";

  if (!inicio || !fim) {
    alert("Informe o período");
    return;
  }

  // 🔹 LISTA DE DATAS
  const datas = [];
  let d = new Date(inicio);
  const dFim = new Date(fim);

  while (d <= dFim) {
    datas.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }

  // 🔹 CABEÇALHO
  let ths = "<tr><th>Diarista</th><th>Pix</th>";
  datas.forEach(dt => {
    ths += `<th>${dt.split("-").reverse().join("/")}</th>`;
  });
  ths += "<th>Extra</th><th>D. Extra (R$)</th><th>Total</th></tr>";
  head.innerHTML = ths;

  // 🔹 DIARISTAS
  const diaristasSnap = await getDocs(collection(db, "diaristas"));
  const diaristas = {};
  diaristasSnap.forEach(d => diaristas[d.id] = d.data());

  // 🔹 LANÇAMENTOS
  const lancSnap = await getDocs(collection(db, "lancamentos_diaria"));
  const mapa = {};

  lancSnap.forEach(doc => {
    const l = doc.data();
    if (l.data >= inicio && l.data <= fim) {
      if (!mapa[l.diaristaId]) mapa[l.diaristaId] = {};
      mapa[l.diaristaId][l.data] = Number(l.valor);
    }
  });

  // 🔹 MONTAR TABELA
  Object.entries(diaristas).forEach(([id, d]) => {
    let totalDiarias = 0;

    let linha = `<tr>
      <td>${d.nome}</td>
      <td>${d.pix || "-"}</td>
    `;

    datas.forEach(dt => {
      if (mapa[id] && mapa[id][dt]) {
        totalDiarias += mapa[id][dt];
        linha += `<td>R$ ${mapa[id][dt].toFixed(2)}</td>`;
      } else {
        linha += `<td>NAO</td>`;
      }
    });

    linha += `
      <!-- EXTRA INFORMATIVO -->
      <td>
        <input
          type="number"
          value="0"
          min="0"
          style="width:70px;text-align:center"
        >
      </td>

      <!-- D.EXTRA QUE SOMA -->
      <td>
        <input
          type="number"
          value="0"
          min="0"
          style="width:90px;text-align:center"
          oninput="atualizarTotal(this, ${totalDiarias})"
        >
      </td>

      <td class="total">
        R$ ${totalDiarias.toFixed(2)}
      </td>
    </tr>`;

    body.innerHTML += linha;
  });
};

/* ================= ATUALIZAR TOTAL ================= */
window.atualizarTotal = function (input, totalDiarias) {
  const dExtra = Number(input.value || 0);
  const tdTotal = input.closest("tr").querySelector(".total");

  const somaFinal = totalDiarias + dExtra;
  tdTotal.innerText = `R$ ${somaFinal.toFixed(2)}`;
};

/* ================= GERAR PDF ================= */
window.gerarPDF = function () {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("jsPDF não carregado");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("l", "mm", "a4");

  const inicio = document.getElementById("dataInicio").value;
  const fim = document.getElementById("dataFim").value;
  const observacao = document.getElementById("observacao").value;

  doc.setFontSize(16);
  doc.text("Fechamento Semanal de Diárias", 14, 15);

  doc.setFontSize(10);
  doc.text(
    `Período: ${formatarData(inicio)} até ${formatarData(fim)}`,
    14,
    22
  );

  const head = [];
  document.querySelectorAll("#fechamentoHead th").forEach(th => {
    head.push(th.innerText);
  });

  const body = [];
  document.querySelectorAll("#resultadoFechamento tr").forEach(tr => {
    const row = [];
    tr.querySelectorAll("td").forEach(td => {
      const input = td.querySelector("input");
      row.push(input ? td.querySelector("input").value : td.innerText);
    });
    body.push(row);
  });

  doc.autoTable({
    startY: 28,
    head: [head],
    body,
    theme: "grid",
    styles: { fontSize: 8, halign: "center" }
  });

  let y = doc.lastAutoTable.finalY + 10;
  doc.text("Observação:", 14, y);
  doc.text(observacao || "-", 14, y + 6);

  doc.save("fechamento-diarias.pdf");
};

/* ================= AUXILIAR ================= */
function formatarData(data) {
  if (!data) return "";
  return data.split("-").reverse().join("/");
}
