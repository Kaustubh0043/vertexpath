import React, { useState, useRef } from 'react';
import { X, Upload, Check, RefreshCw, Sparkles, Image as ImageIcon } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

const PRESET_AVATARS = [
  { id: 'bot-1', label: 'Quantum AI', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=QuantumDev&backgroundColor=7c3aed,8b5cf6' },
  { id: 'bot-2', label: 'Cyber Architect', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberArchitect&backgroundColor=059669,10b981' },
  { id: 'bot-3', label: 'Matrix Hacker', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MatrixHacker&backgroundColor=0284c7,38bdf8' },
  { id: 'bot-4', label: 'Neon Dev', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeonDev&backgroundColor=d97706,f59e0b' },
  { id: 'pixel-1', label: 'Pixel Master', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=VertexCoder' },
  { id: 'pixel-2', label: 'Retro Hacker', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=CyberSamurai' },
  { id: 'adv-1', label: 'Explorer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=PathExplorer' },
  { id: 'adv-2', label: 'Strategist', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=CodeStrategist' },
  { id: 'av-1', label: 'Minimalist', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechLead' },
  { id: 'av-2', label: 'Senior Engineer', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SystemArchitect' },
  { id: 'shapes-1', label: 'Abstract Pulse', url: 'https://api.dicebear.com/7.x/identicon/svg?seed=VertexPath' },
  { id: 'shapes-2', label: 'Cyber Core', url: 'https://api.dicebear.com/7.x/identicon/svg?seed=FullStackDev' },
];

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  userName = 'Developer',
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'upload'>('presets');
  const [selectedUrl, setSelectedUrl] = useState<string>(() => {
    return localStorage.getItem('userAvatar') || PRESET_AVATARS[0].url;
  });
  const [customInputUrl, setCustomInputUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveAvatar = (url: string) => {
    localStorage.setItem('userAvatar', url);
    window.dispatchEvent(new Event('userAvatarUpdated'));
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Please select an image smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setSelectedUrl(result);
        handleSaveAvatar(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Choose Developer Avatar</h3>
              <p className="text-[11px] text-[var(--text-muted)]">Personalize your VertexPath profile & portfolio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Preview */}
        <div className="px-6 py-4 bg-[var(--surface)]/50 border-b border-[var(--border)] flex items-center gap-4">
          <UserAvatar src={selectedUrl} name={userName} size="xl" border />
          <div>
            <span className="text-xs font-semibold text-[var(--text-primary)]">{userName}</span>
            <p className="text-[11px] text-[var(--text-muted)]">Live preview across sidebar, dashboard & badges</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 flex gap-2 border-b border-[var(--border)] text-xs font-medium">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'presets'
                ? 'border-[#8B5CF6] text-[#8B5CF6] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Developer Presets
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#8B5CF6] text-[#8B5CF6] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Upload Photo
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'border-[#8B5CF6] text-[#8B5CF6] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Custom Image URL
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {activeTab === 'presets' && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = selectedUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedUrl(preset.url)}
                    className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#8B5CF6]/15 border-[#8B5CF6] ring-2 ring-[#8B5CF6]/30'
                        : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--brand-purple)]/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--card)] border border-[var(--border)]">
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] text-center font-medium text-[var(--text-secondary)] truncate w-full">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--surface)]/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">Upload your profile picture</p>
                <p className="text-[11px] text-[var(--text-muted)]">PNG, JPG, WEBP, or SVG up to 2MB</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary text-xs py-2 px-4"
              >
                <span>Browse Files</span>
              </button>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-4">
              <label className="block text-xs font-medium text-[var(--text-primary)]">
                Direct Image Link
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={customInputUrl}
                  onChange={(e) => setCustomInputUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#8B5CF6]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customInputUrl.trim()) {
                      setSelectedUrl(customInputUrl.trim());
                    }
                  }}
                  className="btn-secondary text-xs px-3"
                >
                  Preview
                </button>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                You can paste your GitHub avatar URL, Gravatar link, or any public image URL.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--surface)]/30">
          <button
            onClick={() => {
              localStorage.removeItem('userAvatar');
              window.dispatchEvent(new Event('userAvatarUpdated'));
              onClose();
            }}
            className="text-xs text-[var(--text-muted)] hover:text-[#EF4444] transition-colors"
          >
            Reset to Default
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSaveAvatar(selectedUrl)}
              className="btn-primary text-xs py-1.5 px-4"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Avatar</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
