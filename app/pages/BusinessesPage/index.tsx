import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Select,
  Stack,
  TextField,
  Typography,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AppContainer from "~/components/shared/AppContainer";
import { getBusinessUsers } from "~/services/businessesService";
import { loadStoreSettingsFromDb } from "~/services/storeSettingsService";
import { useAllListingsForStatsCached } from "~/hooks/useCachedListingsForStats";
import BusinessesMap from "~/components/businessesPageComponents/BusinessesMap";
import { useNavigate, useLocation } from "react-router";
import { useUserPreferences } from "~/context/UserPreferencesContext";
import { COUNTRIES } from "~/constants/countries";
import { useCities } from "~/hooks/useCities";
import { useTranslation } from "react-i18next";

type BusinessRow = {
  uid: string;
  name: string;
  handleOrUid: string;
  locationText: string;
  logoUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
  viewsTotal: number;
  soldLast30d: number;
  reviewCount: number;
};

type SortKey = "views" | "soldLast30d" | "name";

type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

export default function BusinessesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const prefs = useUserPreferences();
  const listingsStats = useAllListingsForStatsCached();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<BusinessRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [filtersTouched, setFiltersTouched] = useState(false);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState<string>("all");
  const [city, setCity] = useState<string>("");

  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const { cities, loading: citiesLoading } = useCities(
    !country || country === "all" ? "" : country,
  );

  useEffect(() => {
    if (filtersTouched) return;
    const loc = prefs.location;
    if (!loc) return;
    const nextCountry = loc.country ? loc.country : "all";

    setCountry((prev) => {
      if (prev && prev !== "all") return prev;
      return nextCountry;
    });
  }, [prefs.location, filtersTouched]);

  const BIZ_TTL = 5 * 60 * 1000; // 5 minutes cache for businesses

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    import("~/services/listingsCache").then(
      ({ getOrFetch, cacheKeyBusinessUsers, cacheKeyStoreSettings }) => {
        getOrFetch(cacheKeyBusinessUsers(), () => getBusinessUsers(), BIZ_TTL)
          .then(async (biz) => {
            if (cancelled) return;
            const out: BusinessRow[] = [];

            await Promise.all(
              biz.map(async (b) => {
                const uid = b.uid;
                const settings = await getOrFetch(
                  cacheKeyStoreSettings(uid),
                  () => loadStoreSettingsFromDb(uid),
                  BIZ_TTL,
                ).catch(() => null);

                const name = settings?.name || t("auth.business");
                const handleOrUid = b.storeHandle || uid;
                const locationText = settings?.location?.adress || "";
                const lat = settings?.location?.cords?.lat ?? null;
                const lng = settings?.location?.cords?.lng ?? null;
                const logoUrl = settings?.logo ?? null;

                out.push({
                  uid,
                  name,
                  handleOrUid,
                  locationText,
                  logoUrl,
                  lat,
                  lng,
                  viewsTotal: 0,
                  soldLast30d: 0,
                  reviewCount: 0,
                });
              }),
            );

            if (!cancelled) {
              setRows(out);
              setError(null);
            }
          })
          .catch((err) => {
            if (cancelled) return;
            console.error("Error loading businesses:", err);
            setError(
              err instanceof Error ? err.message : "Failed to load businesses",
            );
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [t, location.key]);

  const rowsWithStats = useMemo(() => {
    const now = Date.now();
    const last30 = 30 * 24 * 60 * 60 * 1000;
    const bySeller = new Map<string, { views: number; sold30: number }>();

    for (const l of listingsStats.listings) {
      const sellerId = (l as any).sellerId as string | undefined;
      if (!sellerId) continue;
      const entry = bySeller.get(sellerId) || { views: 0, sold30: 0 };
      entry.views += Number((l as any).viewCount || 0);
      if ((l as any).isSold) {
        const soldAt =
          typeof (l as any).soldAt === "string"
            ? Date.parse((l as any).soldAt)
            : NaN;
        if (Number.isFinite(soldAt) && now - soldAt <= last30)
          entry.sold30 += 1;
      }
      bySeller.set(sellerId, entry);
    }

    return rows.map((r) => {
      const s = bySeller.get(r.uid);
      return {
        ...r,
        viewsTotal: s?.views ?? 0,
        soldLast30d: s?.sold30 ?? 0,
      };
    });
  }, [listingsStats.listings, rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rowsWithStats.filter((r) => {
      const locationLower = (r.locationText || "").toLowerCase();
      const hay = `${r.name} ${r.locationText}`.toLowerCase();

      if (q && !hay.includes(q)) return false;

      if (country && country !== "all") {
        if (!locationLower.includes(country.toLowerCase())) return false;
      }

      if (city) {
        if (!locationLower.includes(city.toLowerCase())) return false;
      }

      return true;
    });
  }, [rowsWithStats, search, country, city]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "name") return dir * a.name.localeCompare(b.name);
      if (sortKey === "views") return dir * (a.viewsTotal - b.viewsTotal);
      if (sortKey === "soldLast30d")
        return dir * (a.soldLast30d - b.soldLast30d);
      return 0;
    });
  }, [filtered, sortDir, sortKey]);

  const top5 = useMemo(() => sorted.slice(0, 5), [sorted]);

  const mapMarkers = useMemo(() => {
    const top5Ids = new Set(top5.map((t) => t.uid));

    return filtered
      .filter((r) => typeof r.lat === "number" && typeof r.lng === "number")
      .map((r) => ({
        id: r.uid,
        name: r.name,
        lat: r.lat as number,
        lng: r.lng as number,
        subtitle: r.locationText,
        isTop5: top5Ids.has(r.uid),
      }));
  }, [filtered, top5]);

  useEffect(() => {
    setPage(1);
  }, [search, country, city, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  const toggleSort = (key: SortKey) => {
    setPage(1);
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const busy = loading || listingsStats.loading;

  return (
    <AppContainer sx={{ py: 4 }}>
      {busy ? <LinearProgress sx={{ mb: 2 }} /> : null}

      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h5" component="h1" fontWeight={900}>
          {t("businesses.title")}
        </Typography>
        <Typography color="text.secondary">
          {t("businesses.subtitle")}
        </Typography>
      </Stack>

      {error && (
        <Box
          sx={{
            mb: 4,
            p: 3,
            bgcolor: "error.light",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "error.main",
          }}
        >
          <Stack spacing={1}>
            <Typography color="error.dark" fontWeight="bold">
              {t("common.error_fetching")}
            </Typography>
            <Typography variant="body2" color="error.dark">
              {error}
            </Typography>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => window.location.reload()}
              sx={{ alignSelf: "flex-start", mt: 1 }}
            >
              {t("common.retry")}
            </Button>
          </Stack>
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={t("businesses.searchLabel")}
                  placeholder={t("businesses.searchPlaceholder")}
                  value={search}
                  onChange={(e) => {
                    setFiltersTouched(true);
                    setSearch(e.target.value);
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: "auto" }}>
                <TextField
                  select
                  fullWidth
                  label={t("businesses.country")}
                  value={country}
                  onChange={(e) => {
                    setFiltersTouched(true);
                    setCountry(e.target.value);
                    setCity("");
                  }}
                  sx={{ minWidth: { md: 190 } }}
                >
                  <MenuItem value="all">
                    {t("businesses.allCountries")}
                  </MenuItem>
                  {COUNTRIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {t(`common.countries.${c}`, c)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: "auto" }}>
                <Autocomplete
                  freeSolo
                  options={cities}
                  loading={citiesLoading}
                  disabled={country === "all"}
                  value={city}
                  onInputChange={(_, newValue) => {
                    setFiltersTouched(true);
                    setCity(newValue);
                  }}
                  sx={{ minWidth: { md: 190 } }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label={
                        citiesLoading
                          ? t("businesses.loadingCities")
                          : t("businesses.cityRegion")
                      }
                      placeholder={
                        country === "all"
                          ? t("businesses.selectCountryFirst")
                          : t("businesses.searchCity")
                      }
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {citiesLoading ? (
                              <CircularProgress color="inherit" size={18} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: "auto" }}>
                <Select
                  fullWidth
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  sx={{ minWidth: { md: 170 } }}
                >
                  <MenuItem value="views">
                    {t("businesses.sort.views")}
                  </MenuItem>
                  <MenuItem value="soldLast30d">
                    {t("businesses.sort.sold")}
                  </MenuItem>
                  <MenuItem value="name">{t("businesses.sort.name")}</MenuItem>
                </Select>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
              {t("businesses.top5")}
            </Typography>
            <Grid container spacing={2}>
              {top5.map((b) => (
                <Grid key={b.uid} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      borderRadius: 1,
                      "&:hover": { borderColor: "primary.main" },
                    }}
                  >
                    <CardActionArea
                      onClick={() => navigate(`/store/${b.handleOrUid}`)}
                      sx={{ height: "100%" }}
                    >
                      <CardContent sx={{ p: 2, textAlign: "center" }}>
                        <Avatar
                          src={b.logoUrl || undefined}
                          variant="rounded"
                          sx={{
                            width: 64,
                            height: 64,
                            mx: "auto",
                            mb: 1.5,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          }}
                        >
                          {b.name.slice(0, 1).toUpperCase()}
                        </Avatar>
                        <Typography
                          fontWeight={800}
                          noWrap
                          sx={{
                            mb: 0.5,
                            height: 24,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {b.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ display: "block", mb: 2, height: 20 }}
                        >
                          {b.locationText || "—"}
                        </Typography>

                        <Stack spacing={1} sx={{ mt: "auto" }}>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={t("carValues.views", {
                              count: b.viewsTotal,
                            })}
                          />
                          <Chip
                            size="small"
                            color="success"
                            label={`${b.soldLast30d} ${t("businesses.table.sold")}`}
                          />
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            {t("businesses.allBusinesses", { count: sorted.length })}
          </Typography>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              mt: 1,
              borderRadius: 1,
              overflowX: "auto",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Table sx={{ minWidth: 900 }}>
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell sx={{ width: 80, fontWeight: 700 }}>
                    {t("businesses.table.logo")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel
                      active={sortKey === "name"}
                      direction={sortKey === "name" ? sortDir : "asc"}
                      onClick={() => toggleSort("name")}
                    >
                      {t("businesses.table.business")}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ width: 180, fontWeight: 700 }}>
                    {t("businesses.table.location")}
                  </TableCell>
                  <TableCell sx={{ width: 120, fontWeight: 700 }} align="right">
                    <TableSortLabel
                      active={sortKey === "views"}
                      direction={sortKey === "views" ? sortDir : "asc"}
                      onClick={() => toggleSort("views")}
                    >
                      {t("businesses.table.views")}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ width: 140, fontWeight: 700 }} align="right">
                    <TableSortLabel
                      active={sortKey === "soldLast30d"}
                      direction={sortKey === "soldLast30d" ? sortDir : "asc"}
                      onClick={() => toggleSort("soldLast30d")}
                    >
                      {t("businesses.table.sold")}
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paged.map((b) => (
                  <TableRow
                    key={b.uid}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/store/${b.handleOrUid}`)}
                  >
                    <TableCell>
                      <Avatar
                        src={b.logoUrl || undefined}
                        variant="rounded"
                        sx={{ width: 40, height: 40 }}
                      >
                        {b.name.slice(0, 1).toUpperCase()}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={800} noWrap>
                        {b.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        @{b.handleOrUid}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ minWidth: 0 }}
                      >
                        <LocationOnIcon fontSize="small" />
                        <Typography variant="body2" noWrap>
                          {b.locationText || "—"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={700}>{b.viewsTotal}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={700}>{b.soldLast30d}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("businesses.resultsCount", { count: sorted.length })}
            </Typography>
            <Pagination
              page={page}
              count={pageCount}
              onChange={(_, p) => setPage(p)}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ position: { md: "sticky" }, top: { md: 24 } }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
              {t("businesses.mapTitle")}
            </Typography>
            <BusinessesMap markers={mapMarkers} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1 }}
            >
              {t("businesses.mapSubtitle", { count: mapMarkers.length })}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </AppContainer>
  );
}
