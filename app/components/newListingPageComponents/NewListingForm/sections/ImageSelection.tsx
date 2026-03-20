import React, { useRef, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ImageUpload from "~/components/shared/ImageUpload";
import ImageCarousel from "~/components/listingPageComponents/ImageCarousel";
import { analyzeCarImages } from "~/services/analyzeCarImages";
import type { CarListingDetailsJson } from "~/types/types";

interface Props {
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  setListing: React.Dispatch<React.SetStateAction<CarListingDetailsJson>>;
}

export default function ImagesSection({
  images,
  setImages,
  setListing,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const emptyStateRef = useRef<HTMLInputElement>(null);

  const imageUrls = useMemo(
    () => images.map((f) => URL.createObjectURL(f)),
    [images],
  );

  const handleUpload = (files: File[]) =>
    setImages((prev) => [...prev, ...files]);
  const handleDelete = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));
  const handleMove = (fromIdx: number, toIdx: number) => {
    setImages((prev) => {
      const arr = [...prev];
      const temp = arr[fromIdx];
      arr[fromIdx] = arr[toIdx];
      arr[toIdx] = temp;
      return arr;
    });
  };

  const handleAnalyze = async () => {
    if (!images.length) return;
    setIsAnalyzing(true);
    try {
      const aiData = await analyzeCarImages(images);

      setListing((prev) => {
        const updated = { ...prev };

        // Apply each inferred field, only overwriting if the AI returned a value
        if (aiData.make) updated.make = aiData.make;
        if (aiData.model) updated.model = aiData.model;
        if (aiData.year) updated.year = aiData.year;
        if (aiData.color) updated.color = aiData.color;
        if (aiData.interiorColor) updated.interiorColor = aiData.interiorColor;
        if ((aiData as any).conditionTier)
          updated.conditionTier = (aiData as any).conditionTier;
        if (aiData.fuelType) updated.fuelType = aiData.fuelType;
        if (aiData.transmission) updated.transmission = aiData.transmission;
        if (aiData.drivetrain) updated.drivetrain = aiData.drivetrain;
        if (aiData.horsepower) updated.horsepower = aiData.horsepower;
        if (aiData.displacement) updated.displacement = aiData.displacement;
        if (aiData.description) updated.description = aiData.description;
        if (aiData.features && aiData.features.length > 0) {
          // Merge with existing features, avoiding duplicates
          const merged = Array.from(
            new Set([...prev.features, ...aiData.features]),
          );
          updated.features = merged;
        }

        return updated;
      });

      const filledFields = Object.keys(aiData).filter(
        (k) => aiData[k as keyof typeof aiData] !== undefined,
      );
      setSnackbar({
        open: true,
        message: `✨ AI filled in ${filledFields.length} field${filledFields.length !== 1 ? "s" : ""}: ${filledFields.join(", ")}`,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err instanceof Error
            ? err.message
            : "Analysis failed. Please try again.",
        severity: "error",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        aspectRatio: "16/9",
        bgcolor: "#e3e1e1",
        borderRadius: 2,
        p: 2,
        mb: 3,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Unconditional hidden input so onUploadMore always works */}
      <input
        type="file"
        hidden
        multiple
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files?.length) {
            handleUpload(Array.from(e.target.files));
            e.target.value = ""; // Reset to allow selecting the same file again
          }
        }}
      />

      {images.length ? (
        <>
          <ImageCarousel
            images={imageUrls}
            onDelete={handleDelete}
            onMove={handleMove}
            onUploadMore={() => fileInputRef.current?.click()}
          />

          {/* Floating AI Analyze Button */}
          <Tooltip
            title="Auto-fill a few details from photos (free)"
            placement="left"
          >
            <Box
              sx={{
                position: "absolute",
                bottom: 20,
                right: 20,
                zIndex: 10,
              }}
            >
              <Button
                variant="contained"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                startIcon={
                  isAnalyzing ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <AutoFixHighIcon />
                  )
                }
                sx={{
                  background: isAnalyzing
                    ? undefined
                    : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  px: 2.5,
                  py: 1,
                  borderRadius: "999px",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  textTransform: "none",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)",
                    boxShadow: "0 6px 28px rgba(99,102,241,0.7)",
                    transform: "translateY(-1px) scale(1.02)",
                  },
                  "&:active": {
                    transform: "translateY(0) scale(0.99)",
                  },
                  "&.Mui-disabled": {
                    background: "rgba(99,102,241,0.4)",
                    color: "#fff",
                  },
                }}
              >
                {isAnalyzing ? "Analyzing…" : "Analyze Photos"}
              </Button>
            </Box>
          </Tooltip>
        </>
      ) : (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography>Upload Images</Typography>
          <ImageUpload
            uploadFunction={handleUpload}
            fileInputRef={emptyStateRef}
          />
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%", maxWidth: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
