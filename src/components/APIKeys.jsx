import { useState } from 'react';
import { Plus, Trash2, Key, Check, X, Copy } from 'lucide-react';

const STORAGE_KEY = 'podcast-tool-api-keys';

// Load initial keys from localStorage
function getInitialKeys() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse stored keys:', e);
  }
  return [];
}

export function APIKeys() {
  const [keys, setKeys] = useState(getInitialKeys);
  const [isAdding, setIsAdding] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Save keys to localStorage when they change
  const saveKeys = (newKeys) => {
    setKeys(newKeys);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newKeys));
  };

  const handleAdd = () => {
    setIsAdding(true);
    setNewKeyName('');
    setNewKeyValue('');
  };

  const handleSave = () => {
    if (!newKeyName.trim() || !newKeyValue.trim()) return;

    const newKey = {
      id: Date.now(),
      name: newKeyName.trim().toLowerCase(),
      value: newKeyValue.trim()
    };

    saveKeys([...keys, newKey]);
    setIsAdding(false);
    setNewKeyName('');
    setNewKeyValue('');
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewKeyName('');
    setNewKeyValue('');
  };

  const handleDelete = (id) => {
    saveKeys(keys.filter(key => key.id !== id));
  };

  const handleCopy = async (key) => {
    try {
      await navigator.clipboard.writeText(key.value);
      setCopiedId(key.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const maskValue = (value) => {
    if (value.length <= 8) return '••••••••';
    return value.slice(0, 4) + '••••••••' + value.slice(-4);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600 dark:text-zinc-400">
          API key'lerinizi buraya ekleyin. Lokal olarak saklanır.
        </p>
        <button
          onClick={handleAdd}
          disabled={isAdding}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Ekle
        </button>
      </div>

      {/* Add new key form */}
      {isAdding && (
        <div className="p-4 bg-neutral-100 dark:bg-surface-100 border border-neutral-200 dark:border-border rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Servis Adı</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="openai, elevenlabs, supabase..."
                className="input-base"
                autoFocus
              />
            </div>
            <div>
              <label className="label">API Key</label>
              <input
                type="password"
                value={newKeyValue}
                onChange={(e) => setNewKeyValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="sk-..."
                className="input-base font-mono text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="btn-primary text-sm">
              <Check className="w-4 h-4" />
              Kaydet
            </button>
            <button onClick={handleCancel} className="btn-ghost text-sm">
              <X className="w-4 h-4" />
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Keys list */}
      {keys.length > 0 ? (
        <div className="space-y-2">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-surface-100 border border-neutral-200 dark:border-border rounded-lg group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-surface-400 flex items-center justify-center">
                  <Key className="w-5 h-5 text-neutral-600 dark:text-zinc-400" />
                </div>
                <div>
                  <div className="font-medium text-neutral-900 dark:text-zinc-100 capitalize">
                    {key.name}
                  </div>
                  <div className="text-sm text-neutral-500 dark:text-zinc-500 font-mono">
                    {maskValue(key.value)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopy(key)}
                  className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-zinc-500 dark:hover:text-zinc-200"
                  title="Kopyala"
                >
                  {copiedId === key.id ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(key.id)}
                  className="p-2 text-neutral-500 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : !isAdding && (
        <div className="text-center py-12 text-neutral-500 dark:text-zinc-500">
          <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Henüz API key eklenmemiş</p>
          <p className="text-sm mt-1">Yukarıdaki "Ekle" butonunu kullanın</p>
        </div>
      )}
    </div>
  );
}

// Helper function to get a specific API key by name
export function getApiKey(name) {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  
  try {
    const keys = JSON.parse(stored);
    const key = keys.find(k => k.name.toLowerCase() === name.toLowerCase());
    return key?.value || null;
  } catch {
    return null;
  }
}

// Helper function to get all saved API keys
export function getAllApiKeys() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}
