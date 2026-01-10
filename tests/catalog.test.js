import request from 'supertest';
import app from '../index.js';
import pool from '../src/config/db.js';

describe('Catalogos API', () => {
    
    afterAll(async () => {
        await pool.end();
    });

    describe('GET /api/catalogos/provincias', () => {
        it('debería retornar lista de provincias', async () => {
            const res = await request(app).get('/api/catalogos/provincias');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            if (res.body.length > 0) {
                expect(res.body[0]).toHaveProperty('id_provincia');
                expect(res.body[0]).toHaveProperty('nombre');
            }
        });
    });

    describe('GET /api/catalogos/ciudades', () => {
        it('debería requerir id_provincia', async () => {
            const res = await request(app).get('/api/catalogos/ciudades');
            expect(res.statusCode).toBe(400);
        });

        it('debería retornar ciudades filtradas por provincia (ej: 11 - Loja)', async () => {
            // Asumiendo que provincia 11 existe (Loja suele ser 11 en Ecuador)
            // Si la base de datos está vacía, esto retornará array vacío pero status 200, lo cual es correcto.
            const res = await request(app).get('/api/catalogos/ciudades?id_provincia=11');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('GET /api/catalogos/categorias', () => {
        it('debería retornar lista de categorías', async () => {
            const res = await request(app).get('/api/catalogos/categorias');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });
});
