import  { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { useNavigate, useParams } from 'react-router-dom'; 
import { Container, Box, Typography, TextField, Button, CircularProgress, Alert, Grid } from '@mui/material';

const initialVehicleState = {
    marca: '',
    modelo: '',
    patente: '',
    año: '',
    capacidad_carga: '',
};

export const VehicleEdit = () => {
    const { fetchAuth } = useAuth();
    const { id } = useParams(); 
    const navigate = useNavigate();

    
    const isNew = id === 'new'; 
    const isIdInvalid = !id && id !== 'new';
    
    const [values, setValues] = useState(initialVehicleState);
    const [loading, setLoading] = useState(!isNew); 
    const [error, setError] = useState(null);


    useEffect(() => {
        if (isIdInvalid) { 
             navigate('/vehicles', { replace: true });
        }
    }, [id, navigate,isIdInvalid]);

    // --- Cargar datos del vehículo ---
    const fetchVehicle = useCallback(async () => {
        if(isNew||isIdInvalid) return;

        setLoading(true);
        const response = await fetchAuth(`/vehicles/${id}`, { method: 'GET' }); 
        const data = await response.json();

        if (!response.ok) {
            setError(data.msg || "Error al cargar los datos del vehículo.");
            setLoading(false);
            return;
        }
        
        // Ajustar el formato de la carga si es necesario (ej: convertir a número)
        setValues({
            ...data,
            capacidad_carga: data.capacidad_carga.toString(), 
        });
        setLoading(false);
    }, [fetchAuth, id,isNew,isIdInvalid]);

    useEffect(() => {
        fetchVehicle();
    }, [fetchVehicle,loading]);
    if (isIdInvalid) {
        return null; 
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };

    // --- Manejar la Modificación (PUT) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const method = isNew ? "POST" : "PUT";
        const url = isNew ? `/vehicles` : `/vehicles/${id}`
        const payload = {
            ...values,
            capacidad_carga: parseFloat(values.capacidad_carga),
            año: parseInt(values.año)
        };
        
        
        const response = await fetchAuth(url, { 
            method: method,
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        setLoading(false);

        if (!response.ok) {
            const errorMsg = data.errors ? data.errors[0].msg : data.msg;
            return setError(`Error al ${isNew? 'crear': 'modificar'}: ${errorMsg}`);
        }

        window.alert(`Vehículo ${isNew ? 'creado': 'modificado' }con éxito.`);
        navigate("/vehicles"); 
    };

    if (loading) {
        return <Container sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Container>;
    }
    
    if (error && !values.id) { // Mostrar error si falló la carga inicial
        return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
    }

    return (
        <Container component="main" maxWidth="sm">
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {isNew ? 'Registrar Nuevo Vehículo' : `Modificar Vehículo (ID: ${id})`}
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth margin="normal" label="Marca" name="marca" value={values.marca || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth margin="normal" label="Modelo" name="modelo" value={values.modelo || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth margin="normal" label="Patente" name="patente" value={values.patente || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth margin="normal" label="Año" name="año" type="number" value={values.año || ''} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth margin="normal" label="Capacidad Carga (kg)" name="capacidad_carga" type="number" step="0.01" value={values.capacidad_carga || ''} onChange={handleChange} required />
                        </Grid>
                    </Grid>
                    
                    <Button type="submit" variant="contained" sx={{ mt: 3, mr: 2 }} disabled={loading}>
                        {isNew ? 'Crear Vehículo' : 'Guardar Cambios'}
                    </Button>
                    <Button onClick={() => navigate('/vehicles')} variant="outlined" sx={{ mt: 3 }}>
                        Cancelar
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};