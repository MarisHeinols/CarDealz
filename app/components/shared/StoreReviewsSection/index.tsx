import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { StoreReview } from "~/types/types";
import {
  getMyStoreReview,
  getStoreReviews,
  upsertStoreReview,
} from "~/services/reviewsService";
import { getUserProfile } from "~/services/usersService";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { useStorefrontSettings } from "~/hooks/useStorefrontSettings";
import { readableTextOn } from "~/utils/color";

type Props = {
  storeUid: string;
  viewerUid: string | null;
  ownerUid: string;
  onStatsChange?: (stats: { avg: number; count: number }) => void;
  useStoreTheme?: boolean;
};

export default function StoreReviewsSection({
  storeUid,
  viewerUid,
  ownerUid,
  onStatsChange,
  useStoreTheme = false,
}: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const storefront = useStorefrontSettings();
  const theme = useStoreTheme ? storefront?.theme : null;
  const cardBg = theme?.secondary || theme?.background || "";
  const onCard = readableTextOn(cardBg, "dark");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [myReview, setMyReview] = useState<StoreReview | null>(null);
  const [viewerRole, setViewerRole] = useState<
    "individual" | "business" | null
  >(null);
  const [text, setText] = useState("");

  const mayAttemptReview = Boolean(
    viewerUid && viewerUid !== ownerUid && !myReview,
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      getStoreReviews(storeUid),
      viewerUid ? getMyStoreReview(storeUid, viewerUid) : Promise.resolve(null),
      viewerUid ? getUserProfile(viewerUid) : Promise.resolve(null),
    ])
      .then(([all, mine, viewerProfile]) => {
        if (cancelled) return;
        setReviews(all);
        setMyReview(mine);
        setViewerRole(viewerProfile?.role || null);
        setText(mine?.text ?? "");
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [storeUid, viewerUid]);

  useEffect(() => {
    onStatsChange?.({ avg: 0, count: reviews.length });
  }, [onStatsChange, reviews.length]);

  const handleSave = async () => {
    if (!viewerUid) return;
    if (!mayAttemptReview) return;
    const txt = String(text || "").trim();
    if (txt.length < 3) {
      dispatch(
        showNotification({
          message: t("reviews.write_short"),
          severity: "warning",
        }),
      );
      return;
    }

    setSaving(true);
    try {
      const viewerProfile = await getUserProfile(viewerUid);
      if (viewerProfile?.role && viewerProfile.role !== "individual") {
        dispatch(
          showNotification({
            message: t("reviews.only_individuals"),
            severity: "warning",
          }),
        );
        return;
      }
      const reviewerName =
        viewerProfile?.role === "individual"
          ? `${viewerProfile?.name || ""} ${viewerProfile?.surname || ""}`.trim() ||
            "User"
          : "User";

      await upsertStoreReview({
        storeUid,
        reviewerUid: viewerUid,
        reviewerName,
        text: txt,
      });

      dispatch(
        showNotification({
          message: t("reviews.submitted"),
          severity: "success",
        }),
      );

      const [all, mine] = await Promise.all([
        getStoreReviews(storeUid),
        getMyStoreReview(storeUid, viewerUid),
      ]);
      setReviews(all);
      setMyReview(mine);
    } catch (e: any) {
      dispatch(
        showNotification({
          message: e?.message || t("common.error"),
          severity: "error",
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={1}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            color: theme ? theme.heading || onCard.text : undefined,
          }}
        >
          {t("reviews.title")}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography
            variant="body2"
            sx={{
              color: theme ? onCard.subtext : undefined,
            }}
          >
            {reviews.length ? `(${reviews.length})` : t("reviews.none")}
          </Typography>
        </Stack>
      </Stack>

      {loading ? <LinearProgress sx={{ mt: 2 }} /> : null}

      <Divider sx={{ my: 2 }} />

      {!viewerUid ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("reviews.login_required")}
        </Alert>
      ) : viewerUid === ownerUid ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("reviews.own_page")}
        </Alert>
      ) : myReview ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t("reviews.submitted")}
        </Alert>
      ) : viewerRole === "business" ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t("reviews.only_individuals")}
        </Alert>
      ) : null}

      {mayAttemptReview && viewerRole !== "business" ? (
        <Card
          variant="outlined"
          sx={{
            mb: 2,
            bgcolor: theme ? theme.secondary || "" : undefined,
            color: theme ? onCard.text : undefined,
          }}
        >
          <CardContent>
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              {t("reviews.leave")}
            </Typography>
            <Stack spacing={1.5}>
              <TextField
                label={t("reviews.label")}
                value={text}
                onChange={(e) => setText(e.target.value)}
                multiline
                minRows={3}
                placeholder={t("reviews.placeholder")}
                sx={{
                  "& .MuiInputBase-root": {
                    bgcolor: theme
                      ? theme.background || "rgba(255,255,255,0.08)"
                      : undefined,
                    color: theme ? onCard.text : undefined,
                  },
                  "& .MuiInputLabel-root": {
                    color: theme ? onCard.subtext : undefined,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme
                      ? onCard.isDarkBg
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(0,0,0,0.2)"
                      : undefined,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme
                      ? onCard.isDarkBg
                        ? "rgba(255,255,255,0.35)"
                        : "rgba(0,0,0,0.35)"
                      : undefined,
                  },
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  sx={
                    theme
                      ? {
                          bgcolor: theme.accent || theme.primary,
                          "&:hover": {
                            bgcolor: theme.accent || theme.primary,
                            filter: "brightness(0.92)",
                          },
                        }
                      : undefined
                  }
                >
                  {saving
                    ? t("reviews.saving")
                    : myReview
                      ? t("reviews.update")
                      : t("reviews.submit")}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      <Stack spacing={2}>
        {reviews.map((r) => (
          <Card
            key={r.id}
            variant="outlined"
            sx={{
              bgcolor: theme ? theme.secondary || "" : undefined,
              color: theme ? onCard.text : undefined,
            }}
          >
            <CardContent>
              <Stack spacing={0.5}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography fontWeight={700}>{r.reviewerName}</Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: theme ? onCard.subtext : undefined }}
                  >
                    {new Date(r.updatedAt || r.createdAt).toLocaleDateString()}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {r.text}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
