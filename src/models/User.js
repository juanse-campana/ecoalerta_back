import pool from '../config/db.js';

class User {
    static async findOne(criteria) {
        // Build base query with joins
        let sql = `
            SELECT 
                u.id_usr, u.nombre, u.apellido, u.correo, u.contrasena, u.rol, u.cedula, u.telefono, u.id_ciudad,
                c.nombre as ciudad_nombre,
                p.nombre as provincia_nombre
            FROM Usuarios u
            LEFT JOIN Ciudades c ON u.id_ciudad = c.id_ciudad
            LEFT JOIN Provincias p ON c.id_provincia = p.id_provincia
            WHERE 
        `;
        let params = [];

        if (criteria.email) {
            sql += 'u.correo = ?';
            params.push(criteria.email);
        } else if (criteria.id) {
            sql += 'u.id_usr = ?';
            params.push(criteria.id);
        } else {
            return null;
        }

        const [rows] = await pool.query(sql + ' LIMIT 1', params);
        return rows[0] || null;
    }

    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT id_usr, nombre, apellido, correo, rol, cedula, telefono, id_ciudad FROM Usuarios WHERE id_usr = ? LIMIT 1',
            [id]
        );
        return rows[0] || null;
    }

    static async findAll() {
        const [rows] = await pool.query(
            'SELECT id_usr, nombre, apellido, correo, rol, cedula, telefono, id_ciudad FROM Usuarios'
        );
        return rows;
    }

    static async create(userData) {
        const [result] = await pool.query(
            'INSERT INTO Usuarios (nombre, apellido, correo, contrasena, rol, cedula, telefono, id_ciudad) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                userData.nombre,
                userData.apellido,
                userData.correo,
                userData.contrasena,
                userData.rol || 'ciudadano',
                userData.cedula,
                userData.telefono,
                userData.id_ciudad
            ]
        );
        return result.insertId;
    }

    static async update(id, userData) {
        const fields = [];
        const values = [];

        if (userData.nombre) {
            fields.push('nombre = ?');
            values.push(userData.nombre);
        }
        if (userData.apellido) {
            fields.push('apellido = ?');
            values.push(userData.apellido);
        }
        if (userData.correo) {
            fields.push('correo = ?');
            values.push(userData.correo);
        }
        if (userData.contrasena) {
            fields.push('contrasena = ?');
            values.push(userData.contrasena);
        }
        if (userData.rol) {
            fields.push('rol = ?');
            values.push(userData.rol);
        }
        if (userData.cedula) {
            fields.push('cedula = ?');
            values.push(userData.cedula);
        }
        if (userData.telefono) {
            fields.push('telefono = ?');
            values.push(userData.telefono);
        }
        if (userData.id_ciudad) {
            fields.push('id_ciudad = ?');
            values.push(userData.id_ciudad);
        }

        if (fields.length === 0) {
            // throw new Error('No hay campos para actualizar');
            return 0;
        }

        values.push(id);

        const [result] = await pool.query(
            `UPDATE Usuarios SET ${fields.join(', ')} WHERE id_usr = ?`,
            values
        );

        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.query(
            'UPDATE Usuarios SET deleted_at = CURRENT_TIMESTAMP WHERE id_usr = ? AND deleted_at IS NULL',
            [id]
        );
        return result.affectedRows;
    }

    static async hardDelete(id) {
        const [result] = await pool.query(
            'DELETE FROM Usuarios WHERE id_usr = ?',
            [id]
        );
        return result.affectedRows;
    }
}

export default User;
