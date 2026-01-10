import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

class FileUploadService {
    
    /**
     * Procesa una lista de archivos subidos (en temp)
     * @param {Array} files - Array de objetos file de Multer
     * @returns {Promise<Array>} - Array de objetos con info del archivo procesado { url, type }
     */
    static async processFiles(files) {
        if (!files || files.length === 0) return [];

        const processedFiles = [];

        for (const file of files) {
            try {
                let result;
                if (file.mimetype.startsWith('image/')) {
                    result = await this.processImage(file);
                } else if (file.mimetype.startsWith('video/')) {
                    result = await this.processVideo(file);
                } else if (file.mimetype.startsWith('audio/')) {
                    result = await this.processAudio(file);
                }

                if (result) {
                    processedFiles.push(result);
                } // Si falla un archivo, lo omitimos o lanzamos error segun politica.
            } catch (error) {
                console.error(`Error procesando archivo ${file.originalname}:`, error);
                // Intentamos borrar el temporal si falló
                await this.deleteFile(file.path).catch(() => {});
            }
        }
        
        return processedFiles;
    }

    static async processImage(file) {
        const filename = `img-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
        const outputPath = path.join(UPLOADS_DIR, 'images', filename);

        // Optimizar a WebP
        await sharp(file.path)
            .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true }) // Max FHD
            .webp({ quality: 80 })
            .toFile(outputPath);

        // Borrar original temporal
        await this.deleteFile(file.path);

        return {
            url: `/uploads/images/${filename}`,
            tipo_archivo: 'imagen'
        };
    }

    static async processVideo(file) {
        const filename = `vid-${Date.now()}-${Math.round(Math.random() * 1E9)}.mp4`;
        const outputPath = path.join(UPLOADS_DIR, 'videos', filename);

        // Transcodificar a H.264 / AAC
        return new Promise((resolve, reject) => {
            ffmpeg(file.path)
                .outputOptions([
                    '-c:v libx264',     // Codec video H.264
                    '-crf 23',          // Calidad constante (menor es mejor, 23 es default)
                    '-preset fast',     // Velocidad de codificación
                    '-c:a aac',         // Codec audio AAC
                    '-b:a 128k',        // Bitrate audio
                    '-movflags +faststart' // Optimizar para web streaming
                ])
                .save(outputPath)
                .on('end', async () => {
                   await this.deleteFile(file.path);
                   resolve({
                       url: `/uploads/videos/${filename}`,
                       tipo_archivo: 'video'
                   });
                })
                .on('error', (err) => {
                    console.error('Error FFmpeg:', err);
                    reject(err); 
                });
        });
    }

    static async processAudio(file) {
        const filename = `aud-${Date.now()}-${Math.round(Math.random() * 1E9)}.mp3`;
        const outputPath = path.join(UPLOADS_DIR, 'audio', filename);

        // Convertir a MP3
        return new Promise((resolve, reject) => {
            ffmpeg(file.path)
                .audioCodec('libmp3lame')
                .audioBitrate('128k')
                .save(outputPath)
                .on('end', async () => {
                   await this.deleteFile(file.path);
                   resolve({
                       url: `/uploads/audio/${filename}`,
                       tipo_archivo: 'audio'
                   });
                })
                .on('error', (err) => {
                    console.error('Error FFmpeg audio:', err);
                    reject(err);
                });
        });
    }

    static async deleteFile(filePath) {
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.warn(`No se pudo borrar archivo: ${filePath}`, error);
        }
    }
}

export default FileUploadService;
