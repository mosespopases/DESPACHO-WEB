import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Link as MuiLink,
  CircularProgress,
  TextField,
  MenuItem,
  Pagination,
  Stack,
  Button
} from "@mui/material";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const estados = ["todos", "pendiente", "en ruta", "entregado", "cancelado"];

const VendedorPedidos = () => {
  const { user, loading } = useAuth(); // ← incluimos loading
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const pedidosPorPagina = 5;

  useEffect(() => {
    if (loading || !user?.id) {
      console.warn("Esperando a que el usuario esté listo...");
      return;
    }

    const obtenerPedidos = async () => {
      setCargandoPedidos(true);
      console.log("🧪 USER ID en pedidos:", user.id);

      try {
        let query = supabase
          .from("pedidos")
          .select("*", { count: "exact" })
          .eq("vendedor_id", user.id);

        if (filtroEstado !== "todos") {
          query = query.eq("estado", filtroEstado);
        }

        if (busqueda.trim()) {
          query = query.ilike("nombre_cliente", `%${busqueda.trim()}%`);
        }

        const desde = (paginaActual - 1) * pedidosPorPagina;
        const hasta = desde + pedidosPorPagina - 1;

        query = query.range(desde, hasta).order("fecha_entrega", { ascending: true });

        const { data, error, count } = await query;

        if (error) {
          console.error("Error al obtener pedidos:", error);
          alert("Ocurrió un error al cargar tus pedidos.");
          return;
        }

        setPedidos(data);
        setTotalPaginas(Math.ceil(count / pedidosPorPagina));
      } catch (error) {
        console.error("Error inesperado:", error);
        alert("Ocurrió un error inesperado.");
      } finally {
        setCargandoPedidos(false);
      }
    };

    obtenerPedidos();
  }, [user, loading, filtroEstado, busqueda, paginaActual]);

  const handleFiltroCambio = (e) => {
    setFiltroEstado(e.target.value);
    setPaginaActual(1);
  };

  const handleBusquedaCambio = (e) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  };

  const handleCambioPagina = (_, nuevaPagina) => {
    setPaginaActual(nuevaPagina);
  };

  return (
    <Box maxWidth="md" mx="auto" mt={6} px={2}>
      <Button
        variant="outlined"
        onClick={() => navigate("/vendedor")}
        sx={{ position: "absolute", left: 20, top: 20 }}
      >
        Volver
      </Button>

      <Typography variant="h4" gutterBottom fontWeight="bold">
        Mis Pedidos Registrados
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap" my={2}>
        <TextField
          label="Buscar por cliente"
          value={busqueda}
          onChange={handleBusquedaCambio}
          fullWidth
        />
        <TextField
          label="Filtrar por estado"
          select
          value={filtroEstado}
          onChange={handleFiltroCambio}
          fullWidth
        >
          {estados.map((estado) => (
            <MenuItem key={estado} value={estado}>
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {cargandoPedidos ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : pedidos.length === 0 ? (
        <Typography color="text.secondary">No se encontraron pedidos.</Typography>
      ) : (
        <Stack spacing={3}>
          {pedidos.map((pedido) => (
            <Paper key={pedido.id} elevation={3} sx={{ p: 3 }}>
              <Typography><strong>Distrito:</strong> {pedido.distrito}</Typography>
              <Typography><strong>Dirección:</strong> {pedido.direccion}</Typography>
              <Typography><strong>Cliente:</strong> {pedido.nombre_cliente || "No especificado"}</Typography>
              <Typography><strong>Teléfono:</strong> {pedido.telefono}</Typography>
              <Typography><strong>Fecha de entrega:</strong> {pedido.fecha_entrega}</Typography>
              <Typography><strong>Monto:</strong> S/. {parseFloat(pedido.monto).toFixed(2)}</Typography>

              {pedido.archivo_url && (
                <Typography>
                  <strong>Archivo:</strong>{" "}
                  <MuiLink href={pedido.archivo_url} target="_blank" rel="noopener" underline="hover">
                    Ver PDF
                  </MuiLink>
                </Typography>
              )}

              <Typography><strong>Estado:</strong> {pedido.estado || "Pendiente"}</Typography>
              <Typography><strong>Chofer asignado:</strong> {pedido.chofer || "No asignado"}</Typography>
              <Typography><strong>Ayudante asignado:</strong> {pedido.ayudante || "No asignado"}</Typography>
            </Paper>
          ))}

          {totalPaginas > 1 && (
            <Pagination
              count={totalPaginas}
              page={paginaActual}
              onChange={handleCambioPagina}
              color="primary"
              sx={{ alignSelf: "center", mt: 2 }}
            />
          )}
        </Stack>
      )}
    </Box>
  );
};

export default VendedorPedidos;