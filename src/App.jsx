import { useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Step1AudioGeneration } from './components/Step1AudioGeneration';
import { Step2AudioConversion } from './components/Step2AudioConversion';
import { Step3Timestamp } from './components/Step3Timestamp';
import { Step4SQLGeneration } from './components/Step4SQLGeneration';
import { APIKeys } from './components/APIKeys';
import { Prompts } from './components/Prompts';
import { useOpenAI } from './hooks/useOpenAI';

function AppContent() {
  // Global state
  const [apiKey, setApiKey] = useState('');
  const [currentPage, setCurrentPage] = useState('audio');

  // Podcast data
  const [podcastData, setPodcastData] = useState({
    title: '',
    text: ''
  });

  // Step outputs
  const [generatedAudio, setGeneratedAudio] = useState(null);
  const [convertedAudio, setConvertedAudio] = useState(null);
  const [timestampData, setTimestampData] = useState(null);

  // SQL page data
  const [sqlFormData, setSqlFormData] = useState({
    audioUrl: '',
    imageUrl: ''
  });

  // OpenAI hook
  const openai = useOpenAI(apiKey);

  const handleReset = useCallback(() => {
    if (confirm('Tüm verileri sıfırlamak istediğinizden emin misiniz?')) {
      setPodcastData({ title: '', text: '' });
      setGeneratedAudio(null);
      setConvertedAudio(null);
      setTimestampData(null);
      setSqlFormData({ audioUrl: '', imageUrl: '' });
    }
  }, []);

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'audio':
        return (
          <Step1AudioGeneration
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            podcastData={podcastData}
            onPodcastDataChange={setPodcastData}
            generatedAudio={generatedAudio}
            onAudioGenerated={setGeneratedAudio}
            openai={openai}
          />
        );
      case 'convert':
        return (
          <Step2AudioConversion
            convertedAudio={convertedAudio}
            onConvertedAudio={setConvertedAudio}
          />
        );
      case 'timestamp':
        return (
          <Step3Timestamp
            timestampData={timestampData}
            onTimestampData={setTimestampData}
          />
        );
      case 'sql':
        return (
          <Step4SQLGeneration
            podcastData={podcastData}
            onPodcastDataChange={setPodcastData}
            timestampData={timestampData}
            onTimestampData={setTimestampData}
            sqlFormData={sqlFormData}
            onSqlFormDataChange={setSqlFormData}
          />
        );
      case 'apikeys':
        return <APIKeys />;
      case 'prompts':
        return <Prompts />;
      default:
        return null;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'audio': return { title: 'Audio Üretimi', desc: 'OpenAI TTS ile podcast audio dosyası oluşturun.' };
      case 'convert': return { title: 'Audio Dönüştürme', desc: 'AAC formatındaki audio dosyasını M4A formatına dönüştürün.' };
      case 'timestamp': return { title: 'Timestamp Üretimi', desc: 'Whisper-1 ile audio dosyasından timestamp ve transkript alın.' };
      case 'sql': return { title: 'SQL Insert Üretimi', desc: 'Supabase için SQL INSERT sorgusu oluşturun.' };
      case 'apikeys': return { title: 'API Keys', desc: 'API key\'lerinizi yönetin. Lokal olarak saklanır.' };
      case 'prompts': return { title: 'Prompts', desc: 'Sık kullandığınız prompt şablonlarını kaydedin.' };
      default: return { title: '', desc: '' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-surface-300 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Main content */}
      <div className="ml-16 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-surface-200/80 backdrop-blur-sm border-b border-neutral-200 dark:border-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-zinc-100">
                  {pageInfo.title}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-zinc-500">
                  {pageInfo.desc}
                </p>
              </div>
            </div>
            
            <button onClick={handleReset} className="btn-ghost text-sm">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Sıfırla</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="card">
              {renderPage()}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-neutral-200 dark:border-border mt-auto">
          <div className="px-6 py-4">
            <p className="text-xs text-neutral-500 dark:text-zinc-600 text-center">
              Internal tool • Data is not saved between sessions
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
