import React, { useState } from 'react';
import axios from 'axios';

const FakeNewsChecker = () => {
  const [inputText, setInputText] = useState('');
  const [verdict, setVerdict] = useState('');
  const [loading, setLoading] = useState(false);

  const checkNews = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/analyze`, {
        claim: inputText
      });
      setVerdict(response.data.verdict);
    } catch (error) {
      console.error('Error checking news:', error);
      setVerdict('Error occurred');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-2">Fake News Detector</h2>
      <textarea
        className="w-full p-2 border rounded"
        rows="4"
        placeholder="Enter news text..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={checkNews}
        disabled={loading}
      >
        {loading ? 'Checking...' : 'Check'}
      </button>
      {verdict && (
        <div className="mt-4 text-lg">
          Verdict: <strong>{verdict}</strong>
        </div>
      )}
    </div>
  );
};

export default FakeNewsChecker;
