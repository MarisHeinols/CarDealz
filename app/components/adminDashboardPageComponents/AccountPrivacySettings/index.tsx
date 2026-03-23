import React, { useState } from "react";
import {
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
} from "@mui/material";
import { auth } from "~/firebase/auth";
import { disableAccount, permanentDeleteAccount } from "~/services/accountService";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { httpsCallable } from "firebase/functions";
import { functions } from "~/firebase/functions";

export default function AccountPrivacySettings() {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [activating, setActivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  React.useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      import("~/services/usersService").then(({ getUserProfile }) => {
        getUserProfile(user.uid).then(setProfile);
      });
    }
  }, []);

  const handleDisable = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setDisabling(true);
    try {
      await disableAccount(user.uid);
      setProfile((p: any) => ({ ...p, status: "disabled" }));
      dispatch(showNotification({ 
        message: t("dashboard.account.notifications.disabled", { defaultValue: "Account disabled. Your store is now hidden." }), 
        severity: "success" 
      }));
    } catch (err: any) {
      dispatch(showNotification({ 
        message: t("dashboard.account.notifications.disableFailed", { defaultValue: "Failed to disable account: {{error}}", error: err.message }), 
        severity: "error" 
      }));
    } finally {
      setDisabling(false);
    }
  };

  const handleActivate = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setActivating(true);
    try {
      const { reActivateAccount } = await import("~/services/accountService");
      await reActivateAccount(user.uid);
      setProfile((p: any) => ({ ...p, status: "active" }));
      dispatch(showNotification({ 
        message: "Account activated! Your store is now public.", 
        severity: "success" 
      }));
    } catch (err: any) {
      dispatch(showNotification({ 
        message: "Failed to activate account: " + err.message, 
        severity: "error" 
      }));
    } finally {
      setActivating(false);
    }
  };

  const handleDelete = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setDeleting(true);
    try {
      // Logic check: only proceed if user is likely allowed to be deleted
      // or at least handle the 'recent login' case before the batch commit
      
      // Try to re-authenticate or throw error if session is old
      // We can't actually 'dry-run' deleteUser, so we check lastSignInTime
      const lastSignIn = user.metadata.lastSignInTime 
        ? new Date(user.metadata.lastSignInTime).getTime() 
        : 0;
      const fiveMinutes = 5 * 60 * 1000;
      if (Date.now() - lastSignIn > fiveMinutes) {
        throw { code: "auth/requires-recent-login" };
      }

      const deleteMine = httpsCallable(functions, "deleteMyAccount");
      await deleteMine();

      dispatch(showNotification({ 
        message: t("dashboard.account.notifications.deleted", { defaultValue: "Account deleted permanently." }), 
        severity: "info" 
      }));
      await auth.signOut();
      window.location.href = "/";
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        dispatch(showNotification({ 
          message: t("dashboard.account.notifications.reauthRequired", { defaultValue: "For security reasons, you must have logged in recently to delete your account. Please log out and back in first." }), 
          severity: "warning" 
        }));
      } else {
        dispatch(showNotification({ 
          message: t("dashboard.account.notifications.deleteFailed", { defaultValue: "Failed to delete account: {{error}}", error: err.message }), 
          severity: "error" 
        }));
      }
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="subtitle2" fontWeight={600}>
          {t("dashboard.account.privacy.disableTitle", { defaultValue: "Disable Store" })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {profile?.status === "disabled" 
            ? t("dashboard.account.privacy.activateDesc", { defaultValue: "Brings your store back online for everyone to see." })
            : t("dashboard.account.privacy.disableDesc", { defaultValue: "Hides your store and all car listings from public search results. You can reactivate them later by marking listings as published again." })
          }
        </Typography>
        {profile?.status === "disabled" ? (
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleActivate} 
            disabled={activating}
          >
            {activating 
              ? t("dashboard.account.privacy.activating", { defaultValue: "Activating..." }) 
              : t("dashboard.account.privacy.activateCta", { defaultValue: "Activate My Store" })
            }
          </Button>
        ) : (
          <Button 
            variant="outlined" 
            color="warning" 
            onClick={handleDisable} 
            disabled={disabling}
          >
            {disabling 
              ? t("dashboard.account.privacy.disabling", { defaultValue: "Disabling..." }) 
              : t("dashboard.account.privacy.disableCta", { defaultValue: "Disable My Store" })
            }
          </Button>
        )}
      </Stack>

      <Divider />

      <Stack spacing={1}>
        <Typography variant="subtitle2" color="error" fontWeight={600}>
          {t("dashboard.account.privacy.dangerTitle", { defaultValue: "Danger Zone" })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("dashboard.account.privacy.dangerDesc", { defaultValue: "Permanently delete your account and all associated data. This action cannot be undone." })}
        </Typography>
        <Button 
          variant="contained" 
          color="error" 
          onClick={() => setDeleteDialogOpen(true)}
          disabled={deleting}
        >
          {deleting 
            ? t("dashboard.account.privacy.deleting", { defaultValue: "Deleting..." }) 
            : t("dashboard.account.privacy.deleteCta", { defaultValue: "Delete Account Permanently" })
          }
        </Button>
      </Stack>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          {t("dashboard.account.privacy.confirmTitle", { defaultValue: "Delete Account Permanently?" })}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("dashboard.account.privacy.confirmDesc", { defaultValue: "Are you absolutely sure? All your listings, store settings, and personal data will be hidden or removed. This action is irreversible." })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button onClick={handleDelete} color="error" disabled={deleting} autoFocus>
            {t("dashboard.account.privacy.confirmCta", { defaultValue: "Confirm Delete" })}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
