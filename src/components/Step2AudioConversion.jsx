import { useState, useCallback } from 'react';
import { Upload, ArrowRight, Download, Loader2, FileAudio, Check, AlertCircle } from 'lucide-react';
import { useFFmpeg } from '../hooks/useFFmpeg';
import { downloadBlob, getFileExtension } from '../utils/helpers';

export function Step2AudioConversion({ 
  convertedAudio,
  onConvertedAudio 
}) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionStatus, setConversionStatus] = useState(null); // 'success' | 'skipped' | 'error'
  const [statusMessage, setStatusMessage] = useState('');
  
  const { loading: ffmpegLoading, progress, convertToM4A, load } = useFFmpeg();

  // Use uploaded file only
  const sourceAudio = uploadedFile;
  const sourceFileName = uploadedFile?.name || null;

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setConversionStatus(null);
      onConvertedAudio(null);
    }
  }, [onConvertedAudio]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('audio/') || getFileExtension(file.name) === 'aac')) {
      setUploadedFile(file);
      setConversionStatus(null);
      onConvertedAudio(null);
    }
  }, [onConvertedAudio]);

  const handleConvert = async () => {
    if (!uploadedFile) return;

    const extension = getFileExtension(uploadedFile.name);
    
    // If already m4a, skip conversion
    if (extension === 'm4a') {
      setConversionStatus('skipped');
      setStatusMessage('Dosya zaten m4a formatında, dönüştürme gerekmiyor.');
      onConvertedAudio(uploadedFile);
      return;
    }

    setIsConverting(true);
    setConversionStatus(null);

    try {
      // Load FFmpeg if not already loaded
      await load();

      const m4aBlob = await convertToM4A(uploadedFile);
      
      onConvertedAudio(m4aBlob);
      setConversionStatus('success');
      setStatusMessage('Dönüştürme başarılı!');
    } catch (error) {
      console.error('Conversion error:', error);
      setConversionStatus('error');
      setStatusMessage(`Hata: ${error.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedAudio || !uploadedFile) return;
    const filename = uploadedFile.name.replace(/\.[^.]+$/, '.m4a');
    downloadBlob(convertedAudio, filename);
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="p-4 bg-neutral-100 dark:bg-surface-100 border border-neutral-200 dark:border-border rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-neutral-600 dark:text-zinc-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-neutral-600 dark:text-zinc-400">
            <p className="font-medium text-neutral-700 dark:text-zinc-300 mb-1">Whisper-1 Gereksinimi</p>
            <p>
              Whisper-1 API, <code className="text-xs bg-neutral-200 dark:bg-surface-400 px-1.5 py-0.5 rounded">aac</code> formatını 
              doğrudan desteklemez. Bu adımda audio dosyanızı{' '}
              <code className="text-xs bg-neutral-200 dark:bg-surface-400 px-1.5 py-0.5 rounded">m4a</code> formatına dönüştürün.
            </p>
          </div>
        </div>
      </div>

      {/* Upload zone */}
      <div>
        <label className="label">Audio Dosyası Yükle</label>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
            ${uploadedFile 
              ? 'border-neutral-400 dark:border-white/50 bg-neutral-50 dark:bg-white/5' 
              : 'border-neutral-300 dark:border-border hover:border-neutral-400 dark:hover:border-border-hover hover:bg-neutral-50 dark:hover:bg-surface-100/50'
            }
          `}
        >
          <input
            type="file"
            accept="audio/*,.aac,.m4a,.mp3,.wav"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className={`w-10 h-10 mx-auto mb-4 ${uploadedFile ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-zinc-600'}`} />
          
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
                aac, m4a, mp3, wav desteklenir
              </div>
            </>
          )}
        </div>
      </div>

      {/* Convert button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleConvert}
          disabled={!uploadedFile || isConverting || ffmpegLoading}
          className="btn-primary"
        >
          {ffmpegLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              FFmpeg yükleniyor...
            </>
          ) : isConverting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Dönüştürülüyor... {progress}%
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4" />
              M4A'ya Dönüştür
            </>
          )}
        </button>

        {convertedAudio && (
          <button
            onClick={handleDownload}
            className="btn-secondary"
          >
            <Download className="w-4 h-4" />
            İndir (.m4a)
          </button>
        )}
      </div>

      {/* Status message */}
      {conversionStatus && (
        <div className={`
          flex items-center gap-3 p-4 rounded-lg
          ${conversionStatus === 'success' 
            ? 'bg-neutral-100 dark:bg-white/10 border border-neutral-200 dark:border-white/20' 
            : conversionStatus === 'skipped'
              ? 'bg-neutral-100 dark:bg-zinc-500/10 border border-neutral-200 dark:border-zinc-500/20'
              : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20'
          }
        `}>
          {conversionStatus === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
          ) : (
            <Check className="w-5 h-5 text-neutral-900 dark:text-white" />
          )}
          <span className={`text-sm ${
            conversionStatus === 'error' ? 'text-red-600 dark:text-red-400' : 'text-neutral-700 dark:text-zinc-300'
          }`}>
            {statusMessage}
          </span>
        </div>
      )}
    </div>
  );
}
