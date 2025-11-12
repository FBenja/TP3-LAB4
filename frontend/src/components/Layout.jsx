import {Outlet, Link} from "react-router-dom"
import { useAuth } from '../context/AuthContext'; 
import { AppBar, Toolbar, Button, Box, Typography, Container } from '@mui/material';


export const Layout = () => {
    // Obtenemos el usuario para mostrar el nombre
    const { isAuthenticated, logout, user } = useAuth(); 

    
    const navLinks = [
        { path: "/dashboard", label: "Dashboard" },
        { path: "/vehicles", label: "Vehículos" },
        { path: "/drivers", label: "Conductores" },
        { path: "/trips", label: "Viajes" },
    ];

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    
                    {/* Título o Logo */}
                    <Typography 
                        variant="h6" 
                        component={Link} 
                        to="/" 
                        sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
                    >
                        Gestión de Viajes 🚚
                    </Typography>

                    {/* Enlaces de Navegación Protegidos */}
                    {isAuthenticated && (
                        <Box sx={{ flexGrow: 1 }}>
                            {navLinks.map((link) => (
                                <Button 
                                    key={link.path} 
                                    color="inherit" 
                                    component={Link} 
                                    to={link.path}
                                >
                                    {link.label}
                                </Button>
                            ))}
                        </Box>
                    )}

                    {/* Lógica de Autenticación (Derecha) */}
                    <Box>
                        {isAuthenticated ? (
                            <>
                                <Typography variant="subtitle1" component="span" sx={{ mr: 2 }}>
                                    Hola, {user?.nombre || user?.email}!
                                </Typography>
                                <Button color="inherit" onClick={logout}>
                                    Salir
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button color="inherit" component={Link} to="/login">
                                    Ingresar
                                </Button>
                                <Button color="inherit" component={Link} to="/register">
                                    Registrarse
                                </Button>
                            </>
                        )}
                    </Box>

                </Toolbar>
            </AppBar>

            {/* Contenido de la página actual */}
            <Container component="main" sx={{ mt: 4, mb: 4 }}>
                <Outlet />
            </Container>
        </Box>
    );
};

