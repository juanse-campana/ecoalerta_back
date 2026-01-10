import pool from '../config/db.js';

class Multimedia {
    static async create(data) {
        // data: { url, tipo_archivo, id_reporte }
        const [result] = await pool.query(
            'INSERT INTO Multimedia (url, tipo_archivo, id_reporte) VALUES (?, ?, ?)',
            [data.url, data.tipo_archivo, data.id_reporte]
        );
        return result.insertId;
    }

    static async findByReportId(reportId) {
        const [rows] = await pool.query(
            'SELECT * FROM Multimedia WHERE id_reporte = ?',
            [reportId]
        );
        return rows;
    }

    static async delete(id) {
        // Hard delete para multimedia o soft delete? El requerimiento dice Soft Delete en Reportes y Usuarios.
        // Asumiremos Hard Delete para la tabla Multimedia si se elimina el archivo en sí,
        // pero dado que hay FK CASCADE desde Reportes, si se borra el reporte (soft), la multimedia sigue ahí.
        // Si se borra físico el reporte, se borra esto.
        // Para este método, implementamos borrado directo por ID (ej. usuario borra una foto).
        const [result] = await pool.query(
            'DELETE FROM Multimedia WHERE id_multimedia = ?',
            [id]
        );
        return result.affectedRows;
    }
}

export default Multimedia;
