import { Button, Paper, Typography, Stack, Divider } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const StoreInfo = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack spacing={1}>
          <Typography variant="body2">
            <LocationOnIcon /> 123 Main Street, Berlin, Germany
          </Typography>
          <Typography variant="body2">
            {" "}
            <AccessTimeIcon /> Mon–Fri 09:00 – 18:00
          </Typography>
          <Typography variant="body2">
            <PhoneIcon /> +49 123 456 789
          </Typography>
        </Stack>

        <Button variant="contained" fullWidth>
          Contact Seller
        </Button>

        <Divider />

        <Stack direction="row" spacing={3}>
          <Typography variant="body2">
            <strong>42</strong> listings
          </Typography>
          <Typography variant="body2">
            <strong>120k</strong> views
          </Typography>
          <Typography variant="body2">
            <strong>4.8★</strong> rating
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default StoreInfo;
