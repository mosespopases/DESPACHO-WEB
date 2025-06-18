// src/pages/AyudantePanel.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Link,
} from '@mui/material';
import { supabase } from '../supabase';

const AyudantePanel = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error al obtener usuario:", userError?.message);
        setLoading(false);
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('ayudante', user.id);

      if (error) {
        console.error("Error al obtener pedidos:", error.message);
        setLoading(false);
        return;
      }

      setPedidos(data);
      setLoading(false);
    };

    fetchPedidos();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Panel del Ayudante
      </Typography>
      <Typography variant="body1" gutterBottom>
        Revisa los pedidos que acompañarás en las rutas.
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : pedidos.length === 0 ? (
        <Typography variant="h6" color="textSecondary" sx={{ mt: 4 }}>
          No tienes pedidos asignados.
        </Typography>
      ) : (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {pedidos.map((pedido) => (
            <Grid item xs={12} md={6} key={pedido.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">Pedido ID: {pedido.id}</Typography>
                  <Typography variant="body2">Cliente: {pedido.nombre_cliente || 'No especificado'}</Typography>
                  <Typography variant="body2">Teléfono: {pedido.telefono}</Typography>
                  <Typography variant="body2">Dirección: {pedido.direccion}</Typography>
                  <Typography variant="body2">Distrito: {pedido.distrito}</Typography>
                  <Typography variant="body2">Monto: S/ {pedido.monto}</Typography>
                  <Typography variant="body2">Fecha de entrega: {pedido.fecha_entrega}</Typography>
                  {pedido.archivo_url && (
                    <Link
                      href={pedido.archivo_url}
                      target="_blank"
                      rel="noopener"
                      underline="hover"
                      sx={{ mt: 1, display: 'inline-block' }}
                    >
                      Descargar archivo PDF
                    </Link>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AyudantePanel;