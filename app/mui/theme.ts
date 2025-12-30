import { createTheme } from "@mui/material/styles";

const PURPLE = "rgb(122, 0, 129)";
const GLASS_BG = "rgba(255, 255, 255, 0.72)";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: PURPLE,
    },

    background: {
      default: "#f5f4f7",
      paper: "#ffffff",
    },

    text: {
      primary: "#111827",
      secondary: "#6b7280",
    },
  },

  shape: {
    borderRadius: 14,
  },

  typography: {
    fontFamily: `"Inter", system-ui, sans-serif`,
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },

  components: {
    /* ───────────────── AppBar (Glass) ───────────────── */
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: GLASS_BG,
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 1px 10px rgba(0,0,0,0.08)",
          color: "#111827",
        },
      },
    },

    /* ───────────────── Cards (Mostly Flat) ───────────────── */
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
            transform: "translateY(-2px)",
          },
        },
      },
    },

    /* ───────────────── Buttons (Accent only) ───────────────── */
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "8px 16px",
        },
        containedPrimary: {
          backgroundColor: PURPLE,
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "rgb(100, 0, 106)",
            boxShadow: "0 6px 18px rgba(122, 0, 129, 0.35)",
          },
        },
        textPrimary: {
          color: PURPLE,
          "&:hover": {
            backgroundColor: "rgba(122, 0, 129, 0.08)",
          },
        },
      },
    },

    /* ───────────────── Inputs (Clean + Focus Glow) ───────────────── */
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#ffffff",
            borderRadius: 10,
            "& fieldset": {
              borderColor: "rgba(0,0,0,0.15)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(0,0,0,0.25)",
            },
            "&.Mui-focused fieldset": {
              borderColor: PURPLE,
              boxShadow: `0 0 0 3px rgba(122, 0, 129, 0.15)`,
            },
          },
        },
      },
    },

    /* ───────────────── Menus / Popovers (Glass) ───────────────── */
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: GLASS_BG,
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        },
      },
    },

    /* ───────────────── Accordion (Neutral) ───────────────── */
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "none",
          "&:before": { display: "none" },
        },
      },
    },

   MuiChip: {
  styleOverrides: {
    root: {
      height: 24,
      fontSize: 12,
      fontWeight: 500,
      borderRadius: 999,
      border: "none",
    },
  },

 variants: [
  {
    // LOW — baseline
    props: { variant: "levelLow" },
    style: {
      backgroundColor: "rgba(0,0,0,0.08)",
      color: "#374151", // gray-700
    },
  },
  {
    // MEDIUM — certified / normal (BLUE)
    props: { variant: "levelMedium" },
    style: {
      backgroundColor: "rgba(59, 130, 246, 0.18)", // blue-500
      color: "#2563eb", // blue-600
    },
  },
  {
    // HIGH — premium / best (PURPLE)
    props: { variant: "levelHigh" },
    style: {
      backgroundColor: "rgba(122, 0, 129, 0.18)",
      color: PURPLE,
    },
  },
],}
  },
});

export default theme;
