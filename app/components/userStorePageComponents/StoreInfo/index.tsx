import { Button, Paper, Typography, Stack, Divider } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmailIcon from "@mui/icons-material/Email";
import type { StoreTheme } from "~/redux/slices/storeSettingsSlice";
interface StoreInfoProps {
  theme: StoreTheme;
  phoneNr: string | undefined;
  email: string | undefined;
}
const StoreInfo = ({ theme, phoneNr, email }: StoreInfoProps) => {
  const textColor = theme.isTextLight ? "white" : "black";
  return (
    <Paper sx={{ p: 3, bgcolor: theme.secondary }}>
      <Stack spacing={2}>
        <Stack spacing={1}>
          <Typography variant="body2" sx={{ color: textColor }}>
            <LocationOnIcon /> 123 Main Street, Berlin, Germany
          </Typography>
          <Typography variant="body2" sx={{ color: textColor }}>
            <AccessTimeIcon /> Mon–Fri 09:00 – 18:00
          </Typography>
          <Typography variant="body2" sx={{ color: textColor }}>
            <PhoneIcon /> {phoneNr}
          </Typography>
          <Typography variant="body2" sx={{ color: textColor }}>
            <EmailIcon /> {email}
          </Typography>
        </Stack>

        <Button variant="contained" fullWidth sx={{ bgcolor: theme.primary }}>
          Contact Seller
        </Button>

        <Divider />

        <Stack direction="row" spacing={3}>
          <Typography variant="body2" sx={{ color: textColor }}>
            <strong>42</strong> listings
          </Typography>
          <Typography variant="body2" sx={{ color: textColor }}>
            <strong>120k</strong> views
          </Typography>
          <Typography variant="body2" sx={{ color: textColor }}>
            <strong>4.8★</strong> rating
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default StoreInfo;
