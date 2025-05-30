import React from "react";
import { Outlet } from "react-router-dom";
import { Typography, Box } from "@mui/material";

function BuildMyResume() {
  return (
    <Box
      sx={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 3,
        backgroundColor: "#f9f9f9",
        borderRadius: 2,
        boxShadow: 3,
        textAlign: "left",
      }}
    >
      {/* Title */}
      <Typography variant="h5" align="center" gutterBottom sx={{ color: "#333" }}>
        Build My Resume
      </Typography>

      {/* Render Child Routes */}
      <Outlet />
    </Box>
  );
}

export default BuildMyResume;