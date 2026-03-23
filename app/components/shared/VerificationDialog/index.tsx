import { Dialog, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";

interface VerificationDialogProps {
  open: boolean;
  onClose: () => void;
}

const VerificationDialog = ({ open, onClose }: VerificationDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <DialogContent sx={{ textAlign: "center", pt: 4 }}>
        <Box sx={{ 
          width: 80, 
          height: 80, 
          borderRadius: "50%", 
          bgcolor: "primary.light", 
          color: "primary.main", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          margin: "0 auto",
          mb: 3
        }}>
          <PhoneIphoneIcon sx={{ fontSize: 40 }} />
        </Box>
        
        <Typography variant="h5" fontWeight={900} gutterBottom>
          {t("auth.completePhoneVerification", "Verify Your Phone")}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {t("auth.phoneVerifyDesc", "Your profile is ready! Please verify your phone number to start using the platform.")}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3 }}>
        <Button 
          variant="contained" 
          fullWidth 
          onClick={onClose}
          sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
        >
          {t("common.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VerificationDialog;
