import {
  AppBar,
  Container,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Tooltip,
  Avatar,
} from "@mui/material";
import React from "react";
import MenuIcon from "@mui/icons-material/Menu";
import AdbIcon from "@mui/icons-material/Adb";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router";
import { useAuth } from "~/hooks/userStore/useAuth";
import { logout } from "~/services/auth";

const pages = [
  {
    pageName: "Listings",
    url: "/",
    businessPageOnly: false,
  },
  {
    pageName: "Profile",
    url: "/user",
    businessPageOnly: true,
  },
  {
    pageName: "Admin",
    url: "/admin",
    businessPageOnly: true,
  },
];

const dropDownSeetings = [
  {
    optionName: "Log In",
    link: "/login",
    businessPage: false,
  },
];

const Header = () => {
  const { user } = useAuth();

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null,
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null,
  );
  const navigate = useNavigate();

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

  return (
    <AppBar position="static" sx={{ zIndex: 1200 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            LOGO
          </Typography>

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
              {pages
                .filter(
                  (page) =>
                    !page.businessPageOnly || (page.businessPageOnly && user),
                )
                .map((page) => (
                  <Button
                    key={page.pageName}
                    onClick={() => {
                      navigate(page.url);
                      handleCloseNavMenu();
                    }}
                    sx={{ my: 2, display: "block" }}
                  >
                    {page.pageName}
                  </Button>
                ))}
            </Menu>
          </Box>
          <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            LOGO
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 2,
            }}
          >
            {pages
              .filter(
                (page) =>
                  !page.businessPageOnly || (page.businessPageOnly && user),
              )
              .map((page) => (
                <Button
                  key={page.pageName}
                  onClick={() => {
                    navigate(page.url);
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
              New Listing
            </Button>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
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
              {user ? (
                <MenuItem
                  onClick={() => {
                    logout();
                    handleCloseUserMenu();
                  }}
                >
                  <Typography sx={{ textAlign: "center" }}>Log Out</Typography>
                </MenuItem>
              ) : (
                dropDownSeetings.map((setting) => (
                  <MenuItem
                    key={setting.link}
                    onClick={() => {
                      navigate(setting.link);
                      handleCloseUserMenu();
                    }}
                  >
                    <Typography sx={{ textAlign: "center" }}>
                      {setting.optionName}
                    </Typography>
                  </MenuItem>
                ))
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
