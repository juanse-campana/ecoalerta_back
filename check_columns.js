
import pool from './src/config/db.js';

async function checkColumns() {
    try {
        const [rows] = await pool.query('DESCRIBE Reportes');
        console.log('Columns in Reportes table:');
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error('Error checking columns:', error);
        process.exit(1);
    }
}

checkColumns();
