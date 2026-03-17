import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AdminDashboardPage from "~/pages/AdminDashboardPage";
import { useAuth } from "~/hooks/userStore/useAuth";
import { getUserProfile } from "~/services/usersService";

export function meta() {
  return [
    { title: "AdminDashboard" },
    { name: "description", content: "AdminDashboard page" },
  ];
}

export default function AdminDashboardRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      navigate("/login");
      return;
    }
    setAllowed(null);
    getUserProfile(user.uid)
      .then((profile) => {
        if (cancelled) return;
        setAllowed(profile?.role === "business");
      })
      .catch(() => {
        if (!cancelled) setAllowed(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate, user]);

  if (allowed === null) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={6} flexDirection="column" gap={1.5}>
        <CircularProgress />
        <Typography color="text.secondary">Checking access…</Typography>
      </Box>
    );
  }

  if (!allowed) {
    return (
      <Box p={6}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          Not authorized
        </Typography>
        <Typography color="text.secondary">
          Store editor is available only for business accounts.
        </Typography>
      </Box>
    );
  }

  return <AdminDashboardPage />;
}
