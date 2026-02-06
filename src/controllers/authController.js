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
        const isMatch = await comparePassword(password, user.contrasena); // Nota: User.js usa 'contrasena'
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        // 3. Generar token
        const token = generateToken(user.id_usr);

        res.json({
            message: "Bienvenido",
            token,
            user: {
                id: user.id_usr,
                email: user.correo,
                rol: user.rol,
                nombre: user.nombre,
                apellido: user.apellido,
                id_ciudad: user.id_ciudad,
                ciudad: user.ciudad_nombre,
                provincia: user.provincia_nombre
            }
        });

    } catch (error) {
        // Pasamos el error a tu middleware 'errorHandler'
        next(error);
    }
};

export const register = async (req, res, next) => {
    try {
        const { nombre, apellido, email, password, cedula, telefono, id_ciudad } = req.body;

        if (!email || !password || !nombre) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        const hashedPassword = await encryptPassword(password);

        const userId = await User.create({
            nombre,
            apellido,
            correo: email,
            contrasena: hashedPassword,
            cedula,
            telefono,
            id_ciudad
        });

        // Generate token for auto-login
        const token = generateToken(userId);

        res.status(201).json({
            message: "Usuario registrado exitosamente",
            token,
            user: {
                id: userId,
                email: email,
                role: 'ciudadano'
            }
        });

    } catch (error) {
        next(error);
    }
};