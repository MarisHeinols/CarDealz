import { Box, IconButton } from "@mui/material";
import React from "react";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

type ImageCarouselProps = {
  images: string[];
  onDelete?: (index: number) => void;
  onUploadMore?: () => void;
};

const ImageCarousel = ({
  images,
  onDelete,
  onUploadMore,
}: ImageCarouselProps) => {
  const [activeStep, setActiveStep] = React.useState(0);

  React.useEffect(() => {
    if (activeStep >= images.length) {
      setActiveStep(Math.max(images.length - 1, 0));
    }
  }, [images, activeStep]);

  if (!images.length) return null;

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Box
        sx={{
          position: "relative",
          height: "85%",
          borderRadius: 2,
          overflow: "hidden",
          mb: 1,
        }}
      >
        <Box
          component="img"
          src={images[activeStep]}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 1, overflowX: "auto" }}>
        {images.map((img, idx) => (
          <Box key={idx} sx={{ position: "relative", flexShrink: 0 }}>
            <Box
              component="img"
              src={img}
              onClick={() => setActiveStep(idx)}
              sx={{
                width: 90,
                height: 60,
                objectFit: "cover",
                borderRadius: 1,
                cursor: "pointer",
                border:
                  idx === activeStep
                    ? "2px solid #7b1fa2"
                    : "2px solid transparent",
              }}
            />

            {onDelete && (
              <IconButton
                size="small"
                onClick={() => onDelete(idx)}
                sx={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  bgcolor: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  width: 20,
                  height: 20,
                }}
              >
                ✕
              </IconButton>
            )}
          </Box>
        ))}

        {onUploadMore && (
          <Box
            onClick={onUploadMore}
            sx={{
              width: 90,
              height: 60,
              borderRadius: 1,
              border: "2px dashed #aaa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            +
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ImageCarousel;
