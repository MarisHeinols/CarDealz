import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "~/hooks/userStore/useAuth";
import { useUserProfile } from "~/hooks/userStore/useUserProfile";
import { Box, CircularProgress } from "@mui/material";

interface RegistrationGuardProps {
  children: React.ReactNode;
}

/**
 * RegistrationGuard ensures that logged-in users have completed their registration (i.e., they have a 'role').
 * If they are logged in but incomplete, they are redirected to /register?social=1.
 */
export default function RegistrationGuard({ children }: RegistrationGuardProps) {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const [isPatient, setIsPatient] = useState(false);

  useEffect(() => {
    // Wait at least 1 second for Firestore to potentially sync new docs
    const timer = setTimeout(() => setIsPatient(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading || !user || !isPatient) return;

    const isOnRegisterPage = location.pathname.startsWith("/register");
    const isOnLegalPage = location.pathname.startsWith("/terms") || location.pathname.startsWith("/privacy");
    const isOnVerifyPage = location.pathname.startsWith("/verify-phone");

    // If logged in but no profile role, and not already on allowed pages
    if (!profile?.role && !isOnRegisterPage && !isOnLegalPage && !isOnVerifyPage) {
      navigate("/register?social=1");
    }
  }, [user, profile, loading, location.pathname, navigate, isPatient]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
