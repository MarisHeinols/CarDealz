import { FileUploadOutlined } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React from "react";
import type { UploadFunction } from "~/types/types";

type ImageUploadProps = {
  uploadFunction: UploadFunction;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
};

const ImageUpload = ({ uploadFunction, fileInputRef }: ImageUploadProps) => {
  return (
    <IconButton component="label">
      <FileUploadOutlined />
      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple
        accept="image/*"
        onChange={(e) => uploadFunction(Array.from(e.target.files ?? []))}
      />
    </IconButton>
  );
};

export default ImageUpload;
