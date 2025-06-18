import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

// Mapeo de colores similares a Tailwind
const colorMap = {
  blue: {
    background: '#DBEAFE',    // bg-blue-100
    text: '#1E40AF',          // text-blue-800
  },
  green: {
    background: '#D1FAE5',    // bg-green-100
    text: '#065F46',          // text-green-800
  },
  red: {
    background: '#FECACA',    // bg-red-100
    text: '#991B1B',          // text-red-800
  },
  purple: {
    background: '#E9D5FF',    // bg-purple-100
    text: '#6B21A8',          // text-purple-800
  },
  gray: {
    background: '#F3F4F6',    // bg-gray-100
    text: '#1F2937',          // text-gray-800
  },
};

export default function CardResumen({ title, value, icon, color = 'gray' }) {
  const { background, text } = colorMap[color] || colorMap.gray;

  return (
    <Card
      elevation={3}
      sx={{
        backgroundColor: background,
        transition: '0.3s',
        '&:hover': {
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: text }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: text, fontSize: '2rem' }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}