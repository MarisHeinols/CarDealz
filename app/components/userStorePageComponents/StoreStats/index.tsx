import { Grid, Paper, Typography } from "@mui/material";

const StoreStats = () => (
  <Grid container spacing={1} sx={{ mb: 3 }}>
    {[
      { label: "Listings", value: 42 },
      { label: "Total Views", value: "120k" },
      { label: "Rating", value: "4.8 ★" },
    ].map((stat) => (
      <Grid size={{ xs: 12, md: 6 }} key={stat.label}>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h6">{stat.value}</Typography>
          <Typography color="text.secondary" variant="body2">
            {stat.label}
          </Typography>
        </Paper>
      </Grid>
    ))}
  </Grid>
);

export default StoreStats;
