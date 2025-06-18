import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Link,
  Box,
  Divider,
  Stack,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ChoferPanel = () => {
  const { user, logout } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [subiendoFotoId, setSubiendoFotoId] = useState(null);

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        cliente:users!pedidos_nombre_cliente(id, email),
        vendedor:users!pedidos_vendedor_id(id, email)
      `)
      .eq('vehiculo_asignado', user.id)
      .order('fecha_creacion', { ascending: true });

    if (error) console.error('Error al cargar pedidos', error);
    else setPedidos(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const marcarEntregado = async (id) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: 'Entregado' })
      .eq('id', id);

    if (error) alert('Error al actualizar estado');
    else fetchPedidos();
  };

  const abrirDialogoProblema = (pedido) => {
    setPedidoSeleccionado(pedido);
    setObservacion('');
    setDialogOpen(true);
  };

  const reportarProblema = async () => {
    if (!observacion.trim()) {
      alert('Por favor ingresa una observación.');
      return;
    }

    const { error } = await supabase
      .from('pedidos')
      .update({
        estado: 'No entregado',
        observacion: observacion.trim(),
      })
      .eq('id', pedidoSeleccionado.id);

    if (error) {
      alert('Error al reportar problema');
    } else {
      setDialogOpen(false);
      fetchPedidos();
    }
  };

  const subirFotoEntrega = async (e, pedido) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `pedido_${pedido.id}_${Date.now()}.${fileExt}`;

    setSubiendoFotoId(pedido.id);
    const { error: uploadError } = await supabase.storage
      .from('entregas')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      alert('Error al subir imagen');
      setSubiendoFotoId(null);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('entregas')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('pedidos')
      .update({ foto_url: publicUrlData.publicUrl })
      .eq('id', pedido.id);

    setSubiendoFotoId(null);

    if (updateError) {
      alert('Error al guardar URL de la foto');
    } else {
      fetchPedidos();
    }
  };

  const rutaCoordenadas = pedidos
    .filter((p) => p.lat && p.lng)
    .map((p) => [p.lat, p.lng]);

  const totalPedidos = pedidos.length;
  const totalEntregados = pedidos.filter((p) => p.estado === 'Entregado').length;
  const totalPendientes = pedidos.filter((p) => p.estado !== 'Entregado').length;
  const montoTotal = pedidos.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Panel del Chofer</Typography>
        <Button variant="outlined" color="error" onClick={logout}>
          Cerrar sesión
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              Resumen del día
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              <Typography>Total de pedidos: {totalPedidos}</Typography>
              <Typography>Entregados: {totalEntregados}</Typography>
              <Typography>Pendientes: {totalPendientes}</Typography>
              <Typography>Monto total: S/. {montoTotal.toFixed(2)}</Typography>
            </Stack>
          </Paper>

          <Grid container spacing={2}>
            {pedidos.map((p) => (
              <Grid item xs={12} md={6} key={p.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography><strong>ID:</strong> {p.id}</Typography>
                  <Typography><strong>Cliente:</strong> {p.nombre_cliente} ({p.cliente?.email})</Typography>
                  <Typography><strong>Teléfono:</strong> {p.telefono}</Typography>
                  <Typography><strong>Distrito:</strong> {p.distrito}</Typography>
                  <Typography><strong>Dirección:</strong> {p.direccion_detalle}</Typography>
                  <Typography><strong>Fecha entrega:</strong> {p.fecha_entrega}</Typography>
                  <Typography><strong>Monto:</strong> S/. {parseFloat(p.monto).toFixed(2)}</Typography>
                  <Typography><strong>Peso:</strong> {p.peso ?? '–'} kg</Typography>
                  <Typography><strong>Estado:</strong> {p.estado}</Typography>

                  {p.observacion && (
                    <Typography color="error"><strong>Observación:</strong> {p.observacion}</Typography>
                  )}

                  {p.archivo_url && (
                    <Typography sx={{ mt: 1 }}>
                      <Link href={p.archivo_url} target="_blank" rel="noopener">
                        Ver PDF
                      </Link>
                    </Typography>
                  )}

                  {p.foto_url && (
                    <Box mt={1}>
                      <Typography variant="body2"><strong>Foto:</strong></Typography>
                      <img src={p.foto_url} alt="foto entrega" width="100%" style={{ borderRadius: 8 }} />
                    </Box>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Button
                      variant="contained"
                      color={p.estado === 'Entregado' ? 'success' : 'primary'}
                      disabled={p.estado === 'Entregado'}
                      onClick={() => marcarEntregado(p.id)}
                    >
                      {p.estado === 'Entregado' ? 'Entregado' : 'Marcar como Entregado'}
                    </Button>

                    {p.estado !== 'Entregado' && (
                      <>
                        <Button
                          variant="outlined"
                          color="warning"
                          onClick={() => abrirDialogoProblema(p)}
                        >
                          Reportar Problema
                        </Button>

                        <IconButton
                          color="primary"
                          component="label"
                          disabled={subiendoFotoId === p.id}
                        >
                          <PhotoCamera />
                          <input
                            hidden
                            accept="image/*"
                            type="file"
                            onChange={(e) => subirFotoEntrega(e, p)}
                          />
                        </IconButton>
                      </>
                    )}

                    <Button
                      variant="outlined"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`,
                          '_blank'
                        )
                      }
                    >
                      Ver en Google Maps
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {rutaCoordenadas.length > 0 && (
            <Box sx={{ height: 400, mt: 5 }}>
              <Typography variant="h6" gutterBottom>
                Ruta del día
              </Typography>
              <MapContainer center={rutaCoordenadas[0]} zoom={13} style={{ height: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={rutaCoordenadas} color="blue" />
                {pedidos.map((p) => (
                  p.lat && p.lng && (
                    <Marker key={p.id} position={[p.lat, p.lng]}>
                      <Popup>
                        <strong>{p.nombre_cliente}</strong>
                        <br />
                        {p.direccion_detalle}
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </Box>
          )}

          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
            <DialogTitle>Reportar problema del pedido</DialogTitle>
            <DialogContent>
              <TextField
                label="Motivo / observación"
                multiline
                fullWidth
                minRows={3}
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={reportarProblema} variant="contained" color="warning">
                Confirmar
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default ChoferPanel;