import React, { useState, useEffect, useRef } from "react";
import { TextField, type TextFieldProps } from "@mui/material";

interface DebouncedTextFieldProps extends Omit<TextFieldProps, "onChange"> {
  value: string | number;
  onChange: (value: string) => void;
  debounceMs?: number;
}

export default function DebouncedTextField({
  value,
  onChange,
  debounceMs = 300,
  ...textFieldProps
}: DebouncedTextFieldProps) {
  const [localValue, setLocalValue] = useState(
    value !== undefined && value !== null ? String(value) : "",
  );
  const timeoutRef = useRef<NodeJS.Timeout | undefined>();

  useEffect(() => {
    setLocalValue(value !== undefined && value !== null ? String(value) : "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <TextField {...textFieldProps} value={localValue} onChange={handleChange} />
  );
}
