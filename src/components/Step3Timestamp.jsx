import { useState } from 'react';
import { Clock, Download, Copy, Loader2, Check, FileJson, Upload } from 'lucide-react';
import { downloadText, copyToClipboard, formatDuration } from '../utils/helpers';
import { useOpenAI } from '../hooks/useOpenAI';
import { getAllApiKeys } from './APIKeys';

export function Step3Timestamp({
  timestampData,
  onTimestampData
}) {
  const [apiKey, setApiKey] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  
  const openai = useOpenAI(apiKey);
  const savedKeys = getAllApiKeys();

  const handleKeySelect = (e) => {
    const selectedName = e.target.value;
    if (selectedName) {
      const key = savedKeys.find(k => k.name === selectedName);
      if (key) {
        setApiKey(key.value);
      }
    } else {
      setApiKey('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      onTimestampData(null);
    }
  };

  const handleTranscribe = async () => {
    if (!uploadedFile) {
      alert('Audio dosyası gerekli');
      return;
    }

    setIsTranscribing(true);
    try {
      const transcription = await openai.transcribeAudio(uploadedFile);
      onTimestampData(transcription);
    } catch (error) {
      alert(`Hata: ${error.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopy = async () => {
    if (!timestampData) return;
    const success = await copyToClipboard(JSON.stringify(timestampData, null, 2));
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!timestampData) return;
    const filename = uploadedFile 
      ? uploadedFile.name.replace(/\.[^.]+$/, '.json')
      : 'timestamp.json';
    downloadText(JSON.stringify(timestampData, null, 2), filename, 'application/json');
  };

  return (
    <div className="space-y-6">
      {/* API Key */}
      <div>
        <label className="label">API Key Seç</label>
        <select
          value={savedKeys.find(k => k.value === apiKey)?.name || ''}
          onChange={handleKeySelect}
          className="input-base"
        >
          <option value="">-- Seçiniz --</option>
          {savedKeys.map((key) => (
            <option key={key.id} value={key.name}>
              {key.name}
            </option>
          ))}
        </select>
        {savedKeys.length === 0 && (
          <p className="text-xs text-neutral-500 dark:text-zinc-600 mt-1">
            API Keys sayfasından key ekleyin
          </p>
        )}
        {apiKey && (
          <p className="text-xs text-green-600 dark:text-green-500 mt-1">
            ✓ Key seçildi
          </p>
        )}
      </div>

      {/* Upload audio */}
      <div>
        <label className="label">Audio Dosyası Yükle</label>
        <div className="relative border-2 border-dashed border-neutral-300 dark:border-border rounded-lg p-6 hover:border-neutral-400 dark:hover:border-border-hover transition-colors text-center">
          <input
            type="file"
            accept="audio/*,.m4a,.mp3,.wav,.aac"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className={`w-8 h-8 mx-auto mb-3 ${uploadedFile ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-zinc-600'}`} />
          {uploadedFile ? (
            <>
              <div className="text-sm font-medium text-neutral-700 dark:text-zinc-200">{uploadedFile.name}</div>
              <div className="text-xs text-neutral-500 dark:text-zinc-500 mt-1">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-neutral-600 dark:text-zinc-400">
                Audio dosyasını sürükleyip bırakın veya tıklayın
              </div>
              <div className="text-xs text-neutral-500 dark:text-zinc-600 mt-1">
                m4a, mp3, wav, aac desteklenir
              </div>
            </>
          )}
        </div>
      </div>

      {/* Transcribe button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleTranscribe}
          disabled={isTranscribing || !apiKey || !uploadedFile}
          className="btn-primary"
        >
          {isTranscribing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Transkript alınıyor...
            </>
          ) : (
            <>
              <Clock className="w-4 h-4" />
              Timestamp Üret
            </>
          )}
        </button>
      </div>

      {/* Timestamp result */}
      {timestampData && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-surface-100 rounded-lg">
              <FileJson className="w-4 h-4 text-neutral-900 dark:text-white" />
              <span className="text-neutral-600 dark:text-zinc-400">
                {timestampData.segments?.length || 0} segment
              </span>
            </div>
            {timestampData.duration && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-surface-100 rounded-lg">
                <Clock className="w-4 h-4 text-neutral-500 dark:text-zinc-500" />
                <span className="text-neutral-600 dark:text-zinc-400">
                  {formatDuration(timestampData.duration)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={handleCopy} className="btn-secondary">
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-neutral-900 dark:text-white" />
                  Kopyalandı
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  JSON Kopyala
                </>
              )}
            </button>
            <button onClick={handleDownload} className="btn-secondary">
              <Download className="w-4 h-4" />
              JSON İndir
            </button>
          </div>

          {/* JSON Preview */}
          <div>
            <label className="label">JSON Önizleme (segments)</label>
            <div className="code-block max-h-[400px] overflow-y-auto">
              <pre className="text-xs">
                {JSON.stringify(
                  timestampData.segments?.slice(0, 5).map(s => ({
                    start: s.start,
                    end: s.end,
                    text: s.text.trim()
                  })),
                  null,
                  2
                )}
                {timestampData.segments?.length > 5 && (
                  <span className="text-zinc-600">
                    {'\n\n'}// ... ve {timestampData.segments.length - 5} segment daha
                  </span>
                )}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
