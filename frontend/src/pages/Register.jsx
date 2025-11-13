import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Alert, CircularProgress, Link as MUILink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Para acceder a error y redireccionar

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // Usaremos login para autenticar automáticamente después del registro

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, contraseña }),
            });

            const data = await response.json();

            if (response.ok) {
                // Registro exitoso: Opcionalmente, inicia sesión inmediatamente
                const loginResult = await login(email, contraseña); 
                if (loginResult.success) {
                    navigate('/dashboard', { replace: true });
                } else {
                    // Si el auto-login falla, redirige al login manual
                    navigate('/login'); 
                }
            } else {
                setError(data.error || data.msg || 'Error al registrar el usuario.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            {/* ... Diseño con MUI (Box, Typography) ... */}
            <Typography component="h1" variant="h5" sx={{ mt: 8, mb: 2 }}>
                Registro de Usuario
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <TextField margin="normal" required fullWidth label="Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                <TextField margin="normal" required fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField margin="normal" required fullWidth label="Contraseña" type="password" value={contraseña} onChange={(e) => setContraseña(e.target.value)} />
                
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Registrarse"}
                </Button>
                
                <Box textAlign="center">
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                        <MUILink component="button" variant="body2">
                            ¿Ya tienes cuenta? Inicia sesión
                        </MUILink>
                    </Link>
                </Box>
            </Box>
        </Container>
    );
};

export default Register;