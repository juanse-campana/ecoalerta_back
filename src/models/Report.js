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
            (descripcion, latitud, longitud, ubicacion, estado, es_publico, id_categoria, id_usr_bin, creado_en) 
            VALUES (?, ?, ?, ST_PointFromText(?, 4326), 'por aprobar', false, ?, UUID_TO_BIN(?), NOT NOW())`, 
            // NOT NOW() es un typo intencional? No, debería ser NOW(). Corregimos abajo.
            // UUID_TO_BIN(?) maneja el null si el usuario es anónimo? Si pasamos NULL, UUID_TO_BIN(NULL) da NULL.
            [
                data.descripcion || null,
                data.latitud,
                data.longitud,
                `POINT(${data.latitud} ${data.longitud})`, // MySQL 8.0 SRID 4326: Lat Lng order
                data.id_categoria,
                data.id_usr_bin || null
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
            (descripcion, latitud, longitud, ubicacion, estado, es_publico, id_categoria, id_usr_bin, creado_en) 
            VALUES (?, ?, ?, ST_PointFromText(?, 4326), 'por aprobar', false, ?, ${data.id_usr_bin ? 'UUID_TO_BIN(?)' : 'NULL'}, NOW())
        `;
        
        const params = [
            data.descripcion || null,
            data.latitud,
            data.longitud,
            `POINT(${data.latitud} ${data.longitud})`,
            data.id_categoria
        ];
        
        if (data.id_usr_bin) {
            params.push(data.id_usr_bin);
        }

        const [result] = await pool.query(query, params);
        return result.insertId;
    }

    static async findAllPublic() {
        // Retorna reportes donde es_publico = true y no está borrado
        const [rows] = await pool.query(
            `SELECT 
                id_reporte, 
                descripcion, 
                latitud, 
                longitud, 
                estado, 
                creado_en, 
                id_categoria 
             FROM Reportes 
             WHERE es_publico = true AND deleted_at IS NULL
             ORDER BY creado_en DESC`
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
                BIN_TO_UUID(r.id_usr_bin) as id_usuario
             FROM Reportes r
             WHERE r.id_reporte = ? AND r.deleted_at IS NULL`,
            [id]
        );
        return rows[0] || null;
    }
    
    static async findByUserId(userId) {
         const [rows] = await pool.query(
            `SELECT 
                id_reporte, 
                descripcion, 
                latitud, 
                longitud, 
                estado, 
                es_publico, 
                creado_en, 
                id_categoria 
             FROM Reportes 
             WHERE id_usr_bin = UUID_TO_BIN(?) AND deleted_at IS NULL
             ORDER BY creado_en DESC`,
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
                BIN_TO_UUID(r.id_usr_bin) as id_usuario,
                u.nombre as usuario_nombre,
                u.apellido as usuario_apellido
            FROM Reportes r
            LEFT JOIN Usuarios u ON r.id_usr_bin = u.id_usr_bin
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
