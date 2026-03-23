import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useSearchParams,
  useNavigate,
} from "react-router";
import { Box, CircularProgress, Typography, Button } from "@mui/material";

import type { Route } from "./+types/root";
import "./app.css";
import "./i18n";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./mui/theme";
import Header from "./components/shared/Header";
import Footer from "./components/shared/Footer";
import CookieBanner from "./components/shared/CookieBanner";
import { store } from "./redux/store";
import { Provider } from "react-redux";
import { FirebaseAuthProvider } from "./provider/FirebaseAuthProvider";
import { UserPreferencesProvider } from "./context/UserPreferencesContext";
import GlobalSnackbar from "./components/shared/GlobalSnackbar";
import RegistrationGuard from "./components/shared/RegistrationGuard";
import VerificationDialog from "./components/shared/VerificationDialog";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg?v=2" },
];

function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <UserPreferencesProvider>
          <CssBaseline />
          {children}
        </UserPreferencesProvider>
      </ThemeProvider>
    </Provider>
  );
}

import i18n from "./i18n";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={i18n.language || "en"}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="canonical" href="https://baltic-auto.net/" />
        <script dangerouslySetInnerHTML={{ __html: `
          // Silence known browser extension background errors (common in Brave/Chrome extensions)
          window.addEventListener('unhandledrejection', function(event) {
            const reason = event.reason;
            const msg = (reason && (reason.message || reason)) || "";
            if (typeof msg === 'string' && msg.includes('tabs:outgoing.message.ready')) {
              event.preventDefault();
              event.stopImmediatePropagation();
              return false;
            }
          });
          // Also catch generic Error thrown by extensions
          window.addEventListener('error', function(event) {
             const msg = (event.error && event.error.message) || event.message || "";
             if (typeof msg === 'string' && msg.includes('tabs:outgoing.message.ready')) {
               event.preventDefault();
               event.stopImmediatePropagation();
               return false;
             }
          });
        ` }} />
      </head>
      <body>
        <GlobalProviders>
          {children}
        </GlobalProviders>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const showVerifyPhone = searchParams.get("verify_phone") === "1";

  const handleCloseVerify = () => {
    // Clear the param
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("verify_phone");
    setSearchParams(newParams, { replace: true });
    // Then go to verify page
    navigate("/verify-phone");
  };

  return (
    <FirebaseAuthProvider>
      <RegistrationGuard>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Header />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Outlet />
          </Box>
          <Footer />
          <CookieBanner />
          <GlobalSnackbar />
          <VerificationDialog 
            open={showVerifyPhone} 
            onClose={handleCloseVerify} 
          />
        </Box>
      </RegistrationGuard>
    </FirebaseAuthProvider>
  );
}

/**
 * HydrateFallback is rendered while the page is being hydrated on the client.
 */
export function HydrateFallback() {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">Loading app…</Typography>
    </Box>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <Box sx={{ p: 4, bgcolor: 'error.light', borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>{message}</Typography>
        <Typography variant="body1">{details}</Typography>
        {stack && (
          <Box component="pre" sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.05)', overflow: 'auto' }}>
            <code>{stack}</code>
          </Box>
        )}
        <Button 
          variant="contained" 
          onClick={() => window.location.href = '/'}
          sx={{ mt: 3 }}
        >
          Go Home
        </Button>
      </Box>
    </main>
  );
}
