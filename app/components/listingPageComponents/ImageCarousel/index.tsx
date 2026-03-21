import { Box } from "@mui/material";
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
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

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

      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          overflowX: "auto",
          pb: 1,
          alignItems: "center",
        }}
      >
        {images.map((img, idx) => {
          const isDraggingThis = draggedIdx === idx;
          const isHoveredTarget = dragOverIdx === idx && !isDraggingThis;
          const isSorting = draggedIdx !== null && !isDraggingThis;

          return (
            <Box
              key={idx}
              draggable={!!onMove}
              onDragStart={(e) => {
                setDraggedIdx(idx);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOverIdx(idx);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDragLeave={(e) => {
                if (dragOverIdx === idx) setDragOverIdx(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (onMove && draggedIdx !== null && draggedIdx !== idx) {
                  onMove(draggedIdx, idx);
                  if (activeStep === draggedIdx) setActiveStep(idx);
                  else if (activeStep === idx) setActiveStep(draggedIdx);
                }
                setDraggedIdx(null);
                setDragOverIdx(null);
              }}
              onDragEnd={() => {
                setDraggedIdx(null);
                setDragOverIdx(null);
              }}
              sx={{
                position: "relative",
                flexShrink: 0,
                opacity: isDraggingThis ? 0.4 : 1,
                transform: isDraggingThis ? "scale(1.05)" : "scale(1)",
                transition: "all 0.2s ease-out",
                transformOrigin: "center center",
                marginLeft:
                  isHoveredTarget && draggedIdx !== null && idx > draggedIdx
                    ? 3
                    : 0,
                marginRight:
                  isHoveredTarget && draggedIdx !== null && idx < draggedIdx
                    ? 3
                    : 0,
                "&::before": isHoveredTarget
                  ? {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      width: "4px",
                      bgcolor: "primary.main",
                      borderRadius: 1,
                      [idx > (draggedIdx ?? 0) ? "left" : "right"]: -10,
                    }
                  : undefined,
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
                  display: "block",
                  boxShadow: isDraggingThis
                    ? "0px 8px 16px rgba(0,0,0,0.3)"
                    : "0px 2px 4px rgba(0,0,0,0.1)",
                  cursor: onMove ? (isDraggingThis ? "grabbing" : "grab") : "pointer",
                  border:
                    idx === activeStep
                      ? "2px solid #7b1fa2"
                      : "2px solid transparent",
                }}
              />

              {onDelete && !isSorting && (
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
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 2,
                    "&:hover": { bgcolor: "black", transform: "scale(1.1)" },
                    transition: "transform 0.1s",
                  }}
                >
                  <RemoveIcon sx={{ fontSize: 12, color: "white" }} />
                </Box>
              )}
            </Box>
          );
        })}

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
              ml: dragOverIdx === images.length ? 3 : 0,
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
