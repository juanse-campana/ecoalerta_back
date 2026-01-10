import { Router } from 'express';
import authRoutes from './auth.routes.js';
import reportRoutes from './report.routes.js';
// import usuarioRoutes from './usuarios.js';
// import catalogoRoutes from './catalogos.js';

const router = Router();

// --- Ruta Base de la API ---
router.get('/', (req, res) => {
  res.json({
    message: 'EcoAlerta API V1',
    status: 'online',
    timestamp: new Date()
  });
});

// --- Definición de Rutas por Módulo ---
router.use('/auth', authRoutes);
router.use('/reportes', reportRoutes);
// router.use('/usuarios', usuarioRoutes);
// router.use('/catalogos', catalogoRoutes);

export default router;