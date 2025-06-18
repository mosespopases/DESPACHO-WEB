import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase"; // Asegúrate de que este archivo esté bien configurado

const Login = () => {
  const [email, setEmail] = useState(() => localStorage.getItem("email") || "");
  const [password, setPassword] = useState("");
  const [recordarme, setRecordarme] = useState(!!localStorage.getItem("email"));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("rol")
          .eq("id", session.user.id)
          .single();

        if (userData) {
          redirectByRole(userData.rol);
        }
      }
    };

    checkSession();
  }, []);

  const redirectByRole = (role) => {
    switch (role) {
      case "admin":
        navigate("/admin");
        break;
      case "vendedor":
        navigate("/vendedor");
        break;
      case "chofer":
        navigate("/chofer");
        break;
      case "ayudante":
        navigate("/ayudante");
        break;
      default:
        alert("Rol no válido.");
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const user = data.user;

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("rol")
        .eq("id", user.id)
        .single();

      if (userError || !userData) {
        alert("No se encontró el rol del usuario.");
        return;
      }

      if (recordarme) {
        localStorage.setItem("email", email);
      } else {
        localStorage.removeItem("email");
      }

      redirectByRole(userData.rol);
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      alert("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={4} sx={{ p: 4, mt: 10 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Iniciar sesión
        </Typography>
        <Box display="flex" flexDirection="column" gap={3}>
          <TextField
            label="Correo electrónico"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Contraseña"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={recordarme}
                onChange={(e) => setRecordarme(e.target.checked)}
              />
            }
            label="Recordarme"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Ingresar"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;