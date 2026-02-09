import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  Slide,
} from "@mui/material";
import StatsChart from "../components/StatsCharts";

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({ fake: 0, real: 0 });
  const socketRef = useRef(null);

  // Helper for color based on confidence
  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return "green";
    if (conf >= 0.5) return "orange";
    return "red";
  };

  useEffect(() => {
    fetch("http://localhost:8000/recent-results")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setResults(data);
        const fakeCount = data.filter((item) => item.verdict === "FAKE").length;
        const realCount = data.filter((item) => item.verdict === "REAL").length;
        setStats({ fake: fakeCount, real: realCount });
      })
      .catch((error) => {
        console.error("Failed to fetch analysis results:", error);
      });
  }, []);

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
    socketRef.current = io(apiUrl);

    socketRef.current.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    socketRef.current.on("new_result", (data) => {
      console.log("New result received:", data);
      setResults((prev) => [data, ...prev]);

      const verdictKey = data.verdict?.toLowerCase();
      if (verdictKey === "fake" || verdictKey === "real") {
        setStats((prev) => ({
          ...prev,
          [verdictKey]: prev[verdictKey] + 1,
        }));
      }
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 10 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Real-Time Fake News Detection Results
      </Typography>

      <Box sx={{ mb: 5, mt: 4 }}>
        <StatsChart stats={stats} />
      </Box>

      <Typography variant="h5" gutterBottom align="center" sx={{ mt: 5, mb: 3 }} fontWeight="bold">
        Recent Analyses
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {results.length === 0 ? (
          <Typography variant="body1" color="textSecondary" sx={{ m: 3 }}>
            No analysis results yet. Start analyzing articles to see them here.
          </Typography>
        ) : (
          results.map((item, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Slide direction="up" in timeout={400}>
                <Card
                  sx={{
                    borderLeft: `6px solid ${item.verdict === "FAKE" ? "#d32f2f" : "#388e3c"}`,
                    backgroundColor: "#fdfdfd",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Claim:
                    </Typography>
                    <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
                      {typeof item.claim === "string" ? item.claim : JSON.stringify(item.claim)}
                    </Typography>

                    <Typography variant="h6">Verdict:</Typography>
                    <Chip
                      label={item.verdict}
                      color={item.verdict === "FAKE" ? "error" : "success"}
                      variant="outlined"
                      sx={{ mt: 1, mb: 2 }}
                    />

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Confidence:{" "}
                      <strong style={{ color: getConfidenceColor(item.confidence) }}>
                        {(item.confidence * 100).toFixed(2)}%
                      </strong>
                    </Typography>

                    {item.reason && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Reason:</strong> {item.reason}
                      </Typography>
                    )}

                    {item.source_type && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Source Type:</strong> {item.source_type}
                      </Typography>
                    )}

                    {Array.isArray(item.tags) && item.tags.length > 0 && (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                        {item.tags.map((tag, idx) => (
                          <Chip
                            key={idx}
                            label={`#${tag}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}