
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
    try {
        // Dynamic import to ensure process.env is set
        const { default: pool } = await import('./src/config/db.js');
        console.log('🌱 Seeding database with catalogs...');

        // 1. Provincias
        console.log('Inserting Provincias...');
        const provincias = [
            { id: 1, nombre: 'Loja' },
            { id: 2, nombre: 'Azuay' },
            { id: 3, nombre: 'Pichincha' },
            { id: 4, nombre: 'Guayas' }
        ];

        for (const prov of provincias) {
            await pool.query(
                'INSERT IGNORE INTO Provincias (id_provincia, nombre) VALUES (?, ?)',
                [prov.id, prov.nombre]
            );
        }

        // 2. Ciudades
        console.log('Inserting Ciudades...');
        const ciudades = [
            // Loja
            { id: 1, nombre: 'Loja', id_provincia: 1 },
            { id: 2, nombre: 'Catamayo', id_provincia: 1 },
            { id: 3, nombre: 'Saraguro', id_provincia: 1 },
            // Azuay
            { id: 4, nombre: 'Cuenca', id_provincia: 2 },
            { id: 5, nombre: 'Gualaceo', id_provincia: 2 },
            // Pichincha
            { id: 6, nombre: 'Quito', id_provincia: 3 },
            { id: 7, nombre: 'Cayambe', id_provincia: 3 },
            // Guayas
            { id: 8, nombre: 'Guayaquil', id_provincia: 4 },
            { id: 9, nombre: 'Samborondón', id_provincia: 4 }
        ];

        for (const city of ciudades) {
            await pool.query(
                'INSERT IGNORE INTO Ciudades (id_ciudad, nombre, id_provincia) VALUES (?, ?, ?)',
                [city.id, city.nombre, city.id_provincia]
            );
        }

        // 3. Categorias (Also useful)
        console.log('Inserting Categorias...');
        const categorias = [
            { id: 1, nombre: 'fauna' },
            { id: 2, nombre: 'basura' },
            { id: 3, nombre: 'quema' },
            { id: 4, nombre: 'deforestacion' },
            { id: 5, nombre: 'contaminacion' },
            { id: 6, nombre: 'ruido' },
            { id: 7, nombre: 'aire' },
            { id: 8, nombre: 'infraestructura' }
        ];

        for (const cat of categorias) {
            await pool.query(
                'INSERT IGNORE INTO Categorias (id_categoria, nombre) VALUES (?, ?)',
                [cat.id, cat.nombre]
            );
        }

        console.log('✅ Seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
