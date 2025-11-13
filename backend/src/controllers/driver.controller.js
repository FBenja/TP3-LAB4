import { db } from '../../db.js';
import { validationResult } from 'express-validator';

// OBTENER TODOS LOS CONDUCTORES 
export const getAllDrivers = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Conductor');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener conductores:', error);
        res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};

// CREAR CONDUCTOR 
export const createDriver = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { nombre, apellido, DNI, licencia, fecha_vencimiento_licencia } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO Conductor (nombre, apellido, DNI, licencia, fecha_vencimiento_licencia) VALUES (?, ?, ?, ?, ?)',
            [nombre, apellido, DNI, licencia, fecha_vencimiento_licencia]
        );
        res.status(201).json({ msg: 'Conductor creado.', id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(400).json({ msg: 'El DNI o número de licencia ya está registrado.' });
        }
        console.error('Error al crear conductor:', error);
        res.status(500).json({ msg: 'Error al crear conductor.' });
    }
};

// 🆕 OBTENER CONDUCTOR POR ID 
export const getDriverById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM Conductor WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Conductor no encontrado.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error al obtener conductor por ID:', error);
        res.status(500).json({ msg: 'Error interno del servidor.' });
    }
};

// 🆕 ACTUALIZAR CONDUCTOR 
export const updateDriver = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { nombre, apellido, DNI, licencia, fecha_vencimiento_licencia } = req.body;

    try {
        const [result] = await db.execute(
            'UPDATE Conductor SET nombre=?, apellido=?, DNI=?, licencia=?, fecha_vencimiento_licencia=? WHERE id=?',
            [nombre, apellido, DNI, licencia, fecha_vencimiento_licencia, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Conductor no encontrado.' });
        }
        res.status(200).json({ msg: 'Conductor actualizado correctamente.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(400).json({ msg: 'El DNI o número de licencia ya está registrado en otro conductor.' });
        }
        console.error('Error al actualizar conductor:', error);
        res.status(500).json({ msg: 'Error al actualizar conductor.' });
    }
};

// ELIMINAR CONDUCTOR 
export const deleteDriver = async (req, res) => {
    // ... (El código de eliminación permanece igual)
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM Conductor WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Conductor no encontrado.' });
        }
        res.status(200).json({ msg: 'Conductor eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar conductor:', error);
        res.status(500).json({ msg: 'Error al eliminar conductor.' });
    }
};