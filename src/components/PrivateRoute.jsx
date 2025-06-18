import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading, userData } = useAuth(); // user viene de Supabase, userData de tu tabla 'usuarios'

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  // Usuario no autenticado o sin datos cargados
  if (!user || !userData) {
    return <Navigate to="/" replace />;
  }

  // Usuario no tiene rol permitido
  if (!allowedRoles.includes(userData.rol)) {
    return <Navigate to="/" replace />;
  }

  // Autenticado y con permiso
  return children;
};

export default PrivateRoute;