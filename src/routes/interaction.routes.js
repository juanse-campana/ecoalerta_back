import { Router } from 'express';
import InteractionController from '../controllers/interactionController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

// ==================== TRENDING (público) ====================
router.get('/trending', InteractionController.getTrending);

// ==================== LIKES (requiere auth) ====================
router.post('/reportes/:id/like', authenticate, InteractionController.toggleLike);

// ==================== COMENTARIOS ====================
router.get('/reportes/:id/comentarios', InteractionController.getComments);
router.post('/reportes/:id/comentarios', authenticate, InteractionController.addComment);
router.delete('/comentarios/:commentId', authenticate, InteractionController.deleteComment);

// ==================== VISTAS ====================
router.post('/reportes/:id/vista', optionalAuth, InteractionController.addView);

// ==================== STATS ====================
router.get('/reportes/:id/stats', optionalAuth, InteractionController.getReportStats);

// ==================== NOTIFICACIONES (requiere auth) ====================
router.get('/notificaciones', authenticate, InteractionController.getNotifications);
router.put('/notificaciones/:id/read', authenticate, InteractionController.markNotificationRead);
router.put('/notificaciones/read-all', authenticate, InteractionController.markAllRead);

export default router;
