class DiagnosisService {
  // ============================================================
  // CALCULAR DIAGNÓSTICO COMPLETO
  // ============================================================

  calculate(data) {
    const indicator_score = this.calculateIndicatorScore(data);

    const pillar_score = this.calculatePillarScore(data);

    const final_score = Math.round(
      indicator_score * 0.65 + pillar_score * 0.35,
    );

    const classification = this.classifyScore(final_score);

    const priority = this.prioritize(classification, final_score);

    const executive_opinion = this.generateOpinion(
      data,
      final_score,
      classification,
      priority,
    );

    return {
      indicator_score,
      pillar_score,
      final_score,
      classification,
      priority,
      executive_opinion,
    };
  }

  // ============================================================
  // SCORE DOS INDICADORES
  // ============================================================

  calculateIndicatorScore(data) {
    const weightedScore = [
      // ----------------------------------------------------------
      // TURNOVER
      // Peso: 22%
      // ----------------------------------------------------------

      {
        score: this.scoreAgainstTarget(data.turnover, 3.5, 7, 11),
        weight: 0.22,
      },

      // ----------------------------------------------------------
      // ABSENTEÍSMO
      // Peso: 22%
      // ----------------------------------------------------------

      {
        score: this.scoreAgainstTarget(data.absenteeism, 3.5, 7, 11),
        weight: 0.22,
      },

      // ----------------------------------------------------------
      // H.E. INEFICIÊNCIA
      // Peso: 20%
      // ----------------------------------------------------------

      {
        score: this.scoreHeInefficiency(data.he_inefficiency),
        weight: 0.2,
      },

      // ----------------------------------------------------------
      // AÇÕES TRABALHISTAS
      // Peso: 18%
      // ----------------------------------------------------------

      {
        score: this.scoreLaborActions(data.labor_actions),
        weight: 0.18,
      },

      // ----------------------------------------------------------
      // TEMPO DE REPOSIÇÃO
      // Peso: 12%
      // ----------------------------------------------------------

      {
        score: this.scoreAgainstTarget(data.replacement_days, 12, 20, 30),
        weight: 0.12,
      },

      // ----------------------------------------------------------
      // TOTAL = 100%
      // ----------------------------------------------------------
    ];

    const total = weightedScore.reduce(
      (sum, item) => sum + item.score * item.weight,
      0,
    );

    return Math.round(total);
  }

  // ============================================================
  // SCORE DOS PILARES
  // ============================================================

  calculatePillarScore(data) {
    const pillars = [
      Number(data.leadership_score || 0),
      Number(data.climate_score || 0),
      Number(data.structure_score || 0),
      Number(data.customer_score || 0),
    ];

    return Math.round(
      pillars.reduce((total, value) => total + value, 0) / pillars.length,
    );
  }

  // ============================================================
  // SCORE POR META
  // ============================================================

  scoreAgainstTarget(value, target, attention, critical) {
    const score = Number(value || 0);

    if (score <= target) {
      return 100;
    }

    if (score <= attention) {
      return 75;
    }

    if (score <= critical) {
      return 45;
    }

    return 20;
  }

  // ============================================================
  // SCORE H.E. INEFICIÊNCIA
  // ============================================================

  scoreHeInefficiency(value) {
    const score = Number(value || 0);

    if (score <= 0) {
      return 100;
    }

    if (score <= 1000) {
      return 75;
    }

    if (score <= 5000) {
      return 45;
    }

    return 20;
  }

  // ============================================================
  // SCORE AÇÕES TRABALHISTAS
  // ============================================================

  scoreLaborActions(value) {
    const score = Number(value || 0);

    if (score === 0) {
      return 100;
    }

    if (score === 1) {
      return 55;
    }

    if (score === 2) {
      return 35;
    }

    return 15;
  }

  // ============================================================
  // CLASSIFICAÇÃO
  // ============================================================

  classifyScore(score) {
    if (score >= 85) {
      return "Referência";
    }

    if (score >= 70) {
      return "Estável";
    }

    if (score >= 50) {
      return "Alerta";
    }

    return "Crítico";
  }

  // ============================================================
  // PRIORIZAÇÃO
  // ============================================================

  prioritize(classification, score) {
    if (classification === "Crítico" || score < 45) {
      return "Prioridade Máxima BP";
    }

    if (classification === "Alerta" && score < 60) {
      return "War Room BP";
    }

    if (classification === "Alerta") {
      return "Plano 30 dias";
    }

    return "Monitoramento";
  }

  // ============================================================
  // OPINIÃO EXECUTIVA
  // ============================================================

  generateOpinion(data, score, classification, priority) {
    const rootCauses = Array.isArray(data.root_cause)
      ? data.root_cause.join(", ")
      : data.root_cause || "Não informada";

    return `
Score Final: ${score}

Classificação:
${classification}

Priorização:
${priority}

Causa(s) raiz:
${rootCauses}
`.trim();
  }
}

export default new DiagnosisService();
