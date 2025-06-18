// src/components/VolverAtras.jsx
import { IconButton, Typography, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const VolverAtras = ({ titulo }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
      <IconButton onClick={() => navigate(-1)} color="primary">
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h5" sx={{ ml: 1 }}>
        {titulo}
      </Typography>
    </Box>
  );
};

export default VolverAtras;