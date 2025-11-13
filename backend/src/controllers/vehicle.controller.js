// /backend/src/controllers/vehicle.controller.js
import { db } from '../../db.js';
import { validationResult } from 'express-validator';

// 1. OBTENER TODOS LOS VEHÍCULOS 
export const getAllVehicles = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, marca, modelo, patente, año, capacidad_carga FROM Vehiculo');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener vehículos.' });
    }
};

// 1.1 OBTENER VEHICULO POR ID
export const getVehicleById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM Vehiculo WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Vehículo no encontrado.' });
        }

        // Devolver el primer (y único) registro
        res.status(200).json(rows[0]); 
    } catch (error) {
        console.error('Error al obtener vehículo por ID:', error);
        res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};

// 2. CREAR VEHÍCULO 
export const createVehicle = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { marca, modelo, patente, año, capacidad_carga } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO Vehiculo (marca, modelo, patente, año, capacidad_carga) VALUES (?, ?, ?, ?, ?)',
            [marca, modelo, patente, año, capacidad_carga]
        );
        res.status(201).json({ msg: 'Vehículo creado.', id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(400).json({ msg: 'La patente ya está registrada.' });
        }
        res.status(500).json({ msg: 'Error al crear vehículo.' });
    }
};

// 3. ACTUALIZAR VEHÍCULO
export const updateVehicle = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { marca, modelo, patente, año, capacidad_carga } = req.body;

    try {
        const [result] = await db.execute(
            'UPDATE Vehiculo SET marca=?, modelo=?, patente=?, año=?, capacidad_carga=? WHERE id=?',
            [marca, modelo, patente, año, capacidad_carga, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Vehículo no encontrado.' });
        }
        res.status(200).json({ msg: 'Vehículo actualizado correctamente.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(400).json({ msg: 'La patente ya está registrada en otro vehículo.' });
        }
        res.status(500).json({ msg: 'Error al actualizar vehículo.' });
    }
};

// 4. ELIMINAR VEHÍCULO
export const deleteVehicle = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM Vehiculo WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Vehículo no encontrado.' });
        }
        res.status(200).json({ msg: 'Vehículo eliminado correctamente.' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar vehículo.' });
    }
};
// ... Aquí irían getTotalKmByVehicle para futuras consultas ...