import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { CssBaseline, Container, CircularProgress, Box } from "@mui/material";
import { useEffect } from "react";

import AdminPanel from "./pages/AdminPanel";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminAsignar from "./pages/AdminAsignar";
import AdminRutas from "./pages/AdminRutas";
import PedidosPorFecha from "./pages/PedidosPorFecha";
import AdminDistribucion from "./pages/AdminDistribucion"; // ✅ NUEVO IMPORT

import VendedorPanel from "./pages/VendedorPanel";
import VendedorPedidos from "./pages/VendedorPedidos";
import NuevoPedido from "./pages/NuevoPedido";

import ChoferPanel from "./pages/ChoferPanel";
import AyudantePanel from "./pages/AyudantePanel";

import Login from "./pages/Login";

import PrivateRoute from "./components/PrivateRoute";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && userData && location.pathname === "/") {
      const rol = userData.rol;
      if (rol === "admin") navigate("/admin");
      else if (rol === "vendedor") navigate("/vendedor");
      else if (rol === "chofer") navigate("/chofer");
      else if (rol === "ayudante") navigate("/ayudante");
      else navigate("/");
    }
  }, [user, userData, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminPanel />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminUsuarios />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/asignar"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminAsignar />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/rutas"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminRutas />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/pedidos-fecha"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <PedidosPorFecha />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/distribucion"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDistribucion />
              </PrivateRoute>
            }
          />

          {/* VENDEDOR */}
          <Route
            path="/vendedor"
            element={
              <PrivateRoute allowedRoles={["vendedor"]}>
                <VendedorPanel />
              </PrivateRoute>
            }
          />
          <Route
            path="/vendedor/pedidos"
            element={
              <PrivateRoute allowedRoles={["vendedor"]}>
                <VendedorPedidos />
              </PrivateRoute>
            }
          />
          <Route
            path="/vendedor/nuevo-pedido"
            element={
              <PrivateRoute allowedRoles={["vendedor"]}>
                <NuevoPedido />
              </PrivateRoute>
            }
          />

          {/* CHOFER */}
          <Route
            path="/chofer"
            element={
              <PrivateRoute allowedRoles={["chofer"]}>
                <ChoferPanel />
              </PrivateRoute>
            }
          />

          {/* AYUDANTE */}
          <Route
            path="/ayudante"
            element={
              <PrivateRoute allowedRoles={["ayudante"]}>
                <AyudantePanel />
              </PrivateRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;