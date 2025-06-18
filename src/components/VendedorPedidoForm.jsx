import React, { useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Snackbar,
  Alert,
  LinearProgress,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

const VendedorPedidoForm = () => {
  const { session } = useAuth(); // Contexto Supabase activo
  const [form, setForm] = useState({
    distrito: "",
    direccion: "",
    nombreCliente: "",
    telefono: "",
    fechaEntrega: "",
    monto: "",
    archivo: null,
    peso: "",
    detalleDireccion: "",
  });

  const [noti, setNoti] = useState({ open: false, message: "", severity: "success" });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hoy = new Date();
    const entrega = new Date(form.fechaEntrega);
    const diferenciaDias = Math.floor((entrega - hoy) / (1000 * 60 * 60 * 24));
    const urgente = diferenciaDias <= 1;

    let archivoURL = null;

    if (form.archivo) {
      const filePath = `pedidos/${Date.now()}-${form.archivo.name}`;
      setUploading(true);

      const { error: uploadError } = await supabase.storage
        .from("archivos")
        .upload(filePath, form.archivo);

      setUploading(false);

      if (uploadError) {
        setNoti({ open: true, message: "Error al subir el archivo", severity: "error" });
        return;
      }

      const { data } = supabase.storage.from("archivos").getPublicUrl(filePath);
      archivoURL = data?.publicUrl || null;
    }

    const userId = session?.user?.id;

    if (!userId) {
      setNoti({ open: true, message: "Usuario no autenticado", severity: "error" });
      return;
    }

    const { error } = await supabase.from("pedidos").insert([
      {
        user_id: userId, // ✅ Clave para políticas RLS
        distrito: form.distrito,
        direccion: form.direccion,
        nombreCliente: form.nombreCliente,
        telefono: form.telefono,
        fechaEntrega: form.fechaEntrega,
        monto: form.monto,
        archivo_url: archivoURL,
        fechaCreacion: new Date(),
        urgente: urgente,
        peso: form.peso ? parseFloat(form.peso) : null,
        detalleDireccion: form.detalleDireccion || null,
        vendedorEmail: session?.user?.email || null,
      },
    ]);

    if (error) {
      console.error("Error al guardar pedido:", error);
      setNoti({ open: true, message: "Error al enviar el pedido", severity: "error" });
    } else {
      setNoti({ open: true, message: "Pedido enviado correctamente", severity: "success" });
      setForm({
        distrito: "",
        direccion: "",
        nombreCliente: "",
        telefono: "",
        fechaEntrega: "",
        monto: "",
        archivo: null,
        peso: "",
        detalleDireccion: "",
      });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Ingreso de Pedido
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField label="Distrito" name="distrito" value={form.distrito} onChange={handleChange} fullWidth required />
          <TextField label="Dirección con lat,lon" name="direccion" value={form.direccion} onChange={handleChange} fullWidth required />
          <TextField label="Nombre del cliente (opcional)" name="nombreCliente" value={form.nombreCliente} onChange={handleChange} fullWidth />
          <TextField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} fullWidth required />
          <TextField label="Fecha de entrega" type="date" name="fechaEntrega" value={form.fechaEntrega} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
          <TextField label="Monto a cobrar" name="monto" value={form.monto} onChange={handleChange} fullWidth required />
          <TextField label="Peso del pedido (kg, opcional)" name="peso" value={form.peso} onChange={handleChange} type="number" fullWidth />
          <TextField label="Detalle adicional de dirección (opcional)" name="detalleDireccion" value={form.detalleDireccion} onChange={handleChange} multiline rows={2} fullWidth />
          <Button variant="outlined" component="label">
            Subir archivo PDF
            <input type="file" name="archivo" onChange={handleChange} accept="application/pdf" hidden />
          </Button>
          {uploading && <LinearProgress />}
          <Button type="submit" variant="contained" color="primary" disabled={uploading}>
            Enviar Pedido
          </Button>
        </Stack>
      </Box>

      <Snackbar open={noti.open} autoHideDuration={4000} onClose={() => setNoti({ ...noti, open: false })}>
        <Alert severity={noti.severity} sx={{ width: "100%" }}>
          {noti.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default VendedorPedidoForm;