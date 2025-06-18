import React from 'react';
import { AppBar, Toolbar, Typography, Avatar, Box } from '@mui/material';

export default function Header() {
  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{ backgroundColor: 'background.paper', color: 'text.primary', px: 3 }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight="bold">
          Panel del Administrador
        </Typography>
        <Box>
          <Avatar
            alt="Admin"
            src="https://i.pravatar.cc/100"
            sx={{
              width: 40,
              height: 40,
              border: '2px solid',
              borderColor: 'primary.main',
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
