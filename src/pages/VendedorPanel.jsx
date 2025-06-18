import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Snackbar,
  Alert,
  Divider,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabase/supabaseClient";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import dayjs from "dayjs";

const PanelVendedor = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    if (!user) return;

    const obtenerPedidos = async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("vendedor_id", user.id);

      if (error) {
        console.error("Error al obtener pedidos:", error.message);
        setSnackbar({
          open: true,
          message: "Error al cargar pedidos.",
          severity: "error",
        });
        return;
      }

      setPedidos(data);

      const urgentes = data.filter((p) =>
        dayjs(p.fecha_entrega).isSame(dayjs(), "day")
      );

      if (urgentes.length > 0) {
        setSnackbar({
          open: true,
          message: `Tienes ${urgentes.length} pedido(s) urgente(s) para hoy.`,
          severity: "warning",
        });
      }
    };

    obtenerPedidos();
  }, [user]);

  const cerrarSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/logout");
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" mt={2}>Cargando datos...</Typography>
      </Container>
    );
  }

  const totalPedidos = pedidos.length;
  const montoTotal = pedidos.reduce(
    (sum, pedido) => sum + parseFloat(pedido.monto || 0),
    0
  );

  const resumenEstados = pedidos.reduce(
    (acc, pedido) => {
      if (pedido.estado === "entregado") acc.entregados++;
      else if (pedido.estado === "reenviado") acc.reenviados++;
      else acc.noEntregados++;
      return acc;
    },
    { entregados: 0, reenviados: 0, noEntregados: 0 }
  );

  const dataChart = {
    labels: ["Entregados", "Reenviados", "No Entregados"],
    datasets: [
      {
        label: "Pedidos por estado",
        data: [
          resumenEstados.entregados,
          resumenEstados.reenviados,
          resumenEstados.noEntregados,
        ],
        backgroundColor: ["#4caf50", "#ffa726", "#f44336"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      {/* Barra superior */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Panel del Vendedor
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Bienvenido, Vendedor
        </Typography>

        <Stack spacing={2} mt={4} direction={{ xs: "column", sm: "row" }} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/vendedor/nuevo-pedido"
          >
            Registrar nuevo pedido
          </Button>

          <Button
            variant="contained"
            color="success"
            component={Link}
            to="/vendedor/pedidos"
          >
            Ver mis pedidos
          </Button>
        </Stack>

        <Box mt={5}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen de tus pedidos
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {pedidos.length === 0 ? (
                <Typography color="text.secondary">Aún no tienes pedidos registrados.</Typography>
              ) : (
                <>
                  <Typography variant="body1">
                    Total de pedidos: <strong>{totalPedidos}</strong>
                  </Typography>
                  <Typography variant="body1">
                    Monto total: <strong>S/ {montoTotal.toFixed(2)}</strong>
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Box>

        {pedidos.length > 0 && (
          <Box mt={5}>
            <Typography variant="h6" gutterBottom>
              Estado de pedidos
            </Typography>
            <Card>
              <CardContent>
                <Pie data={dataChart} />
              </CardContent>
            </Card>
          </Box>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={cerrarSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={cerrarSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default PanelVendedor;