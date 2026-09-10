import cron from "node-cron";

import EmaeRepository
  from "./emae.repository.js";

import EmaePushService
  from "./emae.push.service.js";

const CR = "92296";

let initialized = false;

const knownOccurrences =
  new Set();

const knownJustifications =
  new Set();

function cleanLocation(value) {
  return String(value || "SABARÁ")
    .replace(/\/+$/, "")
    .trim();
}

async function checkEmaeEvents() {
  try {
    const [
      occurrences,
      justifications,
    ] = await Promise.all([
      EmaeRepository.getOccurrences(
        CR,
      ),

      EmaeRepository.getJustifications(
        CR,
      ),
    ]);

    const finishedOccurrences =
      occurrences.filter(
        (item) =>
          Number(item.status) === 85,
      );

    const finishedJustifications =
      justifications.filter(
        (item) =>
          Number(item.status) === 85,
      );

    // ========================================================
    // PRIMEIRA EXECUÇÃO
    // Cria baseline sem disparar notificações antigas.
    // ========================================================

    if (!initialized) {
      for (
        const item
        of finishedOccurrences
      ) {
        knownOccurrences.add(
          String(item.id),
        );
      }

      for (
        const item
        of finishedJustifications
      ) {
        knownJustifications.add(
          String(item.id),
        );
      }

      initialized = true;

      console.log(
        `✅ EMAE Push Monitor iniciado | Ocorrências: ${knownOccurrences.size} | Justificativas: ${knownJustifications.size}`,
      );

      return;
    }

    // ========================================================
    // NOVAS OCORRÊNCIAS
    // ========================================================

    for (
      const item
      of finishedOccurrences
    ) {
      const id =
        String(item.id);

      if (
        knownOccurrences.has(id)
      ) {
        continue;
      }

      knownOccurrences.add(id);

      const local =
        cleanLocation(
          item.estruturadescricao ||
          item.local,
        );

      console.log(
        `🚨 Nova ocorrência EMAE: ${id} | ${local}`,
      );

      await EmaePushService.sendNotification({
        title:
          "🚨 EMAE • Nova ocorrência",

        body:
          `${local}${
            item.vigilante
              ? ` · ${item.vigilante}`
              : ""
          }`,

        url:
          "/emae/sabara",

        tipo:
          "OCORRENCIA",

        tag:
          `emae-ocorrencia-${id}`,
      });
    }

    // ========================================================
    // NOVAS JUSTIFICATIVAS
    // ========================================================

    for (
      const item
      of finishedJustifications
    ) {
      const id =
        String(item.id);

      if (
        knownJustifications.has(id)
      ) {
        continue;
      }

      knownJustifications.add(id);

      const local =
        cleanLocation(
          item.estruturadescricao ||
          item.local,
        );

      console.log(
        `⚠️ Nova justificativa EMAE: ${id} | ${local}`,
      );

      await EmaePushService.sendNotification({
        title:
          "⚠️ EMAE • Nova justificativa",

        body:
          `${local}${
            item.vigilante
              ? ` · ${item.vigilante}`
              : ""
          }`,

        url:
          "/emae/sabara",

        tipo:
          "JUSTIFICATIVA",

        tag:
          `emae-justificativa-${id}`,
      });
    }
  } catch (error) {
    console.error(
      "❌ Erro no monitor Push EMAE:",
      error.message,
    );
  }
}

// ============================================================
// A CADA 10 SEGUNDOS
// ============================================================

cron.schedule(
  "*/10 * * * * *",
  checkEmaeEvents,
);

console.log(
  "🔔 EMAE Push Monitor agendado a cada 10 segundos.",
);
