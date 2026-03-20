import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  useTheme,
  alpha,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SpeedIcon from "@mui/icons-material/Speed";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import StarIcon from "@mui/icons-material/Star";

export default function AboutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Grid container sx={{ minHeight: "100vh" }}>
        {/* LEFT SIDE: BUYER FOCUSED (Purple Background) */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            bgcolor: "#6a1b9a", // Deep Purple
            background: "linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)",
            color: "white",
            p: { xs: 4, md: 8 },
            pt: { xs: 6, md: 12 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <Stack spacing={4}>
            <Box>
              <Typography
                variant="overline"
                sx={{ letterSpacing: 2, opacity: 0.8, fontWeight: 700 }}
              >
                {t("about.buyer.overline")}
              </Typography>
              <Typography
                variant="h2"
                fontWeight={900}
                sx={{
                  lineHeight: 1.1,
                  mb: 2,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                }}
              >
                {t("about.buyer.title")}
              </Typography>
              <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 400 }}>
                {t("about.buyer.subtitle")}
              </Typography>
            </Box>

            <Stack spacing={3}>
              <Typography variant="h6" fontWeight={800}>
                {t("about.buyer.howWorks")}
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                      }}
                    >
                      1
                    </Box>
                    <Typography fontWeight={700}>
                      {t("about.buyer.step1.title")}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {t("about.buyer.step1.desc")}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                      }}
                    >
                      2
                    </Box>
                    <Typography fontWeight={700}>
                      {t("about.buyer.step2.title")}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {t("about.buyer.step2.desc")}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                      }}
                    >
                      3
                    </Box>
                    <Typography fontWeight={700}>
                      {t("about.buyer.step3.title")}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {t("about.buyer.step3.desc")}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>

            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                {t("about.buyer.whyBuy.title")}
              </Typography>
              <Stack spacing={1.5}>
                {[1, 2, 3, 4, 5].map((idx) => (
                  <Stack
                    key={idx}
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                  >
                    <CheckCircleIcon sx={{ color: "#4caf50" }} />
                    <Typography variant="body1" fontWeight={500}>
                      {t(`about.buyer.whyBuy.i${idx}`)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/")}
                sx={{
                  bgcolor: "white",
                  color: "#4a148c",
                  fontWeight: 900,
                  "&:hover": { bgcolor: "#f5f5f5" },
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                }}
              >
                {t("about.buyer.cta")}
              </Button>
            </Stack>
          </Stack>
        </Grid>

        {/* RIGHT SIDE: BUSINESS FOCUSED (White Background) */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            bgcolor: "white",
            p: { xs: 4, md: 8 },
            pt: { xs: 6, md: 12 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <Stack spacing={5}>
            <Box>
              <Typography
                variant="overline"
                color="primary"
                sx={{ letterSpacing: 2, fontWeight: 700 }}
              >
                {t("about.dealer.overline")}
              </Typography>
              <Typography
                variant="h2"
                fontWeight={900}
                color="text.primary"
                sx={{
                  lineHeight: 1.1,
                  mb: 2,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                }}
              >
                {t("about.dealer.title")}
              </Typography>
              <Typography variant="h5" color="text.secondary">
                {t("about.dealer.subtitle")}
              </Typography>
            </Box>

            {/* PRICING PLANS */}
            <Stack spacing={3}>
              <Typography variant="h6" fontWeight={800}>
                {t("about.dealer.pricingTitle")}
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 4,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  borderColor: "primary.main",
                  borderWidth: "2px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 20,
                    right: -35,
                    bgcolor: "primary.main",
                    color: "white",
                    px: 6,
                    py: 0.5,
                    transform: "rotate(45deg)",
                    fontSize: "0.75rem",
                    fontWeight: 900,
                    boxShadow: 2,
                  }}
                >
                  {t("about.dealer.plans.free.chip")}
                </Box>

                <Grid container spacing={4} alignItems="center">
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Typography
                      variant="h3"
                      fontWeight={900}
                      sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}
                    >
                      <Typography
                        component="span"
                        variant="h5"
                        sx={{
                          textDecoration: "line-through",
                          opacity: 0.4,
                          fontWeight: 700,
                        }}
                      >
                        {t("about.dealer.plans.paid.price")}
                      </Typography>
                      {t("about.dealer.plans.free.price")}
                      <Typography
                        variant="subtitle1"
                        sx={{ opacity: 0.6, fontWeight: 700 }}
                      >
                        {t("about.dealer.plans.free.perMonth")}
                      </Typography>
                    </Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                      {t("about.dealer.plans.free.title")}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mt: 1, mb: 3 }}
                    >
                      {t("about.dealer.subtitle")}
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={() => navigate("/register")}
                      sx={{ fontWeight: 900, borderRadius: 2, py: 1.5 }}
                    >
                      {t("about.dealer.plans.free.cta")}
                    </Button>
                  </Grid>

                  <Grid size={{ xs: 12, md: 7 }}>
                    <List dense disablePadding>
                      {(
                        t("about.dealer.plans.free.features", {
                          returnObjects: true,
                        }) as string[]
                      ).map((text, i) => (
                        <ListItem key={i} disableGutters>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircleIcon
                              sx={{
                                fontSize: 20,
                                color: "primary.main",
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={text}
                            primaryTypographyProps={{
                              fontWeight: i === 0 ? 800 : 500,
                              fontSize: "1rem",
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </Paper>
            </Stack>

            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                {t("about.dealer.whyChoose.title")}
              </Typography>
              <Grid container spacing={2}>
                {[1, 2].map((idx) => {
                  const items = [
                    {
                      icon: <AnalyticsIcon color="primary" />,
                      title: t(`about.dealer.whyChoose.f${idx}.title`),
                      desc: t(`about.dealer.whyChoose.f${idx}.desc`),
                    },
                    {
                      icon: <TrendingUpIcon color="primary" />,
                      title: t(`about.dealer.whyChoose.f${idx}.title`),
                      desc: t(`about.dealer.whyChoose.f${idx}.desc`),
                    },
                  ];
                  const item = items[idx - 1];

                  return (
                    <Grid key={idx} size={{ xs: 12, sm: 6 }}>
                      <Stack spacing={1}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {item.icon}
                          <Typography fontWeight={700}>{item.title}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.desc}
                        </Typography>
                      </Stack>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            <Box
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                p: 3,
                borderRadius: 4,
                borderLeft: "4px solid",
                borderLeftColor: "primary.main",
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                {t("about.dealer.exclusiveTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("about.dealer.exclusiveDesc")}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                p: 3,
                borderRadius: 4,
                borderLeft: "4px solid",
                borderLeftColor: "primary.main",
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                {t("about.dealer.uniqueTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("about.dealer.uniqueDesc")}
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
