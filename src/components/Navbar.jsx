import React, { useEffect, useState } from "react";
import {
  AppBar, Toolbar, Typography, IconButton, Menu,
  MenuItem, Box, Avatar
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { supabase } from "../supabase/supabaseClient";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState("");

  useEffect(() => {
    const obtenerUsuario = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (user) {
        const { data, error } = await supabase
          .from("usuarios")
          .select("nombre")
          .eq("user_id", user.id)
          .single();

        if (data?.nombre) {
          setNombreUsuario(data.nombre);
        } else {
          setNombreUsuario(user.email);
        }
      } else {
        setNombreUsuario("");
      }
    };

    obtenerUsuario();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => obtenerUsuario());

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <AppBar position="static" color="primary" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight="bold">
          Panel de Administración
        </Typography>

        <Box>
          <IconButton onClick={handleMenu} color="inherit" size="large">
            <Avatar sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}>
              {nombreUsuario ? nombreUsuario[0]?.toUpperCase() : <AccountCircle />}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem disabled>{nombreUsuario}</MenuItem>
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;