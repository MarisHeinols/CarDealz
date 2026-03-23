import {
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import type { CarListingSummary, SortDir, SortKey } from "~/types/types";
import DealIndicator from "../DealIndicator";
import { Link as RouterLink, useNavigate } from "react-router";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { markListingAsSold, markAsSale, stopSale } from "~/services/listingsService";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { invalidateCache, cacheKeyOwnerListings, cacheKeyAllListings } from "~/services/listingsCache";

const ListingsTable = ({
  rows,
  sortKey,
  sortDir,
  onSort,
  showOwnerActions,
  onChangePrice,
  onDelete,
  onRefresh,
}: {
  rows: CarListingSummary[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  showOwnerActions?: boolean;
  onChangePrice?: (listingId: string, newPrice: number) => void;
  onDelete?: (listingId: string) => void;
  onRefresh?: () => void;
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sortLabel = (key: SortKey, label: string) => (
    <TableSortLabel
      active={sortKey === key}
      direction={sortKey === key ? sortDir : "asc"}
      onClick={() => onSort(key)}
    >
      {label}
    </TableSortLabel>
  );

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setAnchorEl(e.currentTarget);
    setActiveId(id);
  };

  const closeMenu = (e?: unknown) => {
    const evt = e as
      | { stopPropagation?: () => void; preventDefault?: () => void }
      | undefined;
    evt?.stopPropagation?.();
    evt?.preventDefault?.();
    setAnchorEl(null);
    setActiveId(null);
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        width: "100%",
        overflowX: "auto",
        marginTop: "1rem",
      }}
    >
      <Table
        sx={{
          minWidth: 900,
          width: "100%",
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 120 }}>{t("table.image")}</TableCell>
            <TableCell>{sortLabel("make", t("table.make"))}</TableCell>
            <TableCell>{sortLabel("model", t("table.model"))}</TableCell>
            <TableCell sx={{ width: 80 }}>
              {sortLabel("year", t("table.year"))}
            </TableCell>
            <TableCell sx={{ width: 120 }}>
              {sortLabel("conditionTier", t("table.condition"))}
            </TableCell>
            <TableCell sx={{ width: 120 }}>
              {sortLabel("price", t("table.price"))}
            </TableCell>
            <TableCell sx={{ width: 120 }}>
              {sortLabel("mileage", t("table.mileage"))}
            </TableCell>
            <TableCell
              sx={{
                width: { xs: 80, md: 140 },
                textAlign: "center",
              }}
            >
              {t("table.deal")}
            </TableCell>
            <TableCell
              sx={{
                display: { md: "none", lg: "table-cell" },
              }}
            >
              {sortLabel("location", t("table.location"))}
            </TableCell>
            {showOwnerActions ? (
              <TableCell sx={{ width: 60, textAlign: "right" }}>
                {t("table.actions")}
              </TableCell>
            ) : null}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((l) => (
            <TableRow
              key={l.id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => navigate(`/listing/${l.id}`)}
            >
              <TableCell>
                <Avatar
                  variant="rounded"
                  src={l.thumbnailUrl}
                  sx={{ width: 96, height: 64 }}
                />
              </TableCell>

              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="body2" fontWeight={600}>
                    {l.make}
                  </Typography>
                  {l.isDealer && (
                    <Chip
                      label={t("listing.dealer")}
                      size="small"
                      variant="levelHigh"
                      sx={{ fontSize: "0.65rem", height: 20 }}
                    />
                  )}
                  {l.isSold && (
                    <Chip
                      label={t("sellerCard.status_sold")}
                      size="small"
                      color="success"
                      sx={{
                        fontSize: "0.65rem",
                        height: 20,
                        fontWeight: "bold",
                      }}
                    />
                  )}
                </Stack>
              </TableCell>
              <TableCell>{l.model}</TableCell>
              <TableCell>{l.year}</TableCell>

              <TableCell>
                <Chip
                  label={t(`carValues.condition_${l.conditionTier}`, {
                    defaultValue: l.conditionTier,
                  })}
                  size="small"
                  variant={
                    l.conditionTier === "new"
                      ? "levelHigh"
                      : l.conditionTier === "slightly_used" ||
                        l.conditionTier === "first_payment"
                        ? "levelMedium"
                        : "levelLow"
                  }
                />
              </TableCell>

              <TableCell>€{l.price.toLocaleString("en-US")}</TableCell>

              <TableCell>{l.mileage} km</TableCell>

              <TableCell
                sx={{
                  width: { xs: 80, md: 140 },
                  textAlign: "center",
                }}
              >
                <DealIndicator price={l.price} marketRange={l.marketRange} />
              </TableCell>

              <TableCell
                sx={{
                  display: { xs: "none", md: "table-cell" },
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {l.location}
              </TableCell>

              {showOwnerActions ? (
                <TableCell sx={{ textAlign: "right" }}>
                  <IconButton size="small" onClick={(e) => openMenu(e, l.id)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={(e) => {
            const id = activeId;
            closeMenu(e);
            if (!id || !onChangePrice) return;
            const price = window.prompt(t("table.enterNewPrice"));
            if (price && !Number.isNaN(Number(price))) {
              onChangePrice(id, Number(price));
            }
          }}
        >
          <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
          {t("table.changePrice")}
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            const id = activeId;
            closeMenu(e);
            if (!id) return;
            const listing = rows.find((l) => l.id === id);
            if (!listing) return;

            if (listing.isOnSale) {
              stopSale(id).then(() => {
                const sellerId = listing.sellerId;
                if (sellerId) invalidateCache(cacheKeyOwnerListings(sellerId));
                invalidateCache(cacheKeyAllListings());
                onRefresh?.();
              });
            } else {
              const salePriceStr = window.prompt(
                t("listingControl.setSalePriceDesc"),
                (listing.price * 0.9).toString(),
              );
              if (salePriceStr && !isNaN(Number(salePriceStr))) {
                markAsSale(id, Number(salePriceStr)).then(() => {
                  const sellerId = listing.sellerId;
                  if (sellerId) invalidateCache(cacheKeyOwnerListings(sellerId));
                  invalidateCache(cacheKeyAllListings());
                  onRefresh?.();
                });
              }
            }
          }}
        >
          <AttachMoneyIcon fontSize="small" sx={{ mr: 1, color: "error.main" }} />
          {activeId && rows.find((r) => r.id === activeId)?.isOnSale
            ? t("listingControl.stopSale")
            : t("listingControl.putOnSale")}
        </MenuItem>

        {/* Mark as Sold Option */}
        {anchorEl &&
          activeId &&
          !rows.find((r) => r.id === activeId)?.isSold && (
            <MenuItem
              onClick={(e) => {
                const id = activeId;
                closeMenu(e);
                if (!id) return;

                const listing = rows.find((r) => r.id === id);
                if (!listing) return;

                const soldPriceStr = window.prompt(
                  t("listingControl.askSoldPrice"),
                  listing.price.toString(),
                );
                if (soldPriceStr === null) return; // cancelled

                const soldPrice = Number(soldPriceStr);
                if (!isNaN(soldPrice) && soldPrice > 0) {
                  markListingAsSold(id, soldPrice).then(() => {
                    const sellerId = listing.sellerId;
                    if (sellerId) invalidateCache(cacheKeyOwnerListings(sellerId));
                    invalidateCache(cacheKeyAllListings());
                    dispatch(
                      showNotification({
                        message: t("listingControl.soldSuccess"),
                        severity: "success",
                      }),
                    );
                    onRefresh?.();
                  });
                }
              }}
              sx={{ color: "success.main" }}
            >
              <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
              {t("listingControl.markAsSold")}
            </MenuItem>
          )}

        <MenuItem
          onClick={(e) => {
            const id = activeId;
            closeMenu(e);
            if (!id || !onDelete) return;
            const confirmed = window.confirm(t("table.confirmDeleteListing"));
            if (confirmed) onDelete(id);
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          {t("table.deleteListing")}
        </MenuItem>
      </Menu>
    </TableContainer>
  );
};

export default ListingsTable;
