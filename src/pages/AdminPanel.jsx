// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Container, Grid, Paper, Typography, Select,
  MenuItem, TextField, Snackbar, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Skeleton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Bar, Pie } from 'react-chartjs-2';
import 'leaflet/dist/leaflet.css';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
const VEHICULOS = ['JAC', 'Super JAC', 'KIA 2', 'KIA 3'];
const ALMACEN = { lat: -11.9813, lng: -76.9031 };

export default function AdminPanel() {
  const [pedidos, setPedidos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [vehiculosData, setVehiculosData] = useState({});
  const [fecha, setFecha] = useState(new Date());
  const [estadoFilter, setEstadoFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ msg:'',sev:'info',open:false });
  const [modal, setModal] = useState({ open:false, pedido:null });

  const navigate = useNavigate();
  const fechaISO = fecha.toISOString().slice(0,10);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('pedidos')
      .select('*')
      .eq('fecha_entrega', fechaISO)
      .order('fecha_creacion', { ascending: false })
      .then(({ data, error }) => {
        setLoading(false);
        if (error) return console.error(error);
        setPedidos(data);
        assignAndSaveRoutes(data);
      });
  }, [fechaISO]);

  useEffect(() => {
    const arr = estadoFilter ? pedidos.filter(p=>p.estado===estadoFilter) : pedidos;
    setFiltered(arr);
    assignRoutes(arr);
  }, [estadoFilter, pedidos]);

  const calcDist = (a, b) => {
    const R = 6371, dLat = (b.lat-a.lat)*Math.PI/180, dLon=(b.lng-a.lng)*Math.PI/180;
    const A = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;
    return 2*R*Math.atan2(Math.sqrt(A),Math.sqrt(1-A));
  };

  const assignRoutes = (lista) => {
    const veh = VEHICULOS.reduce((a,v)=>(a[v]=[],a), {});
    lista.forEach(p => {
      const dists = VEHICULOS.map(v=>({
        v,
        dist: calcDist((veh[v].slice(-1)[0]||ALMACEN), p)
      })).sort((a,b)=>a.dist-b.dist);
      veh[dists[0].v].push(p);
    });
    setVehiculosData(veh);
  };

  const assignAndSaveRoutes = async (lista) => {
    const veh = VEHICULOS.reduce((a,v)=>(a[v]=[],a), {});
    const updates = [];
    lista.forEach(p => {
      const dists = VEHICULOS.map(v=>({
        v,
        dist: calcDist((veh[v].slice(-1)[0]||ALMACEN), p)
      })).sort((a,b)=>a.dist-b.dist);
      const vehiculo = dists[0].v;
      veh[vehiculo].push(p);
      if (p.vehiculo_asignado !== vehiculo) {
        updates.push({ id: p.id, vehiculo });
      }
    });
    setVehiculosData(veh);

    // Actualiza en Supabase si hay cambios
    for (const u of updates) {
      await supabase.from('pedidos').update({ vehiculo_asignado: u.vehiculo }).eq('id', u.id);
    }
  };

  const handleUpdate = async (id,camp, val) => {
    const { error } = await supabase.from('pedidos').update({[camp]:val}).eq('id',id);
    if (error) {
      setSnack({open:true,msg:'Error actualizando',sev:'error'});
    } else {
      setSnack({open:true,msg:'Pedido modificado',sev:'success'});
      setPedidos(p => p.map(o=>o.id===id?{...o,[camp]:val}:o));
    }
  };

  const exportCSV = () => {
    const headers = ['ID','Cliente','Telefono','Distrito','Estado','Vehiculo'];
    const rows = filtered.map(p=>[p.id,p.nombre_cliente,p.telefono,p.distrito,p.estado,p.vehiculo_asignado]);
    const csv = [headers, ...rows].map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url; a.download='pedidos.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const stateCounts = filtered.reduce((a,p)=>{ a[p.estado]=(a[p.estado]||0)+1; return a;}, {});
  const vehCounts = VEHICULOS.reduce((a,v)=>({...a,[v]:vehiculosData[v]?.length||0}),{});

  return (
    <Box sx={{ display:'flex' }}>
      <Sidebar />
      <Box sx={{flexGrow:1}}>
        <Navbar />
        <Container sx={{py:4}}>
          <Grid container spacing={2} sx={{mb:2}} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                label="Filtro por estado"
                select fullWidth
                value={estadoFilter}
                onChange={e=>setEstadoFilter(e.target.value)}
              >
                <MenuItem value="">— Todos —</MenuItem>
                {Object.keys(stateCounts).map(e=><MenuItem key={e} value={e}>{e}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item>
              <Button onClick={exportCSV}>Exportar CSV</Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="secondary" onClick={() => navigate('/admin/pedidos-fecha')}>
                Ver por Fecha
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{mb:4}}>
            <Grid item xs={12} md={6}>
              <Bar data={{
                labels:Object.keys(vehCounts),
                datasets:[{ label:'Pedidos x vehículo', data:Object.values(vehCounts), backgroundColor:'rgba(54,162,235,0.5)' }]
              }}/>
            </Grid>
            <Grid item xs={12} md={6}>
              <Pie data={{
                labels:Object.keys(stateCounts),
                datasets:[{ data:Object.values(stateCounts), backgroundColor:['#3f51b5','#f50057','#ff9800'] }]
              }}/>
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{mb:4}}>
            {loading
              ? [...Array(rowsPerPage)].map((_,i)=><Skeleton key={i} height={40}/>)
              : <>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Vehículo</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.slice(page*rowsPerPage, page*rowsPerPage+rowsPerPage)
                        .map(p=>(
                          <TableRow key={p.id} hover>
                            <TableCell>{p.id}</TableCell>
                            <TableCell>{p.nombre_cliente}</TableCell>
                            <TableCell>
                              <Select
                                value={p.estado || ''}
                                onChange={e=>handleUpdate(p.id,'estado',e.target.value)}
                                size="small"
                              >
                                <MenuItem value="pendiente">Pendiente</MenuItem>
                                <MenuItem value="entregado">Entregado</MenuItem>
                                <MenuItem value="no entregado">No entregado</MenuItem>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={p.vehiculo_asignado||''}
                                onChange={e=>handleUpdate(p.id,'vehiculo_asignado',e.target.value)}
                                size="small"
                              >
                                <MenuItem value="">—</MenuItem>
                                {VEHICULOS.map(v=><MenuItem key={v} value={v}>{v}</MenuItem>)}
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button size="small" onClick={()=>setModal({open:true,pedido:p})}>Ver</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5,10,25]}
                  component="div"
                  count={filtered.length}
                  page={page}
                  onPageChange={(_,newPage)=>setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={e=>{setRowsPerPage(+e.target.value); setPage(0);}}
                />
              </>
            }
          </Paper>

          <Box>
            <MapContainer center={[ALMACEN.lat, ALMACEN.lng]} zoom={12} style={{height:'300px'}}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[ALMACEN.lat, ALMACEN.lng]}>
                <Popup>Almacén</Popup>
              </Marker>
              {filtered.map(p=>(
                <Marker key={p.id} position={[p.lat,p.lng]}>
                  <Popup>{p.nombre_cliente} — {p.estado}</Popup>
                </Marker>
              ))}
              {VEHICULOS.map(v => {
                const ruta = vehiculosData[v] || [];
                const coords = ruta.map(p=>[p.lat,p.lng]);
                return (
                  coords.length>0 && 
                  <Polyline key={v} positions={[[ALMACEN.lat, ALMACEN.lng], ...coords]} />
                );
              })}
            </MapContainer>
          </Box>

          <Snackbar
            open={snack.open}
            autoHideDuration={3000}
            onClose={()=>setSnack(s=>({...s,open:false}))}
          >
            <Alert severity={snack.sev}>{snack.msg}</Alert>
          </Snackbar>

          <Dialog open={modal.open} onClose={()=>setModal({open:false,pedido:null})} fullWidth>
            <DialogTitle>Pedido {modal.pedido?.id}</DialogTitle>
            <DialogContent>
              {modal.pedido && Object.entries(modal.pedido).map(([k,v])=>(
                <Typography key={k}><strong>{k}:</strong> {v}</Typography>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={()=>setModal({open:false,pedido:null})}>Cerrar</Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
}




