import { useState, useCallback } from 'react';
import { nlpPreciseAlign } from '../utils/helpers';

export function useOpenAI(apiKey) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateAudio = useCallback(async ({ text, voice, instructions }) => {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-tts',
          voice: voice,
          input: text,
          instructions: instructions,
          response_format: 'aac'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const audioBlob = await response.blob();
      return audioBlob;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  const transcribeAudio = useCallback(async (audioFile) => {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'verbose_json');
      formData.append('timestamp_granularities[]', 'segment');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const transcription = await response.json();

      // Apply NLP sentence alignment to segments (temporarily disabled)
      // if (transcription.segments && transcription.segments.length > 0) {
      //   transcription.segments = nlpPreciseAlign(transcription.segments);
      // }

      return transcription;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  return {
    loading,
    error,
    generateAudio,
    transcribeAudio
  };
}

