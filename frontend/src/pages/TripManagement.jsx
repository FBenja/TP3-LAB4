import  { useState, useEffect, useCallback } from 'react';
import { 
    Container, Typography, TextField, Button, CircularProgress, Alert, Box, 
    MenuItem, FormControl, InputLabel, Select, Grid, Paper, Table, TableHead, 
    TableBody, TableRow, TableCell, TableContainer 
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

// Estado inicial del formulario de Viaje
const initialTripState = { 
    vehiculo_id: '', conductor_id: '', fecha_salida: '', fecha_llegada: '', 
    origen: '', destino: '', kilómetros: '', observaciones: '' 
};

export const TripManagement = () => {
    const { fetchAuth } = useAuth();
    const [formData, setFormData] = useState(initialTripState);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    
    // Estados para la consulta de Historial/Analítica
    const [queryType, setQueryType] = useState('driver');
    const [queryId, setQueryId] = useState('');
    const [analyticsResult, setAnalyticsResult] = useState(null); // Resultado del total-km
    const [historyResults, setHistoryResults] = useState([]); // Resultado del historial
    const [historyLoading, setHistoryLoading] = useState(false);

    // --- A. Carga de Listas para FKs (Vehículos y Conductores) ---
    useEffect(() => {
        const loadDependencies = async () => {
            setLoading(true);
            try {
                // Fetch simultáneo de vehículos y conductores
                const [vehResponse, driResponse] = await Promise.all([
                    fetchAuth('/vehicles', { method: 'GET' }),
                    fetchAuth('/drivers', { method: 'GET' }),
                ]);

                if (vehResponse.ok) setVehicles(await vehResponse.json());
                if (driResponse.ok) setDrivers(await driResponse.json());
            } catch (err) {
                setError("Error al cargar dependencias. Verifique la conexión al backend.");
            }
            setLoading(false);
        };
        loadDependencies();
    }, [fetchAuth]);

    // --- B. Registro de Viaje (POST /trips) ---
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTripRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        const payload = {
            ...formData,
            // Convertir a tipo numérico (el backend valida con express-validator)
            vehiculo_id: parseInt(formData.vehiculo_id),
            conductor_id: parseInt(formData.conductor_id),
            kilómetros: parseFloat(formData.kilómetros),
        };

        const response = await fetchAuth('/trips', { method: 'POST', body: JSON.stringify(payload) });
        
        if (response.ok) {
            setSuccessMsg("Viaje registrado con éxito.");
            setFormData(initialTripState); // Limpiar formulario
        } else {
            const data = await response.json();
            const errMsg = data.errors?.[0]?.msg || data.msg || 'Error desconocido al registrar.';
            setError(errMsg);
        }
        setLoading(false);
    };

    // --- C. Consulta de Historial y Cálculos (GET /total-km, /history) ---
    const handleAnalyticsSearch = async (e) => {
        e.preventDefault();
        setHistoryLoading(true);
        setAnalyticsResult(null);
        setHistoryResults([]);
        setError(null);
        
        if (!queryId) return setError('Debe ingresar un ID válido.');
        
        const type = queryType === 'driver' ? 'driver' : 'vehicle';
        
        try {
            // 1. Cálculo de Kilómetros Totales
            const kmEndpoint = `/trips/total-km/${type}/${queryId}`;
            const kmResponse = await fetchAuth(kmEndpoint, { method: 'GET' });

            if (kmResponse.ok) {
                setAnalyticsResult(await kmResponse.json());
            } else {
                 setAnalyticsResult({ total_km: 0 }); // Mostrar 0 si hay error
            }

            // 2. Consulta de Historial de Viajes
            const historyEndpoint = `/trips/history/${type}/${queryId}`;
            const historyResponse = await fetchAuth(historyEndpoint, { method: 'GET' });
            
            if (historyResponse.ok) {
                setHistoryResults(await historyResponse.json());
            }

        } catch (err) {
            setError(err.message || "Error al realizar la consulta.");
        } finally {
            setHistoryLoading(false);
        }
    };


    return (
        <Container component="main" sx={{ mt: 5 }}>
            <Typography variant="h3" gutterBottom>Gestión y Consulta de Viajes</Typography>

            {loading && <Box sx={{ textAlign: 'center' }}><CircularProgress /></Box>}
            {(error || successMsg) && <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }}>{error || successMsg}</Alert>}
            
            {/* -------------------- 1. REGISTRO DE VIAJE -------------------- */}
            <Paper elevation={3} sx={{ p: 4, mb: 5 }}>
                <Typography variant="h5" gutterBottom>1. Registrar Nuevo Viaje</Typography>
                <Box component="form" onSubmit={handleTripRegister}>
                    <Grid container spacing={2}>
                        {/* SELECT CONDUCTOR y VEHÍCULO */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required disabled={drivers.length === 0}>
                                <InputLabel>Conductor</InputLabel>
                                <Select name="conductor_id" value={formData.conductor_id} onChange={handleFormChange} label="Conductor">
                                    {drivers.map(d => (<MenuItem key={d.id} value={d.id}>{d.nombre} {d.apellido} (DNI: {d.DNI})</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required disabled={vehicles.length === 0}>
                                <InputLabel>Vehículo</InputLabel>
                                <Select name="vehiculo_id" value={formData.vehiculo_id} onChange={handleFormChange} label="Vehículo">
                                    {vehicles.map(v => (<MenuItem key={v.id} value={v.id}>{v.patente} ({v.marca})</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        {/* FECHAS Y KM */}
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Fecha/Hora Salida" name="fecha_salida" type="datetime-local" value={formData.fecha_salida} onChange={handleFormChange} required InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Fecha/Hora Llegada" name="fecha_llegada" type="datetime-local" value={formData.fecha_llegada} onChange={handleFormChange} required InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="Origen" name="origen" value={formData.origen} onChange={handleFormChange} required /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="Destino" name="destino" value={formData.destino} onChange={handleFormChange} required /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="Kilómetros" name="kilómetros" type="number" step="0.01" value={formData.kilómetros} onChange={handleFormChange} required /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Observaciones" name="observaciones" value={formData.observaciones} onChange={handleFormChange} multiline rows={2} /></Grid>
                        
                        <Grid item xs={12}><Button type="submit" variant="contained" disabled={loading} startIcon={loading && <CircularProgress size={20} />}>Registrar Viaje</Button></Grid>
                    </Grid>
                </Box>
            </Paper>

            {/* -------------------- 2. CONSULTA Y ANÁLISIS -------------------- */}
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>2. Consulta de Historial y Kilómetros</Typography>
                <Box component="form" onSubmit={handleAnalyticsSearch} sx={{ mb: 4 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Consultar por</InputLabel>
                                <Select value={queryType} onChange={(e) => setQueryType(e.target.value)} label="Consultar por">
                                    <MenuItem value="driver">Conductor (ID)</MenuItem>
                                    <MenuItem value="vehicle">Vehículo (ID)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField fullWidth label={`ID de ${queryType === 'driver' ? 'Conductor' : 'Vehículo'}`} value={queryId} onChange={(e) => setQueryId(e.target.value)} type="number" required />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button type="submit" variant="contained" fullWidth disabled={historyLoading}>Buscar Historial/Cálculo</Button>
                        </Grid>
                    </Grid>
                </Box>
                
                {historyLoading ? <Box sx={{ textAlign: 'center' }}><CircularProgress /></Box> : (
                    <>
                        {/* Resultado del Cálculo de Kilómetros */}
                        {analyticsResult && (
                             <Alert severity="info" sx={{ p: 2, mb: 3 }}>
                                <Typography variant="body1">Total de kilómetros recorridos por el **{queryType === 'driver' ? 'Conductor' : 'Vehículo'} ID {queryId}** es de:</Typography>
                                <Typography component="span" variant="h6" color="primary">{parseFloat(analyticsResult.total_km || 0).toFixed(2)} KM</Typography>
                            </Alert>
                        )}

                        {/* Visualización del Historial de Viajes */}
                        {historyResults.length > 0 ? (
                            <Box mt={3}>
                                <Typography variant="h6">Historial de Viajes ({historyResults.length})</Typography>
                                <TableContainer component={Paper} sx={{ mt: 2 }}>
                                    <Table size="small">
                                        <TableHead><TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Vehículo</TableCell>
                                            <TableCell>Conductor</TableCell>
                                            <TableCell>Origen/Destino</TableCell>
                                            <TableCell align="right">Kilómetros</TableCell>
                                            <TableCell>Fecha Salida</TableCell>
                                        </TableRow></TableHead>
                                        <TableBody>{historyResults.map((trip) => (<TableRow key={trip.id}><TableCell>{trip.id}</TableCell>
                                            <TableCell>{trip.vehiculo_info}</TableCell>
                                            <TableCell>{trip.conductor_nombre}</TableCell>
                                            <TableCell>{trip.origen} → {trip.destino}</TableCell>
                                            <TableCell align="right">{parseFloat(trip.kilómetros).toFixed(2)}</TableCell>
                                            <TableCell>{new Date(trip.fecha_salida).toLocaleDateString()} {new Date(trip.fecha_salida).toLocaleTimeString()}</TableCell>
                                        </TableRow>))}</TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        ) : (
                             !error && queryId && !historyLoading && <Alert severity="warning">No se encontraron viajes para este ID en la base de datos.</Alert>
                        )}
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default TripManagement;