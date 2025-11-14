import React, { useState, useEffect, useCallback } from 'react';
import { 
    Container, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell, 
    Paper, IconButton, Box, CircularProgress, Alert 
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

export const DriverList = () => {
    const { fetchAuth, error: authError } = useAuth();
    const navigate = useNavigate();
    
    const [drivers, setDrivers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- Cargar Datos (GET /drivers) ---
    const loadDrivers = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetchAuth('/drivers', { method: 'GET' }); 

            if (!response.ok) {
                const data = await response.json();
                setError(data.msg || "Error al cargar la lista de conductores.");
                setDrivers([]);
                return;
            }
            
            const data = await response.json();
            setDrivers(data);

        } catch (err) {
            setError(err.message || 'Error de conexión con el servidor.');
            setDrivers([]);
        } finally {
            setLoading(false);
        }
    }, [fetchAuth]);

    useEffect(() => {
        loadDrivers();
    }, [loadDrivers]);

    // --- Eliminar Conductor (DELETE /drivers/:id) ---
    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de que desea eliminar este conductor? Se eliminarán sus viajes asociados.")) return;

        setIsDeleting(true);
        setError(null);
        setSuccessMsg(null);
        
        try {
            const response = await fetchAuth(`/drivers/${id}`, { method: 'DELETE' });

            if (!response.ok) {
                const data = await response.json();
                setError(data.msg || 'Error al intentar eliminar el conductor.');
                return;
            }

            setSuccessMsg('Conductor eliminado con éxito.');
            setDrivers(prev => prev.filter(d => d.id !== id)); 
            
        } catch (err) {
             setError(err.message || 'Error de conexión durante la eliminación.');
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Navegación ---
    const handleNavigateEdit = (id) => {
        navigate(`/drivers/${id}`);
    };
    
    const handleNavigateNew = () => {
        navigate(`/drivers/new`); 
    };

    const displayError = error || authError;

    return (
        <Container component="main">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, mt: 3 }}>
                <Typography variant="h4">Listado de Conductores</Typography>
                <Button variant="contained" onClick={handleNavigateNew} startIcon={<AddIcon />}>
                    Agregar Conductor
                </Button>
            </Box>

            {(displayError || successMsg) && (
                <Alert severity={displayError ? "error" : "success"} sx={{ mb: 2 }}>
                    {displayError || successMsg}
                </Alert>
            )}
            
            {loading ? (
                <Box sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Box>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Nombre Completo</TableCell>
                                <TableCell>DNI</TableCell>
                                <TableCell>Licencia</TableCell>
                                <TableCell>Vencimiento Licencia</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {drivers.length === 0 ? (
                                <TableRow><TableCell colSpan={6} align="center">No hay conductores registrados.</TableCell></TableRow>
                            ) : (
                                drivers.map((d) => (
                                    <TableRow key={d.id} hover>
                                        <TableCell>{d.id}</TableCell>
                                        <TableCell>{d.nombre} {d.apellido}</TableCell>
                                        <TableCell>{d.DNI}</TableCell>
                                        <TableCell>{d.licencia}</TableCell>
                                        <TableCell>{new Date(d.fecha_vencimiento_licencia).toLocaleDateString()}</TableCell>
                                        <TableCell align="center">
                                            <IconButton color="primary" onClick={() => handleNavigateEdit(d.id)} disabled={isDeleting}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDelete(d.id)} disabled={isDeleting}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Paper>
            )}
        </Container>
    );
};

export default DriverList;