// src/components/adminDashboardPageComponents/AdminSettingsPanel.tsx
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AppearanceSettings from "../AppearenceSettings";
import BrandingSettings from "../BrandingSettings";
import LocationSettings from "../LocationSettings";
import StoreInfoSettings from "../StoreInfoSettings";

const AdminSettingsPanel = () => {
  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Appearance</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AppearanceSettings />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Branding</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <BrandingSettings />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Store Info</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <StoreInfoSettings />
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Location</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <LocationSettings />
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default AdminSettingsPanel;
