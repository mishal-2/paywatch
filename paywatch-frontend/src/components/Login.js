import React, { useState } from "react";
import {  TextField, Button, Typography, Paper } from "@mui/material";

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = () => {
    if (credentials.username && credentials.password) {
      onLogin(credentials.username);
    } else {
      alert("Enter username and password");
    }
  };

  return (
    <div
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
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
            mb: 4,
            fontSize: "14px",
          }}
        >
          Track your finances with precision
        </Typography>

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
              transition: "all 0.3s",
              "& fieldset": {
                borderColor: "rgba(102, 126, 234, 0.3)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(102, 126, 234, 0.6)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#667eea",
                boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
              },
            },
            "& .MuiInputBase-input": {
              color: "#333",
              fontSize: "15px",
            },
            "& .MuiInputLabel-root": {
              color: "#999",
            },
          }}
        />

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
              transition: "all 0.3s",
              "& fieldset": {
                borderColor: "rgba(102, 126, 234, 0.3)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(102, 126, 234, 0.6)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#667eea",
                boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
              },
            },
            "& .MuiInputBase-input": {
              color: "#333",
              fontSize: "15px",
            },
            "& .MuiInputLabel-root": {
              color: "#999",
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
                  "&:hover": {
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                  },
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            ),
          }}
        />

        <Button 
          variant="contained" 
          fullWidth 
          onClick={handleLogin}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontWeight: "700",
            py: 1.5,
            borderRadius: "10px",
            fontSize: "16px",
            textTransform: "none",
            transition: "all 0.3s",
            boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
            "&:hover": {
              boxShadow: "0 12px 30px rgba(102, 126, 234, 0.6)",
              transform: "translateY(-2px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          }}
        >
          Sign In
        </Button>

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
          <Button
            sx={{
              color: "#667eea",
              textTransform: "none",
              p: 0,
              mr: 2,
              fontWeight: "500",
              "&:hover": {
                backgroundColor: "rgba(102, 126, 234, 0.1)",
              },
            }}
          >
            Forgot password?
          </Button>
          <Button
            sx={{
              color: "#667eea",
              textTransform: "none",
              p: 0,
              fontWeight: "500",
              "&:hover": {
                backgroundColor: "rgba(102, 126, 234, 0.1)",
              },
            }}
          >
            Sign up
          </Button>
        </Typography>
      </Paper>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(20px);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;