import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Stack,
  Chip,
  Box,
  CardActions,
  IconButton,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router";
import type { CarListingSummary } from "~/types/types";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useState } from "react";
import { markAsSale, updateListingPrice, deleteListingFromDb } from "~/services/listingsService";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { useAppSelector } from "~/redux/hooks";
import { useTheme } from "@mui/material/styles";
import type { StoreTheme } from "~/redux/slices/storeSettingsSlice";

const conditionVariantMap = {
  new: "levelHigh",
  certified: "levelMedium",
  used: "levelLow",
} as const;

interface Props {
  listing: CarListingSummary;
  isOwner?: boolean;
  /**
   * When true, the card uses store profile/admin theme colors.
   * When false (default), it uses the normal website theme.
   */
  useStoreTheme?: boolean;
  storeThemeOverride?: StoreTheme;
}

const ListingCard = ({
  listing,
  isOwner,
  useStoreTheme = false,
  storeThemeOverride,
}: Props) => {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const storeTheme = useAppSelector((state) => state.storeSettings.theme);
  const activeTheme = useStoreTheme ? (storeThemeOverride || storeTheme) : null;

  const color = activeTheme?.isTextLight ? "white" : "inherit";
  const isMinimal = activeTheme?.layout === "minimal";
  const dispatch = useAppDispatch();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleActionMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setAnchorEl(null);
  };

  return (
    <Card
      sx={{ 
        height: isMinimal ? 110 : "100%",
        minHeight: isMinimal ? 110 : 340,
        bgcolor: activeTheme?.secondary || undefined,
        display: "flex",
        flexDirection: isMinimal ? "row" : "column",
      }}
    >
      <CardActionArea 
        onClick={() => navigate(`/listing/${listing.id}`)}
        sx={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: isMinimal ? "row" : "column", 
          alignItems: "stretch", 
          justifyContent: "flex-start",
          minWidth: 0, // important for text overflow in flex row
        }}
      >
        {/* Image */}
        <Box sx={{ width: isMinimal ? { xs: 100, sm: 160 } : "100%", height: isMinimal ? "100%" : 180, flexShrink: 0, position: "relative" }}>
          <CardMedia
            component="img"
            image={listing.thumbnailUrl}
            alt={`${listing.make} ${listing.model}`}
            sx={{
              width: "100%",
              height: "100%",
              aspectRatio: isMinimal ? "auto" : "4 / 3",
              objectFit: "cover",
            }}
          />

          {/* Condition badge */}
          <Chip
            label={listing.condition}
            size="small"
            variant={conditionVariantMap[listing.condition]}
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
            }}
          />
        </Box>

        {/* Content */}
        <CardContent sx={{ pb: 2, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Stack spacing={0.5}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: color,
              }}
            >
              {listing.year} {listing.make} {listing.model}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 0.5 }}>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{
                  color: useStoreTheme
                    ? ((activeTheme?.accent || activeTheme?.primary) ?? muiTheme.palette.primary.main)
                    : muiTheme.palette.primary.main,
                }}
              >
                ${(listing.isOnSale && listing.salePrice ? listing.salePrice : listing.price).toLocaleString("en-US")}
              </Typography>
              {listing.isOnSale && listing.salePrice && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ textDecoration: "line-through", opacity: 0.7 }}>
                    ${listing.price.toLocaleString("en-US")}
                  </Typography>
                  <Chip size="small" label="SALE" color="error" sx={{ height: 20, fontSize: "0.65rem", fontWeight: "bold" }} />
                </>
              )}
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: color,
                opacity: 0.8
              }}
            >
              {listing.mileage.toLocaleString("en-US")} km • {listing.location}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>

      {/* Owner Actions */}
      {isOwner && (
        <CardActions 
          sx={{ 
            borderTop: isMinimal ? "none" : "1px solid", 
            borderLeft: isMinimal ? "1px solid" : "none", 
            borderColor: "divider", 
            bgcolor: "rgba(0,0,0,0.02)", 
            justifyContent: isMinimal ? "center" : "space-between", 
            flexDirection: isMinimal ? "column" : "row",
            px: isMinimal ? 1 : 2,
            minWidth: isMinimal ? 60 : "auto"
          }}
        >
          {isMinimal ? null : (
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/listing/${listing.id}/edit`);
              }}
              sx={{
                color: useStoreTheme ? (storeTheme.accent || storeTheme.primary) : undefined,
              }}
            >
              Edit
            </Button>
          )}
          <Box sx={{ display: 'flex', flexDirection: isMinimal ? 'column' : 'row', alignItems: 'center', gap: isMinimal ? 1 : 0 }}>
            {isMinimal && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/listing/${listing.id}/edit`);
                }}
                sx={{
                  color: useStoreTheme ? (storeTheme.accent || storeTheme.primary) : undefined,
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton size="small" onClick={handleActionMenu}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem onClick={(e) => {
                handleClose(e);
                const price = window.prompt("Enter Sale Price:");
                if (price && !isNaN(Number(price))) {
                  markAsSale(listing.id, Number(price)).then(() => {
                    dispatch(showNotification({ message: "Listing marked as SALE!", severity: "success" }));
                    setTimeout(() => window.location.reload(), 500);
                  });
                }
              }}>
                <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
                Make a Sale
              </MenuItem>
              <MenuItem onClick={(e) => {
                handleClose(e);
                const price = window.prompt("Enter New Price:");
                if (price && !isNaN(Number(price))) {
                  updateListingPrice(listing.id, Number(price)).then(() => {
                    dispatch(showNotification({ message: "Price updated!", severity: "success" }));
                    setTimeout(() => window.location.reload(), 500);
                  });
                }
              }}>
                <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
                Change Price
              </MenuItem>
              <MenuItem onClick={(e) => {
                handleClose(e);
                const confirmed = window.confirm("Are you sure you want to delete this listing?");
                if (confirmed) {
                  deleteListingFromDb(listing.id).then(() => {
                    dispatch(showNotification({ message: "Listing deleted.", severity: "info" }));
                    setTimeout(() => window.location.reload(), 500);
                  });
                }
              }} sx={{ color: "error.main" }}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Delete Listing
              </MenuItem>
            </Menu>
          </Box>
        </CardActions>
      )}
    </Card>
  );
};

export default ListingCard;
