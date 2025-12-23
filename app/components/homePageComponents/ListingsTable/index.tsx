import {
  Avatar,
  Chip,
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

const conditionColor: Record<
  CarListingSummary["condition"],
  "success" | "info" | "default"
> = {
  new: "success",
  certified: "info",
  used: "default",
};

const ListingsTable = ({
  rows,
  sortKey,
  sortDir,
  onSort,
}: {
  rows: CarListingSummary[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) => {
  const navigate = useNavigate();
  const sortLabel = (key: SortKey, label: string) => (
    <TableSortLabel
      active={sortKey === key}
      direction={sortKey === key ? sortDir : "asc"}
      onClick={() => onSort(key)}
    >
      {label}
    </TableSortLabel>
  );

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
            <TableCell sx={{ width: 120 }}>Image</TableCell>
            <TableCell>{sortLabel("make", "Make")}</TableCell>
            <TableCell>{sortLabel("model", "Model")}</TableCell>
            <TableCell sx={{ width: 80 }}>
              {sortLabel("year", "Year")}
            </TableCell>
            <TableCell sx={{ width: 120 }}>
              {sortLabel("condition", "Condition")}
            </TableCell>
            <TableCell sx={{ width: 120 }}>
              {sortLabel("price", "Price")}
            </TableCell>
            <TableCell sx={{ width: 120 }}>
              {sortLabel("mileage", "Mileage")}
            </TableCell>
            <TableCell
              sx={{
                width: { xs: 80, md: 140 },
                textAlign: "center",
              }}
            >
              Deal
            </TableCell>
            <TableCell
              sx={{
                display: { md: "none", lg: "table-cell" },
              }}
            >
              {sortLabel("location", "Location")}
            </TableCell>
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

              <TableCell>{l.make}</TableCell>
              <TableCell>{l.model}</TableCell>
              <TableCell>{l.year}</TableCell>

              <TableCell>
                <Chip
                  label={l.condition}
                  size="small"
                  color={conditionColor[l.condition]}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ListingsTable;
