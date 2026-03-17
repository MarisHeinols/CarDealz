import { Paper, Stack, Typography, Chip, Divider, Button, Rating, Box } from "@mui/material";
import React from "react";
import type { SellerInfo } from "~/types/types";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import StoreIcon from "@mui/icons-material/Store";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

interface Props {
  seller: SellerInfo;
  sellerId?: string;
  compact?: boolean;
}

const SellerCard = ({ seller, sellerId, compact }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Paper
      elevation={compact ? 0 : 1}
      sx={{
        p: compact ? 2 : 3,
        border: compact ? "1px solid" : "none",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: compact ? "rgba(0,0,0,0.02)" : "background.paper",
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Typography variant={compact ? "subtitle1" : "h6"} fontWeight={600}>
            {seller.name}
          </Typography>
          {seller.isDealer && (
            <Chip label={t("listing.dealer")} size="small" variant="levelHigh" />
          )}
        </Stack>
        
        {/* Mocked Rating - as actual rating is likely a backend feature to be added later */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Rating value={4.8} size="small" precision={0.1} readOnly title="4.8 out of 5 stars" />
          <Typography variant="caption" color="text.secondary">
            {t("sellerCard.reviewsCount", { count: 124 })}
          </Typography>
        </Stack>

        <Divider />

        {seller.phone && (
          <Stack direction="row" spacing={1} alignItems="center">
            <PhoneIcon sx={{ fontSize: 16 }} color="action" />
            <Typography variant={compact ? "body2" : "body1"}>{seller.phone}</Typography>
          </Stack>
        )}

        {seller.email && (
          <Stack direction="row" spacing={1} alignItems="center">
            <EmailIcon sx={{ fontSize: 16 }} color="action" />
            <Typography variant={compact ? "body2" : "body1"}>{seller.email}</Typography>
          </Stack>
        )}

        {!seller.phone && !seller.email && (
          <Typography color="text.secondary" variant="body2">
            {t("sellerCard.contactHidden")}
          </Typography>
        )}

        {/* Seller navigation links */}
        {sellerId && (
          <>
            <Divider />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {seller.isDealer ? (
                <Button
                  size={compact ? "small" : "medium"}
                  variant={compact ? "contained" : "outlined"}
                  startIcon={<StoreIcon />}
                  onClick={() => navigate(`/store/${sellerId}`)}
                  fullWidth={compact}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  {t("sellerCard.visitStore")}
                </Button>
              ) : (
                <Button
                  size={compact ? "small" : "medium"}
                  variant={compact ? "contained" : "outlined"}
                  startIcon={<DirectionsCarIcon />}
                  onClick={() => navigate(`/store/${sellerId}`)}
                  fullWidth={compact}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  {t("sellerCard.moreFromSeller")}
                </Button>
              )}
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
};

export default SellerCard;
