import React from 'react';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import CommuteIcon from '@mui/icons-material/Commute';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const stats = [
        { title: "Vehículos", icon: <LocalShippingIcon fontSize="large" />, path: "/vehicles", description: "Alta, Baja y Modificación de la flota." },
        { title: "Conductores", icon: <AssignmentIndIcon fontSize="large" />, path: "/drivers", description: "Gestión de personal y licencias." },
        { title: "Viajes & Rutas", icon: <CommuteIcon fontSize="large" />, path: "/trips", description: "Registro y consulta de viajes realizados." },
    ];

    return (
        <Container component="main" sx={{ mt: 5 }}>
            <Typography variant="h3" gutterBottom>
                Bienvenido, {user?.nombre || user?.email}!
            </Typography>
            <Typography variant="h5" color="text.secondary" paragraph>
                Panel de Gestión de la Flota y Logística
            </Typography>

            <Grid container spacing={4} sx={{ mt: 3 }}>
                {stats.map((stat) => (
                    <Grid item xs={12} md={4} key={stat.title}>
                        <Paper 
                            elevation={3} 
                            sx={{ p: 3, cursor: 'pointer', '&:hover': { bgcolor: 'grey.100' } }}
                            onClick={() => navigate(stat.path)}
                        >
                            <Box display="flex" alignItems="center" mb={1}>
                                {stat.icon}
                                <Typography variant="h6" ml={1}>{stat.title}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">{stat.description}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};
export default Dashboard;