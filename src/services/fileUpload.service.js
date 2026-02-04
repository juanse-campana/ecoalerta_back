class FileUploadService {
    /**
     * Procesa los archivos subidos, los sube a la nube (o carpeta local) y retorna sus URLs.
     * @param {Array} files - Array de archivos de multer
     * @returns {Promise<Array>} - Array de objetos { url, tipo_archivo }
     */
    static async processFiles(files) {
        // Simulación: En un entorno real aquí subiríamos a S3, Cloudinary, o moveríamos a /public/uploads
        // Como 'multer' ya los guardó en /uploads (según configuración usual), solo construimos la URL.

        if (!files || files.length === 0) return [];

        return files.map(file => {
            // Asumiendo que el servidor sirve la carpeta 'uploads' como estática
            // Nota: En index.js vimos: app.use('/uploads', express.static(...));
            // file.filename es el nombre guardado en disco.

            return {
                url: `/uploads/${file.filename}`,
                tipo_archivo: file.mimetype.startsWith('image/') ? 'imagen' : 'video' // Simplificación
            };
        });
    }
}

export default FileUploadService;
