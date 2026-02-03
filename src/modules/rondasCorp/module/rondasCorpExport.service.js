import * as repo from "./rondasCorpExport.repository.js";

/**
 * =====================================================
 * LISTAGEM PARA FRONTEND (JSON)
 * =====================================================
 * 🔒 FILTRADO PELO CR DO PERFIL
 * 📅 FILTRO OPCIONAL POR DATA
 * ⏰ FILTRO OPCIONAL POR HORA
 * 🧭 FILTRO OPCIONAL POR ROTEIRO
 */
export async function listarRondas({
  cr,
  dataInicio,
  dataFim,
  horaInicio,
  horaFim,
  roteiro,
  limit = 50,
  offset = 0,
}) {
  if (!cr) {
    throw new Error("CR do perfil não informado");
  }

  return repo.listarRondas({
    cr,
    dataInicio: dataInicio || null,
    dataFim: dataFim || null,
    horaInicio: horaInicio || null,
    horaFim: horaFim || null,
    roteiro: roteiro || null,
    limit: Number(limit),
    offset: Number(offset),
  });
}

/**
 * =====================================================
 * FORMATA DATA PARA PADRÃO BR (CSV)
 * =====================================================
 * DD/MM/YYYY HH:mm:ss
 */
function formatDateBR(date) {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");

  return (
    `${pad(d.getDate())}/` +
    `${pad(d.getMonth() + 1)}/` +
    `${d.getFullYear()} ` +
    `${pad(d.getHours())}:` +
    `${pad(d.getMinutes())}:` +
    `${pad(d.getSeconds())}`
  );
}

/**
 * =====================================================
 * FORMATA DATA + HORA PARA CABEÇALHO CSV
 * =====================================================
 * Saída: 26/1/2026 7:00:00
 */
function formatDateHoraHeader(data, hora) {
  if (!data) return "";

  const h = hora || "00:00:00";
  const horaFinal = h.length === 5 ? `${h}:00` : h;

  const [yyyy, mm, dd] = data.split("-");
  return `${Number(dd)}/${Number(mm)}/${yyyy} ${horaFinal}`;
}

/**
 * =====================================================
 * EXPORTAÇÃO CSV
 * =====================================================
 * 🔒 FILTRADO PELO CR DO PERFIL
 * 📅⏰ FILTRO POR INTERVALO DATA/HORA
 * ❌ SEM PAGINAÇÃO
 */
export async function gerarCsvRondas({
  cr,
  dataInicio,
  dataFim,
  horaInicio,
  horaFim,
  roteiro,
}) {
  if (!cr) {
    throw new Error("CR do perfil não informado");
  }

  const dados = await repo.listarRondasParaCsv(
    cr,
    dataInicio || null,
    dataFim || null,
    horaInicio || null,
    horaFim || null,
    roteiro || null,
  );

  const headers = [
    "Nome do Departamento",
    "Nome do Roteiro",
    "Nome do Cliente",
    "Nome do Guarda",
    "Numero do Dispositivo",
    "Hora chegada",
    "Evento",
    "processing mode for alarm",
    "remark",
  ];

  /**
   * =====================================================
   * LINHA 1 — PERÍODO DO RELATÓRIO
   * =====================================================
   */
  let linhaPeriodo = "Dados Historicos";

  if (dataInicio || dataFim) {
    const inicio = formatDateHoraHeader(dataInicio, horaInicio);
    const fim = formatDateHoraHeader(dataFim, horaFim);

    if (inicio && fim) {
      linhaPeriodo += ` ${inicio} Para ${fim}`;
    } else if (inicio) {
      linhaPeriodo += ` ${inicio}`;
    }
  }

  /**
   * Escape seguro para CSV (Excel-safe)
   */
  const escape = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const lines = [
    linhaPeriodo, // 👈 Linha 1 (título)
    "", // 👈 Linha 2 (vazia)
    headers.join(";"), // 👈 Linha 3 (header)
    ...dados.map((row) =>
      headers
        .map((header) => {
          let value = row[header];

          if (header === "Hora chegada") {
            value = formatDateBR(value);
          }

          return escape(value);
        })
        .join(";"),
    ),
  ];

  // BOM UTF-8 para Excel
  return "\ufeff" + lines.join("\n");
}

/**
 * =====================================================
 * STATUS DA ÚLTIMA SINCRONIZAÇÃO
 * =====================================================
 * (controle global, NÃO filtra por CR)
 */
export async function obterUltimaSincronizacao() {
  return repo.getUltimaSincronizacao();
}
