import pool from '../config/db.js';

class Interaction {
    // ==================== LIKES ====================
    static async toggleLike(id_reporte, id_usr) {
        // Check if like exists
        const [existing] = await pool.query(
            'SELECT id_like FROM Likes WHERE id_reporte = ? AND id_usr = ?',
            [id_reporte, id_usr]
        );

        if (existing.length > 0) {
            // Remove like
            await pool.query('DELETE FROM Likes WHERE id_like = ?', [existing[0].id_like]);
            return { liked: false };
        } else {
            // Add like
            await pool.query(
                'INSERT INTO Likes (id_reporte, id_usr) VALUES (?, ?)',
                [id_reporte, id_usr]
            );
            return { liked: true };
        }
    }

    static async getLikeCount(id_reporte) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM Likes WHERE id_reporte = ?',
            [id_reporte]
        );
        return rows[0].count;
    }

    static async hasUserLiked(id_reporte, id_usr) {
        const [rows] = await pool.query(
            'SELECT id_like FROM Likes WHERE id_reporte = ? AND id_usr = ?',
            [id_reporte, id_usr]
        );
        return rows.length > 0;
    }

    // ==================== COMENTARIOS ====================
    static async addComment(id_reporte, id_usr, contenido) {
        const [result] = await pool.query(
            'INSERT INTO Comentarios (id_reporte, id_usr, contenido) VALUES (?, ?, ?)',
            [id_reporte, id_usr, contenido]
        );
        return result.insertId;
    }

    static async getComments(id_reporte) {
        const [rows] = await pool.query(
            `SELECT c.id_comentario, c.contenido, c.creado_en,
                    u.id_usr, u.nombre, u.apellido
             FROM Comentarios c
             JOIN Usuarios u ON c.id_usr = u.id_usr
             WHERE c.id_reporte = ?
             ORDER BY c.creado_en DESC`,
            [id_reporte]
        );
        return rows;
    }

    static async getCommentCount(id_reporte) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM Comentarios WHERE id_reporte = ?',
            [id_reporte]
        );
        return rows[0].count;
    }

    static async deleteComment(id_comentario, id_usr) {
        const [result] = await pool.query(
            'DELETE FROM Comentarios WHERE id_comentario = ? AND id_usr = ?',
            [id_comentario, id_usr]
        );
        return result.affectedRows > 0;
    }

    // ==================== VISTAS ====================
    static async addView(id_reporte, id_usr) {
        try {
            if (id_usr) {
                // Usuario logueado - evitar duplicados
                await pool.query(
                    'INSERT IGNORE INTO Vistas (id_reporte, id_usr) VALUES (?, ?)',
                    [id_reporte, id_usr]
                );
            } else {
                // Usuario anónimo - siempre contar
                await pool.query(
                    'INSERT INTO Vistas (id_reporte) VALUES (?)',
                    [id_reporte]
                );
            }
        } catch (error) {
            // Ignorar errores de duplicados
        }
    }

    static async getViewCount(id_reporte) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM Vistas WHERE id_reporte = ?',
            [id_reporte]
        );
        return rows[0].count;
    }

    // ==================== NOTIFICACIONES ====================
    static async createNotification(id_usr_destino, id_usr_origen, id_reporte, tipo) {
        // No notificar si es el mismo usuario
        if (id_usr_destino === id_usr_origen) return;

        await pool.query(
            `INSERT INTO Notificaciones (id_usr_destino, id_usr_origen, id_reporte, tipo) 
             VALUES (?, ?, ?, ?)`,
            [id_usr_destino, id_usr_origen, id_reporte, tipo]
        );
    }

    static async getNotifications(id_usr) {
        const [rows] = await pool.query(
            `SELECT n.id_notificacion, n.tipo, n.leido, n.creado_en, n.id_reporte,
                    u.nombre as origen_nombre, u.apellido as origen_apellido,
                    r.descripcion as reporte_descripcion
             FROM Notificaciones n
             JOIN Usuarios u ON n.id_usr_origen = u.id_usr
             JOIN Reportes r ON n.id_reporte = r.id_reporte
             WHERE n.id_usr_destino = ?
             ORDER BY n.creado_en DESC
             LIMIT 50`,
            [id_usr]
        );
        return rows;
    }

    static async markNotificationRead(id_notificacion, id_usr) {
        await pool.query(
            'UPDATE Notificaciones SET leido = TRUE WHERE id_notificacion = ? AND id_usr_destino = ?',
            [id_notificacion, id_usr]
        );
    }

    static async markAllRead(id_usr) {
        await pool.query(
            'UPDATE Notificaciones SET leido = TRUE WHERE id_usr_destino = ?',
            [id_usr]
        );
    }

    static async getUnreadCount(id_usr) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM Notificaciones WHERE id_usr_destino = ? AND leido = FALSE',
            [id_usr]
        );
        return rows[0].count;
    }

    // ==================== TRENDING ====================
    static async getTrending(limit = 10) {
        const [rows] = await pool.query(
            `SELECT 
                r.id_reporte,
                r.descripcion,
                r.latitud,
                r.longitud,
                r.estado,
                r.id_categoria,
                r.creado_en,
                r.id_usr,
                c.nombre as categoria_nombre,
                u.nombre as autor_nombre,
                u.apellido as autor_apellido,
                (SELECT url FROM Multimedia m WHERE m.id_reporte = r.id_reporte LIMIT 1) as imagen,
                (SELECT COUNT(*) FROM Likes l WHERE l.id_reporte = r.id_reporte) as likes,
                (SELECT COUNT(*) FROM Comentarios cm WHERE cm.id_reporte = r.id_reporte) as comentarios,
                (SELECT COUNT(*) FROM Vistas v WHERE v.id_reporte = r.id_reporte) as vistas,
                (
                    (SELECT COUNT(*) FROM Likes l WHERE l.id_reporte = r.id_reporte) * 3 +
                    (SELECT COUNT(*) FROM Comentarios cm WHERE cm.id_reporte = r.id_reporte) * 2 +
                    (SELECT COUNT(*) FROM Vistas v WHERE v.id_reporte = r.id_reporte)
                ) as score,
                IF(? IS NOT NULL, (SELECT COUNT(*) > 0 FROM Likes l WHERE l.id_reporte = r.id_reporte AND l.id_usr = ?), 0) as liked_by_me
             FROM Reportes r
             LEFT JOIN Usuarios u ON r.id_usr = u.id_usr
             LEFT JOIN Categorias c ON r.id_categoria = c.id_categoria
             WHERE r.estado = 'Aprobado'
             ORDER BY score DESC, r.creado_en DESC
             LIMIT ?`,
            [currentUserId, currentUserId, limit]
        );
        return rows;
    }

    // ==================== STATS FOR REPORT ====================
    static async getReportStats(id_reporte) {
        const [stats] = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM Likes WHERE id_reporte = ?) as likes,
                (SELECT COUNT(*) FROM Comentarios WHERE id_reporte = ?) as comentarios,
                (SELECT COUNT(*) FROM Vistas WHERE id_reporte = ?) as vistas`,
            [id_reporte, id_reporte, id_reporte]
        );
        return stats[0];
    }
}

export default Interaction;
