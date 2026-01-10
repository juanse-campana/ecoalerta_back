import { Router } from 'express';
import { login, register } from '../controllers/authController.js';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contrasena
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *               contrasena:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login exitoso, retorna token JWT
 *       401:
 *         description: Credenciales inválidas
 */
// Definir la ruta POST para login
router.post('/login', login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo ciudadano
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - correo
 *               - contrasena
 *               - cedula
 *               - telefono
 *               - id_ciudad
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               correo:
 *                 type: string
 *                 format: email
 *               contrasena:
 *                 type: string
 *                 format: password
 *               cedula:
 *                 type: string
 *               telefono:
 *                 type: string
 *               id_ciudad:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 */
// Definir la ruta POST para register
router.post('/register', register);

export default router;