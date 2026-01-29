import { Button, Paper, Typography, Stack, Divider } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmailIcon from "@mui/icons-material/Email";
import { useAppSelector } from "~/redux/hooks";

const StoreInfo = () => {
  const theme = useAppSelector((state) => state.storeSettings.theme);
  const contact = useAppSelector((state) => state.storeSettings.contact);
  const location = useAppSelector((state) => state.storeSettings.location);

  return (
    <Paper sx={{ p: 3, bgcolor: theme.secondary }}>
      <Stack spacing={2}>
        <Stack spacing={1}>
          <Typography
            variant="body2"
            sx={{ color: theme.isTextLight ? "white" : "black" }}
          >
            <LocationOnIcon /> {location.adress || "No adress"}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: theme.isTextLight ? "white" : "black" }}
          >
            <AccessTimeIcon /> Mon–Fri 09:00 – 18:00
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: theme.isTextLight ? "white" : "black" }}
          >
            <PhoneIcon /> {contact.phone || "No phone"}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: theme.isTextLight ? "white" : "black" }}
          >
            <EmailIcon /> {contact.email || "No email"}
          </Typography>
        </Stack>

        <Button variant="contained" fullWidth sx={{ bgcolor: theme.primary }}>
          Contact Seller
        </Button>

        <Divider />

        <Stack direction="row" spacing={3}>
          <Typography
            variant="body2"
            sx={{ color: theme.isTextLight ? "white" : "black" }}
          >
            <strong>42</strong> listings
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.isTextLight ? "white" : "black" }}
          >
            <strong>120k</strong> views
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.isTextLight ? "white" : "black" }}
          >
            <strong>4.8★</strong> rating
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default StoreInfo;
