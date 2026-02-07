import Interaction from '../models/Interaction.js';
import Report from '../models/Report.js';

class InteractionController {
    // ==================== LIKES ====================
    static async toggleLike(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Get report owner for notification
            const report = await Report.findById(id);
            if (!report) {
                return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
            }

            const result = await Interaction.toggleLike(id, userId);

            // Create notification if liked (not unliked)
            if (result.liked && report.id_usuario) {
                await Interaction.createNotification(report.id_usuario, userId, id, 'like');
            }

            const likesCount = await Interaction.getLikeCount(id);

            res.json({
                success: true,
                data: {
                    liked: result.liked,
                    likes: likesCount
                }
            });
        } catch (error) {
            console.error('Error toggling like:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    // ==================== COMENTARIOS ====================
    static async addComment(req, res) {
        try {
            const { id } = req.params;
            const { contenido } = req.body;
            const userId = req.user.id;

            if (!contenido || contenido.trim() === '') {
                return res.status(400).json({ success: false, message: 'El comentario no puede estar vacío' });
            }

            // Get report owner for notification
            const report = await Report.findById(id);
            if (!report) {
                return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
            }

            const commentId = await Interaction.addComment(id, userId, contenido.trim());

            // Create notification
            if (report.id_usuario) {
                await Interaction.createNotification(report.id_usuario, userId, id, 'comentario');
            }

            res.status(201).json({
                success: true,
                data: { id_comentario: commentId }
            });
        } catch (error) {
            console.error('Error adding comment:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async getComments(req, res) {
        try {
            const { id } = req.params;
            const comments = await Interaction.getComments(id);

            res.json({
                success: true,
                data: comments
            });
        } catch (error) {
            console.error('Error getting comments:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async deleteComment(req, res) {
        try {
            const { commentId } = req.params;
            const userId = req.user.id;

            const deleted = await Interaction.deleteComment(commentId, userId);

            if (!deleted) {
                return res.status(403).json({ success: false, message: 'No puedes eliminar este comentario' });
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Error deleting comment:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    // ==================== VISTAS ====================
    static async addView(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id || null;

            await Interaction.addView(id, userId);

            res.json({ success: true });
        } catch (error) {
            console.error('Error adding view:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    // ==================== TRENDING ====================
    static async getTrending(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const currentUserId = req.user?.id || null;
            const trending = await Interaction.getTrending(limit, currentUserId);

            res.json({
                success: true,
                data: trending
            });
        } catch (error) {
            console.error('Error getting trending:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    // ==================== NOTIFICACIONES ====================
    static async getNotifications(req, res) {
        try {
            const userId = req.user.id;
            const notifications = await Interaction.getNotifications(userId);
            const unreadCount = await Interaction.getUnreadCount(userId);

            res.json({
                success: true,
                data: {
                    notifications,
                    unreadCount
                }
            });
        } catch (error) {
            console.error('Error getting notifications:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async markNotificationRead(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            await Interaction.markNotificationRead(id, userId);

            res.json({ success: true });
        } catch (error) {
            console.error('Error marking notification read:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async markAllRead(req, res) {
        try {
            const userId = req.user.id;
            await Interaction.markAllRead(userId);

            res.json({ success: true });
        } catch (error) {
            console.error('Error marking all read:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    // ==================== REPORT STATS ====================
    static async getReportStats(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id || null;

            const stats = await Interaction.getReportStats(id);
            let userLiked = false;

            if (userId) {
                userLiked = await Interaction.hasUserLiked(id, userId);
            }

            res.json({
                success: true,
                data: {
                    ...stats,
                    userLiked
                }
            });
        } catch (error) {
            console.error('Error getting report stats:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
}

export default InteractionController;
