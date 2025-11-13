import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, TextField, Button, CircularProgress, Alert, Box, MenuItem, 
    FormControl, InputLabel, Select, Grid
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

export const TripRegister = () => {
    const { fetchAuth } = useAuth();
    const [formData, setFormData] = useState({ 
        vehiculo_id: '', conductor_id: '', fecha_salida: '', fecha_llegada: '', 
        origen: '', destino: '', kilómetros: '', observaciones: '' 
    });
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // --- Cargar Vehículos y Conductores para SELECTS ---
    useEffect(() => {
        const loadDependencies = async () => {
            setLoading(true);
            const [vehResponse, driResponse] = await Promise.all([
                fetchAuth('/vehicles', { method: 'GET' }),
                fetchAuth('/drivers', { method: 'GET' }),
            ]);

            if (vehResponse.ok) setVehicles(await vehResponse.json());
            if (driResponse.ok) setDrivers(await driResponse.json());
            setLoading(false);
        };
        loadDependencies();
    }, [fetchAuth]);

    // --- Manejar el Registro de Viaje ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Convertir IDs y KM a números antes de enviar
        const payload = {
            ...formData,
            vehiculo_id: parseInt(formData.vehiculo_id),
            conductor_id: parseInt(formData.conductor_id),
            kilómetros: parseFloat(formData.kilómetros),
        };

        const response = await fetchAuth('/trips', { method: 'POST', body: JSON.stringify(payload) });
        
        if (response.ok) {
            setSuccessMsg("Viaje registrado con éxito.");
            setFormData(prev => ({ ...initialState, vehiculo_id: '', conductor_id: '' })); // Limpiar form
        } else {
            const data = await response.json();
            setError(data.msg || data.errors?.[0]?.msg || 'Error al registrar el viaje.');
        }
        setLoading(false);
    };

    return (
        <Container component="main" maxWidth="md">
            <Typography variant="h4" sx={{ mt: 3, mb: 3 }}>Registro de Nuevo Viaje</Typography>
            {/* ... (Implementar el formulario usando Grid, Selects (con drivers/vehicles) y TextFields) ... */}
            {/* ... Mostrar alertas de error/éxito ... */}
            
            {/* Ejemplo de un campo de selección: */}
            <FormControl fullWidth margin="normal" required>
                <InputLabel>Conductor</InputLabel>
                <Select name="conductor_id" value={formData.conductor_id} onChange={(e) => setFormData({...formData, conductor_id: e.target.value})} label="Conductor">
                    {drivers.map(d => (<MenuItem key={d.id} value={d.id}>{d.nombre} {d.apellido} (DNI: {d.DNI})</MenuItem>))}
                </Select>
            </FormControl>
        </Container>
    );
};

export default TripRegister;