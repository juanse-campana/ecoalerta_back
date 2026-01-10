import Report from '../models/Report.js';
import Multimedia from '../models/Multimedia.js';
import FileUploadService from '../services/fileUpload.service.js';

class ReportController {

    static async createReport(req, res) {
        try {
            const { descripcion, latitud, longitud, id_categoria } = req.body;
            
            // Si hay usuario autenticado, usamos su ID, sino es null (anónimo)
            const id_usr_bin = req.user ? req.user.id : null;

            // 1. Crear el Reporte
            const reportId = await Report.createSimple({
                descripcion,
                latitud,
                longitud,
                id_categoria,
                id_usr_bin
            });

            // 2. Procesar y guardar Multimedia
            // req.files viene de multer
            if (req.files && req.files.length > 0) {
                // Procesar archivos (optimizar/transcodificar)
                const processedFiles = await FileUploadService.processFiles(req.files);
                
                // Guardar referencias en DB
                for (const fileData of processedFiles) {
                    await Multimedia.create({
                        url: fileData.url,
                        tipo_archivo: fileData.tipo_archivo,
                        id_reporte: reportId
                    });
                }
            }

            res.status(201).json({
                success: true,
                message: 'Reporte creado exitosamente',
                reportId
            });

        } catch (error) {
            console.error('Error creando reporte:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear el reporte',
                error: error.message
            });
        }
    }

    static async getPublicReports(req, res) {
        try {
            const reports = await Report.findAllPublic();
            
            // Para cada reporte, podríamos querer adjuntar su multimedia principal
            // Por rendimiento, idealmente haríamos un JOIN en el modelo, 
            // pero por simplicidad iteramos aquí o lo dejamos al frontend pedir detalle.
            // Vamos a dejarlo simple: Retorna datos básicos para el mapa.
            
            res.json({
                success: true,
                data: reports
            });
        } catch (error) {
            console.error('Error obteniendo reportes públicos:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async getMyReports(req, res) { // Implementar esta función para usuarios registrados
        try {
            const reports = await Report.findByUserId(req.user.id);
            res.json({
                success: true,
                data: reports
            });
        } catch (error) {
             console.error('Error obteniendo historial:', error);
             res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    // --- Admin ---

    static async getAllReports(req, res) {
        try {
            const { estado, id_categoria } = req.query;
            const reports = await Report.findAllAdmin({ estado, id_categoria });
            res.json({
                success: true,
                data: reports
            });
        } catch (error) {
            console.error('Error admin reports:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }

    static async updateReportStatus(req, res) {
        try {
            const { id } = req.params;
            const { estado, es_publico } = req.body;

            const affected = await Report.updateStatus(id, { estado, es_publico });

            if (affected === 0) {
                return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
            }

            res.json({
                success: true,
                message: 'Reporte actualizado'
            });

        } catch (error) {
            console.error('Error actualizando reporte:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
    
    static async deleteReport(req, res) {
        try {
            const { id } = req.params;
            const affected = await Report.delete(id);
             if (affected === 0) {
                return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
            }
            res.json({ success: true, message: 'Reporte eliminado' });
        } catch (error) {
             console.error('Error borrando reporte:', error);
            res.status(500).json({ success: false, message: 'Error del servidor' });
        }
    }
}

export default ReportController;
