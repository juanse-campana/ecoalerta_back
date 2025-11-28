import User from '../models/User.js'; // Asumo que ya tienes el modelo
import { comparePassword } from '../utils/bcrypt.js';
import { generateToken } from '../utils/jwt.js';

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar usuario
        const user = await User.findOne({ email });
        if (!user) {
            // Puedes usar throw new Error() si tu errorHandler lo soporta, 
            // o responder directamente. Por ahora respondemos directo:
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // 2. Verificar password
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        // 3. Generar token
        const token = generateToken(user._id);

        res.json({
            message: "Bienvenido",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        // Pasamos el error a tu middleware 'errorHandler'
        next(error); 
    }
};