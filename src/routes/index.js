import { Router } from 'express';

// --- Importación de Rutas ---
import authRoutes from './auth.routes.js';
// import alertaRoutes from './alertas.js';
// import usuarioRoutes from './usuarios.js';

const router = Router();

// --- Ruta Base de la API ---
router.get('/', (req, res) => {
  res.json({
    message: 'API funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      // alertas: '/api/alertas',
      // usuarios: '/api/usuarios'
    }
  });
});

// --- Definición de Rutas por Módulo ---
router.use('/auth', authRoutes);
// router.use('/alertas', alertaRoutes);
// router.use('/usuarios', usuarioRoutes);

export default router;