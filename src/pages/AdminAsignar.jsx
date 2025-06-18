import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import VolverAtras from "../components/VolverAtras";

const AdminAsignar = () => {
  const [pedidos, setPedidos] = useState([]);
  const [carros, setCarros] = useState(["JAC", "SUPERJAC", "KIA2", "KIA3"]);
  const [choferes, setChoferes] = useState([]);
  const [ayudantes, setAyudantes] = useState([]);
  const [asignaciones, setAsignaciones] = useState({});

  useEffect(() => {
    obtenerPedidos();
    obtenerUsuarios();
  }, []);

  const obtenerPedidos = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .eq("estado", "pendiente");

    if (!error) setPedidos(data);
  };

  const obtenerUsuarios = async () => {
    const { data, error } = await supabase.from("usuarios").select("id, nombre, rol");

    if (!error) {
      setChoferes(data.filter((u) => u.rol === "chofer"));
      setAyudantes(data.filter((u) => u.rol === "ayudante"));
    }
  };

  const handleAsignar = async (pedidoId) => {
    const asignacion = asignaciones[pedidoId];
    if (!asignacion) return;

    const { carro, chofer, ayudante } = asignacion;

    const { error } = await supabase
      .from("pedidos")
      .update({
        vehiculo: carro,
        chofer_id: chofer,
        ayudante_id: ayudante,
        estado: "asignado",
      })
      .eq("id", pedidoId);

    if (!error) obtenerPedidos();
  };

  return (
    <Box>
      <VolverAtras titulo="Asignar pedidos a vehículos y personal" />
      <Grid container spacing={3}>
        {pedidos.map((pedido) => (
          <Grid item xs={12} md={6} key={pedido.id}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Pedido #{pedido.id}</Typography>
                <Typography variant="body2">Cliente: {pedido.cliente || "N/A"}</Typography>
                <Typography variant="body2">Dirección: {pedido.direccion}</Typography>
                <Typography variant="body2">Peso: {pedido.peso || "N/A"} kg</Typography>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Vehículo</InputLabel>
                  <Select
                    value={asignaciones[pedido.id]?.carro || ""}
                    onChange={(e) =>
                      setAsignaciones((prev) => ({
                        ...prev,
                        [pedido.id]: {
                          ...prev[pedido.id],
                          carro: e.target.value,
                        },
                      }))
                    }
                  >
                    {carros.map((carro, i) => (
                      <MenuItem key={i} value={carro}>
                        {carro}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Chofer</InputLabel>
                  <Select
                    value={asignaciones[pedido.id]?.chofer || ""}
                    onChange={(e) =>
                      setAsignaciones((prev) => ({
                        ...prev,
                        [pedido.id]: {
                          ...prev[pedido.id],
                          chofer: e.target.value,
                        },
                      }))
                    }
                  >
                    {choferes.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Ayudante</InputLabel>
                  <Select
                    value={asignaciones[pedido.id]?.ayudante || ""}
                    onChange={(e) =>
                      setAsignaciones((prev) => ({
                        ...prev,
                        [pedido.id]: {
                          ...prev[pedido.id],
                          ayudante: e.target.value,
                        },
                      }))
                    }
                  >
                    {ayudantes.map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => handleAsignar(pedido.id)}
                >
                  Asignar
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminAsignar;