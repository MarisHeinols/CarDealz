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
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React from "react";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router";
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
  const [role, setRole] = React.useState<"individual" | "business" | null>(null);

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
    if (!user) {
      setRole(null);
      return;
    }
    getUserProfile(user.uid)
      .then((p) => {
        if (!cancelled) setRole(p?.role ?? null);
      })
      .catch(() => {
        if (!cancelled) setRole(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const pages = React.useMemo(() => {
    const base = [
      { pageName: t("nav.listings"), url: "/", key: "listings" },
      { pageName: t("nav.profile"), url: "/user", key: "profile" },
    ];
    if (role === "business") base.push({ pageName: t("nav.admin"), url: "/admin", key: "admin" });
    return base;
  }, [role, t]);

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
              alt="CarDealz"
              sx={{ height: 32, width: "auto" }}
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
                    onClick={() => {
                      if (page.key === "profile") {
                        goProfile();
                      } else {
                        navigate(page.url);
                      }
                      handleCloseNavMenu();
                    }}
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
            <Box component="img" src="/logo.svg" alt="CarDealz" sx={{ height: 28, width: "auto" }} />
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
                  onClick={() => {
                    if (page.key === "profile") {
                      goProfile();
                    } else {
                      navigate(page.url);
                    }
                    handleCloseNavMenu();
                  }}
                  sx={{ my: 2, display: "block" }}
                >
                  {page.pageName}
                </Button>
              ))}
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 2,
              mr: 2,
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/new-listing")}
            >
              {t("nav.newListing")}
            </Button>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <>
                <Tooltip title={t("nav.profile")}>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt="User" src="/static/images/avatar/2.jpg" />
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
                  <MenuItem disabled sx={{ opacity: 0.9 }}>
                    <ListItemIcon>
                      <TranslateIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t("nav.language")}
                      secondary={t("nav.languageHint")}
                      primaryTypographyProps={{ fontWeight: 700 }}
                      secondaryTypographyProps={{ variant: "caption" }}
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
                          <span style={{ fontSize: 16, lineHeight: 1 }}>{lang.flag}</span>
                        </ListItemIcon>
                        <ListItemText primary={lang.label} />
                        {selected ? <CheckIcon fontSize="small" /> : null}
                      </MenuItem>
                    );
                  })}

                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem
                    onClick={() => {
                      logout().then(() => {
                        dispatch(
                          showNotification({
                            message: "Logged out successfully",
                            severity: "info",
                          })
                        );
                        navigate("/");
                      });
                      handleCloseUserMenu();
                    }}
                  >
                    <ListItemText primary={t("nav.logout")} />
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button variant="outlined" onClick={() => navigate("/login")}>
                {t("nav.login")}
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppContainer>
    </AppBar>
  );
};

export default Header;
