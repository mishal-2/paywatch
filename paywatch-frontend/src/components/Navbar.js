import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

const Navbar = ({ username, onLogout }) => {
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        zIndex: 1201, // keeps it above other content
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 3,
          py: 1.5,
        }}
      >
        {/* Left: Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              background: "rgba(255, 255, 255, 0.2)",
              p: 1,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: "22px",
              letterSpacing: "-0.5px",
              color: "white",
            }}
          >
            PayWatch
          </Typography>
        </Box>

        {/* Right: User Info + Sign Out */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              background: "rgba(255, 255, 255, 0.3)",
              color: "white",
              fontWeight: 700,
              fontSize: "14px",
              border: "2px solid rgba(255, 255, 255, 0.5)",
            }}
          >
            {getInitials(username)}
          </Avatar>
          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.95)",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {username}
          </Typography>
          <Button
            onClick={onLogout}
            startIcon={<LogoutIcon />}
            sx={{
              color: "white",
              fontWeight: 600,
              textTransform: "none",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "8px",
              px: 2,
              py: 0.8,
              "&:hover": {
                background: "rgba(255,255,255,0.25)",
              },
            }}
          >
         
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
