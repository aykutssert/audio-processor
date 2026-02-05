import { useState, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance = null;

export function useFFmpeg() {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const load = useCallback(async () => {
    if (ffmpegInstance && loaded) return ffmpegInstance;
    
    setLoading(true);
    try {
      const ffmpeg = new FFmpeg();
      
      ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });

      // Load ffmpeg core from CDN
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      ffmpegInstance = ffmpeg;
      setLoaded(true);
      return ffmpeg;
    } catch (error) {
      console.error('FFmpeg load error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loaded]);

  const convertToM4A = useCallback(async (inputFile) => {
    const ffmpeg = await load();
    
    const inputName = inputFile.name;
    const outputName = inputName.replace(/\.[^.]+$/, '.m4a');
    
    // Write input file
    await ffmpeg.writeFile(inputName, await fetchFile(inputFile));
    
    // Convert to m4a
    await ffmpeg.exec(['-i', inputName, '-c:a', 'aac', '-b:a', '128k', outputName]);
    
    // Read output file
    const data = await ffmpeg.readFile(outputName);
    
    // Cleanup
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);
    
    return new Blob([data.buffer], { type: 'audio/mp4' });
  }, [load]);

  return {
    loaded,
    loading,
    progress,
    load,
    convertToM4A
  };
}
