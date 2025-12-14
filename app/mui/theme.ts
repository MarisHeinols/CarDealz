import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    success: { main: "#22c55e" },
    warning: { main: "#f59e0b" },
    info: { main: "#3b82f6" },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #eee",
          fontSize: 14,
        },
        head: {
          fontWeight: 600,
          color: "#6b7280",
          textTransform: "uppercase",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
          textTransform: "lowercase",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 6,
          borderRadius: 4,
        },
      },
    },
  },
});

export default theme;