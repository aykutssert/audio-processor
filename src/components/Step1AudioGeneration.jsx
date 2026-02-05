import { useState } from 'react';
import { Mic, Download, Loader2, Play, Pause, Volume2 } from 'lucide-react';
import { TTS_VOICES, DEFAULT_TTS_INSTRUCTION } from '../utils/constants';
import { downloadBlob, sanitizeFilename } from '../utils/helpers';
import { getAllApiKeys } from './APIKeys';

export function Step1AudioGeneration({ 
  apiKey, 
  onApiKeyChange,
  podcastData, 
  onPodcastDataChange,
  generatedAudio,
  onAudioGenerated,
  openai 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('marin');
  const [instruction, setInstruction] = useState(DEFAULT_TTS_INSTRUCTION);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  // Get saved API keys
  const savedKeys = getAllApiKeys();

  const handleKeySelect = (e) => {
    const selectedName = e.target.value;
    if (selectedName) {
      const key = savedKeys.find(k => k.name === selectedName);
      if (key) {
        onApiKeyChange(key.value);
      }
    } else {
      onApiKeyChange('');
    }
  };

  const handleGenerate = async () => {
    if (!podcastData.title || !podcastData.text) {
      alert('Lütfen başlık ve metin girin');
      return;
    }

    setIsGenerating(true);
    try {
      const audioBlob = await openai.generateAudio({
        text: podcastData.text,
        voice: selectedVoice,
        instructions: instruction
      });

      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      onAudioGenerated(audioBlob);

      // Create audio element for preview
      const audio = new Audio(url);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);

    } catch (error) {
      alert(`Hata: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!generatedAudio) return;
    const filename = `${sanitizeFilename(podcastData.title)}.aac`;
    downloadBlob(generatedAudio, filename);
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
          <p className="text-xs text-neutral-500 dark:text-zinc-600 mt-1.5">
            API Keys sayfasından key ekleyin
          </p>
        )}
        {apiKey && (
          <p className="text-xs text-green-600 dark:text-green-500 mt-1.5">
            ✓ Key seçildi
          </p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="label">Podcast Başlığı</label>
        <input
          type="text"
          value={podcastData.title}
          onChange={(e) => onPodcastDataChange({ ...podcastData, title: e.target.value })}
          placeholder="Planning the Project Timeline"
          className="input-base"
        />
      </div>

      {/* Text */}
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
          placeholder="Metin içeriğini buraya yapıştırın..."
          rows={12}
          className="input-base resize-y min-h-[200px]"
        />
      </div>

      {/* Voice Selection */}
      <div>
        <label className="label">Ses Seçimi</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {TTS_VOICES.map((voice) => (
            <button
              key={voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              className={`
                px-3 py-2 rounded-lg text-sm transition-all duration-200 text-left
                ${selectedVoice === voice.id
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                  : 'bg-neutral-100 dark:bg-surface-100 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-200 dark:hover:bg-surface-50 hover:text-neutral-900 dark:hover:text-zinc-300'
                }
              `}
            >
              <div className="font-medium">{voice.name}</div>
              <div className="text-2xs opacity-70 mt-0.5">{voice.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* TTS Instruction */}
      <div>
        <label className="label">TTS Talimatı (İsteğe bağlı)</label>
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          rows={3}
          className="input-base resize-y text-sm"
        />
      </div>

      {/* Generate Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !apiKey || !podcastData.title || !podcastData.text}
          className="btn-primary"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Üretiliyor...
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Audio Üret
            </>
          )}
        </button>

        {generatedAudio && (
          <>
            <button
              onClick={handlePlayPause}
              className="btn-secondary"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isPlaying ? 'Durdur' : 'Dinle'}
            </button>

            <button
              onClick={handleDownload}
              className="btn-secondary"
            >
              <Download className="w-4 h-4" />
              İndir (.aac)
            </button>
          </>
        )}
      </div>

      {/* Success message */}
      {generatedAudio && (
        <div className="flex items-center gap-3 p-4 bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/20 rounded-lg">
          <Volume2 className="w-5 h-5 text-neutral-900 dark:text-white" />
          <div>
            <div className="text-sm font-medium text-neutral-900 dark:text-white">Audio başarıyla üretildi</div>
            <div className="text-xs text-neutral-500 dark:text-zinc-500 mt-0.5">
              Sonraki adımda dönüştürme yapabilirsiniz veya doğrudan indirebilirsiniz.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
