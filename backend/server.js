const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const NewsAnalyzer = require('./newsAnalyzer');

// Initialize
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const analyzer = new NewsAnalyzer();

// Middleware
app.use(cors());
app.use(express.json());

// Routes

/**
 * POST /analyze
 * Analyze a news claim or article
 * Body: { text: string }
 */
app.post('/analyze', (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing 'text' field in request." });
    }

    const result = analyzer.analyze(text);
    
    // Emit to all connected clients
    io.emit('new_result', result);

    res.json(result);
  } catch (error) {
    console.error('Error in /analyze:', error);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
});

/**
 * GET /recent-results
 * Get recent analysis results
 */
app.get('/recent-results', (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const results = analyzer.getHistory().slice(-limit).reverse();
    res.json(results);
  } catch (error) {
    console.error('Error in /recent-results:', error);
    res.status(500).json({ error: 'Failed to fetch results', details: error.message });
  }
});

/**
 * GET /statistics
 * Get analysis statistics
 */
app.get('/statistics', (req, res) => {
  try {
    const stats = analyzer.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error in /statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
  }
});

/**
 * POST /feedback
 * Submit feedback on an analysis
 */
app.post('/feedback', (req, res) => {
  try {
    const { claim, userVerdict, comment } = req.body;
    
    console.log('Feedback received:', {
      claim,
      userVerdict,
      comment,
      timestamp: new Date().toISOString()
    });

    res.json({ 
      message: 'Feedback submitted successfully',
      status: 'received'
    });
  } catch (error) {
    console.error('Error in /feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback', details: error.message });
  }
});

/**
 * GET /health
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    analyzer: 'NewsAnalyzer v1.0',
    facts_loaded: analyzer.getHistory().length
  });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('✓ Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('✗ Client disconnected:', socket.id);
  });

  // Allow clients to request analysis via WebSocket
  socket.on('analyze', (data) => {
    const result = analyzer.analyze(data.text);
    socket.emit('analysis_result', result);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           FAKE NEWS DETECTION SERVER STARTED               ║
║                                                            ║
║  ✓ Port: ${PORT}                                          
║  ✓ API: http://localhost:${PORT}                           
║  ✓ WebSocket: Enabled                                     
║  ✓ Dataset: Connected                                     
║  ✓ Analyzer: Ready                                         
║                                                            
║  Endpoints:                                                
║  POST   /analyze           - Analyze a claim               
║  GET    /recent-results    - Get recent results            
║  GET    /statistics        - Get analysis stats            
║  POST   /feedback          - Submit feedback               
║  GET    /health            - Health check                  
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = { app, server, analyzer };
