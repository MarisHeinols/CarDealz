import { Box, Button, MobileStepper, IconButton } from "@mui/material";
import React from "react";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

const ImageCarousel = ({ images }: { images: string[] }) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const maxSteps = images.length;

  const handleNext = () => {
    setActiveStep((prev) => (prev + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prev) => (prev - 1 + maxSteps) % maxSteps);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - left;

    if (clickX < width * 0.3) {
      handleBack();
    } else if (clickX > width * 0.7) {
      handleNext();
    }
  };

  return (
    <Box sx={{ maxWidth: "100%" }}>
      <Box
        onClick={handleImageClick}
        sx={{
          position: "relative",
          cursor: "pointer",
          "&:hover .carousel-arrow": {
            opacity: 1,
          },
        }}
      >
        <Box
          component="img"
          src={images[activeStep]}
          alt="Car"
          sx={{
            width: "100%",
            height: 450,
            objectFit: "cover",
            borderRadius: 2,
            boxShadow: 3,
            userSelect: "none",
          }}
        />
        {maxSteps > 1 && (
          <>
            {" "}
            {/* Left Arrow */}
            <IconButton
              className="carousel-arrow"
              onClick={(e) => {
                e.stopPropagation();
                handleBack();
              }}
              sx={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(0,0,0,0.5)",
                color: "#fff",
                opacity: 0,
                transition: "opacity 0.2s",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.7)",
                },
              }}
            >
              <KeyboardArrowLeft />
            </IconButton>
            {/* Right Arrow */}
            <IconButton
              className="carousel-arrow"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              sx={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(0,0,0,0.5)",
                color: "#fff",
                opacity: 0,
                transition: "opacity 0.2s",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.7)",
                },
              }}
            >
              <KeyboardArrowRight />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ImageCarousel;
