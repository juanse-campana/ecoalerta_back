import pool from '../config/db.js';

class Multimedia {
    static async create(data) {
        const [result] = await pool.query(
            'INSERT INTO Multimedia (id_reporte, url, tipo_archivo) VALUES (?, ?, ?)',
            [data.id_reporte, data.url, 'imagen']
        );
        return result.insertId;
    }

    static async findByReportId(idReporte) {
        const [rows] = await pool.query(
            'SELECT * FROM Multimedia WHERE id_reporte = ?',
            [idReporte]
        );
        return rows;
    }
}
export default Multimedia;
