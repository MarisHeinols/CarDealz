import {
  Grid,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import React, { useState } from "react";
import type { CarListingDetails } from "~/types/types";
import { useTranslation } from "react-i18next";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { updateListingFields } from "~/services/listingsService";
import { invalidateCache, cacheKeyListingDetails } from "~/services/listingsCache";

interface Props {
  listing: CarListingDetails;
  isOwner?: boolean;
  mutate?: (updater: (prev: any) => any) => void;
}

const DetailsCard = ({ listing, isOwner, mutate }: Props) => {
  const { t } = useTranslation();
  const [editData, setEditData] = useState<{
    key: string;
    label: string;
    value: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const handleEditClick = (key: string, label: string, value: any) => {
    setEditData({ key, label, value: value?.toString() || "" });
  };

  const handleSave = async () => {
    if (!editData) return;
    setBusy(true);
    try {
      const value =
        editData.key === "displacement" || editData.key === "horsepower"
          ? Number(editData.value)
          : editData.value;

      await updateListingFields(listing.id, { [editData.key]: value });
      if (mutate) {
        mutate((prev: any) => prev ? { ...prev, [editData.key]: value } : prev);
      }
      invalidateCache(cacheKeyListingDetails(listing.id));
      setEditData(null);
    } catch (error) {
      console.error("Failed to update field:", error);
    } finally {
      setBusy(false);
    }
  };

  const renderValue = (labelKey: string, value: any, fieldKey: string, textTransform: any = "none") => (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minHeight: 32 }}>
      <Typography variant="body2" sx={{ flexShrink: 0 }}>
        {t(labelKey)}:{" "}
        <strong style={{ textTransform }}>
          {value || t("details.na")}
        </strong>
      </Typography>
      {isOwner && (
        <IconButton size="small" onClick={() => handleEditClick(fieldKey, t(labelKey), value)}>
          <MoreVertIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </Stack>
  );

  return (
    <>
      <Grid container spacing={1} sx={{ mt: 2, mb: 2 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          {renderValue("details.vin", listing.vin, "vin", "capitalize")}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {renderValue("details.ta", listing.ta, "ta", "capitalize")}
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {renderValue("details.plate", listing.plateNumber, "plateNumber", "uppercase")}
        </Grid>
      </Grid>

      <Grid container spacing={1}>
        <Grid size={{ xs: 6, md: 6 }}>
          {renderValue("details.fuelType", listing.fuelType ? t(`carValues.fuel_${listing.fuelType}`, { defaultValue: listing.fuelType }) : t("details.na"), "fuelType")}
          {renderValue("details.displacement", listing.displacement, "displacement")}
          {renderValue("details.drivetrain", listing.drivetrain ? t(`carValues.drivetrain_${listing.drivetrain}`, { defaultValue: listing.drivetrain }) : t("details.na"), "drivetrain")}
          {renderValue("details.transmission", listing.transmission ? t(`carValues.transmission_${listing.transmission}`, { defaultValue: listing.transmission }) : t("details.na"), "transmission")}
        </Grid>
        <Grid size={{ xs: 6, md: 6 }}>
          {renderValue("details.interiorColor", listing.interiorColor ? t(`carValues.color_${listing.interiorColor}`, { defaultValue: listing.interiorColor }) : t("details.na"), "interiorColor")}
          {renderValue("details.color", listing.color ? t(`carValues.color_${listing.color}`, { defaultValue: listing.color }) : t("details.na"), "color")}
        </Grid>
      </Grid>

      <Dialog open={Boolean(editData)} onClose={() => !busy && setEditData(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("common.edit", { defaultValue: "Edit" })} {editData?.label}</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            fullWidth
            label={editData?.label}
            value={editData?.value || ""}
            onChange={(e) => setEditData(prev => prev ? { ...prev, value: e.target.value } : null)}
            disabled={busy}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditData(null)} disabled={busy}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={busy}>
            {busy ? <CircularProgress size={18} color="inherit" /> : t("common.save", { defaultValue: "Save" })}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DetailsCard;
