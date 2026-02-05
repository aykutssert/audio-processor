import { useState } from 'react';
import { 
  Radio, 
  Mic, 
  RefreshCw, 
  Clock, 
  Database, 
  Sun,
  Moon,
  Key,
  FileText
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { id: 'audio', label: 'Audio Üretimi', icon: Mic, description: 'TTS ile ses oluştur' },
  { id: 'convert', label: 'Dönüştürme', icon: RefreshCw, description: 'AAC → M4A' },
  { id: 'timestamp', label: 'Timestamp', icon: Clock, description: 'Whisper transkript' },
  { id: 'sql', label: 'SQL Üret', icon: Database, description: 'Insert sorgusu' },
  { id: 'prompts', label: 'Prompts', icon: FileText, description: 'Prompt şablonları' },
  { id: 'apikeys', label: 'API Keys', icon: Key, description: 'Key yönetimi' },
];

export function Sidebar({ currentPage, onPageChange }) {
  const { theme, toggleTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isHovered;

  return (
    <aside 
      className={`
        fixed top-0 left-0 h-full z-50
        bg-white dark:bg-surface-200 
        border-r border-neutral-200 dark:border-border
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-64' : 'w-16'}
        overflow-hidden
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={`
          flex items-center gap-3 p-4 border-b border-neutral-200 dark:border-border
          ${isExpanded ? '' : 'justify-center'}
        `}>
          <div className="w-9 h-9 rounded-lg bg-black dark:bg-white/10 flex items-center justify-center flex-shrink-0">
            <Radio className="w-5 h-5 text-white dark:text-white" />
          </div>
          {isExpanded && (
            <div className="overflow-hidden">
              <h1 className="text-base font-semibold text-neutral-900 dark:text-zinc-100 truncate">
                Podcast Tool
              </h1>
              <p className="text-xs text-neutral-500 dark:text-zinc-500">Internal pipeline</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200 text-left
                    ${isActive 
                      ? 'bg-black text-white dark:bg-white dark:text-black' 
                      : 'text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-surface-100 hover:text-neutral-900 dark:hover:text-zinc-200'
                    }
                    ${!isExpanded ? 'justify-center px-0' : ''}
                  `}
                  title={!isExpanded ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isExpanded && (
                    <div className="overflow-hidden">
                      <div className="text-sm font-medium truncate">{item.label}</div>
                      <div className={`text-xs truncate ${isActive ? 'opacity-70' : 'opacity-50'}`}>
                        {item.description}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`
            p-3 border-t border-neutral-200 dark:border-border space-y-2
            ${!isExpanded ? 'px-2' : ''}
          `}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-neutral-600 dark:text-zinc-400 
                hover:bg-neutral-100 dark:hover:bg-surface-100 
                hover:text-neutral-900 dark:hover:text-zinc-200
                transition-all duration-200
                ${!isExpanded ? 'justify-center px-0' : ''}
              `}
              title={!isExpanded ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 flex-shrink-0" />
              ) : (
                <Moon className="w-5 h-5 flex-shrink-0" />
              )}
              {isExpanded && (
                <span className="text-sm font-medium">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>
  );
}