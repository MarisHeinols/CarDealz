import { Box, IconButton } from "@mui/material";
import React, { useState } from "react";
import RemoveIcon from "@mui/icons-material/Remove";

type ImageCarouselProps = {
  images: string[];
  onDelete?: (index: number) => void;
  onUploadMore?: () => void;
  onMove?: (fromIndex: number, toIndex: number) => void;
};

const ImageCarousel = ({
  images,
  onDelete,
  onUploadMore,
  onMove,
}: ImageCarouselProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

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

      <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1, alignItems: "center" }}>
        {images.map((img, idx) => (
          <Box
            key={idx}
            draggable={!!onMove}
            onDragStart={(e) => {
              setDraggedIdx(idx);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (onMove && draggedIdx !== null && draggedIdx !== idx) {
                onMove(draggedIdx, idx);
                if (activeStep === draggedIdx) setActiveStep(idx);
                else if (activeStep === idx) setActiveStep(draggedIdx);
              }
              setDraggedIdx(null);
            }}
            onDragEnd={() => setDraggedIdx(null)}
            sx={{
              position: "relative",
              flexShrink: 0,
              opacity: draggedIdx === idx ? 0.3 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <Box
              component="img"
              src={img}
              onClick={() => setActiveStep(idx)}
              sx={{
                width: 90,
                height: 60,
                objectFit: "cover",
                borderRadius: 1,
                cursor: onMove ? "grab" : "pointer",
                border:
                  idx === activeStep
                    ? "2px solid #7b1fa2"
                    : "2px solid transparent",
                "&:active": {
                  cursor: onMove ? "grabbing" : "pointer",
                },
              }}
            />

            {onDelete && (
              <Box
                component="div"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(idx);
                }}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  bgcolor: "rgba(0,0,0,0.8)",
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 2,
                  "&:hover": { bgcolor: "black" },
                }}
              >
                <RemoveIcon sx={{ fontSize: 10, color: "white" }} />
              </Box>
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
              "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
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
