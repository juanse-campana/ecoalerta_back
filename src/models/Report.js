import pool from '../config/db.js';

class Report {
    static async create(data) {
        // data: { descripcion, latitud, longitud, ubicacion, id_categoria, id_usr (opcional) }
        const [result] = await pool.query(
            `INSERT INTO Reportes 
            (descripcion, latitud, longitud, ubicacion, estado, id_categoria, id_usr) 
            VALUES (?, ?, ?, ?, 'por aprobar', ?, ?)`,
            [
                data.descripcion || null,
                data.latitud,
                data.longitud,
                data.ubicacion || null,
                data.id_categoria,
                data.id_usr || null
            ]
        );
        return result.insertId;
    }

    static async createSimple(data) {
        const query = `
            INSERT INTO Reportes 
            (descripcion, latitud, longitud, ubicacion, estado, id_categoria, id_usr) 
            VALUES (?, ?, ?, ?, 'por aprobar', ?, ?)
        `;
        const params = [
            data.descripcion || null,
            data.latitud,
            data.longitud,
            data.ubicacion || null,
            data.id_categoria,
            data.id_usr_bin || null
        ];

        const [result] = await pool.query(query, params);
        return result.insertId;
    }

    static async findAllPublic(currentUserId = null) {
        const [rows] = await pool.query(
            `SELECT 
                r.id_reporte, 
                r.descripcion, 
                r.latitud, 
                r.longitud, 
                r.ubicacion,
                r.estado, 
                r.id_categoria,
                r.id_usr,
                r.creado_en,
                u.nombre as autor_nombre,
                u.apellido as autor_apellido,
                (SELECT url FROM Multimedia m WHERE m.id_reporte = r.id_reporte LIMIT 1) as imagen,
                (SELECT COUNT(*) FROM Likes l WHERE l.id_reporte = r.id_reporte) as likes,
                (SELECT COUNT(*) FROM Comentarios c WHERE c.id_reporte = r.id_reporte) as comentarios,
                (SELECT COUNT(*) FROM Vistas v WHERE v.id_reporte = r.id_reporte) as vistas,
                IF(? IS NOT NULL, (SELECT COUNT(*) > 0 FROM Likes l WHERE l.id_reporte = r.id_reporte AND l.id_usr = ?), 0) as liked_by_me
             FROM Reportes r
             LEFT JOIN Usuarios u ON r.id_usr = u.id_usr
             WHERE r.estado = 'Aprobado'
             ORDER BY r.id_reporte DESC`,
            [currentUserId, currentUserId]
        );
        return rows;
    }

    static async findById(id, currentUserId = null) {
        const [rows] = await pool.query(
            `SELECT 
                r.id_reporte, 
                r.descripcion, 
                r.latitud, 
                r.longitud, 
                r.ubicacion,
                r.estado, 
                r.id_categoria,
                r.id_usr as id_usuario,
                r.creado_en,
                u.nombre as autor_nombre,
                u.apellido as autor_apellido,
                (SELECT COUNT(*) FROM Likes l WHERE l.id_reporte = r.id_reporte) as likes,
                (SELECT COUNT(*) FROM Comentarios c WHERE c.id_reporte = r.id_reporte) as comentarios,
                (SELECT COUNT(*) FROM Vistas v WHERE v.id_reporte = r.id_reporte) as vistas,
                IF(? IS NOT NULL, (SELECT COUNT(*) > 0 FROM Likes l WHERE l.id_reporte = r.id_reporte AND l.id_usr = ?), 0) as liked_by_me
             FROM Reportes r
             LEFT JOIN Usuarios u ON r.id_usr = u.id_usr
             WHERE r.id_reporte = ?`,
            [currentUserId, currentUserId, id]
        );
        return rows[0] || null;
    }

    // Reportes del usuario logueado
    static async findByUserId(userId, currentUserId = null) {
        const [rows] = await pool.query(
            `SELECT 
                r.id_reporte, 
                r.descripcion, 
                r.latitud, 
                r.longitud, 
                r.ubicacion,
                r.estado, 
                r.id_categoria,
                r.creado_en,
                (SELECT url FROM Multimedia m WHERE m.id_reporte = r.id_reporte LIMIT 1) as imagen,
                (SELECT COUNT(*) FROM Likes l WHERE l.id_reporte = r.id_reporte) as likes,
                (SELECT COUNT(*) FROM Comentarios c WHERE c.id_reporte = r.id_reporte) as comentarios,
                (SELECT COUNT(*) FROM Vistas v WHERE v.id_reporte = r.id_reporte) as vistas,
                IF(? IS NOT NULL, (SELECT COUNT(*) > 0 FROM Likes l WHERE l.id_reporte = r.id_reporte AND l.id_usr = ?), 0) as liked_by_me
             FROM Reportes r
             WHERE r.id_usr = ?
             ORDER BY r.id_reporte DESC`,
            [currentUserId, currentUserId, userId]
        );
        return rows;
    }

    // ... (omitting lines for brevity, applying similarly to other methods)

    static async findAllAdmin(filters = {}) {
        let query = `
            SELECT 
                r.id_reporte, 
                r.descripcion, 
                r.latitud, 
                r.longitud, 
                r.ubicacion,
                r.estado, 
                r.id_categoria,
                r.id_usr as id_usuario,
                r.creado_en,
                c.nombre as categoria_nombre,
                u.nombre as usuario_nombre,
                u.apellido as usuario_apellido,
                u.cedula as usuario_cedula,
                u.telefono as usuario_telefono,
                u.correo as usuario_correo,
                (SELECT url FROM Multimedia m WHERE m.id_reporte = r.id_reporte LIMIT 1) as imagen
            FROM Reportes r
            LEFT JOIN Usuarios u ON r.id_usr = u.id_usr
            LEFT JOIN Categorias c ON r.id_categoria = c.id_categoria
            WHERE 1=1
        `;

        const params = [];

        if (filters.estado) {
            query += ' AND r.estado = ?';
            params.push(filters.estado);
        }

        if (filters.id_categoria) {
            query += ' AND r.id_categoria = ?';
            params.push(filters.id_categoria);
        }

        query += ' ORDER BY r.id_reporte DESC';

        const [rows] = await pool.query(query, params);
        return rows;
    }

    static async updateStatus(id, { estado }) {
        const fields = [];
        const values = [];

        if (estado) {
            fields.push('estado = ?');
            values.push(estado);
        }

        if (fields.length === 0) return 0;

        values.push(id);

        const [result] = await pool.query(
            `UPDATE Reportes SET ${fields.join(', ')} WHERE id_reporte = ?`,
            values
        );
        return result.affectedRows;
    }

    static async delete(id) {
        // Hard delete since deleted_at doesn't exist
        const [result] = await pool.query(
            'DELETE FROM Reportes WHERE id_reporte = ?',
            [id]
        );
        return result.affectedRows;
    }

    static async findNearby(lat, lng, radiusMeters = 1000) {
        const [rows] = await pool.query(
            `SELECT 
                id_reporte, 
                descripcion, 
                latitud, 
                longitud, 
                estado,
    ST_Distance_Sphere(POINT(longitud, latitud), POINT(?, ?)) as distancia
             FROM Reportes
             WHERE ST_Distance_Sphere(POINT(longitud, latitud), POINT(?, ?)) <= ?
    ORDER BY distancia ASC`,
            [lng, lat, lng, lat, radiusMeters]
        );
        return rows;
    }

    // Estadísticas del usuario logueado
    static async countByUser(userId) {
        const [rows] = await pool.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado IN ('por aprobar', 'Aprobado', 'en progreso') THEN 1 ELSE 0 END) as activos
             FROM Reportes
             WHERE id_usr = ?`,
            [userId]
        );
        return rows[0] || { total: 0, activos: 0 };
    }

    // Contador de reportes creados hoy (todos los usuarios)
    static async countTodayAll() {
        const [rows] = await pool.query(
            `SELECT COUNT(*) as count 
             FROM Reportes 
             WHERE DATE(creado_en) = CURDATE()`
        );
        return rows[0]?.count || 0;
    }
}

export default Report;
