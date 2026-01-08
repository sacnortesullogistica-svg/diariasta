window.gerarPDF = function () {
  // 🔴 VERIFICA SE AS BIBLIOTECAS EXISTEM
  if (!window.jspdf || !window.jspdfAutoTable) {
    alert("Biblioteca de PDF não carregada");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("l", "mm", "a4"); // paisagem (melhor p/ tabela)

  const dataInicio = document.getElementById("dataInicio").value;
  const dataFim = document.getElementById("dataFim").value;
  const observacao = document.getElementById("observacao").value;

  // 🔹 TÍTULO
  doc.setFontSize(16);
  doc.setTextColor(30, 144, 255);
  doc.text("Fechamento Semanal de Diárias", 14, 15);

  // 🔹 PERÍODO
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(
    `Período: ${formatarData(dataInicio)} até ${formatarData(dataFim)}`,
    14,
    22
  );

  // 🔹 CAPTURAR TABELA DO HTML
  const head = [];
  document.querySelectorAll("#fechamentoHead th").forEach(th => {
    head.push(th.innerText);
  });

  const body = [];
  document.querySelectorAll("#resultadoFechamento tr").forEach(tr => {
    const row = [];
    tr.querySelectorAll("td").forEach(td => {
      const input = td.querySelector("input");
      row.push(input ? input.value : td.innerText);
    });
    body.push(row);
  });

  if (body.length === 0) {
    alert("Nenhum dado para gerar PDF");
    return;
  }

  // 🔹 TABELA (FORMA CORRETA EM MODULE)
  window.jspdfAutoTable(doc, {
    startY: 28,
    head: [head],
    body: body,
    theme: "grid",
    styles: {
      fontSize: 8,
      halign: "center",
      valign: "middle"
    },
    headStyles: {
      fillColor: [30, 144, 255],
      textColor: 255
    }
  });

  // 🔹 OBSERVAÇÃO
  let y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.text("Observação:", 14, y);
  doc.setFontSize(10);
  doc.text(observacao || "-", 14, y + 6);

  // 🔹 SALVAR
  doc.save("fechamento-diarias.pdf");
};

// 🔹 FUNÇÃO AUXILIAR
function formatarData(data) {
  if (!data) return "";
  return data.split("-").reverse().join("/");
}
