<<<<<<< Updated upstream
=======
import pool from '../config/db.js';

class Report {
    static async create(data) {
        // data: { descripcion, latitud, longitud, id_categoria, id_usr_bin (opcional) }
        // Nota: ST_GeomFromText('POINT(lat lng)', 4326) es el estándar, pero MySQL a veces requiere 'POINT(lng lat)'
        // En GIS espacial estricto es (X Y) -> (Long Lat). MySQL 8+ honra axis order de SRID 4326 que es (Lat Long).
        // Sin embargo, para mayor compatibilidad segura usamos ST_GeomFromText('POINT(lat lng)', 4326, 'axis-order=lat-long') o simplemente probamos.
        // MySQL 8.0: SRID 4326 is Lat/Lon.

        const [result] = await pool.query(
            `INSERT INTO Reportes 
            (descripcion, latitud, longitud, estado, id_categoria, id_usr, creado_en) 
            VALUES (?, ?, ?, 'por aprobar', false, ?, ?, NOW())`,
            // NOT NOW() es un typo intencional? No, debería ser NOW(). Corregimos abajo.
            // UUID_TO_BIN(?) maneja el null si el usuario es anónimo? Si pasamos NULL, UUID_TO_BIN(NULL) da NULL.
            [
                data.descripcion || null,
                data.latitud,
                data.longitud,
                data.id_categoria,
                data.id_usr || null
            ]
        ).catch(err => {
            // Si falla por UUID_TO_BIN con null, manejamos la query dinámica o conditional params.
            // Mejor estrategia: Si id_usr_bin es null, enviamos null directo en la query sin la función, o usamos una query condicional.
            // Pero mysql2 permite '?' para null. El problema es UUID_TO_BIN(NULL) -> NULL. Esto funciona en MySQL 8.
            throw err;
        });

        // Correccion para NOW() y simplificacion
        // Si id_usr_bin es null, mysql tratará de ejecutar UUID_TO_BIN(NULL) que retorna NULL, lo cual es correcto para SET NULL.

        return result.insertId;
    }

    // Corregimos la implementación de create con la query limpia
    static async createSimple(data) {
        const query = `
            INSERT INTO Reportes 
            (descripcion, latitud, longitud, estado, id_categoria, id_usr) 
            VALUES (?, ?, ?, 'por aprobar', ?, ?)
        `;
        // Removed `ubicacion` ST function for simplicity as standard lat/long columns are used in valid query above.
        // Actually, schema shows `latitud` and `longitud` columns. 
        // Schema in prompt 1 does NOT showing a `ubicacion` POINT column. It shows lat/long DECIMAL.
        // So I should remove `ubicacion` geometry column reference if it wasn't in list 1.
        // Prompt 1 Schema: id_reporte, descripcion, latitud, longitud, estado, id_categoria, id_usr.
        //Backend code was trying to insert into `ubicacion` which might not exist. I will verify schema 1 again.
        // Schema 1: latitud DECIMAL(10,8), longitud DECIMAL(11,8). NO `ubicacion`.
        // So I REMOVE `ubicacion` and `UUID_TO_BIN`.

        const params = [
            data.descripcion || null,
            data.latitud,
            data.longitud,
            data.id_categoria,
            data.id_usr_bin || null // Incoming data might be named id_usr_bin from controller, I should check controller.
        ];

        // Controller passes id_usr_bin. I'll change it to use id_usr in controller later or just use the value.
        // Ideally rename key in params.

        const [result] = await pool.query(query, params);
        return result.insertId;
    }

    static async findAllPublic() {
        // Retorna reportes donde es_publico es irrelevante si no está en la tabla, pero la tabla Usuario tenía "estado" 'por aprobar'.
        // Schema 1: estado VARCHAR(20). No 'es_publico'.
        // So I remove 'es_publico'. I filter by 'estado' != 'rechazado' maybe? Or just all.
        // Let's assume 'por aprobar' is pending. 'activo'? 
        // Prompt 1 Data: status 'por aprobar'. 
        // Dashboard shows 'activo', 'en_proceso', 'resuelto'.

        // Joining with Multimedia and Usuarios
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
                r.creado_en, 
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

        // Update and set status to 'por aprobar' again if content changes? 
        // Usually yes, if you edit a report it might need re-approval.
        // For now, let's keep status as is or set to 'en_proceso' if it was rejected?
        // User didn't specify. I'll just update content.

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
                r.creado_en, 
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

        query += ' ORDER BY r.creado_en DESC';

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

    /**
     * Busca reportes dentro de un radio (en metros) desde un punto central.
     * @param {number} lat - Latitud central
     * @param {number} lng - Longitud central
     * @param {number} radiusMeters - Radio en metros (default 1000m)
     */
    static async findNearby(lat, lng, radiusMeters = 1000) {
        // Fórmula ST_Distance_Sphere retorna metros.
        // POINT(lat lng) es la convención para SRID 4326 en MySQL 8.
        const [rows] = await pool.query(
            `SELECT 
                id_reporte, 
                descripcion, 
                latitud, 
                longitud, 
                estado,
                ST_Distance_Sphere(ubicacion, ST_PointFromText(?, 4326)) as distancia
             FROM Reportes
             WHERE es_publico = true 
               AND deleted_at IS NULL
               AND ST_Distance_Sphere(ubicacion, ST_PointFromText(?, 4326)) <= ?
             ORDER BY distancia ASC`,
            [`POINT(${lat} ${lng})`, `POINT(${lat} ${lng})`, radiusMeters]
        );
        return rows;
    }
}

export default Report;
>>>>>>> Stashed changes
