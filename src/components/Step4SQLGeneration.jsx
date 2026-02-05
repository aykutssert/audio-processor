import { useState, useMemo, useCallback } from 'react';
import { Database, Copy, Download, Check, FileCode2, Upload, FileJson } from 'lucide-react';
import { LEVELS, CATEGORIES } from '../utils/constants';
import { buildPodcastInsert, copyToClipboard, downloadText } from '../utils/helpers';

export function Step4SQLGeneration({
  podcastData,
  onPodcastDataChange,
  timestampData,
  onTimestampData,
  sqlFormData,
  onSqlFormDataChange
}) {
  const [level, setLevel] = useState('Intermediate');
  const [category, setCategory] = useState('Educational');
  const [duration, setDuration] = useState('');
  const [copied, setCopied] = useState(false);
  const [jsonFileName, setJsonFileName] = useState('');

  // Use props for audioUrl and imageUrl
  const audioUrl = sqlFormData?.audioUrl || '';
  const imageUrl = sqlFormData?.imageUrl || '';

  const setAudioUrl = (value) => {
    onSqlFormDataChange({ ...sqlFormData, audioUrl: value });
  };

  const setImageUrl = (value) => {
    onSqlFormDataChange({ ...sqlFormData, imageUrl: value });
  };

  // Handle JSON file upload for timestamps
  const handleJsonUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJsonFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Extract segments with start, end, text like sql-pipeline.py
        if (data.segments) {
          const cleanSegments = data.segments.map(seg => ({
            start: seg.start,
            end: seg.end,
            text: seg.text.trim()
          }));
          
          onTimestampData({
            segments: cleanSegments,
            duration: data.duration || null
          });
        } else {
          alert('JSON dosyasında "segments" anahtarı bulunamadı.');
        }
      } catch (err) {
        alert(`JSON parse hatası: ${err.message}`);
      }
    };
    reader.readAsText(file);
  }, [onTimestampData]);

  // Generate SQL
  const sql = useMemo(() => {
    if (!podcastData.title || !podcastData.text || !audioUrl) {
      return null;
    }

    return buildPodcastInsert({
      title: podcastData.title,
      level,
      category,
      rawText: podcastData.text,
      audioUrl,
      timestampData,
      imageUrl: imageUrl || null,
      isEmbedded: false,
      duration: duration ? parseInt(duration, 10) : null
    });
  }, [podcastData, audioUrl, level, category, timestampData, imageUrl, duration]);

  const handleCopy = async () => {
    if (!sql) return;
    const success = await copyToClipboard(sql);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!sql) return;
    downloadText(sql, 'insert_podcast.sql', 'text/sql');
  };

  // Auto-fill duration from timestamp data
  const suggestedDuration = timestampData?.duration 
    ? Math.round(timestampData.duration) 
    : null;

  return (
    <div className="space-y-6">
      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title (from step 1) */}
        <div>
          <label className="label">Podcast Başlığı</label>
          <input
            type="text"
            value={podcastData.title}
            onChange={(e) => onPodcastDataChange({ ...podcastData, title: e.target.value })}
            className="input-base"
          />
        </div>

        {/* Audio URL */}
        <div>
          <label className="label">Audio URL (Supabase Storage)</label>
          <input
            type="text"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            placeholder="https://...supabase.co/storage/v1/object/public/podcast-audio/..."
            className="input-base text-sm"
          />
        </div>

        {/* Level */}
        <div>
          <label className="label">Seviye (Level)</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="input-base"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="label">Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-base"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="label">
            Süre (saniye)
            {suggestedDuration && (
              <button
                onClick={() => setDuration(suggestedDuration.toString())}
                className="ml-2 text-xs text-neutral-900 dark:text-white hover:text-neutral-600 dark:hover:text-zinc-300"
              >
                Önerilen: {suggestedDuration}s
              </button>
            )}
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder={suggestedDuration?.toString() || '120'}
            className="input-base"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="label">
            Image URL <span className="text-neutral-500 dark:text-zinc-600">(isteğe bağlı)</span>
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="input-base"
          />
        </div>
      </div>

      {/* Text (from step 1) */}
      <div>
        <label className="label">
          Podcast Metni
          <span className="text-neutral-500 dark:text-zinc-600 font-normal ml-2">
            ({podcastData.text.split('\n\n').filter(p => p.trim()).length} paragraf)
          </span>
        </label>
        <textarea
          value={podcastData.text}
          onChange={(e) => onPodcastDataChange({ ...podcastData, text: e.target.value })}
          rows={6}
          className="input-base resize-y"
        />
      </div>

      {/* Timestamp JSON Upload */}
      <div>
        <label className="label">Timestamp JSON Yükle</label>
        <div className="relative border border-dashed border-neutral-300 dark:border-border rounded-lg p-4 hover:border-neutral-400 dark:hover:border-border-hover transition-colors">
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleJsonUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex items-center gap-3">
            {timestampData ? (
              <>
                <FileJson className="w-5 h-5 text-neutral-900 dark:text-white" />
                <div>
                  <div className="text-sm text-neutral-700 dark:text-zinc-300">
                    {jsonFileName || 'Timestamp yüklendi'}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-zinc-500 mt-0.5">
                    {timestampData.segments?.length} segment
                    {timestampData.duration && ` • ${Math.round(timestampData.duration)}s`}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-neutral-500 dark:text-zinc-600" />
                <div className="text-sm text-neutral-500 dark:text-zinc-400">
                  JSON dosyası yükleyin (Whisper çıktısı)
                </div>
              </>
            )}
          </div>
        </div>
        <p className="text-xs text-neutral-500 dark:text-zinc-600 mt-1.5">
          JSON içinde "segments" dizisi aranır. Her segment: start, end, text
        </p>
      </div>

      {/* Timestamp status */}
      <div className={`
        flex items-center gap-3 p-4 rounded-lg
        ${timestampData 
          ? 'bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/20' 
          : 'bg-neutral-100 dark:bg-zinc-500/10 border border-neutral-200 dark:border-zinc-500/20'
        }
      `}>
        {timestampData ? (
          <>
            <Check className="w-5 h-5 text-neutral-900 dark:text-white" />
            <span className="text-sm text-neutral-700 dark:text-zinc-300">
              Timestamp verisi mevcut ({timestampData.segments?.length} segment)
            </span>
          </>
        ) : (
          <>
            <Database className="w-5 h-5 text-neutral-500 dark:text-zinc-400" />
            <span className="text-sm text-neutral-500 dark:text-zinc-400">
              Timestamp verisi yok – SQL'de audio_timestamps NULL olacak
            </span>
          </>
        )}
      </div>

      {/* SQL Output */}
      {sql && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-neutral-900 dark:text-white" />
              <span className="text-sm font-medium text-neutral-700 dark:text-zinc-300">SQL INSERT</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleCopy} className="btn-ghost text-sm">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-neutral-900 dark:text-white" />
                    Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Kopyala
                  </>
                )}
              </button>
              <button onClick={handleDownload} className="btn-ghost text-sm">
                <Download className="w-4 h-4" />
                İndir
              </button>
            </div>
          </div>

          <div className="code-block max-h-[400px] overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap break-all">{sql}</pre>
          </div>

          <p className="text-xs text-neutral-500 dark:text-zinc-600">
            Bu SQL'i Supabase SQL Editor'a yapıştırıp çalıştırın.
          </p>
        </div>
      )}

      {/* Missing fields warning */}
      {!sql && (
        <div className="p-4 bg-neutral-100 dark:bg-surface-100 border border-neutral-200 dark:border-border rounded-lg">
          <p className="text-sm text-neutral-500 dark:text-zinc-500">
            SQL oluşturmak için en az <span className="text-neutral-700 dark:text-zinc-400">başlık</span>,{' '}
            <span className="text-neutral-700 dark:text-zinc-400">metin</span> ve{' '}
            <span className="text-neutral-700 dark:text-zinc-400">audio URL</span> gereklidir.
          </p>
        </div>
      )}
    </div>
  );
}
