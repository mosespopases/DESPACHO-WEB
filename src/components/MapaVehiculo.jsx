// src/components/MapaVehiculo.jsx
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import { Box, Typography, Paper } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const almacen = [-11.981346578180196, -76.90307078696297];

const MapaVehiculo = ({ vehiculoId }) => {
  const [pedidos, setPedidos] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(dayjs());

  useEffect(() => {
    if (!vehiculoId) return;

    const cargarPedidos = async () => {
      const fechaStr = fechaSeleccionada.format("YYYY-MM-DD");

      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("vehiculo_asignado", vehiculoId)
        .eq("fecha_entrega", fechaStr);

      if (error) {
        console.error("Error al obtener pedidos:", error.message);
        return;
      }

      setPedidos(data || []);
    };

    cargarPedidos();
  }, [vehiculoId, fechaSeleccionada]);

  const ruta = [almacen, ...pedidos.map((p) => [p.lat, p.lng])];

  return (
    <Box component={Paper} elevation={2} sx={{ mb: 4, p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Ruta del vehículo: {vehiculoId}
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Fecha de entrega"
            value={fechaSeleccionada}
            onChange={(newValue) => setFechaSeleccionada(newValue)}
            format="YYYY-MM-DD"
            slotProps={{ textField: { size: "small", variant: "outlined" } }}
          />
        </LocalizationProvider>
      </Box>

      <Box sx={{ height: 400 }}>
        <MapContainer center={almacen} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={almacen}>
            <Popup>Almacén</Popup>
          </Marker>

          {pedidos.map((pedido) => (
            <Marker key={pedido.id} position={[pedido.lat, pedido.lng]}>
              <Popup>
                Pedido: {pedido.id} <br />
                Cliente: {pedido.nombre_cliente || "No especificado"}
              </Popup>
            </Marker>
          ))}

          <Polyline positions={ruta} color="blue" />
        </MapContainer>
      </Box>
    </Box>
  );
};

export default MapaVehiculo;