// src/routes/admin.routes.js
import express from 'express';
import {
  getUsers, createUser, updateUser, deleteUser,
  getGrupos, createGrupo, updateGrupo, deleteGrupo,
  getEstudiantesGrupo, inscribirEstudiante, desinscribirEstudiante,
  getEventos, createEvento, updateEvento, deleteEvento,
  seedFeriados, deleteFeriadosAnio, createUsersBulk, getAsistencia, registrarAsistencia, eliminarAsistencia,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
const admin  = [authenticate, authorize('admin')];

// ── Usuarios ───────────────────────────────────────────────────────────────
router.get   ('/users',     ...admin, getUsers);
router.post  ('/users',     ...admin, createUser);
router.put   ('/users/:id', ...admin, updateUser);
router.delete('/users/:id', ...admin, deleteUser);

// ── Grupos ─────────────────────────────────────────────────────────────────
router.get   ('/grupos',     ...admin, getGrupos);
router.post  ('/grupos',     ...admin, createGrupo);
router.put   ('/grupos/:id', ...admin, updateGrupo);
router.delete('/grupos/:id', ...admin, deleteGrupo);

// ── Inscripciones ──────────────────────────────────────────────────────────
router.get   ('/grupos/:id/estudiantes',                ...admin, getEstudiantesGrupo);
router.post  ('/grupos/:id/estudiantes',                ...admin, inscribirEstudiante);
router.delete('/grupos/:id/estudiantes/:estudianteId',  ...admin, desinscribirEstudiante);
router.post('/users/bulk',                              ...admin, createUsersBulk);

// ── Eventos ────────────────────────────────────────────────────────────────
router.get   ('/eventos',           ...admin, getEventos);
router.post  ('/eventos',           ...admin, createEvento);
router.put   ('/eventos/:id',       ...admin, updateEvento);
router.delete('/eventos/:id',       ...admin, deleteEvento);

// ── Feriados automáticos ───────────────────────────────────────────────────
router.post  ('/eventos/seed',      ...admin, seedFeriados);
router.delete('/eventos/seed',      ...admin, deleteFeriadosAnio);

// ── Asistencias ───────────────────────────────────────────────────
router.get   ('/grupos/:id/estudiantes/:estudianteId/asistencia',              ...admin, getAsistencia);
router.post  ('/grupos/:id/estudiantes/:estudianteId/asistencia',              ...admin, registrarAsistencia);
router.delete('/grupos/:id/estudiantes/:estudianteId/asistencia/:registroId',  ...admin, eliminarAsistencia);

export default router;