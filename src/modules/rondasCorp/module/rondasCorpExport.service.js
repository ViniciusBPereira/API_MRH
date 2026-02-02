import * as repo from "./rondasCorpExport.repository.js";

/**
 * =====================================================
 * LISTAGEM PARA FRONTEND (JSON)
 * =====================================================
 * 🔒 FILTRADO PELO CR DO PERFIL
 * 📅 FILTRO OPCIONAL POR DATA
 * 🧭 FILTRO OPCIONAL POR ROTEIRO
 */
export async function listarRondas({
  cr,
  dataInicio,
  dataFim,
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
    roteiro: roteiro || null,
    limit: Number(limit),
    offset: Number(offset),
  });
}

/**
 * =====================================================
 * FORMATA DATA PARA PADRÃO BR
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
 * EXPORTAÇÃO CSV
 * =====================================================
 * 🔒 FILTRADO PELO CR DO PERFIL
 * 📅 FILTRO OPCIONAL POR DATA
 * 🧭 FILTRO OPCIONAL POR ROTEIRO
 * ❌ SEM PAGINAÇÃO
 */
export async function gerarCsvRondas({
  cr,
  dataInicio,
  dataFim,
  roteiro,
}) {
  if (!cr) {
    throw new Error("CR do perfil não informado");
  }

  const dados = await repo.listarRondasParaCsv(
    cr,
    dataInicio || null,
    dataFim || null,
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
   * Escape seguro para CSV (Excel-safe)
   */
  const escape = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const lines = [
    headers.join(";"),
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
