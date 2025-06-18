// AdminRutas.jsx
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Snackbar,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import RouteIcon from "@mui/icons-material/AltRoute";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "../supabase/supabaseClient"; // ✅ CORREGIDO

// Fix iconos Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const ALMACEN = { lat: -11.9813, lng: -76.9031 };
const VEHICULOS = ["JAC", "Super JAC", "KIA 2", "KIA 3"];

const MapFitBounds = ({ ruta }) => {
  const map = useMap();
  useEffect(() => {
    if (ruta.length > 0) {
      const bounds = L.latLngBounds(ruta.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [ruta, map]);
  return null;
};

const agruparPorCercania = (pedidos, k = 4) => {
  if (pedidos.length === 0) return Array.from({ length: k }, () => []);
  let centroides = pedidos.slice(0, k).map((p) => ({ lat: p.lat, lng: p.lng }));
  let asignaciones = [];
  let cambiado = true;
  let iteraciones = 0;

  while (cambiado && iteraciones < 10) {
    cambiado = false;
    iteraciones++;
    const nuevosClusters = Array.from({ length: k }, () => []);

    for (const pedido of pedidos) {
      let minDist = Infinity;
      let idxMasCercano = 0;
      centroides.forEach((centroide, idx) => {
        const dist = Math.hypot(pedido.lat - centroide.lat, pedido.lng - centroide.lng);
        if (dist < minDist) {
          minDist = dist;
          idxMasCercano = idx;
        }
      });
      nuevosClusters[idxMasCercano].push(pedido);
    }

    const nuevosCentroides = nuevosClusters.map((cluster) => {
      if (cluster.length === 0) return { lat: 0, lng: 0 };
      const sumLat = cluster.reduce((sum, p) => sum + p.lat, 0);
      const sumLng = cluster.reduce((sum, p) => sum + p.lng, 0);
      return {
        lat: sumLat / cluster.length,
        lng: sumLng / cluster.length,
      };
    });

    for (let i = 0; i < k; i++) {
      if (
        centroides[i].lat !== nuevosCentroides[i].lat ||
        centroides[i].lng !== nuevosCentroides[i].lng
      ) {
        cambiado = true;
        break;
      }
    }

    centroides = nuevosCentroides;
    asignaciones = nuevosClusters;
  }

  return asignaciones;
};

const AdminRutas = () => {
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(0);
  const [vehiculos, setVehiculos] = useState(
    VEHICULOS.map((nombre) => ({ nombre, pedidos: [] }))
  );
  const [fechaSeleccionada, setFechaSeleccionada] = useState(dayjs());
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const navigate = useNavigate();

  const fetchPedidos = async (fechaISO) => {
    const { data: pedidos, error } = await supabase
      .from("pedidos")
      .select("id, cliente, lat, lng, estado, fecha_entrega")
      .eq("estado", "pendiente")
      .eq("fecha_entrega", fechaISO);

    if (error) {
      console.error("Error al obtener pedidos:", error);
      setSnackbar({
        open: true,
        message: "Error al obtener pedidos desde Supabase.",
        severity: "error",
      });
      return;
    }

    if (!pedidos || pedidos.length === 0) {
      setVehiculos(VEHICULOS.map((nombre) => ({ nombre, pedidos: [] })));
      setSnackbar({
        open: true,
        message: "No hay pedidos pendientes para esta fecha.",
        severity: "info",
      });
      return;
    }

    const pedidosConUbicacion = pedidos.filter((p) => p.lat && p.lng);
    const grupos = agruparPorCercania(pedidosConUbicacion, VEHICULOS.length);
    const vehiculosConPedidos = VEHICULOS.map((nombre, i) => ({
      nombre,
      pedidos: grupos[i] || [],
    }));

    setVehiculos(vehiculosConPedidos);
  };

  useEffect(() => {
    fetchPedidos(fechaSeleccionada.format("YYYY-MM-DD"));
  }, [fechaSeleccionada]);

  const pedidos = vehiculos[vehiculoSeleccionado]?.pedidos || [];
  const ruta = [ALMACEN, ...pedidos];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 3 }}
          onClick={() => navigate("/admin")}
        >
          Volver al panel
        </Button>

        <Typography variant="h4" fontWeight={600} gutterBottom>
          Distribución de Rutas
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Visualiza cómo se asignan los pedidos a los vehículos por cercanía geográfica.
        </Typography>

        <DatePicker
          label="Selecciona una fecha"
          value={fechaSeleccionada}
          onChange={(nuevaFecha) => setFechaSeleccionada(nuevaFecha)}
          sx={{ mb: 3 }}
          format="DD/MM/YYYY"
        />

        <Tabs
          value={vehiculoSeleccionado}
          onChange={(e, newValue) => setVehiculoSeleccionado(newValue)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          {vehiculos.map((vehiculo, index) => (
            <Tab key={index} label={vehiculo.nombre} />
          ))}
        </Tabs>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Pedidos asignados a {vehiculos[vehiculoSeleccionado]?.nombre}
                </Typography>

                {pedidos.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No hay pedidos asignados para esta fecha.
                  </Typography>
                ) : (
                  <ul>
                    {pedidos.map((p) => (
                      <li key={p.id}>{p.cliente}</li>
                    ))}
                  </ul>
                )}

                <Typography variant="body2" sx={{ mt: 2 }}>
                  Total pedidos: <strong>{pedidos.length}</strong><br />
                  Peso total aprox: <strong>{pedidos.length * 50} kg</strong>
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<RouteIcon />}
                  sx={{ mt: 2 }}
                  onClick={() => alert("Optimización de ruta pendiente")}
                  fullWidth
                >
                  Optimizar ruta
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ height: "100%" }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Mapa de Ruta
                </Typography>

                <Box
                  sx={{
                    height: '75vh',
                    minHeight: 600,
                    mt: 2,
                    borderRadius: 2,
                    overflow: "hidden",
                    width: '100%',
                  }}
                >
                  <MapContainer
                    center={[ALMACEN.lat, ALMACEN.lng]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapFitBounds ruta={ruta} />
                    <Marker position={[ALMACEN.lat, ALMACEN.lng]}>
                      <Popup>Almacén</Popup>
                    </Marker>
                    {pedidos.map((p) => (
                      <Marker key={p.id} position={[p.lat, p.lng]}>
                        <Popup>{p.cliente}</Popup>
                      </Marker>
                    ))}
                    {pedidos.length > 0 && (
                      <Polyline positions={ruta.map((p) => [p.lat, p.lng])} />
                    )}
                  </MapContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default AdminRutas;