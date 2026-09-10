import EmaeRepository from "./emae.repository.js";

class EmaeService {
  constructor() {
    // ------------------------------------------------------------
    // Cache das coordenadas dos pontos de ronda.
    // As coordenadas físicas mudam muito pouco, então não precisamos
    // recalcular a média histórica a cada polling de 5 segundos.
    // ------------------------------------------------------------
    this.pointsCache = new Map();

    // 30 minutos
    this.POINTS_CACHE_MS = 30 * 60 * 1000;
  }

  // ============================================================
  // NORMALIZA TEXTO
  // ============================================================
  normalizeText(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ");
  }

  // ============================================================
  // CONVERTE DATA PARA TIMESTAMP
  // ============================================================
  toTimestamp(value) {
    if (!value) {
      return 0;
    }

    const timestamp = new Date(value).getTime();

    return Number.isNaN(timestamp)
      ? 0
      : timestamp;
  }

  // ============================================================
  // CLASSIFICA UMA TAREFA DE RONDA
  // ============================================================
  //
  // REGRAS GPSVISTA:
  //
  // status = 85 + expirada = false
  //   -> REALIZADA
  //
  // status = 85 + expirada = true
  //   -> NÃO REALIZADA / EXPIRADA
  //
  // status != 85 + prazo futuro
  //   -> PENDENTE
  //
  // status != 85 + prazo vencido
  //   -> ATRASADA
  // ============================================================
  classifyRound(task) {
    const status = Number(task.status);

    const expired =
      task.expirada === true ||
      task.expirada === "true";

    if (status === 85) {
      return expired
        ? "NAO_REALIZADA"
        : "REALIZADA";
    }

    if (task.prazo) {
      const prazo = new Date(task.prazo);

      if (
        !Number.isNaN(prazo.getTime()) &&
        Date.now() > prazo.getTime()
      ) {
        return "ATRASADA";
      }
    }

    return "PENDENTE";
  }

  // ============================================================
  // COORDENADAS DOS PONTOS
  // ============================================================
  async getMapPoints(cr) {
    const cached = this.pointsCache.get(cr);

    if (
      cached &&
      Date.now() - cached.timestamp <
        this.POINTS_CACHE_MS
    ) {
      return cached.data;
    }

    const rows =
      await EmaeRepository.getMapPoints(cr);

    const points = rows
      .filter((row) => {
        const latitude =
          Number(row.latitude);

        const longitude =
          Number(row.longitude);

        return (
          Number.isFinite(latitude) &&
          Number.isFinite(longitude)
        );
      })
      .map((row) => ({
        nome: row.ponto,

        latitude:
          Number(row.latitude),

        longitude:
          Number(row.longitude),

        amostras:
          Number(row.amostras) || 0,
      }));

    this.pointsCache.set(cr, {
      timestamp: Date.now(),
      data: points,
    });

    return points;
  }

  // ============================================================
  // PREPARA AS TAREFAS DE RONDA
  // ============================================================
  prepareRounds(rounds, points) {
    const pointMap = new Map();

    for (const point of points) {
      pointMap.set(
        this.normalizeText(point.nome),
        point,
      );
    }

    return rounds.map((task) => {
      const point =
        pointMap.get(
          this.normalizeText(
            task.estruturadescricao,
          ),
        ) || null;

      return {
        id: task.id,
        status: Number(task.status),
        numero: task.numero,
        nome: task.nome,

        disponibilizacao:
          task.disponibilizacao,

        prazo:
          task.prazo,

        terminoreal:
          task.terminoreal,

        local:
          task.estruturadescricao,

        expirada:
          task.expirada === true ||
          task.expirada === "true",

        vigilante:
          task.vigilante || null,

        pdf:
          task.pdf,

        situacao:
          this.classifyRound(task),

        latitude:
          point?.latitude ?? null,

        longitude:
          point?.longitude ?? null,
      };
    });
  }

  // ============================================================
  // MONTA STATUS ATUAL DE CADA PONTO DO MAPA
  // ============================================================
  //
  // Cada marcador recebe a tarefa mais recente daquele ponto.
  // Isso permitirá mudar visualmente o marcador no frontend.
  //
  // Ex.:
  // verde    = realizada
  // amarelo  = pendente
  // vermelho = atrasada / não realizada
  // ============================================================
  buildMapPoints(points, rounds) {
    const latestByPoint = new Map();

    for (const round of rounds) {
      const key =
        this.normalizeText(round.local);

      if (!key) {
        continue;
      }

      const current =
        latestByPoint.get(key);

      const roundDate =
        Math.max(
          this.toTimestamp(
            round.disponibilizacao,
          ),
          this.toTimestamp(
            round.terminoreal,
          ),
        );

      const currentDate = current
        ? Math.max(
            this.toTimestamp(
              current.disponibilizacao,
            ),
            this.toTimestamp(
              current.terminoreal,
            ),
          )
        : 0;

      if (
        !current ||
        roundDate > currentDate
      ) {
        latestByPoint.set(
          key,
          round,
        );
      }
    }

    return points.map((point) => {
      const latest =
        latestByPoint.get(
          this.normalizeText(point.nome),
        ) || null;

      return {
        ...point,

        situacao:
          latest?.situacao ||
          "SEM_ATIVIDADE",

        ultimaTarefa:
          latest
            ? {
                id: latest.id,
                numero:
                  latest.numero,
                disponibilizacao:
                  latest.disponibilizacao,
                prazo:
                  latest.prazo,
                terminoreal:
                  latest.terminoreal,
                vigilante:
                  latest.vigilante,
                situacao:
                  latest.situacao,
                pdf:
                  latest.pdf,
              }
            : null,
      };
    });
  }

  // ============================================================
  // INDICADORES OPERACIONAIS
  // ============================================================
  buildIndicators(rounds) {
    const indicators = {
      total: rounds.length,

      realizadas: 0,

      pendentes: 0,

      atrasadas: 0,

      naoRealizadas: 0,

      percentualExecucao: 0,
    };

    for (const round of rounds) {
      switch (round.situacao) {
        case "REALIZADA":
          indicators.realizadas++;
          break;

        case "PENDENTE":
          indicators.pendentes++;
          break;

        case "ATRASADA":
          indicators.atrasadas++;
          break;

        case "NAO_REALIZADA":
          indicators.naoRealizadas++;
          break;

        default:
          break;
      }
    }

    if (indicators.total > 0) {
      indicators.percentualExecucao =
        Number(
          (
            (
              indicators.realizadas /
              indicators.total
            ) * 100
          ).toFixed(1),
        );
    }

    return indicators;
  }

  // ============================================================
  // PREPARA OCORRÊNCIAS E JUSTIFICATIVAS
  // ============================================================
  prepareSpecialTasks(
    tasks,
    type,
  ) {
    return tasks.map((task) => ({
      id: task.id,

      tipo: type,

      status:
        Number(task.status),

      numero:
        task.numero,

      nome:
        task.nome,

      disponibilizacao:
        task.disponibilizacao,

      prazo:
        task.prazo,

      terminoreal:
        task.terminoreal,

      local:
        task.estruturadescricao,

      expirada:
        task.expirada === true ||
        task.expirada === "true",

      vigilante:
        task.vigilante || null,

      pdf:
        task.pdf,

      finalizada:
        Number(task.status) === 85,
    }));
  }

  // ============================================================
  // FEED / TELEMETRIA
  // ============================================================
  //
  // Esse array será usado pelo frontend para:
  //
  // - mostrar o feed em tempo real;
  // - detectar IDs novos;
  // - pulsar o marcador no mapa;
  // - exibir ocorrência;
  // - exibir justificativa.
  // ============================================================
  buildFeed(
    rounds,
    occurrences,
    justifications,
  ) {
    const events = [];

    // ----------------------------------------------------------
    // RONDAS REALIZADAS
    // ----------------------------------------------------------
    for (const round of rounds) {
      if (
        round.situacao !==
        "REALIZADA"
      ) {
        continue;
      }

      events.push({
        id:
          `RONDA-${round.id}`,

        tarefaId:
          round.id,

        tipo:
          "RONDA",

        titulo:
          "Ponto de ronda realizado",

        local:
          round.local,

        vigilante:
          round.vigilante,

        data:
          round.terminoreal ||
          round.disponibilizacao,

        situacao:
          round.situacao,

        latitude:
          round.latitude,

        longitude:
          round.longitude,

        pdf:
          round.pdf,
      });
    }

    // ----------------------------------------------------------
    // RONDAS NÃO REALIZADAS
    // ----------------------------------------------------------
    for (const round of rounds) {
      if (
        round.situacao !==
        "NAO_REALIZADA"
      ) {
        continue;
      }

      events.push({
        id:
          `RONDA-NAO-REALIZADA-${round.id}`,

        tarefaId:
          round.id,

        tipo:
          "RONDA_NAO_REALIZADA",

        titulo:
          "Ponto de ronda não realizado",

        local:
          round.local,

        vigilante:
          null,

        data:
          round.prazo ||
          round.disponibilizacao,

        situacao:
          round.situacao,

        latitude:
          round.latitude,

        longitude:
          round.longitude,

        pdf:
          round.pdf,
      });
    }

    // ----------------------------------------------------------
    // OCORRÊNCIAS
    // ----------------------------------------------------------
    for (
      const occurrence
      of occurrences
    ) {
      if (!occurrence.finalizada) {
        continue;
      }

      events.push({
        id:
          `OCORRENCIA-${occurrence.id}`,

        tarefaId:
          occurrence.id,

        tipo:
          "OCORRENCIA",

        titulo:
          "Ocorrência registrada",

        local:
          occurrence.local,

        vigilante:
          occurrence.vigilante,

        data:
          occurrence.terminoreal ||
          occurrence.disponibilizacao,

        pdf:
          occurrence.pdf,
      });
    }

    // ----------------------------------------------------------
    // JUSTIFICATIVAS
    // ----------------------------------------------------------
    for (
      const justification
      of justifications
    ) {
      if (!justification.finalizada) {
        continue;
      }

      events.push({
        id:
          `JUSTIFICATIVA-${justification.id}`,

        tarefaId:
          justification.id,

        tipo:
          "JUSTIFICATIVA",

        titulo:
          "Justificativa de ronda registrada",

        local:
          justification.local,

        vigilante:
          justification.vigilante,

        data:
          justification.terminoreal ||
          justification.disponibilizacao,

        pdf:
          justification.pdf,
      });
    }

    return events
      .filter(
        (event) =>
          event.data,
      )
      .sort(
        (a, b) =>
          this.toTimestamp(b.data) -
          this.toTimestamp(a.data),
      )
      .slice(0, 50);
  }

  // ============================================================
  // ÚLTIMA ATIVIDADE
  // ============================================================
  getLastActivity(feed) {
    if (!feed.length) {
      return null;
    }

    return feed[0];
  }

  // ============================================================
  // MONITORAMENTO COMPLETO
  // ============================================================
  async getMonitoring(cr, windowOffset = 0) {
    const windows =
      await EmaeRepository.getRoundWindows(
        cr,
      );

    const safeOffset =
      Math.min(
        Math.max(
          Number(windowOffset) || 0,
          0,
        ),
        Math.max(
          windows.length - 1,
          0,
        ),
      );

    const selectedWindow =
      windows[safeOffset] || null;

    const [
      points,
      rawRounds,
      rawOccurrences,
      rawJustifications,
    ] = await Promise.all([
      this.getMapPoints(cr),

      selectedWindow
        ? EmaeRepository.getRounds(
            cr,
            selectedWindow.disponibilizacao,
          )
        : Promise.resolve([]),

      EmaeRepository.getOccurrences(
        cr,
      ),

      EmaeRepository.getJustifications(
        cr,
      ),
    ]);

    const rounds =
      this.prepareRounds(
        rawRounds,
        points,
      );

    const occurrences =
      this.prepareSpecialTasks(
        rawOccurrences,
        "OCORRENCIA",
      );

    const justifications =
      this.prepareSpecialTasks(
        rawJustifications,
        "JUSTIFICATIVA",
      );

    const mapPoints =
      this.buildMapPoints(
        points,
        rounds,
      );

    const indicators =
      this.buildIndicators(
        rounds,
      );

    const feed =
      this.buildFeed(
        rounds,
        occurrences,
        justifications,
      );

    return {
      unidade: {
        cr,

        nome:
          cr === "92296"
            ? "SABARÁ"
            : `CR ${cr}`,

        cliente:
          "EMAE",
      },

      status:
        "ONLINE",

      atualizadoEm:
        new Date().toISOString(),
      filtro: {
        windowOffset: safeOffset,
        atual: safeOffset === 0,

        nome:
          selectedWindow?.nome ?? null,

        inicio:
          selectedWindow?.disponibilizacao ?? null,

        fim:
          selectedWindow?.prazo ?? null,

        totalJanelas:
          windows.length,

        podeAnterior:
          safeOffset < windows.length - 1,

        podeProxima:
          safeOffset > 0,
      },

      janelas: windows.map(
        (window, index) => ({
          index,
          nome: window.nome,
          inicio: window.disponibilizacao,
          fim: window.prazo,
        }),
      ),

      indicadores: indicators,
      resumo: {
        ocorrencias:
          occurrences.filter(
            (item) =>
              item.finalizada,
          ).length,

        justificativas:
          justifications.filter(
            (item) =>
              item.finalizada,
          ).length,

        pontosMapeados:
          mapPoints.length,
      },

      ultimaAtividade:
        this.getLastActivity(
          feed,
        ),

      pontos:
        mapPoints,

      rondas:
        rounds,

      ocorrencias:
        occurrences,

      justificativas:
        justifications,

      feed,
    };
  }
}

export default new EmaeService();









