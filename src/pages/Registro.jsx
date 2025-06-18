import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
  Alert,
} from "@mui/material";
import { supabase } from "../supabase"; // Asegúrate de que esté bien configurado

const roles = ["admin", "vendedor", "chofer", "ayudante"];

const Registro = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("vendedor");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleRegistro = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const userId = authData.user.id;

      // 2. Insertar en la tabla `users` con rol
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: userId,
          email,
          rol,
        },
      ]);

      if (dbError) throw dbError;

      setMensaje("✅ Usuario registrado correctamente.");
      setEmail("");
      setPassword("");
      setRol("vendedor");
    } catch (err) {
      console.error(err);
      setError("❌ Error al registrar usuario: " + err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Registro de Nuevo Usuario
      </Typography>
      <Box component="form" onSubmit={handleRegistro} noValidate sx={{ mt: 2 }}>
        <TextField
          label="Correo electrónico"
          fullWidth
          required
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          required
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Rol"
          select
          fullWidth
          required
          margin="normal"
          value={rol}
          onChange={(e) => setRol(e.target.value)}
        >
          {roles.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>

        {mensaje && <Alert severity="success">{mensaje}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Registrar usuario
        </Button>
      </Box>
    </Container>
  );
};

export default Registro;