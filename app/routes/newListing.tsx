import PleaseLogin from "~/components/shared/PleaseLogin";
import { useAuth } from "~/hooks/userStore/useAuth";
import NewListingPage from "~/pages/NewListingPage";
import { useEffect, useState } from "react";
import { getUserProfile } from "~/services/usersService";
import { Box, CircularProgress, Typography } from "@mui/material";

export function meta() {
  return [
    { title: "Create New Listing" },
    { name: "description", content: "Create a new car listing" },
  ];
}

export default function NewListingRoute() {
  const { user } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  if (!user) {
    return <PleaseLogin />;
  }

  useEffect(() => {
    let cancelled = false;
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
  }, [user.uid]);

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
