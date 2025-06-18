import {
  Box, Typography, Grid, Card, CardContent, Chip, IconButton,
} from "@mui/material";
import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import { supabase } from "../supabase";
import VolverAtras from "../components/VolverAtras";

const AdminDistribucion = () => {
  const [carros] = useState(["JAC", "SUPERJAC", "KIA2", "KIA3"]);
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const { data } = await supabase
      .from("pedidos")
      .select("*, chofer:usuarios!pedidos_chofer_id_fkey(nombre), ayudante:usuarios!pedidos_ayudante_id_fkey(nombre)")
      .eq("estado", "asignado");

    setPedidos(data || []);
  };

  return (
    <Box>
      <VolverAtras titulo="Distribución de pedidos por vehículo" />
      <Grid container spacing={3}>
        {carros.map((carro) => {
          const pedidosCarro = pedidos.filter(p => p.vehiculo === carro);
          const chofer = pedidosCarro[0]?.chofer?.nombre || 'No asignado';
          const ayudante = pedidosCarro[0]?.ayudante?.nombre || 'No asignado';

          return (
            <Grid item xs={12} md={6} key={carro}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>{carro}</Typography>
                  <Typography variant="body2">Chofer: <strong>{chofer}</strong></Typography>
                  <Typography variant="body2">Ayudante: <strong>{ayudante}</strong></Typography>

                  <Box mt={2}>
                    <Typography variant="subtitle2">Pedidos asignados:</Typography>
                    {pedidosCarro.length === 0 ? (
                      <Typography variant="body2">No hay pedidos asignados</Typography>
                    ) : (
                      pedidosCarro.map(p => (
                        <Chip
                          key={p.id}
                          label={`#${p.id} - ${p.distrito}`}
                          sx={{ mr: 1, mt: 1 }}
                          onDelete={() => {
                            // Puedes agregar lógica de reasignación aquí (modal o redirección)
                          }}
                          deleteIcon={
                            <IconButton size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          }
                        />
                      ))
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default AdminDistribucion;