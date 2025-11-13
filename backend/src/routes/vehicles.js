// /backend/src/routes/vehicle.routes.js
import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as vehicleController from '../controllers/vehicle.controller.js';
import { verificarValidaciones, vehicleValidation} from '../middlewares/validaciones.middleware.js';

const router = express.Router();



// RUTAS PROTEGIDAS
router.get('/', authenticate, vehicleController.getAllVehicles);
router.post('/', authenticate, vehicleValidation, vehicleController.createVehicle);
router.put('/:id', authenticate, vehicleValidation, vehicleController.updateVehicle);
router.delete('/:id', authenticate, vehicleController.deleteVehicle);

export default router;