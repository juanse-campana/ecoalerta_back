
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
    try {
        const { default: pool } = await import('./src/config/db.js');
        console.log('🔍 Probing Reportes table columns...');
        const [rows] = await pool.query('SELECT * FROM Reportes LIMIT 1');
        if (rows.length > 0) {
            console.log('Columns found:', Object.keys(rows[0]));
        } else {
            // If empty, use Describe
            const [cols] = await pool.query('DESCRIBE Reportes');
            console.log('Columns (from DESCRIBE):', cols.map(c => c.Field));
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Error probing:', error);
        process.exit(1);
    }
};

seedData();
