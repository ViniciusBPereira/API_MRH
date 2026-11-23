
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  listarMRHsAbertas,
  moverMRHParaDocumentacao,
} from "./mrhsabertas.service.js";

/* =========================================================
   MELHORIAS — AGORA GERENCIA A LISTA DE PRESENÇA DO EVENTO

   Mantém o nome salvarMelhoria e o endpoint POST /api/melhorias.
   Toda a lógica de check-in fica NESTE controller.

   Cada chamada envia { acao: "...", ...dados }.
   O JSON fica em data/presencas-evento.json, separado de melhorias.json.

   Rota pública existente: POST /api/melhorias, sem JWT.
   A fila protege operações concorrentes NO MESMO PROCESSO Node.
   Em produção, limite acesso de rede e considere uma proteção
   específica para mutações administrativas.
   ========================================================= */

const ARQUIVO_PRESENCAS = fileURLToPath(
  new URL("../../../data/presencas-evento.json", import.meta.url),
);

let filaPresencas = Promise.resolve();

const limparTexto = (valor, limite = 180) =>
  typeof valor === "string" ? valor.trim().slice(0, limite) : "";

const normalizarNome = (valor) =>
  limparTexto(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ");

const somenteDigitos = (valor) =>
  String(valor ?? "").replace(/\D/g, "");

const usuarioDaRequisicao = (req) =>
  limparTexto(
    req.user?.nome ||
      req.user?.name ||
      String(req.user?.id || "Recepção"),
    100,
  );

class ErroValidacao extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

/* =========================================================
   ESTADO INICIAL
   ========================================================= */

function estadoVazio() {
  return {
    version: 1,
    revision: 0,
    eventTitle: "Evento Grupo GPS",
    updatedAt: null,
    guests: [],
    managers: [],
    history: [],
  };
}

/* =========================================================
   LEITURA DO JSON
   ========================================================= */

async function lerPresencas() {
  let conteudo;

  try {
    conteudo = await readFile(ARQUIVO_PRESENCAS, "utf8");
  } catch (erro) {
    if (erro.code === "ENOENT") {
      return estadoVazio();
    }

    throw erro;
  }

  const estado = JSON.parse(conteudo);

  if (
    !estado ||
    typeof estado !== "object" ||
    Array.isArray(estado) ||
    !Array.isArray(estado.guests) ||
    !Array.isArray(estado.managers)
  ) {
    throw new Error("Arquivo presencas-evento.json inválido.");
  }

  if (!Array.isArray(estado.history)) {
    estado.history = [];
  }

  if (!estado.eventTitle) {
    estado.eventTitle = "Evento Grupo GPS";
  }

  if (!Number.isInteger(estado.revision)) {
    estado.revision = 0;
  }

  return estado;
}

/* =========================================================
   GRAVAÇÃO ATÔMICA NO JSON
   ========================================================= */

async function gravarPresencas(estado) {
  await mkdir(dirname(ARQUIVO_PRESENCAS), {
    recursive: true,
  });

  estado.revision = (estado.revision || 0) + 1;
  estado.updatedAt = new Date().toISOString();

  const temporario = `${ARQUIVO_PRESENCAS}.${randomUUID()}.tmp`;

  try {
    await writeFile(
      temporario,
      JSON.stringify(estado, null, 2),
      {
        encoding: "utf8",
        mode: 0o600,
      },
    );

    await rename(temporario, ARQUIVO_PRESENCAS);
  } finally {
    await rm(temporario, {
      force: true,
    }).catch(() => {});
  }
}

/* =========================================================
   HISTÓRICO DAS OPERAÇÕES
   ========================================================= */

function registrarHistorico(
  estado,
  req,
  acao,
  detalhe = {},
) {
  estado.history.push({
    id: randomUUID(),
    at: new Date().toISOString(),
    by: usuarioDaRequisicao(req),
    action: acao,
    ...detalhe,
  });

  if (estado.history.length > 3000) {
    estado.history = estado.history.slice(-3000);
  }
}

/* =========================================================
   RESUMO PARA O FRONTEND
   ========================================================= */

function resumoPublico(estado) {
  // O histórico detalhado fica guardado no servidor,
  // sem ser exposto na interface.

  const { history, ...dados } = estado;

  return dados;
}

/* =========================================================
   CONSULTAS DE CONVIDADOS E GERENTES
   ========================================================= */

function convidadoPorId(estado, id) {
  const convidado = estado.guests.find(
    (item) => item.id === id,
  );

  if (!convidado) {
    throw new ErroValidacao(
      404,
      "Convidado não encontrado.",
    );
  }

  return convidado;
}

function gerentePorId(estado, id) {
  const gerente = estado.managers.find(
    (item) => item.id === id,
  );

  if (!gerente) {
    throw new ErroValidacao(
      404,
      "Gerente não encontrado.",
    );
  }

  return gerente;
}

/* =========================================================
   VALIDAÇÃO DE CONVIDADOS
   ========================================================= */

function validarConvidado(
  entrada,
  gerentes,
  existente = null,
) {
  const name = limparTexto(entrada?.name, 180);

  const group = entrada?.group;

  const detail = limparTexto(entrada?.detail, 180);

  const clientGroup =
    group === "cliente"
      ? limparTexto(
          entrada?.clientGroup || detail,
          160,
        )
      : "";

  const managerId =
    group === "cliente"
      ? limparTexto(entrada?.managerId, 100) || null
      : null;

  if (
    name.length < 2 ||
    !["interno", "cliente"].includes(group)
  ) {
    throw new ErroValidacao(
      400,
      "Informe o nome e uma categoria válida.",
    );
  }

  if (
    managerId &&
    !gerentes.some((g) => g.id === managerId)
  ) {
    throw new ErroValidacao(
      400,
      "Gerente não encontrado.",
    );
  }

  return {
    ...(existente || {
      id: randomUUID(),
      arrivedAt: null,
      noticeOpenedAt: null,
      source: "Cadastro manual",
    }),

    name,
    group,
    detail,
    clientGroup,
    managerId,
  };
}

/* =========================================================
   PREVENÇÃO DE CONVIDADOS DUPLICADOS
   ========================================================= */

function validarNomeUnico(
  estado,
  convidado,
  ignorarId = "",
) {
  const repetido = estado.guests.some(
    (item) =>
      item.id !== ignorarId &&
      item.group === convidado.group &&
      normalizarNome(item.name) ===
        normalizarNome(convidado.name),
  );

  if (repetido) {
    throw new ErroValidacao(
      409,
      "Já existe um convidado com esse nome e categoria.",
    );
  }
}

/* =========================================================
   VALIDAÇÃO DE GERENTES
   ========================================================= */

function validarGerente(
  entrada,
  existente = null,
) {
  const name = limparTexto(entrada?.name, 90);

  let phone = somenteDigitos(entrada?.phone);

  if (
    phone.length === 10 ||
    phone.length === 11
  ) {
    phone = `55${phone}`;
  }

  if (!name) {
    throw new ErroValidacao(
      400,
      "Informe o nome do gerente.",
    );
  }

  if (
    phone &&
    !/^\d{12,15}$/.test(phone)
  ) {
    throw new ErroValidacao(
      400,
      "WhatsApp inválido. Informe país, DDD e número.",
    );
  }

  // "verified" indica apenas conferência humana.
  // Não valida o número pela Meta.

  const verified = Boolean(
    entrada?.verified && phone,
  );

  return {
    ...(existente || {
      id: randomUUID(),
      source: "Cadastro manual",
    }),

    name,
    phone,
    verified,
  };
}

/* =========================================================
   AÇÕES DA LISTA DE PRESENÇA
   ========================================================= */

function aplicarAcao(
  estado,
  req,
  acao,
  entrada,
) {
  const id = limparTexto(entrada.id, 100);

  switch (acao) {

    /* =====================================================
       1. LISTAR CONVIDADOS E GERENTES
       ===================================================== */

    case "listar": {
      return {
        alterou: false,
        data: resumoPublico(estado),
      };
    }

    /* =====================================================
       2. ADICIONAR CONVIDADO INDIVIDUAL
       ===================================================== */

    case "adicionarConvidado": {
      const convidado = validarConvidado(
        entrada,
        estado.managers,
      );

      validarNomeUnico(
        estado,
        convidado,
      );

      estado.guests.push(convidado);

      registrarHistorico(
        estado,
        req,
        "convidado_adicionado",
        {
          guestId: convidado.id,
          name: convidado.name,
        },
      );

      return {
        alterou: true,
        data: convidado,
        status: 201,
      };
    }

    /* =====================================================
       3. ADICIONAR CONVIDADOS EM LOTE
       ===================================================== */

    case "adicionarConvidadosLote": {
      const nomes = entrada.names;

      if (
        !Array.isArray(nomes) ||
        nomes.length < 1 ||
        nomes.length > 500
      ) {
        throw new ErroValidacao(
          400,
          "Informe entre 1 e 500 nomes.",
        );
      }

      if (
        !["interno", "cliente"].includes(
          entrada.group,
        )
      ) {
        throw new ErroValidacao(
          400,
          "Categoria inválida.",
        );
      }

      const adicionados = [];

      for (const item of nomes) {
        const name = limparTexto(item, 180);

        if (name.length < 2) {
          continue;
        }

        const convidado = validarConvidado(
          {
            name,
            group: entrada.group,
            detail: entrada.detail,
            clientGroup: entrada.clientGroup,
            managerId: entrada.managerId,
          },
          estado.managers,
        );

        const existe = estado.guests.some(
          (outro) =>
            outro.group === convidado.group &&
            normalizarNome(outro.name) ===
              normalizarNome(convidado.name),
        );

        if (existe) {
          continue;
        }

        estado.guests.push(convidado);
        adicionados.push(convidado);
      }

      if (adicionados.length) {
        registrarHistorico(
          estado,
          req,
          "convidados_em_lote",
          {
            count: adicionados.length,
          },
        );
      }

      return {
        alterou: adicionados.length > 0,
        data: {
          added: adicionados.length,
        },
        status: 201,
      };
    }

    /* =====================================================
       4. IMPORTAÇÃO DE PLANILHA EXCEL

       O React interpreta o Excel e envia JSON.

       Não exclui convidados existentes.
       Não altera check-ins realizados.
       Não valida telefones automaticamente.
       Evita duplicados por nome + categoria.
       ===================================================== */

    case "importarConvidadosPlanilha": {
      const rows = entrada.guests;

      if (
        !Array.isArray(rows) ||
        rows.length === 0 ||
        rows.length > 500
      ) {
        throw new ErroValidacao(
          400,
          "Importe entre 1 e 500 convidados por vez.",
        );
      }

      let added = 0;
      let skipped = 0;
      let managersAdded = 0;

      const known = new Set(
        estado.guests.map(
          (g) =>
            `${g.group}|${normalizarNome(g.name)}`,
        ),
      );

      for (const item of rows) {
        const name = limparTexto(
          item?.name,
          180,
        );

        if (name.length < 2) {
          skipped++;
          continue;
        }

        const group =
          item?.group === "cliente"
            ? "cliente"
            : "interno";

        const key =
          `${group}|${normalizarNome(name)}`;

        if (known.has(key)) {
          skipped++;
          continue;
        }

        /* =========================================
           IDENTIFICAR GERENTE DA PLANILHA
           ========================================= */

        const managerName =
          group === "cliente"
            ? limparTexto(
                item?.managerName,
                90,
              )
            : "";

        let managerId = null;

        if (managerName) {
          let manager = estado.managers.find(
            (m) =>
              normalizarNome(m.name) ===
              normalizarNome(managerName),
          );

          if (!manager) {
            let phone = somenteDigitos(
              item?.managerPhone,
            );

            if (
              phone.length === 10 ||
              phone.length === 11
            ) {
              phone = `55${phone}`;
            }

            if (
              phone &&
              !/^\d{12,15}$/.test(phone)
            ) {
              phone = "";
            }

            manager = {
              id: randomUUID(),
              name: managerName,
              phone,
              verified: false,
              source: "Importação de planilha",
            };

            estado.managers.push(manager);

            managersAdded++;
          }

          managerId = manager.id;
        }

        /* =========================================
           CADASTRAR CONVIDADO
           ========================================= */

        const detail = limparTexto(
          item?.detail,
          180,
        );

        const clientGroup =
          group === "cliente"
            ? limparTexto(
                item?.clientGroup || detail,
                160,
              )
            : "";

        const guest = validarConvidado(
          {
            name,
            group,
            detail,
            clientGroup,
            managerId,
          },
          estado.managers,
        );

        guest.source = "Importação de planilha";

        estado.guests.push(guest);

        known.add(key);

        added++;
      }

      /* =========================================
         REGISTRAR IMPORTAÇÃO NO HISTÓRICO
         ========================================= */

      if (added || managersAdded) {
        registrarHistorico(
          estado,
          req,
          "planilha_importada",
          {
            added,
            skipped,
            managersAdded,
          },
        );
      }

      return {
        alterou:
          added > 0 ||
          managersAdded > 0,

        data: {
          added,
          skipped,
          managersAdded,
        },

        status: 200,
      };
    }

    /* =====================================================
       5. EDITAR CONVIDADO
       ===================================================== */

    case "editarConvidado": {
      const atual = convidadoPorId(
        estado,
        id,
      );

      const proximo = validarConvidado(
        entrada,
        estado.managers,
        atual,
      );

      validarNomeUnico(
        estado,
        proximo,
        atual.id,
      );

      Object.assign(
        atual,
        proximo,
      );

      registrarHistorico(
        estado,
        req,
        "convidado_editado",
        {
          guestId: atual.id,
          name: atual.name,
        },
      );

      return {
        alterou: true,
        data: atual,
      };
    }

    /* =====================================================
       6. EXCLUIR CONVIDADO
       ===================================================== */

    case "excluirConvidado": {
      const atual = convidadoPorId(
        estado,
        id,
      );

      estado.guests = estado.guests.filter(
        (item) => item.id !== id,
      );

      registrarHistorico(
        estado,
        req,
        "convidado_excluido",
        {
          guestId: id,
          name: atual.name,
          wasPresent: Boolean(
            atual.arrivedAt,
          ),
        },
      );

      return {
        alterou: true,
        data: {
          id,
          removed: true,
        },
      };
    }

    /* =====================================================
       7. CONFIRMAR OU DESFAZER PRESENÇA
       ===================================================== */

    case "definirPresenca": {
      const atual = convidadoPorId(
        estado,
        id,
      );

      if (
        typeof entrada.presente !== "boolean"
      ) {
        throw new ErroValidacao(
          400,
          "Informe presente: true ou false.",
        );
      }

      /* =========================================
         EVITA CHECK-IN DUPLICADO
         ========================================= */

      if (
        Boolean(atual.arrivedAt) ===
        entrada.presente
      ) {
        return {
          alterou: false,
          data: atual,
        };
      }

      /* =========================================
         REGISTRA HORÁRIO DO SERVIDOR
         ========================================= */

      atual.arrivedAt =
        entrada.presente
          ? new Date().toISOString()
          : null;

      // Uma correção de presença também reinicia
      // o indicador de conversa aberta.

      atual.noticeOpenedAt = null;

      registrarHistorico(
        estado,
        req,
        entrada.presente
          ? "checkin_confirmado"
          : "checkin_desfeito",
        {
          guestId: id,
          name: atual.name,
        },
      );

      return {
        alterou: true,
        data: atual,
      };
    }

    /* =====================================================
       8. REGISTRAR ABERTURA DO WHATSAPP

       Não envia mensagens automaticamente.
       Apenas registra a abertura da conversa.
       ===================================================== */

    case "registrarWhatsappAberto": {
      const atual = convidadoPorId(
        estado,
        id,
      );

      if (!atual.arrivedAt) {
        throw new ErroValidacao(
          409,
          "Confirme a chegada primeiro.",
        );
      }

      if (
        atual.group !== "cliente"
      ) {
        throw new ErroValidacao(
          400,
          "Somente clientes podem notificar gerentes.",
        );
      }

      const gerente = gerentePorId(
        estado,
        atual.managerId,
      );

      if (
        !gerente.verified ||
        !gerente.phone
      ) {
        throw new ErroValidacao(
          400,
          "Confira e valide o WhatsApp do gerente.",
        );
      }

      atual.noticeOpenedAt =
        new Date().toISOString();

      registrarHistorico(
        estado,
        req,
        "conversa_whatsapp_aberta",
        {
          guestId: id,
          managerId: gerente.id,
        },
      );

      return {
        alterou: true,
        data: atual,
      };
    }

    /* =====================================================
       9. ADICIONAR GERENTE
       ===================================================== */

    case "adicionarGerente": {
      const gerente = validarGerente(
        entrada,
      );

      estado.managers.push(gerente);

      registrarHistorico(
        estado,
        req,
        "gerente_adicionado",
        {
          managerId: gerente.id,
          name: gerente.name,
        },
      );

      return {
        alterou: true,
        data: gerente,
        status: 201,
      };
    }

    /* =====================================================
       10. EDITAR GERENTE
       ===================================================== */

    case "editarGerente": {
      const atual = gerentePorId(
        estado,
        id,
      );

      const proximo = validarGerente(
        entrada,
        atual,
      );

      Object.assign(
        atual,
        proximo,
      );

      registrarHistorico(
        estado,
        req,
        "gerente_editado",
        {
          managerId: id,
          name: atual.name,
        },
      );

      return {
        alterou: true,
        data: atual,
      };
    }

    /* =====================================================
       11. EXCLUIR GERENTE
       ===================================================== */

    case "excluirGerente": {
      const gerente = gerentePorId(
        estado,
        id,
      );

      const possuiClientes =
        estado.guests.some(
          (item) =>
            item.managerId === id,
        );

      if (possuiClientes) {
        throw new ErroValidacao(
          409,
          "Este gerente possui clientes vinculados. Reatribua-os antes de excluir.",
        );
      }

      estado.managers =
        estado.managers.filter(
          (item) => item.id !== id,
        );

      registrarHistorico(
        estado,
        req,
        "gerente_excluido",
        {
          managerId: id,
          name: gerente.name,
        },
      );

      return {
        alterou: true,
        data: {
          id,
          removed: true,
        },
      };
    }

    /* =====================================================
       12. EDITAR NOME DO EVENTO
       ===================================================== */

    case "editarEvento": {
      const eventTitle = limparTexto(
        entrada.eventTitle,
        90,
      );

      if (!eventTitle) {
        throw new ErroValidacao(
          400,
          "Nome do evento inválido.",
        );
      }

      estado.eventTitle = eventTitle;

      registrarHistorico(
        estado,
        req,
        "evento_editado",
        {
          eventTitle,
        },
      );

      return {
        alterou: true,
        data: {
          eventTitle,
        },
      };
    }

    /* =====================================================
       AÇÃO NÃO RECONHECIDA
       ===================================================== */

    default:
      throw new ErroValidacao(
        400,
        "Ação inválida para /api/melhorias.",
      );
  }
}

/* =========================================================
   CONTROLLER — MRHS ABERTAS

   MANTIDO SEM ALTERAÇÕES
   ========================================================= */

export async function getMRHsAbertas(req, res) {
  const controller =
    "MRHsAbertasController.getMRHsAbertas";

  const startTime = Date.now();

  const usuarioAtual =
    req.user?.nome || "Desconhecido";

  try {
    console.info(
      `[CONTROLLER] ${controller} - Requisição iniciada`,
      {
        usuario: usuarioAtual,
        rota: req.originalUrl,
        metodo: req.method,
      },
    );

    const resultado =
      await listarMRHsAbertas();

    console.info(
      `[CONTROLLER] ${controller} - Requisição concluída com sucesso`,
      {
        usuario: usuarioAtual,
        total_mrhs: resultado.length,
        tempo_execucao_ms:
          Date.now() - startTime,
      },
    );

    return res.status(200).json(
      resultado,
    );
  } catch (error) {
    console.error(
      `[CONTROLLER] ${controller} - Erro ao processar requisição`,
      {
        usuario: usuarioAtual,
        mensagem: error.message,
        stack: error.stack,
        tempo_execucao_ms:
          Date.now() - startTime,
      },
    );

    return res.status(500).json({
      message: "Erro ao buscar MRHs em aberto",
    });
  }
}

/* =========================================================
   POST /api/melhorias

   Nome mantido: salvarMelhoria

   Agora executa todas as operações
   da lista de presença.

   Endpoint público, sem JWT.
   ========================================================= */

export async function salvarMelhoria(req, res) {
  const controller =
    "MRHsAbertasController.salvarMelhoria";

  const startTime = Date.now();

  // Endpoint público.
  // Não exige req.user.

  const entrada = req.body ?? {};

  const acao = limparTexto(
    entrada.acao,
    50,
  );

  if (!acao) {
    return res.status(400).json({
      sucesso: false,
      mensagem:
        "Informe a ação em req.body.acao.",
    });
  }

  /* =========================================
     FILA DE OPERAÇÕES

     Leitura, alteração e gravação sequenciais.
     ========================================= */

  const operacao = filaPresencas.then(
    async () => {
      const estado = await lerPresencas();

      const resultado = aplicarAcao(
        estado,
        req,
        acao,
        entrada,
      );

      if (resultado.alterou) {
        await gravarPresencas(estado);
      }

      return {
        ...resultado,
        revision: estado.revision,
      };
    },
  );

  filaPresencas = operacao.then(
    () => {},
    () => {},
  );

  try {
    const resultado = await operacao;

    console.info(
      `[CONTROLLER] ${controller} - Ação concluída`,
      {
        usuario: usuarioDaRequisicao(req),
        acao,
        revision: resultado.revision,
        tempo_execucao_ms:
          Date.now() - startTime,
      },
    );

    return res
      .status(resultado.status || 200)
      .json({
        sucesso: true,
        data: resultado.data,
        revision: resultado.revision,
      });
  } catch (erro) {
    if (!(erro instanceof ErroValidacao)) {
      console.error(
        `[CONTROLLER] ${controller} - Erro`,
        {
          acao,
          mensagem: erro.message,
          stack: erro.stack,
          tempo_execucao_ms:
            Date.now() - startTime,
        },
      );
    }

    return res
      .status(erro.status || 500)
      .json({
        sucesso: false,
        mensagem:
          erro instanceof ErroValidacao
            ? erro.message
            : "Não foi possível processar a lista de presença.",
      });
  }
}

/* =========================================================
   CONTROLLER — MOVER MRH

   MANTIDO SEM ALTERAÇÕES
   ========================================================= */

export async function moverMRH(req, res) {
  const controller =
    "MRHsAbertasController.moverMRH";

  const startTime = Date.now();

  const usuarioAtual =
    req.user?.nome || "Desconhecido";

  const { id } = req.params;

  try {
    console.info(
      `[CONTROLLER] ${controller} - Requisição iniciada`,
      {
        usuario: usuarioAtual,
        mrh_id: id,
        rota: req.originalUrl,
        metodo: req.method,
      },
    );

    const resultado =
      await moverMRHParaDocumentacao(id);

    console.info(
      `[CONTROLLER] ${controller} - MRH movida com sucesso`,
      {
        usuario: usuarioAtual,
        mrh_id: id,
        novo_time: resultado.time,
        tempo_execucao_ms:
          Date.now() - startTime,
      },
    );

    return res.status(200).json({
      sucesso: true,
      mensagem:
        "MRH movida para o time de Documentação",
      data: resultado,
    });
  } catch (error) {
    console.error(
      `[CONTROLLER] ${controller} - Erro ao mover MRH`,
      {
        usuario: usuarioAtual,
        mrh_id: id,
        mensagem: error.message,
        stack: error.stack,
        tempo_execucao_ms:
          Date.now() - startTime,
      },
    );

    return res.status(400).json({
      sucesso: false,
      message:
        error.message ||
        "Erro ao mover MRH para Documentação",
    });
  }
}
