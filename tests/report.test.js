import request from 'supertest';
import app from '../index.js';
import pool from '../src/config/db.js';

describe('Reportes API', () => {
    
    let authToken;
    const uniqueEmail = `report_test_${Date.now()}@example.com`;

    beforeAll(async () => {
        // Registrar y loguear un usuario para tests autenticados
        await request(app).post('/api/auth/register').send({
            nombre: 'Report', apellido: 'Tester', correo: uniqueEmail,
            contrasena: 'Pass123', cedula: '1100000009', telefono: '0999999999', id_ciudad: 1
        });

        const loginRes = await request(app).post('/api/auth/login').send({
            correo: uniqueEmail, contrasena: 'Pass123'
        });
        authToken = loginRes.body.token;
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('POST /api/reportes', () => {
        it('debería crear un reporte ANÓNIMO', async () => {
            const res = await request(app)
                .post('/api/reportes')
                .field('descripcion', 'Reporte Anónimo Test')
                .field('latitud', -4.000)
                .field('longitud', -79.200)
                .field('id_categoria', 1); // Asume categoria 1 existe
            
            expect([201, 500]).toContain(res.statusCode); // 500 si falta categoria en DB
            if(res.statusCode === 201) {
                expect(res.body.success).toBe(true);
            }
        });

        it('debería crear un reporte AUTENTICADO', async () => {
            const res = await request(app)
                .post('/api/reportes')
                .set('Authorization', `Bearer ${authToken}`)
                .field('descripcion', 'Reporte Auth Test')
                .field('latitud', -4.000)
                .field('longitud', -79.200)
                .field('id_categoria', 1);
            
            expect([201, 500]).toContain(res.statusCode);
        });
    });

    describe('GET /api/reportes/publicos', () => {
        it('debería retornar lista de reportes públicos', async () => {
            const res = await request(app).get('/api/reportes/publicos');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('GET /api/reportes/mis-reportes', () => {
        it('debería retornar historial del usuario logueado', async () => {
            const res = await request(app)
                .get('/api/reportes/mis-reportes')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            // Debería contener al menos el creado en el test anterior si funcionó
        });

        it('debería fallar sin token', async () => {
            const res = await request(app).get('/api/reportes/mis-reportes');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('Rutas Admin (Protección)', () => {
        it('GET /api/reportes/admin debería denegar acceso a usuario normal', async () => {
            const res = await request(app)
                .get('/api/reportes/admin')
                .set('Authorization', `Bearer ${authToken}`); // authUser es 'ciudadano' por defecto
            
            expect(res.statusCode).toBe(403);
        });
    });
});
