import { param, validationResult } from "express-validator";

// Middleware simplificado para verificar las validaciones de express-validator
export const verificarValidaciones = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};