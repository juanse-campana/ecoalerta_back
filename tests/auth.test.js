import request from 'supertest';
import app from '../index.js';
import pool from '../src/config/db.js';

describe('Auth API', () => {
    
    // Generar email único para cada ejecución
    const uniqueEmail = `test_${Date.now()}_${Math.random()}@example.com`;
    const testUser = {
        nombre: 'Test',
        apellido: 'User',
        correo: uniqueEmail,
        contrasena: 'TestPass123',
        cedula: '1100000000',
        telefono: '0900000000',
        id_ciudad: 1
    };

    afterAll(async () => {
        await pool.end();
    });

    describe('POST /api/auth/register', () => {
        it('debería registrar un nuevo usuario exitosamente', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);
            
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
        });

        it('no debería permitir registrar el mismo correo dos veces', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);
            
            expect(res.statusCode).toBe(409); // O el código que retorna tu AuthController para duplicados
        });
    });

    describe('POST /api/auth/login', () => {
        it('debería loguear exitosamente con credenciales correctas', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    correo: testUser.correo,
                    contrasena: testUser.contrasena
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
        });

        it('debería fallar con contrasena incorrecta', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    correo: testUser.correo,
                    contrasena: 'WrongPass'
                });

            expect(res.statusCode).toBe(401);
        });
    });
});
