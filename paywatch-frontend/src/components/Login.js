import React, { useState } from "react";
import { TextField, Button, Typography, Paper, Alert, Tabs, Tab, Box } from "@mui/material";
import { authAPI } from "../services/api";

const Login = ({ onLogin }) => {
  const [tab, setTab] = useState(0); // 0 = Login, 1 = Register
  const [credentials, setCredentials] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    if (!credentials.email || !credentials.password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.login(credentials.email, credentials.password);
      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Call parent callback
      onLogin(user.username);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    setLoading(true);

    if (!credentials.username || !credentials.email || !credentials.password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (credentials.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register(
        credentials.username,
        credentials.email,
        credentials.password
      );
      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Call parent callback
      onLogin(user.username);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tab === 0) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      {/* Animated background shapes */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "500px",
          height: "500px",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "50%",
          animation: "float 20s infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-50%",
          right: "-50%",
          width: "500px",
          height: "500px",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "50%",
          animation: "float 25s infinite reverse",
        }}
      />

      <Paper
        sx={{
          p: 4,
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          position: "relative",
          zIndex: 10,
        }}
        elevation={0}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            textAlign: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "800",
            mb: 1,
            fontSize: "32px",
          }}
        >
          PayWatch
        </Typography>
        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            color: "#999",
            mb: 3,
            fontSize: "14px",
          }}
        >
          AI-Powered Fraud Detection
        </Typography>

        {/* Tabs for Login/Register */}
        <Tabs
          value={tab}
          onChange={(e, newValue) => {
            setTab(newValue);
            setError("");
            setCredentials({ username: "", email: "", password: "" });
          }}
          sx={{ mb: 3 }}
          centered
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Username field (only for registration) */}
          {tab === 1 && (
            <TextField
              label="Username"
              name="username"
              fullWidth
              value={credentials.username}
              onChange={handleChange}
              sx={{
                mb: 2.5,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(102, 126, 234, 0.08)",
                  borderRadius: "10px",
                },
              }}
              disabled={loading}
            />
          )}

          {/* Email field */}
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            value={credentials.email}
            onChange={handleChange}
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(102, 126, 234, 0.08)",
                borderRadius: "10px",
              },
            }}
            disabled={loading}
          />

          {/* Password field */}
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            fullWidth
            value={credentials.password}
            onChange={handleChange}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(102, 126, 234, 0.08)",
                borderRadius: "10px",
              },
            }}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{
                    textTransform: "none",
                    color: "#667eea",
                    fontSize: "11px",
                    fontWeight: "600",
                    p: 0.5,
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              ),
            }}
            disabled={loading}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: "700",
              py: 1.5,
              borderRadius: "10px",
              fontSize: "16px",
              textTransform: "none",
              boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
              "&:hover": {
                boxShadow: "0 12px 30px rgba(102, 126, 234, 0.6)",
                transform: "translateY(-2px)",
              },
            }}
          >
            {loading ? "Please wait..." : tab === 0 ? "Sign In" : "Create Account"}
          </Button>
        </Box>

        <Typography
          sx={{
            textAlign: "center",
            mt: 3,
            pt: 2.5,
            borderTop: "1px solid #e0e0e0",
            color: "#999",
            fontSize: "12px",
          }}
        >
          {tab === 0 ? "Don't have an account? " : "Already have an account? "}
          <Button
            onClick={() => {
              setTab(tab === 0 ? 1 : 0);
              setError("");
              setCredentials({ username: "", email: "", password: "" });
            }}
            sx={{
              color: "#667eea",
              textTransform: "none",
              p: 0,
              fontWeight: "600",
            }}
          >
            {tab === 0 ? "Register" : "Login"}
          </Button>
        </Typography>
      </Paper>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(30px); }
        }
      `}</style>
    </div>
  );
};

export default Login;
