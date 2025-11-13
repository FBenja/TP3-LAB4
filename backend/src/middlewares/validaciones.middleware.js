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


export const driverValidation = [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio.'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio.'),
    body('DNI').isLength({ min: 7, max: 20 }).withMessage('DNI inválido.'),
    body('licencia').notEmpty().withMessage('La licencia es obligatoria.'),
    body('fecha_vencimiento_licencia').isDate({ format: 'YYYY-MM-DD' }).withMessage('Fecha de vencimiento inválida o formato incorrecto (YYYY-MM-DD).'),
];