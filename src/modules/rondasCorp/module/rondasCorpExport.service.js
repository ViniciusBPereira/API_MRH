import * as repo from "./rondasCorpExport.repository.js";

/**
 * Lista rondas para o frontend (JSON)
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
 * 🔒 FILTRADO PELO CR DO PERFIL
 * 📅 FILTRO OPCIONAL POR DATA
 * 🧭 FILTRO OPCIONAL POR ROTEIRO
 */
export async function gerarCsvRondas({ cr, dataInicio, dataFim, roteiro }) {
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
 * (controle global, NÃO filtra por CR)
 */
export async function obterUltimaSincronizacao() {
  return repo.getUltimaSincronizacao();
}
