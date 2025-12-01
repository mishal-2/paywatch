import React, { useState } from "react";
import { Container, Box, Typography, Card, Grid } from "@mui/material";
import Navbar from "./Navbar"; // ✅ import Navbar
import TransactionForm from "./TransactionForm";
import PredictionResult from "./PredictionResult";

function Dashboard({ username, onLogout }) {
  const [prediction, setPrediction] = useState(null);

  return (
    <>
      {/* ✅ Navbar stays fixed at top */}
      <Navbar username={username} onLogout={onLogout} />

      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          py: 10, // added space because of fixed Navbar
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated background shapes */}
        <Box
          sx={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "50%",
            animation: "float 20s infinite",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "600px",
            height: "600px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "50%",
            animation: "float 25s infinite reverse",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 10 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "80",
                color: "white",
                mb: 1,
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
              }}
            >
              Welcome, {username}! 👋
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "14px",
              }}
            >
              Track and predict your financial transactions
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Transaction Form Section */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                  p: 3,
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: "0 25px 70px rgba(0, 0, 0, 0.35)",
                    transform: "translateY(-5px)",
                  },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "700",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 2,
                  }}
                >
                  Add Transaction
                </Typography>
                <TransactionForm setPrediction={setPrediction} />
              </Card>
            </Grid>

            {/* Prediction Result Section */}
            {prediction !== null && (
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.8)",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                    p: 3,
                    animation: "slideIn 0.5s ease-out",
                    transition: "all 0.3s",
                    "&:hover": {
                      boxShadow: "0 25px 70px rgba(0, 0, 0, 0.35)",
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "700",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 2,
                    }}
                  >
                    Prediction Result
                  </Typography>
                  <PredictionResult prediction={prediction} />
                </Card>
              </Grid>
            )}

            {/* Full width placeholder if no prediction */}
            {prediction === null && (
              <Grid item xs={12}>
                <Card
                  sx={{
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "16px",
                    border: "2px dashed rgba(255, 255, 255, 0.3)",
                    p: 4,
                    textAlign: "center",
                  }}
                >
                  <Typography sx={{ color: "rgba(255, 255, 255, 0.8)" }}>
                    Fill out the transaction form to see predictions
                  </Typography>
                </Card>
              </Grid>
            )}
          </Grid>
        </Container>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(30px); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </Box>
    </>
  );
}

export default Dashboard;
