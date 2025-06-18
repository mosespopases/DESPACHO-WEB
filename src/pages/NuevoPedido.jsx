import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  InputLabel,
  Divider,
  LinearProgress,
} from "@mui/material";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function NuevoPedido() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombreVendedor: "", // NUEVO CAMPO
    distrito: "",
    direccion: "",
    direccionDetalle: "",
    nombreCliente: "",
    telefono: "",
    fechaEntrega: "",
    monto: "",
    peso: "",
    archivo: null,
  });

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

    if (!user) {
      alert("Usuario no autenticado.");
      return;
    }

    if (!form.nombreVendedor.trim()) {
      alert("Por favor ingresa el nombre del vendedor.");
      return;
    }

    const hoy = new Date().toISOString().split("T")[0];
    if (form.fechaEntrega === hoy) {
      alert("La entrega es hoy. Requiere aprobación del administrador.");
      return;
    }

    setUploading(true);
    let archivoURL = null;

    try {
      if (form.archivo) {
        const file = form.archivo;
        if (file.type !== "application/pdf") {
          alert("Solo se permiten archivos PDF.");
          setUploading(false);
          return;
        }

        const filePath = `pedidos/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("pedidos")
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data, error: urlError } = supabase.storage
          .from("pedidos")
          .getPublicUrl(filePath);
        if (urlError) throw urlError;

        archivoURL = data.publicUrl;
      }

      const [lat, lng] = form.direccion.split(",").map((v) => parseFloat(v.trim()));
      if (isNaN(lat) || isNaN(lng)) {
        alert("Dirección inválida. Usa formato: lat,lng");
        setUploading(false);
        return;
      }

      const { error: insertError } = await supabase.from("pedidos").insert([
        {
          vendedor_id: user.id,
          nombre_vendedor: form.nombreVendedor.trim(), // NUEVO
          distrito: form.distrito,
          direccion: form.direccion,
          direccion_detalle: form.direccionDetalle || null,
          nombre_cliente: form.nombreCliente || null,
          telefono: form.telefono,
          fecha_entrega: form.fechaEntrega,
          monto: parseFloat(form.monto),
          peso: form.peso ? parseFloat(form.peso) : null,
          archivo_url: archivoURL,
          lat,
          lng,
          estado: "Pendiente",
          fecha_creacion: new Date(),
        },
      ]);

      if (insertError) throw insertError;

      alert("✅ Pedido enviado correctamente");
      navigate("/vendedor");

    } catch (error) {
      console.error("Error al guardar pedido:", error);
      alert("Error al guardar el pedido.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4, position: "relative" }}>
        <Box sx={{ position: "absolute", top: 16, left: 16 }}>
          <Button variant="outlined" color="secondary" onClick={() => navigate("/vendedor")}>
            Volver
          </Button>
        </Box>

        <Typography variant="h5" gutterBottom textAlign="center">
          Nuevo Pedido
        </Typography>

        {uploading && (
          <Box sx={{ my: 2 }}>
            <LinearProgress />
            <Typography variant="body2" align="center" mt={1}>
              Subiendo archivo...
            </Typography>
          </Box>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          autoComplete="off"
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <TextField label="Nombre del vendedor" name="nombreVendedor" value={form.nombreVendedor} onChange={handleChange} fullWidth required />
          <TextField label="Distrito" name="distrito" value={form.distrito} onChange={handleChange} fullWidth required />
          <TextField label="Dirección (lat,lng)" name="direccion" value={form.direccion} onChange={handleChange} fullWidth required />
          <TextField label="Detalle de dirección (opcional)" name="direccionDetalle" value={form.direccionDetalle} onChange={handleChange} fullWidth />
          <TextField label="Nombre Cliente (opcional)" name="nombreCliente" value={form.nombreCliente} onChange={handleChange} fullWidth />
          <TextField label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} fullWidth required />
          <TextField label="Fecha de Entrega" type="date" name="fechaEntrega" value={form.fechaEntrega} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
          <TextField label="Monto a cobrar" name="monto" type="number" value={form.monto} onChange={handleChange} fullWidth required />
          <TextField label="Peso del pedido (kg)" name="peso" type="number" value={form.peso} onChange={handleChange} fullWidth />

          <Box>
            <InputLabel>Subir archivo PDF</InputLabel>
            <input type="file" name="archivo" accept=".pdf" onChange={handleChange} />
          </Box>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1">Resumen</Typography>
          <Box fontSize={14}>
            <p><strong>Vendedor:</strong> {form.nombreVendedor}</p>
            <p><strong>Distrito:</strong> {form.distrito}</p>
            <p><strong>Dirección:</strong> {form.direccion}</p>
            <p><strong>Cliente:</strong> {form.nombreCliente || "N/A"}</p>
            <p><strong>Teléfono:</strong> {form.telefono}</p>
            <p><strong>Entrega:</strong> {form.fechaEntrega}</p>
            <p><strong>Monto:</strong> S/ {form.monto}</p>
            <p><strong>Peso:</strong> {form.peso || "N/A"} kg</p>
            <p><strong>Archivo:</strong> {form.archivo?.name || "No adjunto"}</p>
          </Box>

          <Button type="submit" variant="contained" disabled={uploading}>
            Enviar Pedido
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}