// Utility functions for the podcast tool
import nlp from 'compromise';

/**
 * NLP-based timestamp alignment
 * Merges raw Whisper segments into natural sentence boundaries
 * Port of fix_segment_nlp.py
 */
export function nlpPreciseAlign(segments) {
  if (!segments || segments.length === 0) return [];

  let fullText = '';
  const charTimeMap = [];

  for (const item of segments) {
    const text = item.text?.trim();
    if (!text) continue;

    const start = item.start;
    const end = item.end;
    const duration = end - start;
    const segLen = text.length;
    const timePerChar = duration / segLen;

    // Add space between segments if needed
    if (fullText && !fullText.endsWith(' ')) {
      fullText += ' ';
      charTimeMap.push(start);
    }

    fullText += text;

    // Map each character to its timestamp
    for (let i = 0; i < segLen; i++) {
      const charTime = start + (i * timePerChar);
      charTimeMap.push(charTime);
    }
  }

  // Use compromise to split into sentences
  const doc = nlp(fullText);
  const sentences = doc.sentences().out('array');

  const newData = [];
  let currentPos = 0;

  for (const sentText of sentences) {
    const trimmed = sentText.trim();
    if (!trimmed) continue;

    // Find sentence position in full text
    const startChar = fullText.indexOf(trimmed, currentPos);
    if (startChar === -1) continue;

    const endChar = startChar + trimmed.length;
    currentPos = endChar;

    // Get timestamps from map
    const safeStartIdx = Math.min(startChar, charTimeMap.length - 1);
    const safeEndIdx = Math.min(endChar - 1, charTimeMap.length - 1);

    const realStart = charTimeMap[safeStartIdx] || 0;
    const realEnd = charTimeMap[safeEndIdx] || realStart;

    newData.push({
      start: Math.round(realStart * 1000) / 1000,
      end: Math.round(realEnd * 1000) / 1000,
      text: trimmed
    });
  }

  return newData;
}

/**
 * Escape single quotes for SQL strings
 */
export function escapeSqlString(value) {
  return value.replace(/'/g, "''");
}

/**
 * Split text into paragraphs by double newlines
 */
export function textToParagraphs(text) {
  return text
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * Build SQL INSERT statement for podcasts table
 */
export function buildPodcastInsert({
  title,
  level,
  category,
  rawText,
  audioUrl,
  timestampData,
  imageUrl = null,
  isEmbedded = false,
  duration = null
}) {
  // Parse paragraphs
  const paragraphs = textToParagraphs(rawText);
  const episodes = paragraphs.length;
  const paragraphsJson = JSON.stringify(paragraphs);
  const paragraphsValue = `'${escapeSqlString(paragraphsJson)}'::jsonb`;

  // Process timestamps
  let timestampsValue = 'NULL';
  if (timestampData && timestampData.segments) {
    const cleanSegments = timestampData.segments.map(seg => ({
      start: seg.start,
      end: seg.end,
      text: seg.text.trim()
    }));
    const segmentsJson = JSON.stringify(cleanSegments);
    timestampsValue = `'${escapeSqlString(segmentsJson)}'::jsonb`;
  }

  // Escape other fields
  const escapedTitle = escapeSqlString(title);
  const escapedLevel = escapeSqlString(level);
  const escapedCategory = escapeSqlString(category);
  const escapedAudioUrl = escapeSqlString(audioUrl);
  const imageValue = imageUrl ? `'${escapeSqlString(imageUrl)}'` : 'NULL';
  const durationValue = duration !== null ? duration : 'NULL';

  const sql = `INSERT INTO public.podcasts (
  title,
  level,
  category,
  paragraphs,
  audio_url,
  audio_timestamps,
  image_url,
  publish_date,
  is_embedded,
  episodes,
  duration
) VALUES (
  '${escapedTitle}',
  '${escapedLevel}',
  '${escapedCategory}',
  ${paragraphsValue},
  '${escapedAudioUrl}',
  ${timestampsValue},
  ${imageValue},
  CURRENT_DATE,
  ${isEmbedded},
  ${episodes},
  ${durationValue}
);`;

  return sql;
}

/**
 * Download a blob as file
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download text content as file
 */
export function downloadText(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type });
  downloadBlob(blob, filename);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Format duration in seconds to mm:ss
 */
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get file extension
 */
export function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

/**
 * Sanitize filename (replace spaces with underscores)
 */
export function sanitizeFilename(name) {
  return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
}
