import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "~/hooks/userStore/useAuth";
import { getStoreHandleForUid } from "~/services/storeHandleService";
import { useTranslation } from "react-i18next";
import { getUserProfile } from "~/services/usersService";

export function meta() {
  return [
    { title: "User landing page" },
    { name: "description", content: "Users landing page" },
  ];
}

export default function NewUserStoreRoute() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      navigate("/login");
      return;
    }


    setBusy(true);
    getStoreHandleForUid(user.uid)
      .then((handle) => {
        if (cancelled) return;
        navigate(`/store/${handle || user.uid}`, { replace: true });
      })
      .catch(() => {
        if (cancelled) return;
        navigate(`/store/${user.uid}`, { replace: true });
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, user]);

  if (!busy) return null;

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
      <Typography color="text.secondary">{t("about.store.opening")}</Typography>
    </Box>
  );
}
