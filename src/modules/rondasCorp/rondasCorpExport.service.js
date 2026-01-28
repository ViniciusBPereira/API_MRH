import * as repo from "./rondasCorpExport.repository.js";

/**
 * Lista rondas para o frontend (JSON)
 */
export async function listarRondas(params) {
  const { limit = 50, offset = 0 } = params;

  return repo.listarRondas({
    limit,
    offset,
  });
}

/**
 * Formata data para: DD/MM/YYYY HH:mm:ss
 */
function formatDateBR(date) {
  if (!date) return "";

  const d = new Date(date);

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
 * Gera CSV das rondas no formato oficial
 */
export async function gerarCsvRondas() {
  const dados = await repo.listarRondasParaCsv();

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
   * Escape seguro para CSV
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

          // 🔥 AJUSTE DO FORMATO DA DATA
          if (header === "Hora chegada") {
            value = formatDateBR(value);
          }

          return escape(value);
        })
        .join(";"),
    ),
  ];

  // BOM para Excel (UTF-8)
  return "\ufeff" + lines.join("\n");
}

/**
 * Retorna status da última sincronização
 */
export async function obterUltimaSincronizacao() {
  return repo.getUltimaSincronizacao();
}
