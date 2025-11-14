import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { useNavigate, useParams } from 'react-router-dom'; 
import { Container, Box, Typography, TextField, Button, CircularProgress, Alert, Grid } from '@mui/material';

const initialDriverState = {
    nombre: '', apellido: '', DNI: '', licencia: '', fecha_vencimiento_licencia: '',
};

export const DriverEdit = () => {
    const { fetchAuth } = useAuth();
    const { id } = useParams(); // Será 'new' si es una alta, o el ID si es edición
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [values, setValues] = useState(initialDriverState);
    const [loading, setLoading] = useState(isNew ? false : true);
    const [error, setError] = useState(null);

    // --- Cargar datos del conductor (Solo si es Edición) ---
    const fetchDriver = useCallback(async () => {
        if (isNew) return; // No hacer fetch si es nuevo registro

        const response = await fetchAuth(`/drivers/${id}`, { method: 'GET' }); 
        const data = await response.json();

        if (!response.ok) {
            setError(data.msg || "Error al cargar los datos del conductor.");
            setLoading(false);
            return;
        }
        
        // Ajustar la fecha a formato YYYY-MM-DD para el input type="date"
        const formattedDate = data.fecha_vencimiento_licencia ? 
            new Date(data.fecha_vencimiento_licencia).toISOString().split('T')[0] : '';

        setValues({ ...data, fecha_vencimiento_licencia: formattedDate });
        setLoading(false);
    }, [fetchAuth, id, isNew]);

    useEffect(() => {
        fetchDriver();
    }, [fetchDriver]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };

    // --- Manejar el Submit (Alta o Modificación) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        // La URL y el método cambian según si es Alta o Modificación
        const url = isNew ? '/drivers' : `/drivers/${id}`;
        const method = isNew ? 'POST' : 'PUT';

        const response = await fetchAuth(url, { 
            method: method,
            body: JSON.stringify(values),
        });

        const data = await response.json();
        setLoading(false);

        if (!response.ok) {
            const errorMsg = data.errors ? data.errors[0].msg : data.msg;
            return setError(`Error al ${isNew ? 'crear' : 'modificar'}: ${errorMsg}`);
        }

        window.alert(`Conductor ${isNew ? 'creado' : 'modificado'} con éxito.`);
        navigate("/drivers"); 
    };

//     const handleNavigateNew = () => {
//     navigate('/drivers/new'); 
// };

    if (loading) {
        return <Container sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Container>;
    }
    
    // Si hubo un error al cargar un conductor existente (ej: ID no encontrado)
    if (error && !isNew) { 
        return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
    }

    return (
        <Container component="main" maxWidth="sm">
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {isNew ? 'Registrar Nuevo Conductor' : `Modificar Conductor (ID: ${id})`}
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth margin="normal" label="Nombre" name="nombre" value={values.nombre || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth margin="normal" label="Apellido" name="apellido" value={values.apellido || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth margin="normal" label="DNI" name="DNI" value={values.DNI || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth margin="normal" label="Licencia" name="licencia" value={values.licencia || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth margin="normal" label="Vencimiento Licencia" name="fecha_vencimiento_licencia" 
                                type="date" value={values.fecha_vencimiento_licencia || ''} onChange={handleChange} required 
                                InputLabelProps={{ shrink: true }} // Asegura que la etiqueta se muestre correctamente para type="date"
                            />
                        </Grid>
                    </Grid>
                    
                    <Button type="submit" variant="contained" sx={{ mt: 3, mr: 2 }} disabled={loading}>
                        {isNew ? 'Crear Conductor' : 'Guardar Cambios'}
                    </Button>
                    <Button onClick={() => navigate('/drivers')} variant="outlined" sx={{ mt: 3 }}>
                        Cancelar
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};