// /backend/src/routes/auth.routes.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../db.js';
import { verificarValidaciones } from '../middlewares/validaciones.middleware.js';

const router = express.Router();




// --- RUTA DE PRUEBA ---
router.get("/",(req,res)=>{
    console.log("Ruta de prueba funcionando")
})
// --- RUTA DE REGISTRO ---
router.post(
    "/register",
    body("nombre").trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body("email").isEmail().withMessage('Formato de email incorrecto.').normalizeEmail(),
    body("contraseña").isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
    verificarValidaciones,
    async (req, res) => {
        const { nombre, email, contraseña } = req.body;

        try {
            // 1. Verificar si el email ya existe
            const [existing] = await db.execute('SELECT id FROM Usuario WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(400).json({ success: false, error: 'El email ya está registrado.' });
            }

            // 2. Encriptar la contraseña (bcrypt)
            const hashedPassword = await bcrypt.hash(contraseña, 10);

            // 3. Insertar nuevo usuario
            await db.execute(
                'INSERT INTO Usuario (nombre, email, contraseña) VALUES (?, ?, ?)',
                [nombre, email, hashedPassword]
            );

            res.status(201).json({ success: true, message: 'Usuario registrado con éxito.' });
        } catch (error) {
            console.error('Error en el registro:', error);
            res.status(500).json({ success: false, error: 'Error interno del servidor.' });
        }
    }
);


// --- RUTA DE LOGIN ---
router.post(
    "/login",
    body("email").isEmail().withMessage('El email es inválido.'),
    body("contraseña").notEmpty().withMessage('La contraseña es requerida.'),
    verificarValidaciones,
    async (req, res) => {
        const { email, contraseña } = req.body;

        try {
            // 1. Consultar por el usuario a la base de datos
            const [usuarios] = await db.execute(
                "SELECT id, nombre, email, contraseña FROM Usuario WHERE email=?",
                [email]
            );

            if (usuarios.length === 0) {
                // Usamos 401 Unauthorized para no dar pistas sobre qué falló (usuario o contraseña)
                return res.status(401).json({ success: false, error: "Credenciales inválidas." });
            }

            const user = usuarios[0];
            const hashedPassword = user.contraseña;

            // 2. Verificar la contraseña
            const passwordComparada = await bcrypt.compare(contraseña, hashedPassword);

            if (!passwordComparada) {
                return res.status(401).json({ success: false, error: "Credenciales inválidas." });
            }

            // 3. Generar JWT
            // Payload mínimo: { id: user.id }
            const payload = { id: user.id }; 
            
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });

            // 4. Devolver jwt y datos del usuario
            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    email: user.email,
                },
            });
        } catch (error) {
            console.error('Error en el login:', error);
            res.status(500).json({ success: false, error: 'Error interno del servidor.' });
        }
    }
);

export default router;