// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // ✅ Verifica que el path sea correcto

import './index.css';

// 🎨 Tema personalizado de MUI
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* ✅ Proveedor de autenticación */}
        <ThemeProvider theme={theme}> {/* 🎨 Proveedor de tema MUI */}
          <CssBaseline /> {/* 🧼 Reseteo global de estilos */}
          <LocalizationProvider dateAdapter={AdapterDateFns}> {/* 📅 Fechas en español/latino */}
            <App />
          </LocalizationProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);