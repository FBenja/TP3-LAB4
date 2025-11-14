import { param } from "express-validator";
import * as tripController from "../controllers/trip.controller.js"
import { authenticate } from "../middlewares/auth.middleware.js";
import { tripValidation } from "../middlewares/validaciones.middleware.js";
import express from "express"

const router = express.Router();

router.post('/', authenticate, tripValidation, tripController.createTrip);

// Ruta: /api/trips/history/driver/1 o /api/trips/history/vehicle/2
router.get('/history/:type/:id', authenticate, [
    param('type').isIn(['driver', 'vehicle']),
    param('id').isInt()
], tripController.getTripsHistory);

// 3. CÁLCULO TOTAL DE KILÓMETROS
// Ruta: /api/trips/total-km/driver/1 o /api/trips/total-km/vehicle/2
router.get('/total-km/:type/:id', authenticate, [
    param('type').isIn(['driver', 'vehicle']),
    param('id').isInt()
], tripController.getTotalKmByEntity);

export default router;