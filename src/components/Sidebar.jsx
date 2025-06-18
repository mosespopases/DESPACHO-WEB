import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Box, Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Map as MapIcon,
  Logout as LogoutIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';

const drawerWidth = 240;

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { label: 'Asignar Personal', icon: <PeopleIcon />, path: '/admin/asignar' },
    { label: 'Ver Rutas', icon: <MapIcon />, path: '/admin/rutas' },
    { label: 'Distribución', icon: <LocalShippingIcon />, path: '/admin/distribucion' }, // Ruta corregida ✅
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#fafafa',
          borderRight: '1px solid #e0e0e0',
        },
      }}
    >
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="primary" fontWeight="bold">
          Despacho
        </Typography>
      </Box>

      <Divider />

      <List>
        {navItems.map(({ label, icon, path }) => (
          <ListItemButton
            key={label}
            component={Link}
            to={path}
            selected={location.pathname === path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
              },
            }}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <List sx={{ mt: 'auto' }}>
        <ListItemButton component={Link} to="/logout">
          <ListItemIcon sx={{ color: 'error.main' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" sx={{ color: 'error.main' }} />
        </ListItemButton>
      </List>
    </Drawer>
  );
}