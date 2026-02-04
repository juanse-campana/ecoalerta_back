import pool from '../config/db.js';

class Report {
    static async create(data) {
        // data: { descripcion, latitud, longitud, id_categoria, id_usr_bin (opcional) }
        const [result] = await pool.query(
            `INSERT INTO Reportes 
            (descripcion, latitud, longitud, estado, id_categoria, id_usr) 
            VALUES (?, ?, ?, 'por aprobar', ?, ?)`,
            [
                data.descripcion || null,
                data.latitud,
                data.longitud,
                data.id_categoria,
                data.id_usr || null
            ]
        );
        return result.insertId;
    }

    static async createSimple(data) {
        const query = `
            INSERT INTO Reportes 
            (descripcion, latitud, longitud, estado, id_categoria, id_usr) 
            VALUES (?, ?, ?, 'por aprobar', ?, ?)
        `;
        const params = [
            data.descripcion || null,
            data.latitud,
            data.longitud,
            data.id_categoria,
            data.id_usr_bin || null
        ];

        const [result] = await pool.query(query, params);
        return result.insertId;
    }

    static async findAllPublic() {
        const [rows] = await pool.query(
            `SELECT 
                r.id_reporte, 
                r.descripcion, 
                r.latitud, 
                r.longitud, 
                r.estado, 
                r.id_categoria,
                r.id_usr,
                u.nombre as autor_nombre,
                u.apellido as autor_apellido,
                (SELECT url FROM Multimedia m WHERE m.id_reporte = r.id_reporte LIMIT 1) as imagen
             FROM Reportes r
             LEFT JOIN Usuarios u ON r.id_usr = u.id_usr
             WHERE r.estado != 'rechazado'
             ORDER BY r.id_reporte DESC`
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT 
                r.id_reporte, 
                r.descripcion, 
                r.latitud, 
                r.longitud, 
                r.estado, 
                r.es_publico, 
                r.es_publico, 
                r.id_categoria,
                r.id_usr as id_usuario,
                u.nombre as autor_nombre,
                u.apellido as autor_apellido
             FROM Reportes r
             LEFT JOIN Usuarios u ON r.id_usr = u.id_usr
             WHERE r.id_reporte = ? AND r.deleted_at IS NULL`,
            [id]
        );
        return rows[0] || null;
    }

    static async updateContent(id, data) {
        const fields = [];
        const values = [];

        if (data.descripcion) {
            fields.push('descripcion = ?');
            values.push(data.descripcion);
        }

        if (data.id_categoria) {
            fields.push('id_categoria = ?');
            values.push(data.id_categoria);
        }

        if (data.latitud) {
            fields.push('latitud = ?');
            values.push(data.latitud);
        }

        if (data.longitud) {
            fields.push('longitud = ?');
            values.push(data.longitud);
        }

        if (fields.length === 0) return 0;

        values.push(id);

        const [result] = await pool.query(
            `UPDATE Reportes SET ${fields.join(', ')} WHERE id_reporte = ?`,
            values
        );
        return result.affectedRows;
    }

    static async findByUserId(userId) {
        const [rows] = await pool.query(
            `SELECT 
                r.id_reporte, 
                r.descripcion, 
                r.latitud, 
                r.longitud, 
                r.estado, 
                r.id_categoria,
                (SELECT url FROM Multimedia m WHERE m.id_reporte = r.id_reporte LIMIT 1) as imagen
             FROM Reportes r
             WHERE r.id_usr = ?
             ORDER BY r.id_reporte DESC`,
            [userId]
        );
        return rows;
    }

    static async findAllAdmin(filters = {}) {
        let query = `
            SELECT 
                r.id_reporte, 
                r.descripcion, 
                r.latitud, 
                r.longitud, 
                r.estado, 
                r.es_publico, 
                r.id_categoria,
                r.id_usr as id_usuario,
                u.nombre as usuario_nombre,
                u.apellido as usuario_apellido
            FROM Reportes r
            LEFT JOIN Usuarios u ON r.id_usr = u.id_usr
            WHERE r.deleted_at IS NULL
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

    static async updateStatus(id, { estado, es_publico }) {
        const fields = [];
        const values = [];

        if (estado) {
            fields.push('estado = ?');
            values.push(estado);
        }

        if (es_publico !== undefined) {
            fields.push('es_publico = ?');
            values.push(es_publico);
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
        // Soft delete
        const [result] = await pool.query(
            'UPDATE Reportes SET deleted_at = NOW() WHERE id_reporte = ?',
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
             WHERE es_publico = true 
               AND deleted_at IS NULL
               AND ST_Distance_Sphere(POINT(longitud, latitud), POINT(?, ?)) <= ?
             ORDER BY distancia ASC`,
            [lng, lat, lng, lat, radiusMeters]
        );
        return rows;
    }
}

export default Report;
