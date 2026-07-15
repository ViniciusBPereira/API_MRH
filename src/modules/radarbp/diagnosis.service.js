class DiagnosisService {
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

  calculateIndicatorScore(data) {
    const headcount = Number(data.headcount || 0);

    const vacancyRate =
      headcount > 0 ? (Number(data.open_positions || 0) / headcount) * 100 : 0;

    const warningRate =
      headcount > 0 ? (Number(data.warnings || 0) / headcount) * 100 : 0;

    const weightedScore = [
      {
        score: this.scoreAgainstTarget(data.turnover, 3.5, 7, 11),
        weight: 0.22,
      },
      {
        score: this.scoreAgainstTarget(data.absenteeism, 3.5, 7, 11),
        weight: 0.22,
      },
      {
        score: this.scoreHeInefficiency(data.he_inefficiency),
        weight: 0.2,
      },
      {
        score: this.scoreLaborActions(data.labor_actions),
        weight: 0.18,
      },
      {
        score: this.scoreAgainstTarget(data.replacement_days, 12, 20, 30),
        weight: 0.12,
      },
      {
        score: this.scoreByThreshold(vacancyRate, 2, 5, 9),
        weight: 0.03,
      },
      {
        score: this.scoreByThreshold(warningRate, 1, 3, 6),
        weight: 0.03,
      },
    ].reduce((total, item) => total + item.score * item.weight, 0);

    return Math.round(weightedScore);
  }

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

  scoreAgainstTarget(value, target, attention, critical) {
    const score = Number(value || 0);

    if (score <= target) return 100;

    if (score <= attention) return 75;

    if (score <= critical) return 45;

    return 20;
  }

  scoreByThreshold(value, good, attention, critical) {
    const score = Number(value || 0);

    if (score <= good) return 95;

    if (score <= attention) return 78;

    if (score <= critical) return 55;

    return 30;
  }

  scoreHeInefficiency(value) {
    const score = Number(value || 0);

    if (score <= 0) return 100;

    if (score <= 1000) return 75;

    if (score <= 5000) return 45;

    return 20;
  }

  scoreLaborActions(value) {
    const score = Number(value || 0);

    if (score === 0) return 100;

    if (score === 1) return 55;

    if (score === 2) return 35;

    return 15;
  }

  classifyScore(score) {
    if (score >= 85) return "Referência";

    if (score >= 70) return "Estável";

    if (score >= 50) return "Alerta";

    return "Crítico";
  }

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

  generateOpinion(data, score, classification, priority) {
  return `
PEC: ${data.pec}

CR: ${data.cr}

Score Final: ${score}

Classificação:
${classification}

Priorização:
${priority}

Causa(s) raiz:
${
  Array.isArray(data.root_cause)
    ? data.root_cause.join(", ")
    : data.root_cause || "Não informada"
}
`.trim();
}
}

export default new DiagnosisService();
