import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import supabase from './config/supabase.js'; // ← NUEVO

import authRoutes       from './routes/auth.routes.js';
import adminRoutes      from './routes/admin.routes.js';
import profesorRoutes   from './routes/profesor.routes.js';
import estudianteRoutes from './routes/estudiante.routes.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado para origen: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    success:   true,
    message:   'API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth',       authRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/profesor',   profesorRoutes);
app.use('/api/estudiante', estudianteRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message || err);
  res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

// ── Limpieza de códigos expirados cada hora ────────────────────────────────
setInterval(async () => {
  const { error } = await supabase
    .from('password_reset_codes')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (!error) console.log('Codigos expirados eliminados');
}, 60 * 60 * 1000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\nServidor corriendo en http://localhost:${PORT}\n`);
});

export default app;