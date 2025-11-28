import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// --- Importaciones de la Aplicación ---
import apiRouter from './src/routes/index.js'; // El Menú Principal (Paso 1)
import errorHandler from './src/middleware/errorHandler.js'; // La Red de Seguridad (Paso 2)

// --- Carga de Configuración ---
// 1. Cargar variables de entorno (.env)
dotenv.config();

// 2. Importar configs (esto inicia las conexiones en la consola)
// No necesitamos usarlas aquí, solo importarlas para que se ejecuten.
import './src/config/db.js';
import './src/config/redisClient.js';

// --- Inicialización del Servidor ---
const app = express();
const PORT = process.env.PORT || 4000;

// --- Middlewares Generales ---
// Permite que tu frontend Next.js (en otro dominio) haga peticiones
app.use(cors());

// Permite al servidor entender JSON enviado en el body de las peticiones
app.use(express.json());

// --- Rutas de la API ---
// Carga el "Menú Principal". Todas las rutas empezarán con /api
app.use('/api', apiRouter);

// --- Manejador de Errores ---
// ¡Importante! Debe ir DESPUÉS de todas las rutas.
// Es la red de seguridad que atrapa cualquier error (next(error)).
app.use(errorHandler);

// --- Encender el Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
}); 

import { Router } from 'express';
import authRoutes from './auth.js'; // Importamos el archivo del paso 2

const router = Router();

// --- Definición de Rutas ---

// Todo lo que entre por /auth, se va al archivo authRoutes
// La URL final será: http://localhost:4000/api/auth/login
router.use('/auth', authRoutes);

// Aquí irían tus otras rutas, ejemplo:
// router.use('/alertas', alertaRoutes);

export default router;