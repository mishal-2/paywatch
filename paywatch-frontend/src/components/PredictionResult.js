import React from "react";
import { Box, Typography, Card, LinearProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

function PredictionResult({ prediction }) {
  const isFraudulent = prediction === 1;

  return (
    <Box sx={{ width: "100%" }}>
      {isFraudulent ? (
        <>
          {/* Fraudulent Transaction */}
          <Box
            sx={{
              mb: 2,
              p: 3,
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: 2,
              boxShadow: "0 10px 30px rgba(255, 107, 107, 0.3)",
              animation: "slideIn 0.5s ease-out",
            }}
          >
            <ErrorIcon sx={{ fontSize: 40, color: "white" }} />
            <Box>
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "white",
                  mb: 0.5,
                }}
              >
                ⚠️ Fraudulent Transaction Detected
              </Typography>
              <Typography
                sx={{
                  fontSize: "13px",
                  color: "rgba(255, 255, 255, 0.9)",
                }}
              >
                This transaction has been flagged as potentially fraudulent
              </Typography>
            </Box>
          </Box>

          {/* Risk Level */}
          <Card
            sx={{
              p: 2.5,
              background: "rgba(255, 107, 107, 0.08)",
              border: "1px solid rgba(255, 107, 107, 0.2)",
              borderRadius: "10px",
            }}
          >
            <Box sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#ff6b6b",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Risk Level: HIGH
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={90}
              sx={{
                height: 8,
                borderRadius: 4,
                background: "rgba(255, 107, 107, 0.1)",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #ff6b6b 0%, #ee5a6f 100%)",
                  borderRadius: 4,
                },
              }}
            />
            <Typography
              sx={{
                fontSize: "11px",
                color: "#999",
                mt: 1,
              }}
            >
              Recommended Action: Review or decline this transaction
            </Typography>
          </Card>
        </>
      ) : (
        <>
          {/* Safe Transaction */}
          <Box
            sx={{
              mb: 2,
              p: 3,
              background: "linear-gradient(135deg, #51cf66 0%, #2db448 100%)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: 2,
              boxShadow: "0 10px 30px rgba(81, 207, 102, 0.3)",
              animation: "slideIn 0.5s ease-out",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40, color: "white" }} />
            <Box>
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "white",
                  mb: 0.5,
                }}
              >
                ✅ Transaction is Safe
              </Typography>
              <Typography
                sx={{
                  fontSize: "13px",
                  color: "rgba(255, 255, 255, 0.9)",
                }}
              >
                This transaction has been verified as legitimate
              </Typography>
            </Box>
          </Box>

          {/* Confidence Level */}
          <Card
            sx={{
              p: 2.5,
              background: "rgba(81, 207, 102, 0.08)",
              border: "1px solid rgba(81, 207, 102, 0.2)",
              borderRadius: "10px",
            }}
          >
            <Box sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#51cf66",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Confidence: 95%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={95}
              sx={{
                height: 8,
                borderRadius: 4,
                background: "rgba(81, 207, 102, 0.1)",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #51cf66 0%, #2db448 100%)",
                  borderRadius: 4,
                },
              }}
            />
            <Typography
              sx={{
                fontSize: "11px",
                color: "#999",
                mt: 1,
              }}
            >
              Recommended Action: Proceed with transaction
            </Typography>
          </Card>
        </>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  );
}

export default PredictionResult;