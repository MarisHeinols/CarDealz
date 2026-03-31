import { Box, Modal } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [dropTarget, setDropTarget] = useState<{
    idx: number;
    side: "left" | "right";
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerStateRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    isDown: boolean;
    didSwipe: boolean;
  }>({ pointerId: null, startX: 0, startY: 0, isDown: false, didSwipe: false });
  const [isActive, setIsActive] = useState(false);

  const canNavigate = images.length > 1;

  const goNext = useMemo(
    () => () => {
      if (!canNavigate) return;
      setActiveStep((prev) => (prev + 1) % images.length);
    },
    [canNavigate, images.length],
  );

  const goPrev = useMemo(
    () => () => {
      if (!canNavigate) return;
      setActiveStep((prev) => (prev - 1 + images.length) % images.length);
    },
    [canNavigate, images.length],
  );

  React.useEffect(() => {
    if (activeStep >= images.length) {
      setActiveStep(Math.max(images.length - 1, 0));
    }
  }, [images, activeStep]);

  useEffect(() => {
    if (!isActive && !isModalOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (!canNavigate) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isEditable =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        Boolean(target?.isContentEditable);
      if (isEditable) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [canNavigate, goNext, goPrev, isActive, isModalOpen]);

  if (!images.length) return null;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        ref={containerRef}
        tabIndex={0}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        onClick={() => {
          if (!images.length) return;
          const st = pointerStateRef.current;
          if (st.didSwipe) return;
          setIsModalOpen(true);
        }}
        onPointerDown={(e) => {
          if (!canNavigate) return;
          pointerStateRef.current.pointerId = e.pointerId;
          pointerStateRef.current.startX = e.clientX;
          pointerStateRef.current.startY = e.clientY;
          pointerStateRef.current.isDown = true;
          pointerStateRef.current.didSwipe = false;
          setIsActive(true);
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!canNavigate) return;
          const st = pointerStateRef.current;
          if (!st.isDown) return;
          if (st.pointerId !== e.pointerId) return;
          if (st.didSwipe) return;

          const dx = e.clientX - st.startX;
          const dy = e.clientY - st.startY;
          const absX = Math.abs(dx);
          const absY = Math.abs(dy);

          if (absX < 40) return;
          if (absY > absX) return;

          st.didSwipe = true;
          if (dx < 0) goNext();
          else goPrev();
        }}
        onPointerUp={(e) => {
          const st = pointerStateRef.current;
          if (st.pointerId === e.pointerId) {
            st.isDown = false;
            st.pointerId = null;
          }
        }}
        onPointerCancel={(e) => {
          const st = pointerStateRef.current;
          if (st.pointerId === e.pointerId) {
            st.isDown = false;
            st.pointerId = null;
          }
        }}
        sx={{
          position: "relative",
          flex: "1 1 auto",
          minHeight: 0,
          borderRadius: 2,
          overflow: "hidden",
          mb: 1,
          touchAction: "pan-y",
          outline: "none",
        }}
      >
        <Box
          component="img"
          src={images[activeStep]}
          draggable={false}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            cursor: "pointer",
          }}
        />
      </Box>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-label="Image preview"
      >
        <Box
          onClick={() => setIsModalOpen(false)}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 1.5, md: 4 },
            outline: "none",
          }}
        >
          <Box
            component="img"
            src={images[activeStep]}
            onClick={(e) => e.stopPropagation()}
            sx={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              borderRadius: 1,
            }}
          />
        </Box>
      </Modal>

      <Box
        sx={{
          flex: "0 0 auto",
          display: "flex",
          gap: 1.5,
          overflowX: "auto",
          pb: 1,
          alignItems: "center",
        }}
      >
        {images.map((img, idx) => {
          const isDraggingThis = draggedIdx === idx;
          const isHoveredTarget = dropTarget?.idx === idx && !isDraggingThis;
          const isSorting = draggedIdx !== null && !isDraggingThis;
          const dropSide = isHoveredTarget ? (dropTarget?.side ?? null) : null;

          return (
            <Box
              key={idx}
              draggable={!!onMove}
              onDragStart={(e) => {
                if (!onMove) return;
                try {
                  const transparentImg = new Image();
                  transparentImg.src =
                    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                  e.dataTransfer.setDragImage(transparentImg, 0, 0);
                } catch {
                  // ignore
                }
                setDraggedIdx(idx);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragEnter={(e) => {
                if (!onMove) return;
                e.preventDefault();
                setDragOverIdx(idx);
              }}
              onDragOver={(e) => {
                if (!onMove) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";

                const rect = (
                  e.currentTarget as HTMLElement
                ).getBoundingClientRect();
                const x = e.clientX - rect.left;
                const side = x < rect.width / 2 ? "left" : "right";
                setDropTarget({ idx, side });
              }}
              onDragLeave={(e) => {
                if (!onMove) return;
                if (dragOverIdx === idx) setDragOverIdx(null);
                if (dropTarget?.idx === idx) setDropTarget(null);
              }}
              onDrop={(e) => {
                if (!onMove) return;
                e.preventDefault();
                if (onMove && draggedIdx !== null) {
                  const target = dropTarget?.idx === idx ? dropTarget : null;
                  const insertAt = target
                    ? target.side === "left"
                      ? idx
                      : idx + 1
                    : idx;

                  // If moving forward, account for the removal of the dragged item.
                  const toIndex =
                    draggedIdx < insertAt
                      ? Math.max(insertAt - 1, 0)
                      : insertAt;

                  if (toIndex !== draggedIdx) {
                    onMove(draggedIdx, toIndex);

                    if (activeStep === draggedIdx) setActiveStep(toIndex);
                    else if (activeStep === toIndex) setActiveStep(draggedIdx);
                  }
                }
                setDraggedIdx(null);
                setDragOverIdx(null);
                setDropTarget(null);
              }}
              onDragEnd={() => {
                if (!onMove) return;
                setDraggedIdx(null);
                setDragOverIdx(null);
                setDropTarget(null);
              }}
              sx={{
                position: "relative",
                flexShrink: 0,
                opacity: isDraggingThis ? 0.4 : 1,
                transform: isDraggingThis ? "scale(1.05)" : "scale(1)",
                transition: "all 0.2s ease-out",
                transformOrigin: "center center",
                "&::before": isHoveredTarget
                  ? {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      width: "4px",
                      bgcolor: "primary.main",
                      borderRadius: 1,
                      ...(dropSide === "right"
                        ? { right: -10 }
                        : { left: -10 }),
                    }
                  : undefined,
              }}
            >
              <Box
                component="img"
                src={img}
                onClick={() => setActiveStep(idx)}
                draggable={false}
                sx={{
                  width: 90,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 1,
                  display: "block",
                  boxShadow: isDraggingThis
                    ? "0px 8px 16px rgba(0,0,0,0.3)"
                    : "0px 2px 4px rgba(0,0,0,0.1)",
                  cursor: onMove
                    ? isDraggingThis
                      ? "grabbing"
                      : "grab"
                    : "pointer",
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
