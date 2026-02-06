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
             WHERE r.estado = 'Aprobado'
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
                r.estado, 
                r.id_categoria,
                r.id_usr as id_usuario,
                u.nombre as autor_nombre,
                u.apellido as autor_apellido
             FROM Reportes r
             LEFT JOIN Usuarios u ON r.id_usr = u.id_usr
             WHERE r.id_reporte = ?`,
            [id]
        );
        return rows[0] || null;
    }

    // ... (omitting lines for brevity, applying similarly to other methods)

    static async findAllAdmin(filters = {}) {
        let query = `
            SELECT 
                r.id_reporte, 
                r.descripcion, 
                r.latitud, 
                r.longitud, 
                r.estado, 
                r.id_categoria,
                r.id_usr as id_usuario,
                u.nombre as usuario_nombre,
                u.apellido as usuario_apellido,
                u.cedula as usuario_cedula,
                u.telefono as usuario_telefono,
                u.correo as usuario_correo,
                (SELECT url FROM Multimedia m WHERE m.id_reporte = r.id_reporte LIMIT 1) as imagen
            FROM Reportes r
            LEFT JOIN Usuarios u ON r.id_usr = u.id_usr
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
}

export default Report;
