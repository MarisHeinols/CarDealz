import { Paper, Stack, Typography, Chip, Divider } from "@mui/material";
import React from "react";
import type { SellerInfo } from "~/types/types";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

const SellerCard = ({ seller }: { seller: SellerInfo }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6">{seller.name}</Typography>
          {seller.isDealer && (
            <Chip label="Dealer" size="small" variant="levelHigh" />
          )}
        </Stack>

        <Divider />

        {seller.phone && (
          <Typography>
            <PhoneIcon sx={{ fontSize: 16, mr: 1 }} />
            {seller.phone}
          </Typography>
        )}

        {seller.email && (
          <Typography>
            <EmailIcon sx={{ fontSize: 16, mr: 1 }} />
            {seller.email}
          </Typography>
        )}

        {!seller.phone && !seller.email && (
          <Typography color="text.secondary">
            Contact information hidden
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

export default SellerCard;
