// src/routes/profesor.routes.js
import express from 'express';
import {
  getMisGrupos,
  getEstudiantesDeGrupo,
  agregarNota, editarNota, eliminarNota,
  getActividades, createActividad, updateActividad, deleteActividad,
  getMateriales, createMaterial, deleteMaterial,
  getCalendario, getEventosDeGrupo, createEvento, deleteEvento,
} from '../controllers/profesorController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router   = express.Router();
const profesor = [authenticate, authorize('profesor')];

// ── Grupos ─────────────────────────────────────────────────────────────────
router.get('/grupos', ...profesor, getMisGrupos);

// ── Estudiantes y notas ────────────────────────────────────────────────────
router.get   ('/grupos/:id/estudiantes',                          ...profesor, getEstudiantesDeGrupo);
router.post  ('/grupos/:id/estudiantes/:studentId/notas',         ...profesor, agregarNota);
router.put   ('/grupos/:id/estudiantes/:studentId/notas/:notaId', ...profesor, editarNota);
router.delete('/grupos/:id/estudiantes/:studentId/notas/:notaId', ...profesor, eliminarNota);

// ── Actividades ────────────────────────────────────────────────────────────
router.get   ('/grupos/:id/actividades',              ...profesor, getActividades);
router.post  ('/grupos/:id/actividades',              ...profesor, createActividad);
router.put   ('/grupos/:id/actividades/:actividadId', ...profesor, updateActividad);
router.delete('/grupos/:id/actividades/:actividadId', ...profesor, deleteActividad);

// ── Materiales ─────────────────────────────────────────────────────────────
router.get   ('/grupos/:id/materiales',             ...profesor, getMateriales);
router.post  ('/grupos/:id/materiales',             ...profesor, createMaterial);
router.delete('/grupos/:id/materiales/:materialId', ...profesor, deleteMaterial);

// ── Calendario ─────────────────────────────────────────────────────────────
router.get   ('/calendario',                          ...profesor, getCalendario);
router.get   ('/grupos/:id/eventos',                  ...profesor, getEventosDeGrupo);
router.post  ('/grupos/:id/eventos',                  ...profesor, createEvento);
router.delete('/grupos/:id/eventos/:eventoId',        ...profesor, deleteEvento);

export default router;