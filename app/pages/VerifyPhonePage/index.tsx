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

export default function VerifyPhonePage() {
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
    }
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
          message: "Enter a valid phone number (include country code, e.g. +371...).",
          severity: "error",
        })
      );
      return;
    }

    setLoading(true);
    try {
      const verifier = ensureVerifier();
      const confirmation = await linkWithPhoneNumber(
        currentUser,
        phone.trim(),
        verifier
      );
      confirmationRef.current = confirmation;
      setStep("enter_code");
      dispatch(
        showNotification({
          message: "Verification code sent.",
          severity: "success",
        })
      );
    } catch (e: any) {
      dispatch(
        showNotification({
          message:
            e?.code === "auth/credential-already-in-use"
              ? "This phone number is already used by another account."
              : e?.code === "auth/invalid-phone-number"
                ? "Invalid phone number. Make sure it includes the country code (e.g. +371...)."
                : e?.code === "auth/too-many-requests"
                  ? "Too many attempts. Please wait a bit and try again."
                  : e?.message || "Failed to send verification code.",
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
          message: "Please request a verification code first.",
          severity: "error",
        })
      );
      return;
    }

    if (!canConfirm) {
      dispatch(
        showNotification({
          message: "Enter the SMS code.",
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
          message: "Phone verified successfully.",
          severity: "success",
        })
      );
      navigate("/");
    } catch (e: any) {
      dispatch(
        showNotification({
          message:
            e?.code === "auth/invalid-verification-code"
              ? "Incorrect code. Please try again."
              : e?.code === "auth/code-expired"
                ? "Code expired. Please request a new one."
                : e?.message || "Failed to verify phone.",
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
          <Typography variant="h5" fontWeight={800} textAlign="center">
            Verify phone
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Phone verification is required to prevent multiple accounts.
          </Typography>

          {step === "enter_phone" ? (
            <>
              <TextField
                fullWidth
                label="Phone number"
                placeholder="+371..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />

              <Button
                variant="contained"
                onClick={sendCode}
                disabled={loading}
              >
                Send code
              </Button>
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="SMS code"
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
                  Back
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={confirmCode}
                  disabled={loading}
                >
                  Verify
                </Button>
              </Stack>
            </>
          )}

          <Box id="phone-recaptcha" />
        </Stack>
      </Paper>
    </Box>
  );
}
