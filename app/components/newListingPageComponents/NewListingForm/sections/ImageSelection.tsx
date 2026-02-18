import React, { useRef, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import ImageUpload from "~/components/shared/ImageUpload";
import ImageCarousel from "~/components/listingPageComponents/ImageCarousel";

interface Props {
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>; // <-- fixed type
}

export default function ImagesSection({ images, setImages }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUrls = useMemo(
    () => images.map((f) => URL.createObjectURL(f)),
    [images],
  );

  const handleUpload = (files: File[]) =>
    setImages((prev) => [...prev, ...files]);
  const handleDelete = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

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
      }}
    >
      {images.length ? (
        <ImageCarousel
          images={imageUrls}
          onDelete={handleDelete}
          onUploadMore={() => fileInputRef.current?.click()}
        />
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
            fileInputRef={fileInputRef}
          />
        </Box>
      )}
    </Box>
  );
}
