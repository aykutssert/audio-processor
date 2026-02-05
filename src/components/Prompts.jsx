import { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Copy, 
  Edit3, 
  Star, 
  Search,
  FileText,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';

const STORAGE_KEY = 'podcast-tool-prompts';

// Predefined categories
const CATEGORIES = [
  'Image Generation',
  'Text Generation',
  'Audio',
  'Translation',
  'Summary',
  'Code',
  'Other'
];

// Load initial prompts from localStorage
function getInitialPrompts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse stored prompts:', e);
  }
  return [];
}

export function Prompts() {
  const [prompts, setPrompts] = useState(getInitialPrompts);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'Other',
    content: '',
    tags: '',
    isFavorite: false
  });

  // Save to localStorage
  const savePrompts = (newPrompts) => {
    setPrompts(newPrompts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrompts));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      category: 'Other',
      content: '',
      tags: '',
      isFavorite: false
    });
  };

  // Handle add new
  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    resetForm();
  };

  // Handle edit
  const handleEdit = (prompt) => {
    setEditingId(prompt.id);
    setIsAdding(false);
    setFormData({
      title: prompt.title,
      category: prompt.category,
      content: prompt.content,
      tags: prompt.tags?.join(', ') || '',
      isFavorite: prompt.isFavorite || false
    });
  };

  // Handle save (add or update)
  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;

    const tagsArray = formData.tags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    if (editingId) {
      // Update existing
      const updated = prompts.map(p => 
        p.id === editingId 
          ? { 
              ...p, 
              title: formData.title.trim(),
              category: formData.category,
              content: formData.content.trim(),
              tags: tagsArray,
              isFavorite: formData.isFavorite,
              updatedAt: Date.now()
            }
          : p
      );
      savePrompts(updated);
      setEditingId(null);
    } else {
      // Add new
      const newPrompt = {
        id: Date.now(),
        title: formData.title.trim(),
        category: formData.category,
        content: formData.content.trim(),
        tags: tagsArray,
        isFavorite: formData.isFavorite,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      savePrompts([newPrompt, ...prompts]);
      setIsAdding(false);
    }
    resetForm();
  };

  // Handle cancel
  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  // Handle delete
  const handleDelete = (id) => {
    if (confirm('Bu prompt\'u silmek istediğinizden emin misiniz?')) {
      savePrompts(prompts.filter(p => p.id !== id));
    }
  };

  // Handle copy
  const handleCopy = async (prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopiedId(prompt.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  // Toggle favorite
  const toggleFavorite = (id) => {
    const updated = prompts.map(p => 
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    );
    savePrompts(updated);
  };

  // Toggle expand
  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Handle keyboard
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    }
  };

  // Filter prompts
  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some(t => t.includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !filterCategory || p.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort: favorites first, then by updatedAt
  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.updatedAt - a.updatedAt;
  });

  // Render form
  const renderForm = () => (
    <div className="p-4 bg-neutral-100 dark:bg-surface-100 border border-neutral-200 dark:border-border rounded-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Başlık</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Prompt başlığı..."
            className="input-base"
            autoFocus
          />
        </div>
        <div>
          <label className="label">Kategori</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="input-base"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Prompt İçeriği</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="Prompt içeriğinizi buraya yazın..."
          className="input-base min-h-[200px] font-mono text-sm"
          rows={10}
        />
      </div>

      <div>
        <label className="label">Etiketler (virgülle ayırın)</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="image, podcast, thumbnail..."
          className="input-base"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isFavorite}
            onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
            className="w-4 h-4 rounded border-neutral-300 dark:border-border"
          />
          <Star className={`w-4 h-4 ${formData.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-400'}`} />
          <span className="text-sm text-neutral-600 dark:text-zinc-400">Favorilere ekle</span>
        </label>

        <div className="flex items-center gap-2">
          <button onClick={handleCancel} className="btn-ghost text-sm">
            <X className="w-4 h-4" />
            İptal
          </button>
          <button onClick={handleSave} className="btn-primary text-sm">
            <Check className="w-4 h-4" />
            {editingId ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
      
      <p className="text-xs text-neutral-500 dark:text-zinc-600">
        Kaydetmek için ⌘+Enter, iptal için Escape
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Add button and search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-neutral-600 dark:text-zinc-400">
          Sık kullandığınız prompt'ları kaydedin ve yönetin.
        </p>
        <button
          onClick={handleAdd}
          disabled={isAdding || editingId}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Yeni Prompt
        </button>
      </div>

      {/* Search and Filter */}
      {prompts.length > 0 && !isAdding && !editingId && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-zinc-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ara..."
              className="input-base pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-base w-full sm:w-48"
          >
            <option value="">Tüm Kategoriler</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && renderForm()}

      {/* Prompts List */}
      {sortedPrompts.length > 0 ? (
        <div className="space-y-3">
          {sortedPrompts.map((prompt) => {
            const isExpanded = expandedIds.has(prompt.id);
            const isEditing = editingId === prompt.id;
            
            if (isEditing) return null;

            return (
              <div
                key={prompt.id}
                className="bg-neutral-50 dark:bg-surface-100 border border-neutral-200 dark:border-border rounded-lg overflow-hidden group"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleFavorite(prompt.id)}
                      className="flex-shrink-0"
                    >
                      <Star 
                        className={`w-5 h-5 transition-colors ${
                          prompt.isFavorite 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-neutral-300 dark:text-zinc-600 hover:text-yellow-500'
                        }`} 
                      />
                    </button>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-neutral-900 dark:text-zinc-100 truncate">
                          {prompt.title}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-surface-400 text-neutral-600 dark:text-zinc-400">
                          {prompt.category}
                        </span>
                      </div>
                      
                      {prompt.tags?.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <Tag className="w-3 h-3 text-neutral-400 dark:text-zinc-600" />
                          {prompt.tags.map((tag, i) => (
                            <span 
                              key={i}
                              className="text-xs text-neutral-500 dark:text-zinc-500"
                            >
                              {tag}{i < prompt.tags.length - 1 ? ',' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleExpand(prompt.id)}
                      className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-zinc-500 dark:hover:text-zinc-200"
                      title={isExpanded ? 'Daralt' : 'Genişlet'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopy(prompt)}
                      className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-zinc-500 dark:hover:text-zinc-200"
                      title="Kopyala"
                    >
                      {copiedId === prompt.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(prompt)}
                      className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-zinc-500 dark:hover:text-zinc-200"
                      title="Düzenle"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(prompt.id)}
                      className="p-2 text-neutral-500 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content Preview / Full */}
                <div 
                  className={`px-4 pb-4 ${isExpanded ? '' : 'cursor-pointer'}`}
                  onClick={() => !isExpanded && toggleExpand(prompt.id)}
                >
                  <div 
                    className={`
                      text-sm text-neutral-600 dark:text-zinc-400 font-mono 
                      bg-white dark:bg-surface-200 border border-neutral-200 dark:border-border 
                      rounded-lg p-3 whitespace-pre-wrap
                      ${isExpanded ? '' : 'line-clamp-3'}
                    `}
                  >
                    {prompt.content}
                  </div>
                  
                  {!isExpanded && prompt.content.split('\n').length > 3 && (
                    <button 
                      className="text-xs text-neutral-500 dark:text-zinc-500 mt-2 hover:text-neutral-900 dark:hover:text-zinc-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(prompt.id);
                      }}
                    >
                      Devamını göster...
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : !isAdding && !editingId && (
        <div className="text-center py-12 text-neutral-500 dark:text-zinc-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          {searchQuery || filterCategory ? (
            <>
              <p>Arama sonucu bulunamadı</p>
              <button 
                onClick={() => { setSearchQuery(''); setFilterCategory(''); }}
                className="text-sm mt-2 text-neutral-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-zinc-200"
              >
                Filtreleri temizle
              </button>
            </>
          ) : (
            <>
              <p>Henüz prompt eklenmemiş</p>
              <p className="text-sm mt-1">Yukarıdaki "Yeni Prompt" butonunu kullanın</p>
            </>
          )}
        </div>
      )}

      {/* Stats */}
      {prompts.length > 0 && !isAdding && !editingId && (
        <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-zinc-600 pt-4 border-t border-neutral-200 dark:border-border">
          <span>{prompts.length} prompt</span>
          <span>{prompts.filter(p => p.isFavorite).length} favori</span>
          <span>{CATEGORIES.filter(c => prompts.some(p => p.category === c)).length} kategori</span>
        </div>
      )}
    </div>
  );
}

// Helper function to get all prompts
export function getAllPrompts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Helper function to get a prompt by title
export function getPromptByTitle(title) {
  const prompts = getAllPrompts();
  return prompts.find(p => p.title.toLowerCase() === title.toLowerCase()) || null;
}
