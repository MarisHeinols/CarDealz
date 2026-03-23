import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { auth } from "~/firebase/auth";
import {
  RecaptchaVerifier,
  linkWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";

import { useTranslation } from "react-i18next";

export default function VerifyPhonePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"enter_phone" | "enter_code">(
    "enter_phone"
  );
  const [loading, setLoading] = useState(false);

  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.phoneNumber) {
      navigate("/");
      return;
    }

    // Pre-fill phone from user doc if available
    const fetchProfile = async () => {
      const { getUserProfile } = await import("~/services/usersService");
      const profile = await getUserProfile(user.uid);
      if (profile && (profile.phone || profile.ownerPhone)) {
        setPhone(profile.phone || profile.ownerPhone || "");
      }
    };
    fetchProfile();
  }, [navigate, user]);

  const canSend = useMemo(() => phone.trim().length >= 8, [phone]);
  const canConfirm = useMemo(() => code.trim().length >= 4, [code]);

  const ensureVerifier = () => {
    if (verifierRef.current) return verifierRef.current;

    const el = document.getElementById("phone-recaptcha");
    if (!el) throw new Error("reCAPTCHA container not found");

    verifierRef.current = new RecaptchaVerifier(auth, "phone-recaptcha", {
      size: "invisible",
    });
    return verifierRef.current;
  };

  const sendCode = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!canSend) {
      dispatch(
        showNotification({
          message: t("verifyPhone.enterValidPhone"),
          severity: "error",
        })
      );
      return;
    }

    setLoading(true);
    try {
      // 1. Check if number is blocked in Firestore (duplicate check across individual/business)
      const { collection, getDocs, query, where } = await import("firebase/firestore");
      const { db } = await import("~/firebase/fireStore");

      const num = phone.replace(/[^\d+]/g, "").trim();
      console.log("[DEBUG] Sending SMS to clean number:", num);

      if (!num.startsWith("+")) {
         throw { code: "custom/missing-plus-sign" };
      }
      
      // Global minimum check (longest country code + shortest valid subscriber number)
      if (num.length < 8) {
        throw { code: "auth/invalid-phone-number" };
      }

      const checkPhone = await getDocs(query(collection(db, "users"), where("phone", "==", num), where("uid", "!=", currentUser.uid)));
      const checkOwner = await getDocs(query(collection(db, "users"), where("ownerPhone", "==", num), where("uid", "!=", currentUser.uid)));

      if (!checkPhone.empty || !checkOwner.empty) {
        throw { code: "custom/phone-in-use-firestore" };
      }

      const verifier = ensureVerifier();
      const confirmation = await linkWithPhoneNumber(
        currentUser,
        num,
        verifier
      );
      confirmationRef.current = confirmation;
      setStep("enter_code");
      dispatch(
        showNotification({
          message: t("verifyPhone.codeSent"),
          severity: "success",
        })
      );
    } catch (e: any) {
      console.error("Phone verification error:", e);
      dispatch(
        showNotification({
          message:
            e?.code === "custom/phone-in-use-firestore" || e?.code === "auth/credential-already-in-use"
              ? t("verifyPhone.phoneInUse")
              : e?.code === "auth/invalid-phone-number"
                ? t("verifyPhone.invalidPhone")
                : e?.code === "custom/missing-plus-sign"
                  ? t("verifyPhone.missingPlus")
                  : e?.code === "auth/too-many-requests"
                    ? t("verifyPhone.tooManyRequests", { code: e?.code || "unknown" })
                    : t("verifyPhone.verificationFailed", { error: e?.code || e?.message || "unknown" }),
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmCode = async () => {
    const confirmation = confirmationRef.current;
    if (!confirmation) {
      dispatch(
        showNotification({
          message: t("verifyPhone.requestFirst"),
          severity: "error",
        })
      );
      return;
    }

    if (!canConfirm) {
      dispatch(
        showNotification({
          message: t("verifyPhone.enterSmsCode"),
          severity: "error",
        })
      );
      return;
    }

    setLoading(true);
    try {
      await confirmation.confirm(code.trim());
      dispatch(
        showNotification({
          message: t("verifyPhone.verifySuccess"),
          severity: "success",
        })
      );
      navigate("/");
    } catch (e: any) {
      dispatch(
        showNotification({
          message:
            e?.code === "auth/invalid-verification-code"
              ? t("verifyPhone.incorrectCode")
              : e?.code === "auth/code-expired"
                ? t("verifyPhone.codeExpired")
                : e?.message || t("verifyPhone.failedToVerify"),
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        px: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 420 }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={900} textAlign="center" mb={2}>
            {t("verifyPhone.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {t("verifyPhone.description")}
          </Typography>

          {step === "enter_phone" ? (
            <Box
              component="form"
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                sendCode();
              }}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                fullWidth
                label={t("verifyPhone.phoneNumber")}
                placeholder="+371..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />

              <Button
                variant="contained"
                type="submit"
                disabled={loading}
              >
                {t("verifyPhone.sendCode")}
              </Button>
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                confirmCode();
              }}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                fullWidth
                label={t("verifyPhone.smsCode")}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={loading}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setStep("enter_phone");
                    setCode("");
                  }}
                  disabled={loading}
                >
                  {t("verifyPhone.back")}
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  type="submit"
                  disabled={loading}
                >
                  {t("verifyPhone.verify")}
                </Button>
              </Stack>
            </Box>
          )}

          <Box id="phone-recaptcha" />
        </Stack>
      </Paper>
    </Box>
  );
}
