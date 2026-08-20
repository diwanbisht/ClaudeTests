// src/rag/healthCheck.ts

import axios from 'axios';

export async function checkOllama() {
  try {
    await axios.get('http://localhost:11434');
    console.log('✅ Ollama is running');
  } catch {
    throw new Error('❌ Ollama is NOT running on http://localhost:11434');
  }
}

export async function checkChroma() {
  try {
    // If using local in-memory Chroma, skip
    // If using server mode:
    await axios.get('http://localhost:8000/api/v1/heartbeat');
    console.log('✅ Chroma is running');
  } catch {
    console.warn('⚠️ Chroma server not reachable (may be in-memory)');
  }
}