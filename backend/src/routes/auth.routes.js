import express from 'express';
import { login, solicitarCodigo, cambiarPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Públicas ───────────────────────────────────────────────────────────────
router.post('/login', login);

// ── Protegidas ─────────────────────────────────────────────────────────────
router.post('/cambiar-password/solicitar', authenticate, solicitarCodigo);
router.post('/cambiar-password/confirmar', authenticate, cambiarPassword);

export default router;