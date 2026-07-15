import visitRepository from "./visit.repository.js";
import diagnosisService from "./diagnosis.service.js";
import trackingRepository from "./tracking.repository.js";

class VisitService {
  async getAll() {
    return await visitRepository.findAll();
  }

  async getById(id) {
    const visit = await visitRepository.findById(id);

    if (!visit) {
      throw new Error("Visita não encontrada.");
    }

    return visit;
  }

  async getByPec(pec) {
    return await visitRepository.findByPec(pec);
  }


  async create(data) {

    // Calcula diagnóstico
    const diagnosis = diagnosisService.calculate(data);

    const visitData = {
      ...data,
      ...diagnosis,
    };


    // 1 - Cria a visita
    const visit = await visitRepository.create(visitData);



    await trackingRepository.create({
  month: data.visit_date.substring(0,7),

  cr: data.cr,

  turnover: data.turnover,
  absenteeism: data.absenteeism,
  he_inefficiency: data.he_inefficiency,

  labor_actions: data.labor_actions,
  replacement_days: data.replacement_days,

  headcount: data.headcount,

  notes: data.overview
});


    return visit;
  }



  async update(id, data) {
    const visit = await visitRepository.findById(id);

    if (!visit) {
      throw new Error("Visita não encontrada.");
    }

    const diagnosis = diagnosisService.calculate(data);

    const visitData = {
      ...data,
      ...diagnosis,
    };

    return await visitRepository.update(id, visitData);
  }



  async delete(id) {
    const visit = await visitRepository.findById(id);

    if (!visit) {
      throw new Error("Visita não encontrada.");
    }

    await visitRepository.delete(id);

    return {
      message: "Visita removida com sucesso.",
    };
  }
}

export default new VisitService();