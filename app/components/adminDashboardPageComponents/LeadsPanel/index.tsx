import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";
import { useAuth } from "~/hooks/userStore/useAuth";
import { getLeadsByDealer, updateLeadStatus } from "~/services/leadsService";
import { getListingsByOwner } from "~/services/listingsService";
import { useTranslation } from "react-i18next";
import type { CarListingSummary, LeadDoc, LeadStatus } from "~/types/types";

function statusColor(status: LeadStatus): "default" | "primary" | "success" | "warning" {
  if (status === "new") return "warning";
  if (status === "contacted") return "primary";
  return "success";
}

export default function LeadsPanel() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<LeadDoc[]>([]);
  const [listings, setListings] = useState<CarListingSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");

  useEffect(() => {
    let cancelled = false;
    if (!user) return;

    setLoading(true);
    Promise.all([getLeadsByDealer(user.uid), getListingsByOwner(user.uid)])
      .then(([ls, ownerListings]) => {
        if (cancelled) return;
        setLeads(ls);
        setListings(ownerListings);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const listingLabelById = useMemo(() => {
    const m = new Map<string, string>();
    for (const l of listings) {
      m.set(l.id, `${l.year} ${l.make} ${l.model}`.trim());
    }
    return m;
  }, [listings]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const listingTitle = (listingLabelById.get(l.listingId) || "").toLowerCase();
      const name = (l.buyerName || "").toLowerCase();
      const email = (l.buyerEmail || "").toLowerCase();
      const phone = (l.buyerPhone || "").toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch =
        listingTitle.includes(q) ||
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q);

      const matchesStatus = filterStatus === "all" || l.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, filterStatus, listingLabelById]);

  const setStatus = async (leadId: string, status: LeadStatus) => {
    await updateLeadStatus(leadId, status);
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
  };

  if (!user) {
    return (
      <Box p={2}>
        <Typography color="text.secondary">
          {t("leads.login_required_leads")}
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Stack alignItems="center" py={4}>
        <CircularProgress />
        <Typography mt={1} color="text.secondary">
          {t("leads.loading_leads")}
        </Typography>
      </Stack>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          {t("leads.title")}
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
          <TextField
            size="small"
            placeholder={t("leads.search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: { sm: 200 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="lead-status-filter">{t("leads.status")}</InputLabel>
            <Select
              labelId="lead-status-filter"
              label={t("leads.status")}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as LeadStatus | "all")}
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon fontSize="small" color="action" />
                </InputAdornment>
              }
            >
              <MenuItem value="all">{t("leads.all_status")}</MenuItem>
              <MenuItem value="new">{t("leads.status_new")}</MenuItem>
              <MenuItem value="contacted">{t("leads.status_contacted")}</MenuItem>
              <MenuItem value="closed">{t("leads.status_closed")}</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Stack spacing={2}>
        {filtered.length === 0 ? (
          <Typography color="text.secondary">{t("leads.no_leads_yet")}</Typography>
        ) : null}

        {filtered.map((l) => (
          <Paper key={l.id} sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={1.25}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                <Typography fontWeight={700}>
                  {l.buyerName}
                </Typography>

                <Chip
                  label={t(`leads.status_${l.status}`)}
                  color={statusColor(l.status)}
                  size="small"
                />

                <Box sx={{ flex: 1 }} />

                <Button
                  component={RouterLink}
                  to={`/listing/${l.listingId}`}
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  {t("leads.view_listing")}
                </Button>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {listingLabelById.get(l.listingId) || l.listingId}
              </Typography>

              <Divider />

              <Stack spacing={0.5}>
                {l.buyerEmail ? (
                  <Typography variant="body2">{t("leads.email", { email: l.buyerEmail })}</Typography>
                ) : null}
                {l.buyerPhone ? (
                  <Typography variant="body2">{t("leads.phone", { phone: l.buyerPhone })}</Typography>
                ) : null}
                <Typography variant="body2">
                  {t("leads.preferred_contact_method", { method: l.preferredContactMethod })}
                </Typography>
              </Stack>

              <Typography sx={{ whiteSpace: "pre-wrap" }}>{l.message}</Typography>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  size="small"
                  onClick={() => setStatus(l.id, "contacted")}
                  disabled={l.status === "contacted"}
                >
                  {t("leads.mark_contacted")}
                </Button>
                <Button
                  size="small"
                  color="success"
                  onClick={() => setStatus(l.id, "closed")}
                  disabled={l.status === "closed"}
                >
                  {t("leads.close")}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
