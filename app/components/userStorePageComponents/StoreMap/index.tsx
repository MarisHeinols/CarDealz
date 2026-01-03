import { Box, Paper, Typography } from "@mui/material";

const StoreMap = () => {
  return (
    <Paper sx={{ height: 240, overflow: "hidden" }}>
      {/* Replace with Google Maps / Mapbox later */}
      <Box
        sx={{
          height: "100%",
          backgroundColor: "#e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">
          Map will be displayed here
        </Typography>
      </Box>
    </Paper>
  );
};

export default StoreMap;
