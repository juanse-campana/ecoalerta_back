import pool from '../config/db.js';

class User {
    static async findOne(criteria) {
        const [rows] = await pool.query(
            'SELECT BIN_TO_UUID(id_usr_bin) as id, nombre, apellido, correo, contrasena, rol, cedula, telefono, id_ciudad FROM Usuarios WHERE correo = ? AND deleted_at IS NULL LIMIT 1',
            [criteria.email]
        );
        return rows[0] || null;
    }

    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT BIN_TO_UUID(id_usr_bin) as id, nombre, apellido, correo, rol, cedula, telefono, id_ciudad FROM Usuarios WHERE id_usr_bin = UUID_TO_BIN(?) AND deleted_at IS NULL LIMIT 1',
            [id]
        );
        return rows[0] || null;
    }

    static async findAll() {
        const [rows] = await pool.query(
            'SELECT BIN_TO_UUID(id_usr_bin) as id, nombre, apellido, correo, rol, cedula, telefono, id_ciudad FROM Usuarios WHERE deleted_at IS NULL'
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
            throw new Error('No hay campos para actualizar');
        }

        values.push(id);

        const [result] = await pool.query(
            `UPDATE Usuarios SET ${fields.join(', ')} WHERE id_usr_bin = UUID_TO_BIN(?) AND deleted_at IS NULL`,
            values
        );

        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await pool.query(
            'UPDATE Usuarios SET deleted_at = CURRENT_TIMESTAMP WHERE id_usr_bin = UUID_TO_BIN(?) AND deleted_at IS NULL',
            [id]
        );
        return result.affectedRows;
    }

    static async hardDelete(id) {
        const [result] = await pool.query(
            'DELETE FROM Usuarios WHERE id_usr_bin = UUID_TO_BIN(?)',
            [id]
        );
        return result.affectedRows;
    }
}

export default User;