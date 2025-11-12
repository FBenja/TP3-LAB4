import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom"; 

// Contexto para compartir el estado de autenticación
const AuthContext = createContext(null);


// Hook personzalizado para acceder al contexto de auth
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null); // Contiene id, nombre, email
    const [error, setError] = useState(null);
    const navigate = useNavigate();


    // Función de Login adaptada a 'email' y 'contraseña'
    const login = async (email, password) => {
        setError(null);
        try {
            const response = await fetch(`http://localhost:3000/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, contraseña:password }),
            });

            const session = await response.json();

            if (!response.ok && response.status == 400) {
                
                throw new Error(session.error || session.msg || "Credenciales inválidas.");
            }

            // Guardar en localStorage y estado
            localStorage.setItem('token', session.token);
            localStorage.setItem('user', JSON.stringify(session.user));

            setToken(session.token);
            setUser(session.user);

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setError(null);
        navigate('/login'); // Redirigir al login al cerrar sesión
    };

    // Función para peticiones autenticadas (fetchAuth)
    const fetchAuth = async (url, options = {}) => {
        if (!token) {
            logout();
            throw new Error("No esta iniciada la sesión o ha expirado.");
        }

        const fullUrl = `http://localhost:3000/api${url}`; // Usar /api/ como prefijo

        const response = await fetch(fullUrl, {
            ...options,
            headers: { 
                ...options.headers, 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json' // Añadir Content-Type por defecto
            },
        });
        
        // Si el token falla (401), hacemos logout automático
        if (response.status === 401) {
             logout();
             throw new Error("Su sesión ha expirado.");
        }

        return response;
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                error,
                isAuthenticated: !!token,
                login,
                logout,
                fetchAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};