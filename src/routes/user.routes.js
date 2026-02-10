import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Todas las rutas de usuarios requieren autenticación
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
