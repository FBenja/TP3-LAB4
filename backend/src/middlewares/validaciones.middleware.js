import { param, validationResult, body } from "express-validator";

// Middleware simplificado para verificar las validaciones de express-validator
export const verificarValidaciones = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

export const vehicleValidation = [
    body('patente').isLength({ min: 6, max: 20 }).withMessage('Patente inválida.'),
    body('marca').notEmpty().withMessage('La marca es obligatoria.'),
    body('modelo').notEmpty().withMessage("El modelo es obligatorio"),
    body('año').isLength({max:4}).withMessage("Todavia no llegamos a ese año"),
    body('capacidad_carga').isLength({max:100000}).withMessage("No existe un vehiculo que cargue tanto")
];
