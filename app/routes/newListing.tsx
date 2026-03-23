import PleaseLogin from "~/components/shared/PleaseLogin";
import { useAuth } from "~/hooks/userStore/useAuth";
import NewListingPage from "~/pages/NewListingPage";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getUserProfile } from "~/services/usersService";
import { Box, CircularProgress, Typography } from "@mui/material";

export function meta() {
  return [
    { title: "Sell Your Car - Create New Listing | BalticAuto" },
    { name: "description", content: "List your car for sale on the most popular vehicle marketplace in the Baltics. Simple, fast, and secure process." },
  ];
}

export default function NewListingRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  if (!user) {
    return <PleaseLogin />;
  }

  useEffect(() => {
    let cancelled = false;
    
    // Strict phone verification check
    if (!user.phoneNumber) {
      navigate("/verify-phone");
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
  }, [user.uid, user.phoneNumber, navigate]);

  if (allowed === null) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={6}
        flexDirection="column"
        gap={1.5}
      >
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
          Only business accounts can create listings.
        </Typography>
      </Box>
    );
  }

  return <NewListingPage />;
}
