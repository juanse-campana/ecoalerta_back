import { Router } from 'express';
import { login, register } from '../controllers/authController.js';

const router = Router();

// Definir la ruta POST para login
router.post('/login', login);
router.post('/register', register);

export default router;