"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTranscribe = async () => {
    setLoading(true);
    setError(null);
    setTranscript(null);

    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setTranscript(data.text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>AssemblyAI Transcription</h1>

      <button
        onClick={handleTranscribe}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {loading ? "Transcribing..." : "Start Transcription"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "20px" }}>Error: {error}</p>
      )}

      {transcript && (
        <div style={{ marginTop: "20px" }}>
          <h2>Transcript:</h2>
          <p>{transcript}</p>
        </div>
      )}
    </main>
  );
}
