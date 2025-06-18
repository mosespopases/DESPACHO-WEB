import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, TextField, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { createClient } from '@supabase/supabase-js';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function PedidosPorFecha() {
  const [fecha, setFecha] = useState(dayjs());
  const [pedidos, setPedidos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!fecha || !dayjs(fecha).isValid()) return;

      const inicio = dayjs(fecha).startOf('day').toISOString();
      const fin = dayjs(fecha).endOf('day').toISOString();

      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .gte('fecha_entrega', inicio)
        .lte('fecha_entrega', fin);

      if (error) {
        console.error('Error al obtener pedidos:', error);
        return;
      }

      setPedidos(data || []);
      setFiltered(data || []);
    };

    fetchPedidos();
  }, [fecha]);

  useEffect(() => {
    const filtro = pedidos.filter(p =>
      p.distrito?.toLowerCase().includes(search.toLowerCase()) ||
      p.estado?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filtro);
    setPage(0);
  }, [search, pedidos]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        <Navbar />
        <Container sx={{ py: 4 }}>
          <Typography variant="h5" gutterBottom>Pedidos por Fecha</Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Fecha de entrega"
                value={fecha}
                onChange={(newValue) => {
                  const safeDate = dayjs(newValue);
                  if (safeDate.isValid()) setFecha(safeDate);
                }}
                format="YYYY-MM-DD"
                slotProps={{
                  textField: { fullWidth: true },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Buscar por distrito o estado"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ mb: 4 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Distrito</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Vehículo</TableCell>
                    <TableCell>Chofer</TableCell>
                    <TableCell>Vendedor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay pedidos para esta fecha o coincidencias en búsqueda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map(p => (
                        <TableRow key={p.id} hover>
                          <TableCell>{p.id}</TableCell>
                          <TableCell>{p.nombre_cliente || '—'}</TableCell>
                          <TableCell>{p.distrito || '—'}</TableCell>
                          <TableCell>{p.estado || '—'}</TableCell>
                          <TableCell>{p.vehiculo_asignado || '—'}</TableCell>
                          <TableCell>{p.chofer_asignado || '—'}</TableCell>
                          <TableCell>{p.nombre_vendedor || '—'}</TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Paper>

          <MapContainer
            center={[-11.9813, -76.9031]}
            zoom={12}
            style={{ height: '300px' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filtered.map(p => (
              p.lat && p.lng && (
                <Marker key={p.id} position={[p.lat, p.lng]}>
                  <Popup>
                    <strong>{p.nombre_cliente}</strong><br />
                    {p.distrito} — {p.estado}<br />
                    {p.nombre_vendedor && <em>Vendedor: {p.nombre_vendedor}</em>}
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer>
        </Container>
      </Box>
    </Box>
  );
}