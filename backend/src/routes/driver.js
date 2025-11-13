import { authenticate } from "../middlewares/auth.middleware.js";
import { driverValidation, verificarValidaciones } from "../middlewares/validaciones.middleware.js";
import * as driverController from "../controllers/driver.controller.js"
import express from "express";
import { param } from "express-validator";

const router = express.Router()

router.get('/', authenticate, driverController.getAllDrivers);
router.get('/:id', authenticate, driverController.getDriverById);
router.post('/', authenticate, driverValidation, driverController.createDriver);
router.put('/:id', authenticate, driverValidation, driverController.updateDriver);
router.delete('/:id', authenticate, [param('id').isInt()], driverController.deleteDriver);

export default router