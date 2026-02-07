import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env explicitly from the script's directory
dotenv.config({ path: join(__dirname, '.env') });

async function migrate() {
    try {
        // Dynamic import to ensure process.env is populated before db.js runs
        const { default: pool } = await import('./src/config/db.js');

        console.log('Adding ubicacion column to Reportes table...');
        await pool.query('ALTER TABLE Reportes ADD COLUMN ubicacion VARCHAR(255) AFTER longitud;');
        console.log('Column added successfully.');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
            process.exit(0);
        }
        console.error('Error migrating database:', error);
        process.exit(1);
    }
}

migrate();
