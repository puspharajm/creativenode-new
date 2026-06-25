import React, { useState, useEffect, useRef } from 'react';
import { 
  User as UserIcon, Shield, Zap, Sparkles, Star, Layers, Trash2, Eye, 
  Settings, CheckCircle2, ChevronRight, Bookmark, ArrowRight, Palette, RefreshCw,
  Edit2, Upload, Check, X, Download, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LocalUser, auth } from '../auth';
import { PORTFOLIO_PRESETS } from '../data';
import { PosterTemplate } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface UserProfileViewProps {
  user: LocalUser | null;
  userTier: 'free' | 'pro' | 'sovereign';
  setUserTier: (tier: 'free' | 'pro' | 'sovereign') => void;
  appTheme: string;
  setAppTheme: (theme: string) => void;
  themeStyles: Record<string, {
    name: string;
    isDark: boolean;
    bg: string;
    text: string;
    textMuted: string;
    border: string;
    borderMuted: string;
    accent: string;
    cardBg: string;
    cardBorder: string;
    glow: string;
  }>;
  getDailyDesignCount: () => number;
  getDailyLimit: () => number;
  onViewProject: (project: PosterTemplate) => void;
  setActiveTab?: (tab: 'home' | 'portfolio' | 'atelier' | 'services' | 'investment' | 'profile' | 'crm') => void;
  onProfileUpdate?: () => void;
  recentlyViewed?: PosterTemplate[];
  clearRecentlyViewed?: () => void;
  onBatchPrint?: (selectedIds: string[]) => void;
}

export default function UserProfileView({
  user,
  userTier,
  setUserTier,
  appTheme,
  setAppTheme,
  themeStyles,
  getDailyDesignCount,
  getDailyLimit,
  onViewProject,
  setActiveTab,
  onProfileUpdate,
  recentlyViewed = [],
  clearRecentlyViewed,
  onBatchPrint
}: UserProfileViewProps) {
  const [collections, setCollections] = useState<PosterTemplate[]>([]);
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
  const { t } = useLanguage();

  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Advanced profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState(user?.displayName || '');
  const [editedAvatar, setEditedAvatar] = useState(user?.photoURL || '');
  const [dragActive, setDragActive] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync edits when user is updated from auth
  useEffect(() => {
    if (user) {
      setEditedName(user.displayName || '');
      setEditedAvatar(user.photoURL || '');
    }
  }, [user]);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setShowConfirmation("Please select a valid image file.");
      setTimeout(() => setShowConfirmation(null), 3000);
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setShowConfirmation("Image size should be less than 1.5MB.");
      setTimeout(() => setShowConfirmation(null), 3000);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setEditedAvatar(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      // Save profile to localStorage only (no Firebase)
      localStorage.setItem('creativenode_profile_name', editedName);
      localStorage.setItem('creativenode_profile_avatar', editedAvatar);
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      setShowConfirmation("Mudalvar profile updated successfully.");
      setTimeout(() => setShowConfirmation(null), 3000);
      setIsEditingProfile(false);
    } catch (err: any) {
      console.error(err);
      setShowConfirmation("Failed to update profile.");
      setTimeout(() => setShowConfirmation(null), 3000);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Sync saved collections from localStorage on load and update
  const syncCollections = () => {
    const data = localStorage.getItem('creativenode_my_collections');
    if (data) {
      try {
        const ids: string[] = JSON.parse(data);
        const matched = PORTFOLIO_PRESETS.filter(p => ids.includes(p.id));
        setCollections(matched);
      } catch (err) {
        setCollections([]);
      }
    } else {
      setCollections([]);
    }
  };

  const handleToggleSelectProject = (id: string) => {
    setSelectedProjects(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAllProjects = () => {
    if (selectedProjects.length === collections.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(collections.map(c => c.id));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedProjects.length === 0) return;
    const data = localStorage.getItem('creativenode_my_collections');
    if (data) {
      try {
        const ids: string[] = JSON.parse(data);
        const filtered = ids.filter(id => !selectedProjects.includes(id));
        localStorage.setItem('creativenode_my_collections', JSON.stringify(filtered));
        setSelectedProjects([]);
        syncCollections();
        
        // Notify of state update to other sections
        window.dispatchEvent(new Event('creativenode-collections-sync'));
        
        setShowConfirmation(`Removed ${selectedProjects.length} selected items from collections.`);
        setTimeout(() => setShowConfirmation(null), 3000);
      } catch (err) {}
    }
  };

  const handleClearAll = () => {
    localStorage.setItem('creativenode_my_collections', JSON.stringify([]));
    setSelectedProjects([]);
    syncCollections();
    
    // Notify of state update to other sections
    window.dispatchEvent(new Event('creativenode-collections-sync'));
    
    setShowConfirmation("All design collections bookmarks cleared successfully.");
    setTimeout(() => setShowConfirmation(null), 3000);
  };

  useEffect(() => {
    syncCollections();
    
    // Listen for custom save events to dynamic refresh collections
    const handleSync = () => syncCollections();
    window.addEventListener('creativenode-collections-sync', handleSync);
    return () => window.removeEventListener('creativenode-collections-sync', handleSync);
  }, []);

  // State and logic for tracking generated asset exports
  const [exports, setExports] = useState<any[]>([]);

  const syncExports = () => {
    try {
      const data = localStorage.getItem('creativenode_export_gallery');
      if (data) {
        setExports(JSON.parse(data));
      } else {
        setExports([]);
      }
    } catch (e) {
      setExports([]);
    }
  };

  useEffect(() => {
    syncExports();
    window.addEventListener('creativenode-exports-sync', syncExports);
    return () => window.removeEventListener('creativenode-exports-sync', syncExports);
  }, []);

  const handleClearExports = () => {
    localStorage.removeItem('creativenode_export_gallery');
    syncExports();
    setShowConfirmation("Export Gallery history cleared successfully.");
    setTimeout(() => setShowConfirmation(null), 3000);
  };

  const handleRemoveExport = (id: string) => {
    const updated = exports.filter((item: any) => item.id !== id);
    localStorage.setItem('creativenode_export_gallery', JSON.stringify(updated));
    syncExports();
    setShowConfirmation("Asset removed from export history.");
    setTimeout(() => setShowConfirmation(null), 3000);
  };

  const handleReloadInAtelier = (item: any) => {
    if (!setActiveTab) return;
    try {
      // Re-seed Session Storage representing active compositions in Atelier
      sessionStorage.setItem('creativenode_session_stored_composition', JSON.stringify(item.composition));
      
      // Seed initial placed assets if any exist in the saved state
      if (item.composition.placedAssets) {
        sessionStorage.setItem('creativenode_session_placed_assets', JSON.stringify(item.composition.placedAssets));
      } else {
        sessionStorage.removeItem('creativenode_session_placed_assets');
      }

      // Notify the store sequence
      window.dispatchEvent(new Event('creativenode-composition-restored'));
      
      setActiveTab('atelier');
      setShowConfirmation(`Restored "${item.title}" into Atelier studio!`);
      setTimeout(() => setShowConfirmation(null), 3000);
    } catch (e) {
      console.error(e);
      setShowConfirmation("Failed to reload that design configuration.");
      setTimeout(() => setShowConfirmation(null), 3500);
    }
  };

  const handleMockRedownload = (item: any) => {
    setShowConfirmation(`Preparing physical download of ${item.format} file (${item.title})...`);
    setTimeout(() => {
      try {
        const textContent = `CREATIVENODE HIFI ${item.format} RE-DOWNLOAD BLUEPRINT\n\nTitle: ${item.title}\nTimestamp: ${item.timestamp}\nFormat: ${item.format}\nSpecifications: ${item.size}\n`;
        const blob = new Blob([textContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${item.title.toLowerCase().replace(/\s+/g, '_')}_reexport.${item.format === 'PDF' ? 'pdf' : item.format === 'SVG' ? 'svg' : 'tiff'}`;
        link.click();
        setShowConfirmation(`Successfully downloaded "${item.title}"!`);
        setTimeout(() => setShowConfirmation(null), 3000);
      } catch (e) {
        setShowConfirmation("Fallback download failed.");
        setTimeout(() => setShowConfirmation(null), 3000);
      }
    }, 1200);
  };

  const handleRemoveFromCollection = (projectId: string, title: string) => {
    const data = localStorage.getItem('creativenode_my_collections');
    if (data) {
      try {
        const ids: string[] = JSON.parse(data);
        const filtered = ids.filter(id => id !== projectId);
        localStorage.setItem('creativenode_my_collections', JSON.stringify(filtered));
        syncCollections();
        
        // Notify of state update to other sections
        window.dispatchEvent(new Event('creativenode-collections-sync'));
        
        setShowConfirmation(`Removed "${title}" from collections successfully.`);
        setTimeout(() => setShowConfirmation(null), 3000);
      } catch (err) {}
    }
  };

  const handleLogout = async () => {
    // Local auth: clear stored data and sign out
    await auth.signOut();
    localStorage.removeItem('creativenode_profile_name');
    localStorage.removeItem('creativenode_profile_avatar');
    window.location.reload();
  };

  const dailyCount = getDailyDesignCount();
  const dailyLimit = getDailyLimit();
  const isLimitFull = dailyLimit !== Infinity && dailyCount >= dailyLimit;
  const progressPercent = dailyLimit === Infinity ? 100 : Math.min((dailyCount / dailyLimit) * 100, 100);

  return (
    <div id="profile-section" className="py-12 px-4 md:px-8 max-w-6xl mx-auto space-y-10 relative">
      
      {/* Dynamic Action Notification Bubble */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-6 z-50 bg-zinc-950/95 border border-gold-500/40 text-xs text-zinc-100 px-4 py-3 rounded-xl flex items-center gap-2.5 shadow-2xl backdrop-blur-md max-w-md font-mono"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{showConfirmation}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Profile Title card block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-900 pb-8">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold-400 block mb-1 font-bold">
            CREATIVENODE DESIGN CONSOLE
          </span>
          <h2 className="font-display text-2xl md:text-4xl font-extrabold text-white tracking-tight uppercase">
            Client Profile Workbench
          </h2>
          <p className="text-zinc-500 text-xs font-sans mt-0.5 leading-relaxed max-w-xl">
            Configure system themes, manage active subscription license thresholds, and review bookmarked custom lookbooks directly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user && user.email === 'puspharaj.m2003@gmail.com' && setActiveTab && (
            <button
              onClick={() => setActiveTab('crm')}
              className="bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/50 hover:border-emerald-400 text-emerald-400 font-mono text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition duration-200 select-none cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Launch CRM Workspace</span>
            </button>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-red-900/30 text-zinc-400 hover:text-red-400 font-mono text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition duration-200 select-none cursor-pointer"
            >
              Disconnect Account
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: User Credentials & Tier Manager (5 cols) */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Identity Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-6 relative overflow-hidden shadow-xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gold-400/5 blur-2xl pointer-events-none" />
            
            {isEditingProfile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-gold-400 font-bold">
                    Edit Profile Credentials
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setEditedName(user?.displayName || '');
                      setEditedAvatar(user?.photoURL || '');
                    }}
                    className="p-1 text-zinc-500 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Drag and Drop / Click Avatar Upload */}
                <div className="space-y-2">
                  <label className="text-zinc-500 font-mono block text-[8.5px] uppercase tracking-wider font-bold">
                    Profile Avatar Representation
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition relative overflow-hidden flex flex-col items-center justify-center min-h-[110px] ${
                      dragActive 
                        ? 'border-gold-400 bg-gold-500/5' 
                        : 'border-zinc-850 bg-zinc-950/20 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    {editedAvatar ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-14 w-14 rounded-full border border-zinc-800 bg-zinc-900 overflow-hidden shadow-lg relative group">
                          <img src={editedAvatar} alt="Avatar preview" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[7.5px] text-white font-mono font-bold uppercase">Change</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditedAvatar('');
                          }}
                          className="font-mono text-[8px] text-red-500 hover:text-red-400 uppercase tracking-widest font-bold"
                        >
                          Clear Image
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 py-1.5">
                        <Upload className="w-5 h-5 text-zinc-500" />
                        <span className="text-[9.5px] text-zinc-400 font-mono">
                          Drag &amp; Drop avatar or <span className="text-gold-405 text-gold-400 font-bold underline">Click to Browse</span>
                        </span>
                        <span className="text-[7.5px] text-zinc-600 font-mono">Supports PNG, JPG (Max 1.5MB)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Username Input */}
                <div className="space-y-1">
                  <label className="text-zinc-500 font-mono block text-[8.5px] uppercase tracking-wider font-bold">
                    Username / Display Name
                  </label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Enter customized username"
                    maxLength={32}
                    className="w-full bg-zinc-950/80 border border-zinc-850 focus:border-gold-505 focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 text-xs font-mono text-white rounded-xl px-3 py-2 outline-none transition"
                  />
                </div>

                {/* Save and Cancel actions */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    disabled={isSavingProfile}
                    onClick={handleSaveProfile}
                    className="flex-1 bg-gold-500 hover:bg-gold-400 text-black font-mono text-[10px] font-bold uppercase tracking-wider py-2 rounded-xl transition cursor-pointer select-none flex items-center justify-center gap-1 shadow-md disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setEditedName(user?.displayName || '');
                      setEditedAvatar(user?.photoURL || '');
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 text-zinc-400 font-mono text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl transition cursor-pointer select-none"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg border border-zinc-900 bg-zinc-950/40 text-zinc-500 hover:text-gold-400 hover:border-gold-500/20 transition cursor-pointer"
                  title="Edit profile information"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full overflow-hidden border border-zinc-850 bg-zinc-900 flex items-center justify-center shadow shadow-zinc-950/60 relative">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="User Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="font-display font-black text-lg text-gold-400 uppercase select-none">
                        {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-gold-400 block mb-0.5 font-bold">
                      REGISTERED ACCOUNT
                    </span>
                    <h3 className="font-display text-lg font-bold text-white tracking-tight leading-none mb-1 flex items-center gap-1.5">
                      {user?.displayName || 'CreativeNode Associate'}
                      {userTier === 'sovereign' && (
                        <span className="px-1.5 py-0.5 border border-gold-500/50 rounded-sm text-[8px] bg-gold-950/40 text-gold-400 font-extrabold uppercase shadow-[0_0_8px_rgba(212,175,55,0.15)] flex items-center gap-0.5 shrink-0 animate-pulse">
                          ★ {t('profile_tier_sovereign')}
                        </span>
                      )}
                    </h3>
                    <p className="text-zinc-500 text-[11px] font-mono leading-none tracking-tight">
                      {user?.email || 'puspharaj.m2003@gmail.com'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-zinc-900 flex justify-between items-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">{t('profile_license')}</span>
                  <span className="px-2.5 py-0.5 bg-gold-500/10 border border-gold-500/20 text-gold-400 font-mono text-[10px] uppercase tracking-wider rounded-lg font-bold">
                    {userTier === 'free' ? t('profile_tier_free') : userTier === 'pro' ? t('profile_tier_pro') : t('profile_tier_sovereign')}
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* User Tier Management Console */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-6 space-y-5"
          >
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <Settings className="w-4 h-4 text-gold-400" /> {t('profile_tier_section_title')}
              </h3>
              <p className="text-zinc-500 text-[11px] mt-1 leading-normal">
                {user?.email === 'puspharaj.m2003@gmail.com' ? t('profile_admin_desc') : t('profile_user_desc')}
              </p>
            </div>

            {/* Super Admin Tier Switcher */}
            {user?.email === 'puspharaj.m2003@gmail.com' ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 mb-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg px-3 py-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider font-bold">{t('profile_admin_banner')}</span>
                </div>
                {[
                  { id: 'free', label: t('admin_tier_free_label'), quota: '2 designs / day', desc: t('admin_tier_free_desc'), price: t('admin_tier_free_price'), color: 'zinc' },
                  { id: 'pro', label: t('admin_tier_pro_label'), quota: '5 designs / day', desc: t('admin_tier_pro_desc'), price: t('admin_tier_pro_price'), color: 'indigo' },
                  { id: 'sovereign', label: t('admin_tier_sov_label'), quota: t('tier_sov_quota'), desc: t('admin_tier_sov_desc'), price: t('admin_tier_sov_price'), color: 'gold' }
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => {
                      setUserTier(tier.id as any);
                      if (user) {
                        localStorage.setItem(`creativenode_user_tier_${user.uid}`, tier.id);
                      }
                      setShowConfirmation(`Tier set to "${tier.label}" successfully!`);
                      setTimeout(() => setShowConfirmation(null), 3000);
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left flex justify-between items-center transition cursor-pointer select-none ${
                      userTier === tier.id 
                        ? 'bg-gold-500/5 border-gold-500 text-white shadow-md shadow-gold-500/5' 
                        : 'bg-zinc-900/10 border-zinc-900/80 text-zinc-400 hover:border-zinc-800 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-xs font-bold block">{tier.label}</span>
                      <span className="text-zinc-500 text-[10px] block">{tier.desc}</span>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="font-mono text-[9.5px] font-bold block text-gold-400 uppercase tracking-wide">
                        {tier.quota}
                      </span>
                      {userTier === tier.id && (
                        <span className="text-[8px] font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Active
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* Regular User: View-only subscription cards */
              <div className="space-y-2.5">
                {[
                  { 
                    id: 'free', 
                    label: t('tier_free_label'), 
                    quota: t('tier_free_quota'),
                    desc: t('tier_free_desc'),
                    price: t('tier_free_price'),
                    features: [t('tier_free_f1'), t('tier_free_f2'), t('tier_free_f3')],
                    badgeColor: 'zinc'
                  },
                  { 
                    id: 'pro', 
                    label: t('tier_pro_label'), 
                    quota: t('tier_pro_quota'),
                    desc: t('tier_pro_desc'),
                    price: t('tier_pro_price'),
                    features: [t('tier_pro_f1'), t('tier_pro_f2'), t('tier_pro_f3'), t('tier_pro_f4')],
                    badgeColor: 'indigo'
                  },
                  { 
                    id: 'sovereign', 
                    label: t('tier_sov_label'), 
                    quota: t('tier_sov_quota'),
                    desc: t('tier_sov_desc'),
                    price: t('tier_sov_price'),
                    features: [t('tier_sov_f1'), t('tier_sov_f2'), t('tier_sov_f3'), t('tier_sov_f4'), t('tier_sov_f5')],
                    badgeColor: 'gold'
                  }
                ].map((tier) => {
                  const isCurrentTier = userTier === tier.id;
                  const isLocked = tier.id === 'sovereign';
                  return (
                    <div
                      key={tier.id}
                      className={`rounded-xl border p-4 flex justify-between items-start gap-4 transition-all ${
                        isCurrentTier
                          ? 'bg-gold-500/5 border-gold-500/60 shadow-md shadow-gold-500/5'
                          : 'bg-zinc-900/10 border-zinc-900/80'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold text-white">{tier.label}</span>
                          {isCurrentTier && (
                            <span className="px-1.5 py-0.5 bg-gold-500/15 border border-gold-500/30 text-gold-400 font-mono text-[8px] uppercase tracking-widest rounded font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> {t('profile_your_plan')}
                            </span>
                          )}
                          {isLocked && (
                            <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono text-[8px] uppercase tracking-widest rounded font-bold flex items-center gap-0.5">
                              <Shield className="w-2.5 h-2.5" /> {t('profile_admin_only')}
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-500 text-[10px] leading-snug mb-2">{tier.desc}</p>
                        <ul className="space-y-0.5">
                          {tier.features.map((f) => (
                            <li key={f} className="text-[9.5px] font-mono text-zinc-400 flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-gold-400/60 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-2">
                        <span className={`font-mono text-[9px] font-bold uppercase tracking-wide ${
                          tier.id === 'sovereign' ? 'text-gold-400' : tier.id === 'pro' ? 'text-indigo-400' : 'text-zinc-400'
                        }`}>
                          {tier.price}
                        </span>
                        {!isCurrentTier && tier.id !== 'sovereign' && (
                          <a
                            href="mailto:puspharaj.m2003@gmail.com?subject=CreativeNode Upgrade Request"
                            className="inline-block bg-indigo-950/30 hover:bg-indigo-950/60 border border-indigo-500/40 hover:border-indigo-400 text-indigo-400 font-mono text-[8.5px] uppercase tracking-wider px-2.5 py-1 rounded-lg transition cursor-pointer select-none"
                          >
                            {t('profile_request_upgrade')}
                          </a>
                        )}
                        {!isCurrentTier && tier.id === 'sovereign' && (
                          <span className="font-mono text-[8.5px] text-zinc-600 uppercase">{t('profile_contact_admin')}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Daily Design Limit Progress Bar */}
            <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-900 space-y-2 font-mono">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500 uppercase">Daily Atelier Quota Status</span>
                <span className={`font-bold ${isLimitFull ? 'text-rose-400' : 'text-gold-400'}`}>
                  {dailyCount} / {dailyLimit === Infinity ? 'Unlimited' : dailyLimit}
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${isLimitFull ? 'bg-rose-500' : 'bg-gold-400 animate-pulse'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500 leading-snug">
                {userTier === 'free' && t('profile_quota_free')}
                {userTier === 'pro' && t('profile_quota_pro')}
                {userTier === 'sovereign' && t('profile_quota_sovereign')}
              </p>
            </div>
          </motion.div>

        </div>

        {/* RIGHT COLUMN: Modernist Theme customizer & Saved Collections (7 cols) */}
        <div className="profile-view-content lg:col-span-7 space-y-6 text-left">
          
          {/* Theme customizer Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-6 space-y-5"
          >
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <Palette className="w-4 h-4 text-gold-400" /> Executive Theme Selection
              </h3>
              <p className="text-zinc-500 text-[11px] mt-1 leading-normal">
                Set your favorite physical studio color scheme. This changes the full application background, cards, labels, and borders dynamically with super-smooth, state-driven transitions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(themeStyles).map(([id, style]) => {
                const isSelected = appTheme === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setAppTheme(id);
                      localStorage.setItem('creativenode_global_theme', id);
                      // Custom flash confirmation
                      setShowConfirmation(`Applied Studio Theme: "${style.name}"`);
                      setTimeout(() => setShowConfirmation(null), 3000);
                    }}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition relative overflow-hidden group select-none cursor-pointer ${
                      isSelected 
                        ? 'border-gold-400 bg-zinc-900/80 text-white shadow-xl' 
                        : 'border-zinc-900 bg-zinc-900/10 text-zinc-400 hover:border-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full mb-3">
                      <div>
                        <span className="font-mono text-xs font-bold block">{style.name}</span>
                        <span className="text-zinc-500 text-[9px] block">
                          {style.isDark ? 'Immersive Dark' : 'Vibrant Light'} Theme
                        </span>
                      </div>
                      
                      {/* Interactive radio check dot */}
                      <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected ? 'border-gold-400 bg-gold-400' : 'border-zinc-800'
                      }`}>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-black font-bold" />}
                      </div>
                    </div>

                    {/* Miniature Swatch Previews */}
                    <div className="flex items-center gap-1.5 mt-2 bg-zinc-950/40 p-1.5 rounded-lg border border-zinc-900/60 max-w-[130px]">
                      <div className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: style.bg }} title="BG" />
                      <div className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: style.cardBg }} title="Card BG" />
                      <div className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: style.accent }} title="Accent" />
                      <div className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: style.text }} title="Text" />
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Bookmarked My Collections Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  <Bookmark className="w-4 h-4 text-gold-400" /> Bookmarked Design Collections
                </h3>
                <p className="text-zinc-500 text-[11px] mt-1 leading-normal">
                  Private showcase holding your bookmarked curations from our portfolio presets.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-gold-400 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded-lg">
                  {collections.length} items
                </span>
                {collections.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 bg-red-950/20 hover:bg-red-950/50 border border-red-900/40 hover:border-red-500 text-red-400 rounded-md transition select-none cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {collections.length > 0 && (
              <div className="flex items-center justify-between pb-1 border-b border-zinc-900/60 text-[10.5px] font-mono">
                <button
                  onClick={handleSelectAllProjects}
                  className="text-zinc-400 hover:text-white flex items-center gap-1.5 transition select-none cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={collections.length > 0 && selectedProjects.length === collections.length}
                    onChange={handleSelectAllProjects}
                    className="rounded border-zinc-800 bg-zinc-900 text-gold-500 focus:ring-gold-500/20 h-3.5 w-3.5 cursor-pointer accent-gold-400"
                  />
                  <span>Select All ({selectedProjects.length} selected)</span>
                </button>

                {selectedProjects.length > 0 && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (onBatchPrint) {
                          onBatchPrint(selectedProjects);
                        }
                      }}
                      className="bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/50 hover:border-indigo-400 text-indigo-400 font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md transition select-none cursor-pointer flex items-center gap-1 shadow-lg shadow-indigo-500/5"
                    >
                      <Layers className="w-3 h-3 text-indigo-400" />
                      <span>Batch Print Multi-page PDF</span>
                    </button>
                    
                    <button
                      onClick={handleRemoveSelected}
                      className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 transition select-none cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Selected ({selectedProjects.length})</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {collections.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <AnimatePresence>
                  {collections.map((project) => {
                    const isChecked = selectedProjects.includes(project.id);
                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`border rounded-xl p-3 flex gap-2 items-center justify-between group overflow-hidden transition-colors ${
                          isChecked ? 'bg-zinc-900/40 border-gold-400/40' : 'bg-zinc-950 border-zinc-900 hover:border-zinc-805'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Selection Checkbox */}
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelectProject(project.id)}
                            className="rounded border-zinc-850 bg-zinc-900 text-gold-500 focus:ring-gold-500/20 h-3.5 w-3.5 cursor-pointer shrink-0 accent-gold-400"
                          />
                          
                          {/* Custom background image bullet */}
                          <div 
                            className="h-10 w-10 rounded bg-cover bg-center shrink-0 border border-zinc-800/80 relative"
                            style={{ backgroundImage: `url(${project.bgValue})` }}
                          >
                            <div className="absolute inset-0 bg-black/30" />
                          </div>
                          
                          <div className="min-w-0">
                            <h4 className="font-display text-xs font-bold text-white truncate max-w-[120px]">
                              {project.title}
                            </h4>
                            <span className="text-[9px] font-mono text-zinc-500 block uppercase truncate max-w-[120px]">
                              {project.category} spec
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onViewProject(project)}
                            className="p-1.5 text-zinc-400 hover:text-gold-400 rounded-lg hover:bg-zinc-900 transition"
                            title="Open detailed view & interact"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveFromCollection(project.id, project.title)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-905 transition"
                            title="Remove bookmark"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-zinc-900/10 border border-dashed border-zinc-900 rounded-xl p-8 text-center">
                <Bookmark className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                <h5 className="font-mono text-xs text-zinc-500 uppercase">Collections is Empty</h5>
                <p className="text-zinc-600 text-[10.5px] font-sans mt-1">
                  Open any portfolio item in detail view and select "Save to Collection" to populate this workspace.
                </p>
              </div>
            )}
          </motion.div>

          {/* Export Gallery Tab */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  <Download className="w-4 h-4 text-gold-400" /> Export Gallery
                </h3>
                <p className="text-zinc-500 text-[11px] mt-1 leading-normal">
                  History of all physically generated PDF/SVG architectural assets.
                </p>
              </div>
              {exports.length > 0 && (
                <button
                  onClick={handleClearExports}
                  className="font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 bg-red-950/20 hover:bg-red-950/50 border border-red-900/40 hover:border-red-500 text-red-400 rounded-md transition select-none cursor-pointer"
                >
                  Clear History
                </button>
              )}
            </div>

            {exports.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <AnimatePresence>
                  {exports.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="border rounded-xl p-3 flex gap-2 items-center justify-between group overflow-hidden transition-colors bg-zinc-950 border-zinc-900 hover:border-zinc-805"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Custom background image bullet */}
                        <div 
                          className="h-10 w-10 rounded bg-cover bg-center shrink-0 border border-zinc-800/80 relative"
                          style={{ backgroundImage: `url(${item.composition?.bgValue || ''})`, backgroundColor: item.composition?.bgType === 'color' ? item.composition.bgValue : '#111' }}
                        >
                          <div className="absolute inset-0 bg-black/30" />
                        </div>
                        
                        <div className="min-w-0">
                          <h4 className="font-display text-xs font-bold text-white truncate max-w-[120px]">
                            {item.title}
                          </h4>
                          <span className="text-[9px] font-mono text-zinc-500 block uppercase truncate max-w-[120px]">
                            {item.timestamp || 'May 10 2026, 12:00 PM'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMockRedownload(item)}
                          className="px-2 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-black bg-gold-400 hover:bg-gold-500 rounded transition"
                          title="Re-download physical file"
                        >
                          Re-download
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="bg-zinc-900/10 border border-dashed border-zinc-900 rounded-xl p-8 text-center">
                <Download className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                <h5 className="font-mono text-xs text-zinc-500 uppercase">Gallery Empty</h5>
                <p className="text-zinc-600 text-[10.5px] font-sans mt-1">
                  Export physical posters from the Atelier studio to populate your gallery.
                </p>
              </div>
            )}
          </motion.div>

          {/* Recently Viewed Specs Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  <RefreshCw className="w-4 h-4 text-gold-400" /> Recently Viewed
                </h3>
                <p className="text-zinc-500 text-[11px] mt-1 leading-normal">
                  Track your historical design footprints and quickly revisit prior curation blueprints.
                </p>
              </div>
              {recentlyViewed.length > 0 && clearRecentlyViewed && (
                <button
                  onClick={clearRecentlyViewed}
                  className="font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 text-zinc-400 rounded-md transition select-none cursor-pointer hover:text-white"
                >
                  Clear History
                </button>
              )}
            </div>

            {recentlyViewed.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {recentlyViewed.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => onViewProject(project)}
                    className="bg-zinc-950/40 hover:bg-zinc-900/40 border border-zinc-905 hover:border-gold-500/30 rounded-xl p-3 cursor-pointer transition duration-200 flex items-center justify-between group overflow-hidden text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Thumbnail frame */}
                      <div 
                        className="h-10 w-10 rounded bg-cover bg-center shrink-0 border border-zinc-900 relative"
                        style={{ backgroundImage: `url(${project.bgValue})` }}
                      >
                        <div className="absolute inset-0 bg-black/40" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display text-xs font-bold text-white truncate max-w-[130px]">
                          {project.title}
                        </h4>
                        <span className="text-[9px] font-mono text-zinc-500 block uppercase truncate">
                          {project.category} spec
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewProject(project);
                      }}
                      className="p-1.5 text-zinc-500 group-hover:text-gold-400 rounded-lg hover:bg-zinc-900 transition shrink-0"
                      title="Revisit project"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-900/10 border border-dashed border-zinc-900 rounded-xl p-8 text-center">
                <RefreshCw className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                <h5 className="font-mono text-xs text-zinc-500 uppercase">No footprint yet</h5>
                <p className="text-zinc-600 text-[10.5px] font-sans mt-1">
                  Revisit your account portfolio or atelier studio to store active footprints in your history.
                </p>
              </div>
            )}
          </motion.div>

          {/* EXPORT GALLERY SECTION */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-gold-400" /> Exported Assets Gallery
                </h3>
                <p className="text-zinc-500 text-[11px] mt-1 leading-normal">
                  Historical archive of all high-resolution PDF, SVG and TIFF blueprint specifications you have compiled.
                </p>
              </div>
              {exports.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearExports}
                  className="font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 bg-red-950/20 hover:bg-red-950/50 border border-red-900/40 hover:border-red-500 text-red-500 rounded-md transition select-none cursor-pointer"
                >
                  Clear Archive
                </button>
              )}
            </div>

            {exports.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {exports.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3.5 flex flex-col justify-between group overflow-hidden text-left space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div 
                          className="h-10 w-10 rounded shrink-0 border border-zinc-850 bg-zinc-900 bg-cover bg-center flex items-center justify-center relative shadow shadow-black/40"
                          style={{ backgroundImage: item.bgValue && item.bgValue.startsWith('http') ? `url(${item.bgValue})` : 'none' }}
                        >
                          {!item.bgValue || !item.bgValue.startsWith('http') ? (
                            <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                              {item.format}
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-black/10" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-display text-xs font-bold text-white truncate max-w-[140px]">
                            {item.title}
                          </h4>
                          <span className="text-[8.5px] font-mono text-zinc-500 block uppercase pt-0.5">
                            {item.timestamp}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                        item.format === 'PDF' 
                          ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30' 
                          : item.format === 'SVG' 
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/30'
                      }`}>
                        {item.format}
                      </span>
                    </div>

                    <div className="text-[9.5px] font-mono text-zinc-500 leading-snug border-t border-zinc-900/40 pt-2 flex items-center justify-between">
                      <span>{item.size || "Digital Spec Layout"}</span>
                      <button 
                        onPointerDown={(e) => { e.stopPropagation(); handleRemoveExport(item.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-red-400 transition cursor-pointer"
                        title="Remove from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-900/40">
                      <button
                        type="button"
                        onClick={() => handleMockRedownload(item)}
                        className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-gold-500/25 text-zinc-400 hover:text-white font-mono text-[9px] uppercase tracking-wider py-1.5 rounded-lg transition text-center select-none cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3 text-gold-400/80" />
                        <span>Download</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReloadInAtelier(item)}
                        className="bg-gold-500/10 hover:bg-gold-500/25 border border-gold-500/20 text-gold-400 hover:text-white font-mono text-[9px] uppercase tracking-wider py-1.5 rounded-lg transition text-center select-none cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-gold-400" />
                        <span>Atelier Load</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-900/10 border border-dashed border-zinc-905 rounded-xl p-8 text-center">
                <Layers className="w-6 h-6 text-zinc-850 mx-auto mb-2" />
                <h5 className="font-mono text-xs text-zinc-500 uppercase">Export History Empty</h5>
                <p className="text-zinc-650 text-[10px] font-sans mt-1">
                  Exports prepared in active portfolio cards or design canvas workbench will instantly appear here.
                </p>
              </div>
            )}
          </motion.div>

        </div>
      </div>

    </div>
  );
}
