import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Alert, CircularProgress, Link as MUILink } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const Login = () => {
    const { error: authError, login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState(null);

    // Redirigir si ya está autenticado
    if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        setLoading(true);

        if (!email || !password) {
            setLocalError("El email y la contraseña son obligatorios.");
            setLoading(false);
            return;
        }

        // Llamar a la función login del contexto
        const result = await login(email, password); 
        
        setLoading(false);

        if (result.success) {
            navigate("/dashboard", { replace: true });
        }
        // Si no es exitoso, el error es manejado por el contexto (authError)
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Iniciar Sesión
                </Typography>
                
                {/* Muestra errores del contexto o validación local */}
                {(localError || authError) && (
                    <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                        {localError || authError}
                    </Alert>
                )}
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required fullWidth id="email" label="Email" name="email" 
                        autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required fullWidth name="password" label="Contraseña" type="password"
                        id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                    
                    <Button
                        type="submit" fullWidth variant="contained" 
                        sx={{ mt: 3, mb: 2 }} disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Ingresar"}
                    </Button>
                    
                    <Box textAlign="center">
                        <Link to="/register" style={{ textDecoration: 'none' }}>
                            <MUILink component="button" variant="body2">
                                ¿No tienes cuenta? Regístrate aquí
                            </MUILink>
                        </Link>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

