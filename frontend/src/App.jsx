import { Layout } from './components/Layout.jsx'; 
import { AuthProvider, useAuth } from './context/AuthContext';
import {BrowserRouter, Route, Routes, Navigate} from "react-router-dom"
import  {Login } from './pages/Login.jsx';
import { StrictMode } from 'react';
import Register from './pages/Register.jsx';
import { VehicleEdit } from './pages/VehicleEdit.jsx';
import VehicleList from './pages/VehicleList.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DriverList from './pages/Driverlist.jsx';
import { DriverEdit } from './pages/DriverEdit.jsx';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        // Si no está autenticado, lo redirigimos a la página de inicio de sesión
        return <Navigate to="/login" replace />; 
    }
    return children;
};

function App() {

    return (
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
                <Routes>
                    {/* Definimos la ruta principal (/) usando Layout */}
                    <Route path="/" element={<Layout />}> 
                        
                        {/* Rutas Públicas (se renderizan dentro de <Outlet />) */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        {/*RUTAS PRIVADAS */}
                        <Route path='vehicles' element={<ProtectedRoute><VehicleList/></ProtectedRoute>} />
                        <Route path='vehicles/:id' element={<ProtectedRoute><VehicleEdit/></ProtectedRoute>} />
                        {/* <Route path="vehicles/new" element={<ProtectedRoute><VehicleEdit /></ProtectedRoute>} /> */}
                        <Route path='dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
                        <Route path="drivers" element={<ProtectedRoute><DriverList/></ProtectedRoute>} />
                        <Route path="drivers/:id" element={<ProtectedRoute> { <DriverEdit /> } </ProtectedRoute>} />
                        {/* 404 Not Found */}
                        <Route path="*" element={<h1>404: Página no encontrada</h1>} />

                    </Route>
                </Routes>
                </AuthProvider>
            </BrowserRouter>
        </StrictMode>
    );
}

export default App;