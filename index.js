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
const allowedOrigins = [process.env.FRONTEND_URL].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
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

// --- Documentación Swagger (opcional, comentar si no tienes swagger) ---
/*
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './src/config/swagger.js';
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
*/

// --- Archivos Estáticos (Uploads) ---
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
// Solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Documentacion en http://localhost:${PORT}/api/docs`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Exportar para tests
export default app;