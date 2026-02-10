import User from '../models/User.js';

export const getProfile = async (req, res) => {
    try {
        // req.user viene del middleware de autenticación
        const userId = req.user.id;
        const user = await User.findOne({ id: userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Eliminar contraseña antes de enviar
        delete user.contrasena;

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el perfil'
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { telefono, id_ciudad, id_provincia } = req.body;

        const updateData = {};

        // Solo permitir actualizar telefono y ciudad (provincia viene implícita o se usa para filtrar ciudades en frontend)
        if (telefono !== undefined) updateData.telefono = telefono;
        if (id_ciudad !== undefined) updateData.id_ciudad = id_ciudad;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay datos para actualizar'
            });
        }

        const affectedRows = await User.update(userId, updateData);

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado o sin cambios'
            });
        }

        // Obtener usuario actualizado para devolverlo
        const updatedUser = await User.findOne({ id: userId });
        delete updatedUser.contrasena;

        res.json({
            success: true,
            message: 'Perfil actualizado correctamente',
            data: updatedUser
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el perfil'
        });
    }
};
