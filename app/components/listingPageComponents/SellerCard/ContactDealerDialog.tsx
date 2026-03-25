import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router";
import { useAuth } from "~/hooks/userStore/useAuth";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { createLead } from "~/services/leadsService";
import type { LeadPreferredContactMethod } from "~/types/types";

export default function ContactDealerDialog({
  open,
  onClose,
  listingId,
  dealerId,
  dealerName,
}: {
  open: boolean;
  onClose: () => void;
  listingId: string;
  dealerId: string;
  dealerName: string;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [preferred, setPreferred] =
    useState<LeadPreferredContactMethod>("email");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Bot-trap field
  const [gdprConsent, setGdprConsent] = useState(false);
  const [profanityError, setProfanityError] = useState<string | null>(null);

  // Pre-fill user data if logged in
  React.useEffect(() => {
    if (user) {
      if (user.displayName) setBuyerName(user.displayName);
      if (user.email) setBuyerEmail(user.email);
    }
  }, [user]);

  const canSubmit = useMemo(() => {
    if (!listingId || !dealerId) return false;
    if (!buyerName.trim()) return false;
    if (!message.trim()) return false;
    if (preferred === "email" && !buyerEmail.trim()) return false;
    if (preferred === "phone" && !buyerPhone.trim()) return false;
    if (!gdprConsent) return false;
    return true;
  }, [
    buyerEmail,
    buyerName,
    buyerPhone,
    dealerId,
    gdprConsent,
    listingId,
    message,
    preferred,
  ]);

  // Client-side profanity check (mirrors backend logic)
  const containsProfanityClient = (text: string): boolean => {
    const normalized = (text || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ё/g, "е")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
    const patterns = [
      /\b(fuck|fucking|fucked|fucker|shit|shitty|bitch|bitching|asshole|bastard|cunt|dick|dickhead|cock|cocksucker|motherfucker|whore|slut|nigger|faggot|retard)\b/i,
      /\b(бля|блять|бляд|блядь|сука|суки|хуй|хуйня|пизд|пизда|ёб|ёба|еба|ебать|нахуй|захуй|мудак|мразь|ублюдок|шлюха|проститутка)\b/i,
      /\b(pizd|pizda|pizdet|dirsa|dirst|kuce|sukas|mauka|maukas|sūds|jebi|jebies|jebties)\b/i,
    ];
    return patterns.some((p) => p.test(normalized));
  };

  const submit = async () => {
    if (!canSubmit) return;

    // Client-side profanity check
    if (containsProfanityClient(buyerName) || containsProfanityClient(message)) {
      setProfanityError(t("lead.profanityError", { defaultValue: "Your message contains prohibited language. Please remove it and try again." }));
      return;
    }
    setProfanityError(null);

    // Honeypot check: If the bot-trap field is filled, silently ignore
    if (honeypot) {
      console.warn("Spam bot detected via honeypot.");
      onClose();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createLead({
        listingId,
        dealerId,
        buyerUid: user?.uid,
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim() || undefined,
        buyerPhone: buyerPhone.trim() || undefined,
        preferredContactMethod: preferred,
        message: message.trim(),
      });

      dispatch(
        showNotification({
          message: t("lead.sent", { defaultValue: "Message sent to dealer." }),
          severity: "success",
        }),
      );
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      dispatch(
        showNotification({
          message: t("lead.sendFailed", {
            defaultValue: "Failed to send message.",
          }),
          severity: "error",
        }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("lead.contactDealer", {
          defaultValue: "Contact dealer",
        })}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label={t("lead.dealer", { defaultValue: "Dealer" })}
            value={dealerName}
            fullWidth
            disabled
          />

          <TextField
            label={t("lead.yourName", { defaultValue: "Your name" })}
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            fullWidth
            required
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label={t("lead.email", { defaultValue: "Email" })}
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              fullWidth
            />
            <TextField
              label={t("lead.phone", { defaultValue: "Phone" })}
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              fullWidth
            />
          </Stack>

          <FormControl fullWidth>
            <InputLabel id="preferred-contact">
              {t("lead.preferredContact", {
                defaultValue: "Preferred contact",
              })}
            </InputLabel>
            <Select
              labelId="preferred-contact"
              label={t("lead.preferredContact", {
                defaultValue: "Preferred contact",
              })}
              value={preferred}
              onChange={(e) =>
                setPreferred(e.target.value as LeadPreferredContactMethod)
              }
            >
              <MenuItem value="email">
                {t("lead.preferredEmail", { defaultValue: "Email" })}
              </MenuItem>
              <MenuItem value="phone">
                {t("lead.preferredPhone", { defaultValue: "Phone" })}
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            label={t("lead.message", { defaultValue: "Message" })}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            multiline
            minRows={4}
            placeholder={t("lead.messagePlaceholder", {
              defaultValue:
                "Write a message to the dealer. Include when you'd like them to contact you.",
            })}
            required
          />

          <Alert severity="info">
            {t("lead.notice", {
              defaultValue:
                "Your contact details and message will be sent to the dealer by email notification and shown in their dashboard.",
            })}
          </Alert>

          {/* GDPR Consent */}
          <FormControlLabel
            control={
              <Checkbox
                id="lead-gdpr-consent"
                checked={gdprConsent}
                onChange={(e) => setGdprConsent(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Typography variant="caption" color="text.secondary">
                {t("lead.gdprConsentPart1", { defaultValue: "I agree that my contact details and message will be processed to handle my enquiry. See our" })}{" "}
                <Link component={RouterLink} to="/privacy-policy" target="_blank" sx={{ fontSize: "inherit" }}>
                  {t("lead.gdprPolicy", { defaultValue: "Privacy Policy" })}
                </Link>
                {t("lead.gdprConsentPart2", { defaultValue: "." })}
              </Typography>
            }
          />
          {profanityError && (
            <Alert severity="error">{profanityError}</Alert>
          )}

          {/* Honeypot field - Visually hidden from users but seen by bots */}
          <div
            style={{
              opacity: 0,
              position: "absolute",
              top: 0,
              left: 0,
              height: 0,
              width: 0,
              zIndex: -1,
              overflow: "hidden",
            }}
          >
            <input
              tabIndex={-1}
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
            />
          </div>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {t("common.cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            t("lead.send", { defaultValue: "Send" })
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
