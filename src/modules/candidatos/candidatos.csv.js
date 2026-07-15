import { parse } from "csv-parse";
import XLSX from "xlsx";
import path from "path";

export async function parseArquivo(file) {
  const extensao = path.extname(file.originalname).toLowerCase();

  switch (extensao) {
    case ".csv":
      return parseCSV(file.buffer);

    case ".xlsx":
    case ".xls":
      return parseExcel(file.buffer);

    default:
      throw new Error(
        "Formato de arquivo não suportado. Utilize CSV, XLS ou XLSX.",
      );
  }
}

function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];

    parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
      .on("data", (row) => results.push(normalizarLinha(row)))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

function parseExcel(buffer) {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
  });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const linhas = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
  });

  return linhas.map(normalizarLinha);
}

function normalizarLinha(row) {
  const linha = {};

  for (const coluna in row) {
    linha[normalizarTexto(coluna)] = row[coluna];
  }

  return {
    nome: buscar(linha, ["nome", "nomecompleto", "candidato", "colaborador"]),

    cpf: buscar(linha, ["cpf", "cpfdocandidato", "documento"]),

    telefone: buscar(linha, [
      "telefone",
      "celular",
      "fone",
      "telefonecelular",
      "contato",
      "whatsapp",
    ]),

    email: buscar(linha, ["email", "e-mail", "mail", "correioeletronico"]),
  };
}

function buscar(obj, aliases) {
  for (const alias of aliases) {
    const chave = normalizarTexto(alias);

    if (obj[chave] !== undefined && obj[chave] !== null) {
      return String(obj[chave]).trim();
    }
  }

  return "";
}

function normalizarTexto(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_/]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase()
    .trim();
}
