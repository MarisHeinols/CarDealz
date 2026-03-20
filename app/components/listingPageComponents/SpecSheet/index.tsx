import {
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import React, { useState } from "react";
import type { CarFeature } from "~/types/types";
import { groupFeatures } from "./helper/helper";
import { featureDefinitions } from "./featureLabels";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { useTranslation } from "react-i18next";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { updateListingFields } from "~/services/listingsService";

interface Props {
  features: CarFeature[];
  isOwner?: boolean;
  listingId?: string;
}

const SpecSheet = ({ features, isOwner, listingId }: Props) => {
  const { t } = useTranslation();
  const grouped = groupFeatures();
  const featureSet = new Set(features);

  const [open, setOpen] = useState(false);
  const [tempFeatures, setTempFeatures] = useState<CarFeature[]>(features);
  const [busy, setBusy] = useState(false);

  const handleToggleFeature = (f: CarFeature) => {
    setTempFeatures((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  const handleSave = async () => {
    if (!listingId) return;
    setBusy(true);
    try {
      await updateListingFields(listingId, { features: tempFeatures });
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Paper sx={{ p: 3, position: "relative" }}>
      {isOwner && (
        <IconButton
          size="small"
          sx={{ position: "absolute", top: 8, right: 8 }}
          onClick={() => {
            setTempFeatures(features);
            setOpen(true);
          }}
        >
          <MoreVertIcon />
        </IconButton>
      )}

      {Object.entries(grouped).map(([category, featureKeys]) => (
        <Box key={category} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {t(`featureCategories.${category}`, { defaultValue: category })}
          </Typography>

          <Grid container spacing={2}>
            {featureKeys.map((f) => {
              const enabled = featureSet.has(f);

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      opacity: enabled ? 1 : 0.6,
                    }}
                  >
                    {enabled ? (
                      <CheckCircleIcon fontSize="small" color="success" />
                    ) : (
                      <RadioButtonUncheckedIcon
                        fontSize="small"
                        sx={{ color: "rgba(0,0,0,0.3)" }}
                      />
                    )}

                    <Typography variant="body2">
                      {t(`features.${f}`, {
                        defaultValue: featureDefinitions[f].label,
                      })}
                    </Typography>
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}

      <Dialog open={open} onClose={() => !busy && setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t("listing.owner.manageFeatures", { defaultValue: "Manage Features" })}</DialogTitle>
        <DialogContent dividers>
          {Object.entries(grouped).map(([category, featureKeys]) => (
            <Box key={category} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom color="primary">
                {t(`featureCategories.${category}`, { defaultValue: category })}
              </Typography>
              <Grid container spacing={1}>
                {featureKeys.map((f) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={tempFeatures.includes(f as CarFeature)}
                          onChange={() => handleToggleFeature(f as CarFeature)}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {t(`features.${f}`, { defaultValue: featureDefinitions[f].label })}
                        </Typography>
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={busy}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={busy}>
            {busy ? <CircularProgress size={18} color="inherit" /> : t("common.save", { defaultValue: "Save" })}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SpecSheet;
