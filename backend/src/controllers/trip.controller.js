import { db } from '../../db.js';
import { validationResult } from 'express-validator';


// REGISTRAR VIAJE (POST)
export const createTrip = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilómetros, observaciones } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO Viaje (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilómetros, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilómetros, observaciones]
        );
        res.status(201).json({ msg: 'Viaje registrado.', id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             return res.status(400).json({ msg: 'ID de Vehículo o Conductor inválido.' });
        }
        console.error('Error al registrar viaje:', error);
        res.status(500).json({ msg: 'Error al registrar viaje.' });
    }
};

// CONSULTA DE HISTORIAL POR CONDUCTOR O VEHÍCULO
export const getTripsHistory = async (req, res) => {
    const { type, id } = req.params; // type será 'driver' o 'vehicle'
    
    let column;
    if (type === 'driver') {
        column = 'conductor_id';
    } else if (type === 'vehicle') {
        column = 'vehiculo_id';
    } else {
        return res.status(400).json({ msg: 'Tipo de consulta inválido.' });
    }

    try {
        // Consulta avanzada que une Viaje con Conductor y Vehículo para obtener información legible
        const [rows] = await db.execute(
            `SELECT 
                V.id, V.fecha_salida, V.fecha_llegada, V.origen, V.destino, V.kilómetros, 
                CONCAT(C.nombre, ' ', C.apellido) AS conductor_nombre, 
                CONCAT(VE.marca, ' - ', VE.patente) AS vehiculo_info 
            FROM Viaje V
            JOIN Conductor C ON V.conductor_id = C.id
            JOIN Vehiculo VE ON V.vehiculo_id = VE.id
            WHERE V.${column} = ?
            ORDER BY V.fecha_salida DESC`,
            [id]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ msg: 'Error al obtener historial de viajes.' });
    }
};

// CÁLCULO DE KILÓMETROS TOTALES (REQUISITO CLAVE)
export const getTotalKmByEntity = async (req, res) => {
    const { type, id } = req.params; // type será 'driver' o 'vehicle'
    
    let column;
    if (type === 'driver') {
        column = 'conductor_id';
    } else if (type === 'vehicle') {
        column = 'vehiculo_id';
    } else {
        return res.status(400).json({ msg: 'Tipo de consulta inválido.' });
    }

    try {
        const [rows] = await db.execute(
            `SELECT SUM(kilómetros) AS total_km FROM Viaje WHERE ${column} = ?`,
            [id]
        );
        const totalKm = rows[0].total_km || 0;
        res.status(200).json({ id: id, total_km: totalKm });
    } catch (error) {
        console.error('Error al calcular kilómetros:', error);
        res.status(500).json({ msg: 'Error al calcular kilómetros.' });
    }
};