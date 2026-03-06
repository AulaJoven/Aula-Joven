// src/routes/estudiante.routes.js
import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import {
  getMisMaterias,
  getCalificaciones,
  getActividades,
  getMateriales,
  getEventos,
  getCalendario,
  getAsistenciaEstudiante,
} from '../controllers/estudianteController.js';

const router = express.Router();
const estudiante = [authenticate, authorize('estudiante')];

router.get('/mis-materias',                  ...estudiante, getMisMaterias);
router.get('/grupos/:id/calificaciones',     ...estudiante, getCalificaciones);
router.get('/grupos/:id/actividades',        ...estudiante, getActividades);
router.get('/grupos/:id/materiales',         ...estudiante, getMateriales);
router.get('/grupos/:id/eventos',            ...estudiante, getEventos);
router.get('/calendario',                    ...estudiante, getCalendario);
router.get('/grupos/:id/asistencia', ...estudiante, getAsistenciaEstudiante);

export default router;