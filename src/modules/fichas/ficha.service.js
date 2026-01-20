// src/modules/fichas/ficha.service.js
import fichaRepo from "./ficha.repository.js";
import candidatosRepo from "../candidatos/candidatos.repository.js";

export async function criarFicha(candidatoId, data) {
  const ficha = await fichaRepo.create(candidatoId, data);

  // vincula ficha ao candidato
  await candidatosRepo.updateFichaId(candidatoId, ficha.id);

  return ficha;
}

export async function atualizarFicha(id, data) {
  return await fichaRepo.update(id, data);
}

export async function buscarFicha(id) {
  return await fichaRepo.getById(id);
}
