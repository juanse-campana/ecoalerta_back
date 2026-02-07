import { Router } from 'express';

// 1. Importa todos tus enrutadores (los "menús" específicos)
import catalogosRouter from './catalogos.routes.js';
import authRouter from './auth.routes.js';
import reportesRouter from './report.routes.js';
import interactionRouter from './interaction.routes.js';
// import usuariosRouter from './usuarios.routes.js';

const router = Router();

// 2. Registra cada enrutador en una ruta base
// Todo lo en 'catalogos.routes.js' ahora comenzará con /catalogos
router.use('/catalogos', catalogosRouter);

// Todo lo en 'auth.routes.js' ahora comenzará con /auth
router.use('/auth', authRouter);

// Todo lo en 'reportes.routes.js' ahora comenzará con /reportes
router.use('/reportes', reportesRouter);

// Interacciones (likes, comentarios, vistas, notificaciones, trending)
router.use('/', interactionRouter);

// (Opcional) Puedes añadir más en el futuro
// router.use('/usuarios', usuariosRouter);

// Exportamos el "Menú Principal" completo
export default router;