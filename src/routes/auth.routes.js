import { Router } from 'express';
import { login } from '../controllers/authController.js';
// import { register } from '../controllers/authController.js'; // Cuando lo tengas

const router = Router();

// Definir la ruta POST para login
router.post('/login', login);

export default router;