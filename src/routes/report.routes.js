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
router.get('/publicos', ReportController.getPublicReports);

// ==========================================
// RUTAS USUARIO REGISTRADO
// ==========================================

// Historial del usuario (GET /api/reportes/mis-reportes)
router.get('/mis-reportes', authenticate, ReportController.getMyReports);

// Obtener un reporte por ID (GET /api/reportes/:id)
// Nota: Debería ser público o restringido? El controlador verifica propiedad para editar/borrar, pero para ver?
// Public reports are visible to everyone. Private ones only to owner.
// Controller logic for getReportById simply fetches it. `Report.findById` returns everything.
// Let's make it optionalAuth so we can check if user is owner if needed, but for now open is fine or use logic.
// Given requirement to "integrate without damaging", let's keep it simple.
// Allowing authenticated access for now since it's mostly for editing.
router.get('/:id', authenticate, ReportController.getReportById);

// Editar reporte propio (PUT /api/reportes/:id)
router.put('/:id', authenticate, ReportController.updateReport);

// Eliminar reporte propio (DELETE /api/reportes/:id)
router.delete('/:id', authenticate, ReportController.deleteReport);

// ==========================================
// RUTAS ADMIN
// ==========================================

// Obtener todos los reportes (GET /api/reportes/admin)
router.get('/admin',
    authenticate,
    authorize('autoridad', 'admin', 'moderador'),
    ReportController.getAllReports
);

// Actualizar estado (PUT /api/reportes/admin/:id)
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

// Eliminar reporte (DELETE /api/reportes/admin/:id)
router.delete('/admin/:id',
    authenticate,
    authorize('autoridad', 'admin'),
    ReportController.deleteReport
);

export default router;
