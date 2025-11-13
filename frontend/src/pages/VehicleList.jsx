import  { useState, useEffect, useCallback } from 'react';
import { 
    Container, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell, 
    Paper, IconButton, Box, CircularProgress, Alert 
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// Importamos useAuth para usar fetchAuth
import { useAuth } from '../context/AuthContext'; 

export const VehicleList = () => {
    // Usamos el hook useAuth para obtener fetchAuth, logout, y el estado de error
    const { fetchAuth, error: authError, logout } = useAuth();
    const navigate = useNavigate();
    
    const [vehicles, setVehicles] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- 1. Cargar Datos (GET /vehicles) ---
    const loadVehicles = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Usamos fetchAuth para incluir automáticamente el token
            const response = await fetchAuth('/vehicles', { method: 'GET' }); 
            
            // fetchAuth maneja el 401 (token expirado) con logout

            if (!response.ok) {
                const data = await response.json();
                setError(data.msg || "Error al cargar la lista de vehículos.");
                setVehicles([]);
                return;
            }
            
            const data = await response.json();
            setVehicles(data);

        } catch (err) {
            // Captura errores de red o errores lanzados por fetchAuth (ej: "Sesión expirada")
            setError(err.message || 'Error de conexión con el servidor.');
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    }, [fetchAuth, logout]);

    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    // --- 2. Eliminar Vehículo (DELETE /vehicles/:id) ---
    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de que desea eliminar este vehículo? Esta acción no se puede deshacer.")) return;

        setIsDeleting(true);
        setError(null);
        setSuccessMsg(null);
        
        try {
            const response = await fetchAuth(`/vehicles/${id}`, { method: 'DELETE' });

            if (!response.ok) {
                const data = await response.json();
                setError(data.msg || 'Error al intentar eliminar el vehículo.');
                return;
            }

            setSuccessMsg('Vehículo eliminado con éxito.');
            // Eliminar de la lista localmente
            setVehicles(prev => prev.filter(v => v.id !== id)); 
            
        } catch (err) {
             setError(err.message || 'Error de conexión durante la eliminación.');
        } finally {
            setIsDeleting(false);
        }
    };

    // --- 3. Navegación / Botones ---
    const handleNavigateEdit = (id) => {
        navigate(`/vehicles/edit/${id}`);
    };
    
    const handleNavigateNew = () => {
        // Redirige a la ruta donde se manejará la creación (ej: un modal o un formulario separado)
        // Por ahora, solo es una acción, ya que la creación se suele integrar en esta misma página con un Modal.
        alert("Botón de 'Agregar Vehículo' pulsado. Aquí iría la lógica para abrir el formulario de Alta.");
    };

    const displayError = error || authError;

    return (
        <Container component="main">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, mt: 3 }}>
                <Typography variant="h4">Listado de Vehículos</Typography>
                <Button variant="contained" onClick={handleNavigateNew} startIcon={<AddIcon />}>
                    Agregar Vehículo
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
                                <TableCell>Marca</TableCell>
                                <TableCell>Modelo</TableCell>
                                <TableCell>Patente</TableCell>
                                <TableCell align="right">Año</TableCell>
                                <TableCell align="right">Capacidad (t)</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {vehicles.length === 0 ? (
                                <TableRow><TableCell colSpan={7} align="center">No hay vehículos registrados.</TableCell></TableRow>
                            ) : (
                                vehicles.map((v) => (
                                    <TableRow key={v.id} hover>
                                        <TableCell>{v.id}</TableCell>
                                        <TableCell>{v.marca}</TableCell>
                                        <TableCell>{v.modelo}</TableCell>
                                        <TableCell>{v.patente}</TableCell>
                                        <TableCell align="right">{v.año}</TableCell>
                                        <TableCell align="right">{parseFloat(v.capacidad_carga).toFixed(2)}</TableCell>
                                        <TableCell align="center">
                                            <IconButton 
                                                color="primary" 
                                                onClick={() => handleNavigateEdit(v.id)}
                                                disabled={isDeleting}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton 
                                                color="error" 
                                                onClick={() => handleDelete(v.id)}
                                                disabled={isDeleting}
                                            >
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

export default VehicleList;