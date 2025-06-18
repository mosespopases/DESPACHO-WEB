// src/pages/AdminUsuarios.jsx
import React, { useEffect, useState } from "react";
import {
  TextField, Button, Typography, MenuItem, Paper, Grid, Box,
  IconButton, Table, TableHead, TableRow, TableCell, TableBody,
  Tooltip, Snackbar, Alert, CircularProgress
} from "@mui/material";
import { Edit, Delete, FileDownload, Clear } from "@mui/icons-material";
import { supabase } from "../supabase/supabaseClient";
import * as XLSX from "xlsx";

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("vendedor");
  const [filtroRol, setFiltroRol] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const fetchUsuarios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("usuarios")
      .select("user_id, email, rol, nombre, confirmed_at");
    if (!error) setUsuarios(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleRegistro = async () => {
    if (!email || !password || !rol || !nombre) {
      setSnackbar({ open: true, message: "Completa todos los campos.", severity: "warning" });
      return;
    }

    if (!email.includes("@")) {
      setSnackbar({ open: true, message: "Correo no válido.", severity: "error" });
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setSnackbar({ open: true, message: "Error: " + error.message, severity: "error" });
      return;
    }

    const userId = data.user?.id;
    const confirmed = data.user?.confirmed_at || null;

    if (userId) {
      await supabase.from("usuarios").insert({
        user_id: userId,
        email,
        nombre,
        rol,
        confirmed_at: confirmed,
      });

      setSnackbar({ open: true, message: "Usuario registrado correctamente.", severity: "success" });
      setNombre("");
      setEmail("");
      setPassword("");
      setRol("vendedor");
      fetchUsuarios();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    await supabase.from("usuarios").delete().eq("user_id", id);
    setSnackbar({ open: true, message: "Usuario eliminado.", severity: "info" });
    fetchUsuarios();
  };

  const handleExport = () => {
    const cleanData = usuarios.map(({ email, rol, nombre, confirmed_at }) => ({
      Nombre: nombre,
      Correo: email,
      Rol: rol,
      Estado: confirmed_at ? "Activo" : "Pendiente"
    }));

    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
    XLSX.writeFile(wb, "usuarios.xlsx");
  };

  const usuariosFiltrados = usuarios
    .filter((u) => u.email.toLowerCase().includes(busqueda.toLowerCase()))
    .filter((u) => (filtroRol ? u.rol === filtroRol : true));

  const rolColor = (rol) => {
    switch (rol) {
      case "admin": return "primary.main";
      case "vendedor": return "success.main";
      case "chofer": return "warning.main";
      case "ayudante": return "info.main";
      default: return "text.primary";
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Gestión de Usuarios
      </Typography>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Nombre"
              fullWidth
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Correo"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Rol"
              select
              fullWidth
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="vendedor">Vendedor</MenuItem>
              <MenuItem value="chofer">Chofer</MenuItem>
              <MenuItem value="ayudante">Ayudante</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button fullWidth variant="contained" onClick={handleRegistro}>
              Registrar Usuario
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Buscar por email"
              fullWidth
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Filtrar por rol"
              select
              fullWidth
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="vendedor">Vendedor</MenuItem>
              <MenuItem value="chofer">Chofer</MenuItem>
              <MenuItem value="ayudante">Ayudante</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button fullWidth variant="outlined" startIcon={<FileDownload />} onClick={handleExport}>
              Exportar Excel
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button fullWidth variant="text" color="secondary" startIcon={<Clear />} onClick={() => {
              setBusqueda("");
              setFiltroRol("");
            }}>
              Limpiar filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuariosFiltrados.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell>{u.nombre || "-"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Box sx={{ color: rolColor(u.rol), fontWeight: 500 }}>{u.rol}</Box>
                  </TableCell>
                  <TableCell>
                    {u.confirmed_at ? (
                      <span style={{ color: "green", fontWeight: "bold" }}>Activo</span>
                    ) : (
                      <span style={{ color: "gray" }}>Pendiente</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Editar (próximamente)">
                      <IconButton disabled>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar usuario">
                      <IconButton color="error" onClick={() => handleDelete(u.user_id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}