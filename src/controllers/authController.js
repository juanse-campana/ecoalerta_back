import User from '../models/User.js';
import { comparePassword, encryptPassword } from '../utils/bcrypt.js';
import { generateToken } from '../utils/jwt.js';

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar usuario
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // 2. Verificar password
        const isMatch = await comparePassword(password, user.contrasena);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        // 3. Generar token
        const token = generateToken(user.id);

        res.json({
            message: "Bienvenido",
            token,
            user: {
                id: user.id,
                email: user.correo,
                role: user.rol,
                nombre: user.nombre,
                apellido: user.apellido
            }
        });

    } catch (error) {
        next(error); 
    }
};

export const register = async (req, res, next) => {
    try {
        const { nombre, apellido, correo, contrasena, cedula, telefono, id_ciudad, rol } = req.body;

        // 1. Validar campos requeridos
        if (!nombre || !apellido || !correo || !contrasena || !cedula || !telefono || !id_ciudad) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }

        // 2. Verificar si el usuario ya existe
        const userExists = await User.findOne({ email: correo });
        if (userExists) {
            return res.status(409).json({ 
                message: "El correo ya está registrado" 
            });
        }

        // 3. Encriptar contraseña
        const contrasenaEncriptada = await encryptPassword(contrasena);

        // 4. Crear usuario
        const userId = await User.create({
            nombre,
            apellido,
            correo,
            contrasena: contrasenaEncriptada,
            rol: rol || 'ciudadano',
            cedula,
            telefono,
            id_ciudad
        });

        // 5. Generar token
        const token = generateToken(userId);

        res.status(201).json({
            message: "Usuario registrado exitosamente",
            token,
            user: {
                id: userId,
                nombre,
                apellido,
                correo,
                rol: rol || 'ciudadano'
            }
        });

    } catch (error) {
        next(error);
    }
};