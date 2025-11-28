import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// --- Configuración de Variables de Entorno ---
// Debe ir PRIMERO antes de cualquier importación que use process.env
dotenv.config();

// --- Importaciones de Configuración ---
// Inicializa conexiones a BD y Redis
import './src/config/db.js';
import './src/config/redisClient.js';

// --- Importaciones de la Aplicación ---
import apiRouter from './src/routes/index.js';
import errorHandler from './src/middleware/errorHandler.js';

// --- Inicialización del Servidor ---
const app = express();
const PORT = process.env.PORT || 4000;

// --- Middlewares Globales ---
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Ruta de Health Check ---
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// --- Rutas de la API ---
app.use('/api', apiRouter);

// --- Manejo de Rutas No Encontradas ---
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

// --- Manejador Global de Errores ---
// DEBE ir al final, después de todas las rutas
app.use(errorHandler);

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});