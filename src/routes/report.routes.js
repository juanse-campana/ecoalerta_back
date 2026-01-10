import express from 'express';
import { check } from 'express-validator';
import ReportController from '../controllers/reportController.js';
import upload from '../middleware/upload.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateResult } from '../middleware/validator.js';

const router = express.Router();

/**
 * RUTAS PÚBLICAS
 */

// Crear reporte (Anónimo o Registrado - si envía token se asocia)
// Nota: Para permitir opcionalmente auth, podríamos hacer un middleware "softAuthenticate"
// o simplemente chequeamos si hay header en el controlador o usamos `authenticate` pero modificado.
// Para simplificar, haremos una ruta POST / que intenta autenticar pero no falla si no hay token?
// Express chain: Si usas authenticate, fallará si no hay token.
// Estrategia: Crear middleware 'optionalAuth' o dos rutas distintas.
// Usaremos un middleware inline simple para optionalAuth.

const optionalAuth = async (req, res, next) => {
    if (req.headers.authorization) {
        await authenticate(req, res, next);
    } else {
        next();
    }
};

/**
 * @swagger
 * /reportes:
 *   post:
 *     summary: Crear un nuevo reporte
 *     tags: [Reportes]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *               latitud:
 *                 type: number
 *               longitud:
 *                 type: number
 *               id_categoria:
 *                 type: integer
 *               archivos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Reporte creado exitosamente
 */
router.post('/', 
    optionalAuth,
    upload.array('archivos', 5), // Max 5 archivos
    [
        check('latitud').isFloat().withMessage('Latitud debe ser un número'),
        check('longitud').isFloat().withMessage('Longitud debe ser un número'),
        check('id_categoria').isInt().withMessage('Categoría inválida'),
        validateResult
    ],
    ReportController.createReport
);

// Obtener reportes públicos (Mapa)
/**
 * @swagger
 * /reportes/publicos:
 *   get:
 *     summary: Obtener reportes públicos para el mapa
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Lista de reportes públicos
 */
router.get('/publicos', ReportController.getPublicReports);

/**
 * RUTAS USUARIO REGISTRADO
 */
router.get('/mis-reportes', authenticate, ReportController.getMyReports);

/**
 * RUTAS ADMIN
 (Solo personal con rol 'autoridad' o 'admin')
 */
router.get('/admin', 
    authenticate, 
    authorize('autoridad', 'admin', 'moderador'), 
    ReportController.getAllReports
);

router.put('/admin/:id', 
    authenticate, 
    authorize('autoridad', 'admin'), 
    [
        check('estado').optional().isIn(['por aprobar', 'en revision', 'en progreso', 'rechazado', 'culminado']),
        check('es_publico').optional().isBoolean(),
        validateResult
    ],
    ReportController.updateReportStatus
);

router.delete('/admin/:id', 
    authenticate, 
    authorize('autoridad', 'admin'), 
    ReportController.deleteReport
);

export default router;
