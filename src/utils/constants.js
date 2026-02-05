// Constants for the podcast tool

export const LEVELS = [
  'Beginner',
  'Elementary', 
  'Pre-Intermediate',
  'Intermediate',
  'Upper-Intermediate',
  'Advanced'
];

export const CATEGORIES = [
  'Arts & Entertainment',
  'Business & Technology',
  'Educational',
  'Hobbies & Interests',
  'Lifestyle & Health',
  'News & Politics',
  'Sports & Recreation',
  'Stories & Crime'
];

export const TTS_VOICES = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced' },
  { id: 'echo', name: 'Echo', description: 'Warm, conversational' },
  { id: 'fable', name: 'Fable', description: 'Expressive, British' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative' },
  { id: 'nova', name: 'Nova', description: 'Friendly, upbeat' },
  { id: 'shimmer', name: 'Shimmer', description: 'Soft, gentle' },
  { id: 'coral', name: 'Coral', description: 'Clear, warm' },
  { id: 'sage', name: 'Sage', description: 'Calm, thoughtful' },
  { id: 'ash', name: 'Ash', description: 'Natural, relaxed' },
  { id: 'ballad', name: 'Ballad', description: 'Melodic, expressive' },
  { id: 'verse', name: 'Verse', description: 'Dynamic, engaging' },
  { id: 'marin', name: 'Marin', description: 'Friendly, podcast style' }
];

export const DEFAULT_TTS_INSTRUCTION = 
  "You are a friendly, relaxed podcast companion with a natural General American accent. " +
  "Speak in a warm, welcoming, and expressive tone. " +
  "Your delivery should be dynamic and engaging, avoiding any robotic monotone.";

export const WORKFLOW_STEPS = [
  { id: 1, title: 'Audio Üretimi', description: 'TTS ile ses dosyası oluştur' },
  { id: 2, title: 'Dönüştürme', description: 'Audio formatını dönüştür' },
  { id: 3, title: 'Timestamp', description: 'Whisper ile transkript al' },
  { id: 4, title: 'SQL Üret', description: 'Insert sorgusu oluştur' }
];
