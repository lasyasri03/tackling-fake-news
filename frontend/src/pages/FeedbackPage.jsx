import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState(null); // null, 'sending', 'success', 'error'

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Feedback Error:", error);
      setStatus("error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Feedback
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Your Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Your Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Your Feedback"
          name="message"
          value={formData.message}
          onChange={handleChange}
          fullWidth
          required
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            type="submit"
            variant="contained"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending..." : "Submit"}
          </Button>
          {status === "sending" && <CircularProgress size={24} />}
        </Box>
      </form>

      {status === "success" && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Thank you for your feedback!
        </Alert>
      )}
      {status === "error" && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Something went wrong. Please try again.
        </Alert>
      )}
    </Container>
  );
};

export default Feedback;
