import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Tooltip,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React from "react";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import { Link as RouterLink, useNavigate } from "react-router";
import { useAuth } from "~/hooks/userStore/useAuth";
import { logout } from "~/services/auth";
import { useAppDispatch } from "~/redux/hooks";
import { showNotification } from "~/redux/slices/uiSlice";
import { getStoreHandleForUid } from "~/services/storeHandleService";
import { getUserProfile } from "~/services/usersService";
import AppContainer from "~/components/shared/AppContainer";
import { useTranslation } from "react-i18next";
import { setAppLanguage } from "~/i18n";
import CheckIcon from "@mui/icons-material/Check";
import TranslateIcon from "@mui/icons-material/Translate";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LanguageIcon from "@mui/icons-material/Language";

const dropDownSeetings = [
  {
    optionName: "Log In",
    link: "/login",
    businessPage: false,
  },
];

const Header = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [role, setRole] = React.useState<"individual" | "business" | null>(
    null,
  );
  const [dealerVerified, setDealerVerified] = React.useState<boolean>(false);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null,
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null,
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    if (!user) {
      setRole(null);
      setDealerVerified(false);
      return;
    }
    const load = async (attempt: number) => {
      try {
        const p = await getUserProfile(user.uid);
        if (cancelled) return;
        setRole(p?.role ?? null);
        setDealerVerified(Boolean(p?.dealerVerified));

        if (!p && attempt < 5) {
          retryTimer = setTimeout(() => load(attempt + 1), 800);
        }
      } catch {
        if (cancelled) return;
        setRole(null);
        setDealerVerified(false);
        if (attempt < 5) {
          retryTimer = setTimeout(() => load(attempt + 1), 800);
        }
      }
    };

    if (user) {
      user.getIdTokenResult().then((res) => {
        if (!cancelled) setIsAdmin(!!res.claims.admin);
      });
    } else {
      setIsAdmin(false);
    }

    load(0);
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [user]);

  const pages = React.useMemo(() => {
    return [
      { pageName: t("nav.listings"), url: "/", key: "listings" },
      { pageName: t("nav.businesses"), url: "/businesses", key: "businesses" },
      {
        pageName: t("nav.about", { defaultValue: "About" }),
        url: "/about",
        key: "about",
      },
    ];
  }, [t]);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const goProfile = async () => {
    if (!user) return;
    try {
      const handle = await getStoreHandleForUid(user.uid);
      navigate(`/store/${handle || user.uid}`);
    } catch (e) {
      console.error(e);
      navigate(`/store/${user.uid}`);
    }
  };

  return (
    <AppBar position="static" sx={{ zIndex: 1200 }}>
      <AppContainer>
        <Toolbar disableGutters>
          <Box
            onClick={() => navigate("/")}
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Box
              component="img"
              src="/logo.svg"
              alt="BalticAuto"
              sx={{ height: 80, width: "auto" }}
            />
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <Button
                  key={page.key}
                  component={RouterLink}
                  to={page.url}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, display: "block" }}
                >
                  {page.pageName}
                </Button>
              ))}
            </Menu>
          </Box>
          <Box
            onClick={() => navigate("/")}
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <Box
              component="img"
              src="/logo.svg"
              alt="BalticAuto"
              sx={{ height: 48, width: "auto" }}
            />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 2,
            }}
          >
            {pages.map((page) => (
              <Button
                key={page.key}
                component={RouterLink}
                to={page.url}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, display: "block" }}
              >
                {page.pageName}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 1 }} />

          <Box
            sx={{ flexGrow: 0, display: "flex", alignItems: "center", gap: 2 }}
          >
            {!user ? (
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{ borderRadius: 2, px: 3 }}
              >
                {t("nav.login")}
              </Button>
            ) : null}

            <Tooltip
              title={
                user
                  ? t("nav.account", { defaultValue: "Account" })
                  : t("nav.language", { defaultValue: "Language" })
              }
            >
              <IconButton
                onClick={handleOpenUserMenu}
                sx={{
                  p: 0.5,
                  color: "inherit",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 2,
                }}
              >
                {user ? (
                  <AccountCircleIcon fontSize="large" />
                ) : (
                  <LanguageIcon />
                )}
              </IconButton>
            </Tooltip>

            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {user && (
                <Box>
                  {!user.phoneNumber ? (
                    <MenuItem
                      onClick={() => {
                        navigate("/verify-phone");
                        handleCloseUserMenu();
                      }}
                      sx={{ color: "error.main" }}
                    >
                      <ListItemIcon>
                        <CheckIcon fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t("nav.verifyPhone", {
                          defaultValue: "Verify Phone",
                        })}
                        primaryTypographyProps={{ fontWeight: 800 }}
                      />
                    </MenuItem>
                  ) : (
                    role === "business" && (
                      <>
                        <MenuItem
                          onClick={() => {
                            goProfile();
                            handleCloseUserMenu();
                          }}
                        >
                          <ListItemIcon>
                            <PersonIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={t("nav.profile")}
                            primaryTypographyProps={{ fontWeight: 600 }}
                          />
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            navigate("/admin");
                            handleCloseUserMenu();
                          }}
                        >
                          <ListItemIcon>
                            <DashboardIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={t("nav.admin")}
                            primaryTypographyProps={{ fontWeight: 600 }}
                          />
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            navigate("/new-listing");
                            handleCloseUserMenu();
                          }}
                        >
                          <ListItemIcon>
                            <AddIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={t("nav.newListing")}
                            primaryTypographyProps={{ fontWeight: 600 }}
                          />
                        </MenuItem>
                      </>
                    )
                  )}
                  {isAdmin && (
                    <MenuItem
                      onClick={() => {
                        navigate("/super-admin");
                        handleCloseUserMenu();
                      }}
                      sx={{ bgcolor: "rgba(106, 27, 154, 0.05)" }}
                    >
                      <ListItemIcon>
                        <DashboardIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Super Admin"
                        primaryTypographyProps={{
                          fontWeight: 800,
                          color: "primary",
                        }}
                      />
                    </MenuItem>
                  )}
                  <Divider />
                </Box>
              )}

              <MenuItem disabled sx={{ opacity: 0.9 }}>
                <ListItemIcon>
                  <LanguageIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={t("nav.language")}
                  primaryTypographyProps={{ fontWeight: 700 }}
                />
              </MenuItem>
              <Divider />
              {[
                { code: "en", label: "English", flag: "🇬🇧" },
                { code: "lv", label: "Latviešu", flag: "🇱🇻" },
                { code: "lt", label: "Lietuvių", flag: "🇱🇹" },
                { code: "et", label: "Eesti", flag: "🇪🇪" },
                { code: "es", label: "Español", flag: "🇪🇸" },
                { code: "de", label: "Deutsch", flag: "🇩🇪" },
              ].map((lang) => {
                const selected = i18n.language?.startsWith(lang.code);
                return (
                  <MenuItem
                    key={lang.code}
                    selected={selected}
                    onClick={() => {
                      setAppLanguage(lang.code as any);
                      handleCloseUserMenu();
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <span style={{ fontSize: 16, lineHeight: 1 }}>
                        {lang.flag}
                      </span>
                    </ListItemIcon>
                    <ListItemText primary={lang.label} />
                    {selected ? <CheckIcon fontSize="small" /> : null}
                  </MenuItem>
                );
              })}

              {user && (
                <Box>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem
                    onClick={() => {
                      logout().then(() => {
                        dispatch(
                          showNotification({
                            message: t("nav.logout"),
                            severity: "info",
                          }),
                        );
                        navigate("/");
                      });
                      handleCloseUserMenu();
                    }}
                  >
                    <ListItemIcon>
                      <ExitToAppIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={t("nav.logout")} />
                  </MenuItem>
                </Box>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppContainer>
    </AppBar>
  );
};

export default Header;
