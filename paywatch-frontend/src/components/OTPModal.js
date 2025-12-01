import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import { transactionAPI } from "../services/api";

const OTPModal = ({ open, onClose, transactionId, amount, onVerified }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [resending, setResending] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setOtp("");
      setError("");
      setTimeLeft(300);
    }
  }, [open]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await transactionAPI.verifyTransaction(transactionId, otp);
      onVerified();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");

    try {
      await transactionAPI.resendOTP(transactionId);
      setTimeLeft(300); // Reset timer
      setOtp("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          background: "rgba(255, 255, 255, 0.98)",
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SecurityIcon sx={{ color: "#667eea", fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Transaction Verification
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Suspicious Activity Detected
          </Typography>
          <Typography variant="body2">
            Transaction Amount: <strong>${amount}</strong>
          </Typography>
        </Alert>

        <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
          We've sent a 6-digit verification code to your registered email address. Please enter it
          below to complete this transaction.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Enter OTP"
          fullWidth
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
            setOtp(value);
            setError("");
          }}
          placeholder="000000"
          inputProps={{
            maxLength: 6,
            style: {
              fontSize: "24px",
              textAlign: "center",
              letterSpacing: "10px",
              fontWeight: "bold",
            },
          }}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(102, 126, 234, 0.08)",
              borderRadius: "10px",
            },
          }}
          disabled={loading || timeLeft === 0}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography
            variant="body2"
            sx={{
              color: timeLeft < 60 ? "#ff6b6b" : "#666",
              fontWeight: 600,
            }}
          >
            Time remaining: {formatTime(timeLeft)}
          </Typography>

          <Button
            onClick={handleResend}
            disabled={resending || timeLeft > 240}
            sx={{
              textTransform: "none",
              color: "#667eea",
              fontWeight: 600,
            }}
          >
            {resending ? "Sending..." : "Resend OTP"}
          </Button>
        </Box>

        {timeLeft === 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            OTP has expired. Please request a new one.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: "none",
            color: "#999",
          }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleVerify}
          variant="contained"
          disabled={loading || !otp || otp.length !== 6 || timeLeft === 0}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Verify"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OTPModal;
