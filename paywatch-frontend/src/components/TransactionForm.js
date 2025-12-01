import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,

} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

function TransactionForm({ setPrediction }) {
  const [amount, setAmount] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!amount || !time) {
      setError("Please fill in all fields");
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (parseFloat(time) < 0 || parseFloat(time) > 86400) {
      setError("Time must be between 0 and 86400 seconds");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:5000/predict", {
        Amount: parseFloat(amount),
        Time: parseFloat(time),
      });
      setPrediction(res.data.prediction);
      setSuccess("Fraud prediction completed!");
      setAmount("");
      setTime("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error predicting fraud. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: "10px",
            background: "rgba(255, 107, 107, 0.1)",
            border: "1px solid rgba(255, 107, 107, 0.3)",
            color: "#ff6b6b",
            "& .MuiAlert-icon": {
              color: "#ff6b6b",
            },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
            borderRadius: "10px",
            background: "rgba(81, 207, 102, 0.1)",
            border: "1px solid rgba(81, 207, 102, 0.3)",
            color: "#51cf66",
            "& .MuiAlert-icon": {
              color: "#51cf66",
            },
          }}
        >
          {success}
        </Alert>
      )}

      {/* Amount Input */}
      <TextField
        label="Transaction Amount"
        type="number"
        fullWidth
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount in USD"
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
          startAdornment: "$",
        }}
        disabled={loading}
      />

      {/* Time Input */}
      <TextField
        label="Transaction Time"
        type="number"
        fullWidth
        value={time}
        onChange={(e) => setTime(e.target.value)}
        placeholder="Enter time in seconds (0-86400)"
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
          endAdornment: "sec",
        }}
        disabled={loading}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{
          background: loading
            ? "linear-gradient(135deg, #999 0%, #777 100%)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
          "&:disabled": {
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
          },
          display: "flex",
          gap: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {loading ? (
          <>
            <CircularProgress size={20} color="inherit" />
            Analyzing...
          </>
        ) : (
          <>
            <SendIcon sx={{ fontSize: "18px" }} />
            Check Fraud
          </>
        )}
      </Button>

      {/* Info Text */}
      <Box
        sx={{
          mt: 2.5,
          p: 2,
          background: "rgba(102, 126, 234, 0.08)",
          borderRadius: "10px",
          border: "1px solid rgba(102, 126, 234, 0.2)",
        }}
      >
        <ul
          style={{
            margin: 0,
            paddingLeft: "20px",
            fontSize: "12px",
            color: "#666",
          }}
        >
          <li>Amount: Transaction value in USD</li>
          <li>Time: Seconds since start of day (0-86400)</li>
        </ul>
      </Box>
    </Box>
  );
}

export default TransactionForm;
