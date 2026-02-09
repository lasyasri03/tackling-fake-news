import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
  Paper,
  Chip,
  Grid,
  LinearProgress,
} from "@mui/material";
import { WarningAmber } from "@mui/icons-material";

export default function AnalyzePage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: text }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Failed to fetch analysis result.");
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 10 }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
        Fake News Detection System
      </Typography>
      <Typography variant="subtitle1" align="center" gutterBottom>
        Analyze news articles to determine their authenticity using AI
      </Typography>

      {/* Main Grid */}
      <Grid container spacing={4} sx={{ mt: 3 }}>
        {/* Left: Article Input */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Article Analysis
            </Typography>
            <TextField
              label="Enter news article text"
              multiline
              rows={8}
              fullWidth
              value={text}
              onChange={(e) => setText(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleAnalyze}
              disabled={!text || loading}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Analyze Article"}
            </Button>
          </Paper>
        </Grid>

        {/* Right: Result Display */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, minHeight: 250 }}>
            <Typography variant="h6" gutterBottom>
              Analysis Results
            </Typography>

            {error && (
              <Typography color="error">
                <WarningAmber fontSize="small" sx={{ mr: 1 }} />
                {error}
              </Typography>
            )}

            {!error && !result && (
              <Typography color="textSecondary">
                Enter an article above and click "Analyze" to see results.
              </Typography>
            )}

            {result && !error && (
              <Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Verdict:</strong>{" "}
                  <span style={{ color: result.verdict === "REAL" ? "green" : "red" }}>
                    {result.verdict}
                  </span>
                </Typography>

                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Confidence:</strong>{" "}
                  <span style={{ color: result.confidence >= 0.8 ? "green" : result.confidence >= 0.5 ? "orange" : "red" }}>
                    {(result.confidence * 100).toFixed(2)}%
                  </span>
                </Typography>

                <Box sx={{ mt: 1, mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={result.confidence * 100}
                    sx={{
                      height: 8,
                      borderRadius: 5,
                      backgroundColor: "#eee",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor:
                          result.confidence >= 0.8
                            ? "green"
                            : result.confidence >= 0.5
                            ? "orange"
                            : "red",
                      },
                    }}
                  />
                </Box>

                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Reason:</strong> {result.reason}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Source Type:</strong> {result.source_type}
                </Typography>

                {result.tags?.length > 0 && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {result.tags.map((tag, i) => (
                      <Chip key={i} label={`#${tag}`} variant="outlined" color="primary" />
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* How it works */}
      <Paper elevation={3} sx={{ mt: 6, p: 4 }}>
        <Typography variant="h6" align="center" gutterBottom fontWeight="medium">
          How it works
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4} textAlign="center">
            <Typography variant="h4" color="primary">1</Typography>
            <Typography fontWeight="bold">Paste your article</Typography>
            <Typography variant="body2" color="textSecondary">
              Enter your news article text in the input field
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} textAlign="center">
            <Typography variant="h4" color="primary">2</Typography>
            <Typography fontWeight="bold">AI Analysis</Typography>
            <Typography variant="body2" color="textSecondary">
              Our AI model analyzes the content for authenticity
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} textAlign="center">
            <Typography variant="h4" color="primary">3</Typography>
            <Typography fontWeight="bold">Get Results</Typography>
            <Typography variant="body2" color="textSecondary">
              See verdict with confidence score and context tags
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}