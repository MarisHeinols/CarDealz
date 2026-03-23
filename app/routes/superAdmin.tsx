import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Box, CircularProgress, Typography } from "@mui/material";
import SuperAdminPage from "~/pages/SuperAdminPage";
import { useAuth } from "~/hooks/userStore/useAuth";
import { getUserProfile } from "~/services/usersService";

export function meta() {
  return [
    { title: "Super Admin | CarDealz" },
    { name: "description", content: "Super Admin panel for approvals" },
  ];
}

export default function SuperAdminRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      navigate("/login");
      return;
    }

    // Check custom claims from idToken
    user.getIdTokenResult().then((result) => {
      if (cancelled) return;
      if (result.claims.admin === true) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }
    }).catch(() => {
      if (!cancelled) setAllowed(false);
    });

    return () => {
      cancelled = true;
    };
  }, [navigate, user]);

  if (allowed === null) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (allowed === false) {
    return (
      <Box p={10} textAlign="center">
        <Typography variant="h5" fontWeight={700} color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography color="text.secondary">
          This page is restricted to site administrators only.
        </Typography>
      </Box>
    );
  }

  return <SuperAdminPage />;
}
