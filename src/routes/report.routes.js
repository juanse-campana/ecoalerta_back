import { Router } from 'express';
import { check } from 'express-validator';
import ReportController from '../controllers/reportController.js';
import upload from '../middleware/upload.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateResult } from '../middleware/validator.js';

const router = Router();

// --- Middleware para Autenticación Opcional ---
const optionalAuth = async (req, res, next) => {
    if (req.headers.authorization) {
        return authenticate(req, res, next);
    }
    req.user = null;
    next();
};

// ==========================================
// RUTAS ADMIN (Prioridad Alta)
// ==========================================

// Obtener todos los reportes (GET /api/reportes/admin)
router.get('/admin',
    authenticate,
    authorize('autoridad', 'admin', 'moderador'),
    ReportController.getAllReports
);

// Obtener reportes pendientes (GET /api/reportes/pendientes)
router.get('/pendientes',
    authenticate,
    authorize('autoridad', 'admin', 'moderador'),
    ReportController.getPendientes
);

// Estadísticas del usuario logueado (GET /api/reportes/mis-stats)
router.get('/mis-stats',
    authenticate,
    ReportController.getUserStats
);

// Contador de reportes del día (GET /api/reportes/hoy)
router.get('/hoy', ReportController.getTodayCount);

// Actualizar estado (PUT /api/reportes/admin/:id)
router.put('/admin/:id',
    authenticate,
    authorize('autoridad', 'admin'),
    [
        check('estado').optional().isIn(['Pendiente', 'Aprobado', 'Rechazado', 'por aprobar', 'en revision', 'en progreso', 'rechazado', 'culminado']),
        validateResult
    ],
    ReportController.updateReportStatus
);

// Eliminar reporte (DELETE /api/reportes/admin/:id)
router.delete('/admin/:id',
    authenticate,
    authorize('autoridad', 'admin'),
    ReportController.deleteReport
);

// ==========================================
// RUTAS PÚBLICAS Y DE CREACIÓN
// ==========================================

// Crear reporte (POST /api/reportes)
router.post('/',
    optionalAuth,
    upload.array('archivos', 5),
    [
        check('latitud').isFloat().withMessage('Latitud debe ser un número decimal'),
        check('longitud').isFloat().withMessage('Longitud debe ser un número decimal'),
        check('id_categoria').isInt().withMessage('Categoría inválida'),
        check('descripcion').notEmpty().withMessage('La descripción es obligatoria'),
        validateResult
    ],
    ReportController.createReport
);

// Obtener reportes públicos (GET /api/reportes/publicos)
router.get('/publicos', optionalAuth, ReportController.getPublicReports);

// ==========================================
// RUTAS USUARIO REGISTRADO
// ==========================================

// Historial del usuario (GET /api/reportes/mis-reportes)
router.get('/mis-reportes', authenticate, ReportController.getMyReports);

// (Rutas Admin movidas al inicio)

// ==========================================
// RUTAS USUARIO REGISTRADO Y DINÁMICAS
// ==========================================

// Obtener un reporte por ID (GET /api/reportes/:id)
router.get('/:id', authenticate, ReportController.getReportById);

// Editar reporte propio (PUT /api/reportes/:id)
router.put('/:id', authenticate, ReportController.updateReport);

// Eliminar reporte propio (DELETE /api/reportes/:id)
router.delete('/:id', authenticate, ReportController.deleteReport);

// (Rutas Admin movidas arriba para evitar colisiones)

export default router;
