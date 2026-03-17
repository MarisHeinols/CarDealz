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
} from "@mui/material";

import type { CarListingSummary, SortDir, SortKey } from "~/types/types";
import DealIndicator from "../DealIndicator";
import { Link as RouterLink, useNavigate } from "react-router";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const ListingsTable = ({
  rows,
  sortKey,
  sortDir,
  onSort,
  showOwnerActions,
  onChangePrice,
  onDelete,
}: {
  rows: CarListingSummary[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  showOwnerActions?: boolean;
  onChangePrice?: (listingId: string, newPrice: number) => void;
  onDelete?: (listingId: string) => void;
}) => {
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
    const evt = e as { stopPropagation?: () => void; preventDefault?: () => void } | undefined;
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
              {sortLabel("condition", t("table.condition"))}
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
                {l.make}
                {l.isDealer && (
                  <Chip
                    label="Dealer"
                    size="small"
                    variant="levelHigh"
                    sx={{ ml: 1, fontSize: "0.65rem" }}
                  />
                )}
              </TableCell>
              <TableCell>{l.model}</TableCell>
              <TableCell>{l.year}</TableCell>

              <TableCell>
                <Chip
                  label={l.condition}
                  size="small"
                  variant={
                    l.condition === "new"
                      ? "levelHigh"
                      : l.condition === "certified"
                        ? "levelMedium"
                        : "levelLow"
                  }
                />
              </TableCell>

              <TableCell>${l.price.toLocaleString("en-US")}</TableCell>

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
