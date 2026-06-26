import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PlusCircle, Database, Edit, Trash2, CheckCircle2, AlertCircle, X,
  Save, Sparkles, Sliders, Type, Palette, AlignLeft, Info, Eye, EyeOff,
  History, BarChart3, Settings, Check, Square, MinusSquare, Archive,
  ExternalLink, Calendar, Search, Trash, LayoutGrid, CheckSquare, Layers,
  Download, Copy, ShieldCheck, RefreshCw, Bell, CalendarRange, ToggleLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PosterTemplate } from '../types';
import { auth } from '../auth';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';

// Custom ResizeObserver hook to accurately measure container dimensions and prevent Recharts console warnings
function useChartSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (node) {
      const observer = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        const width = Math.floor(entries[0].contentRect.width);
        const height = Math.floor(entries[0].contentRect.height);
        setSize({ width, height });
      });
      observer.observe(node);
      observerRef.current = observer;
    }
  }, []);

  return [ref, size] as const;
}

// Global Themes mapping for CSS emulation in Adaptive Live Drawer Sandbox
const THEME_STYLES: Record<string, {
  name: string;
  isDark: boolean;
  bg: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  cardBg: string;
  glow: string;
}> = {
  'obsidian-gold': {
    name: 'Obsidian Gold',
    isDark: true,
    bg: '#09090b',
    text: '#ffffff',
    textMuted: '#a1a1aa',
    border: '#18181b',
    accent: '#eca115',
    cardBg: '#09090b',
    glow: 'rgba(212, 175, 55, 0.05)'
  },
  'alpine-minimalist': {
    name: 'Alpine Off-White',
    isDark: false,
    bg: '#f4f4f5',
    text: '#09090b',
    textMuted: '#52525b',
    border: '#e4e4e7',
    accent: '#4f46e5',
    cardBg: '#ffffff',
    glow: 'rgba(79, 70, 229, 0.03)'
  },
  'nordic-slate': {
    name: 'Nordic Sage Slate',
    isDark: true,
    bg: '#14211a',
    text: '#f5f5f4',
    textMuted: '#a8a29e',
    border: '#1c2e24',
    accent: '#22c55e',
    cardBg: '#0c1511',
    glow: 'rgba(34, 197, 94, 0.05)'
  },
  'royal-cobalt': {
    name: 'Royal Cobalt',
    isDark: true,
    bg: '#0b132b',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    border: '#1c2541',
    accent: '#38bdf8',
    cardBg: '#0f172a',
    glow: 'rgba(56, 189, 248, 0.05)'
  },
  'tokyo-cyber': {
    name: 'Tokyo Neon Cyber',
    isDark: true,
    bg: '#0f0e17',
    text: '#fffffe',
    textMuted: '#a7a9be',
    border: '#1a1829',
    accent: '#ff007f',
    cardBg: '#14121f',
    glow: 'rgba(255, 0, 127, 0.05)'
  },
  'bordeaux-burgundy': {
    name: 'Crimson Bordeaux',
    isDark: true,
    bg: '#250610',
    text: '#fff1f2',
    textMuted: '#fca5a5',
    border: '#3c0d1e',
    accent: '#f43f5e',
    cardBg: '#1c030c',
    glow: 'rgba(244, 63, 94, 0.05)'
  }
};

interface CrmPanelProps {
  posters: PosterTemplate[];
  setPosters: React.Dispatch<React.SetStateAction<PosterTemplate[]>>;
  triggerToast: (msg: string, type?: 'success' | 'info' | 'alert') => void;
  adminPreviewPoster?: PosterTemplate | null;
  setAdminPreviewPoster?: (p: PosterTemplate | null) => void;
  themeStyles: Record<string, any>;
  setThemeStyles?: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

interface AuditLog {
  id: string;
  timestamp: number;
  action: string;
  details: string;
  adminEmail: string;
}

export default function CrmPanel({
  posters, setPosters, triggerToast,
  adminPreviewPoster, setAdminPreviewPoster,
  themeStyles, setThemeStyles
}: CrmPanelProps) {
  // Check if current user is Super-admin
  const isSuperAdmin = auth.currentUser?.is_admin || false;

  // Chart size measuring hooks to prevent Recharts layout warnings
  const [lineChartRef, lineChartSize] = useChartSize();
  const [pieChartRef, pieChartSize] = useChartSize();
  const [barChartRef, barChartSize] = useChartSize();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'analytics' | 'inventory' | 'logs' | 'theme-config' | 'client-hub' | 'admin'>(() => {
    return (localStorage.getItem('creativenode_crm_tab') as any) || 'analytics';
  });
  
  useEffect(() => {
    localStorage.setItem('creativenode_crm_tab', activeTab);
  }, [activeTab]);
  
  // Neon DB CRM State
  const [neonData, setNeonData] = useState<{ 
    clients: { id: string; name: string; slug: string; tagline: string; accent: string; sort_order: number; created_at: string; }[], 
    posterDesigns: { id: string; client_id: string; title: string; image_path: string; sort_order: number; created_at: string; }[], 
    websites: { id: string; client_id: string; title: string; image_path: string; sort_order: number; approved: boolean; created_at: string; }[] 
  }>({ clients: [], posterDesigns: [], websites: [] });
  const [isFetchingNeon, setIsFetchingNeon] = useState(false);

  const refreshNeonData = async () => {
    setIsFetchingNeon(true);
    try {
      const res = await fetch('/api/db/crm-data').then(async r => { const t = await r.text(); try { return t ? JSON.parse(t) : {}; } catch { return {}; } });
      if (res.status === 'success') {
        setNeonData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch neon data:", err);
    } finally {
      setIsFetchingNeon(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'client-hub') {
      refreshNeonData();
    }
  }, [activeTab]);

  // CRM Forms State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState({ id: '', name: '', slug: '', tagline: '', accent: '#d4af37', sort_order: 0 });

  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [clientPosterForm, setClientPosterForm] = useState({ id: '', client_id: '', title: '', image_path: '', sort_order: 0 });

  const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useState(false);
  const [websiteForm, setWebsiteForm] = useState({ id: '', client_id: '', title: '', image_path: '', approved: true, sort_order: 0 });

  // CRM Submit Handlers
  const handleClientFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = clientForm.id || `client-${Date.now()}`;
    try {
      const res = await fetch('/api/db/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...clientForm, id }) });
      if (res.ok) {
        triggerToast("Client saved successfully.", "success");
        setIsClientModalOpen(false);
        setClientForm({ id: '', name: '', slug: '', tagline: '', accent: '#d4af37', sort_order: 0 });
        refreshNeonData();
      } else {
        triggerToast("Failed to save client.", "alert");
      }
    } catch (err) {
      triggerToast("Failed to save client.", "alert");
    }
  };

  const handleClientDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this client? All associated posters and websites will also be deleted.')) return;
    try {
      const res = await fetch(`/api/db/clients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        triggerToast("Client deleted successfully.", "success");
        refreshNeonData();
      } else {
        triggerToast("Failed to delete client.", "alert");
      }
    } catch (err) {
      triggerToast("Failed to delete client.", "alert");
    }
  };

  const handleClientPosterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = clientPosterForm.id || `poster-${Date.now()}`;
    try {
      const res = await fetch('/api/db/client-posters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...clientPosterForm, id }) });
      if (res.ok) {
        triggerToast("Poster saved successfully.", "success");
        setIsPosterModalOpen(false);
        setClientPosterForm({ id: '', client_id: '', title: '', image_path: '', sort_order: 0 });
        refreshNeonData();
      } else {
        triggerToast("Failed to save poster.", "alert");
      }
    } catch (err) {
      triggerToast("Failed to save poster.", "alert");
    }
  };

  const handleClientPosterDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this poster?')) return;
    try {
      const res = await fetch(`/api/db/client-posters/${id}`, { method: 'DELETE' });
      if (res.ok) {
        triggerToast("Poster deleted successfully.", "success");
        refreshNeonData();
      } else {
        triggerToast("Failed to delete poster.", "alert");
      }
    } catch (err) {
      triggerToast("Failed to delete poster.", "alert");
    }
  };

  const handleWebsiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = websiteForm.id || `website-${Date.now()}`;
    try {
      const res = await fetch('/api/db/client-websites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...websiteForm, id }) });
      if (res.ok) {
        triggerToast("Website saved successfully.", "success");
        setIsWebsiteModalOpen(false);
        setWebsiteForm({ id: '', client_id: '', title: '', image_path: '', approved: true, sort_order: 0 });
        refreshNeonData();
      } else {
        triggerToast("Failed to save website.", "alert");
      }
    } catch (err) {
      triggerToast("Failed to save website.", "alert");
    }
  };

  const handleWebsiteDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this website?')) return;
    try {
      const res = await fetch(`/api/db/client-websites/${id}`, { method: 'DELETE' });
      if (res.ok) {
        triggerToast("Website deleted successfully.", "success");
        refreshNeonData();
      } else {
        triggerToast("Failed to delete website.", "alert");
      }
    } catch (err) {
      triggerToast("Failed to delete website.", "alert");
    }
  };
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Selection & Bulk Editing State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState<string>('');
  const [bulkBadge, setBulkBadge] = useState<string>('');
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [showBulkControls, setShowBulkControls] = useState(false);

  // Modal form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [previewTheme, setPreviewTheme] = useState('obsidian-gold');
  const [showAuditExportConfirm, setShowAuditExportConfirm] = useState(false);

  // Image Cropper State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropX, setCropX] = useState(10);
  const [cropY, setCropY] = useState(10);
  const [cropW, setCropW] = useState(80);
  const [cropH, setCropH] = useState(80);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Real-time Database Operation Toast State
  const [activityToast, setActivityToast] = useState<AuditLog | null>(null);
  const prevLogsRef = useRef<AuditLog[]>([]);

  // Drag & Drop Reordering State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [details, setDetails] = useState('');
  const [theme, setTheme] = useState('Obsidian Gold');
  const [bgType, setBgType] = useState<'color' | 'image' | 'gradient'>('image');
  const [bgValue, setBgValue] = useState('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80');
  const [accentColor, setAccentColor] = useState('#d4af37');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontTitle, setFontTitle] = useState('Space Grotesk');
  const [fontSubtitle, setFontSubtitle] = useState('JetBrains Mono');
  const [badge, setBadge] = useState('');
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');
  const [geometricElement, setGeometricElement] = useState<'circle' | 'lines' | 'grid' | 'border' | 'none'>('circle');
  const [category, setCategory] = useState<'fitness' | 'fashion' | 'minimalist' | 'offers' | 'all'>('minimalist');
  const [keywordsString, setKeywordsString] = useState('Minimalist, Premium, Geometry, Modern');
  const [status, setStatus] = useState<'Live' | 'Pending Approval' | 'Draft' | 'Archived'>('Pending Approval');
  const [expiryDate, setExpiryDate] = useState('');
  const [dateCreated, setDateCreated] = useState('');

  // AI Generation State
  const [brandName, setBrandName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // New features declarations block
  const [drawerPoster, setDrawerPoster] = useState<PosterTemplate | null>(null);
  const [drawerTheme, setDrawerTheme] = useState<string>('obsidian-gold');
  const [quickPreviewPoster, setQuickPreviewPoster] = useState<PosterTemplate | null>(null);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; poster: PosterTemplate } | null>(null);
  const [exportStartDate, setExportStartDate] = useState<string>('');
  const [exportEndDate, setExportEndDate] = useState<string>('');

  // Close context menu on global window clicks
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // Live Update safeguards via reference comparison
  const lastPostersRef = useRef<PosterTemplate[]>(posters);

  // Monitor Live changes from Firestore snapshot and trigger a subtle alert
  useEffect(() => {
    if (lastPostersRef.current && lastPostersRef.current.length > 0 && posters.length > 0) {
      const addedItems = posters.filter(p => !lastPostersRef.current.some(old => old.id === p.id));
      if (addedItems.length > 0) {
        triggerToast(`Live Update: ${addedItems.length} new layouts synchronized in real-time.`, "success");
      }
    }
    lastPostersRef.current = posters;
  }, [posters, triggerToast]);

  // Form Progress Auto-Save to localStorage
  useEffect(() => {
    if (isModalOpen && !editingId) {
      const draftData = {
        title, subtitle, details, theme, bgType, bgValue, accentColor, textColor,
        fontTitle, fontSubtitle, badge, align, geometricElement, category, keywordsString, status
      };
      localStorage.setItem('atelier-crm-modal-draft', JSON.stringify(draftData));
    }
  }, [
    isModalOpen, editingId, title, subtitle, details, theme, bgType, bgValue,
    accentColor, textColor, fontTitle, fontSubtitle, badge, align, geometricElement,
    category, keywordsString, status
  ]);

  // Auto-Restore form progress draft on modal launch
  useEffect(() => {
    if (isModalOpen && !editingId) {
      const savedDraft = localStorage.getItem('atelier-crm-modal-draft');
      if (savedDraft) {
        try {
          const draft = savedDraft ? JSON.parse(savedDraft) : {};
          if (draft.title || draft.subtitle || draft.details) {
            setTitle(draft.title || '');
            setSubtitle(draft.subtitle || '');
            setDetails(draft.details || '');
            setTheme(draft.theme || 'Obsidian Gold');
            setBgType(draft.bgType || 'image');
            setBgValue(draft.bgValue || '');
            setAccentColor(draft.accentColor || '#d4af37');
            setTextColor(draft.textColor || '#ffffff');
            setFontTitle(draft.fontTitle || 'Space Grotesk');
            setFontSubtitle(draft.fontSubtitle || 'JetBrains Mono');
            setBadge(draft.badge || '');
            setAlign(draft.align || 'center');
            setGeometricElement(draft.geometricElement || 'circle');
            setCategory(draft.category || 'minimalist');
            setKeywordsString(draft.keywordsString || '');
            setStatus(draft.status || 'Live');
            triggerToast("In-progress form progress restored automatically.", "info");
          }
        } catch (e) {
          console.error("Failed to restore form draft state", e);
        }
      }
    }
  }, [isModalOpen, editingId]);

  // Image Cropper Canvas Drawing Loop
  useEffect(() => {
    if (isCropperOpen && bgValue && bgType === 'image') {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = bgValue;
      img.onload = () => {
        const canvas = cropCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = img.width || 600;
        canvas.height = img.height || 900;
        ctx.drawImage(img, 0, 0);
        
        // Draw crop frame rectangle
        const x = (cropX / 100) * canvas.width;
        const y = (cropY / 100) * canvas.height;
        const w = (cropW / 100) * canvas.width;
        const h = (cropH / 100) * canvas.height;
        
        ctx.strokeStyle = '#eca115';
        ctx.lineWidth = Math.max(3, canvas.width / 150);
        ctx.strokeRect(x, y, w, h);
        
        // Draw dimmed background areas outwith crop boundary
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        // Above
        ctx.fillRect(0, 0, canvas.width, y);
        // Below
        ctx.fillRect(0, y + h, canvas.width, canvas.height - (y + h));
        // Left
        ctx.fillRect(0, y, x, h);
        // Right
        ctx.fillRect(x + w, y, canvas.width - (x + w), h);
      };
      
      img.onerror = () => {
        const canvas = cropCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = 400;
        canvas.height = 350;
        ctx.fillStyle = '#0f0f12';
        ctx.fillRect(0, 0, 400, 350);
        ctx.fillStyle = '#ef4444';
        ctx.font = '10.5px Courier';
        ctx.fillText("Failed to load cross-origin asset.", 20, 100);
        ctx.fillText("You can still crop non-CORS restricted links manually,", 20, 130);
        ctx.fillText("or write raw image URLs directly.", 20, 150);
      };
    }
  }, [isCropperOpen, bgValue, bgType, cropX, cropY, cropW, cropH]);

  const executeCropAction = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = bgValue;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const realX = (cropX / 100) * img.width;
      const realY = (cropY / 100) * img.height;
      const realW = (cropW / 100) * img.width;
      const realH = (cropH / 100) * img.height;
      
      canvas.width = realW;
      canvas.height = realH;
      ctx.drawImage(img, realX, realY, realW, realH, 0, 0, realW, realH);
      
      try {
        const cropResult = canvas.toDataURL("image/jpeg", 0.9);
        setBgValue(cropResult);
        triggerToast("Custom backdrop cropped to strict aspect parameters!", "success");
        setIsCropperOpen(false);
      } catch (e) {
        console.error("Cropping canvas crash:", e);
        triggerToast("Format restriction: please use non-cors secured image links.", "alert");
        setIsCropperOpen(false);
      }
    };
    img.onerror = () => {
      triggerToast("Image asset failed during export parameters.", "alert");
    };
  };

  // Duplicate item template to a new unique blueprint spec inside Neon DB
  const handleDuplicateClick = async (item: PosterTemplate) => {
    try {
      const newId = `custom-project-${Date.now()}`;
      const duplicatedItem: PosterTemplate = {
        ...item,
        id: newId,
        title: `${item.title} (Copy)`,
        createdAt: new Date().toISOString()
      } as any;
      
      await fetch('/api/db/custom-posters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(duplicatedItem) });
      await logAction("DUPLICATE_POSTER", `Duplicated layout blueprint: "${item.title}" to "${duplicatedItem.title}"`);
      triggerToast(`Duplicated spec template as "${duplicatedItem.title}" successfully.`, "success");
    } catch (err: any) {
      console.error("Duplication failed:", err);
      triggerToast(`Failed to duplicate template: ${err.message}`, "alert");
    }
  };

  // Drag & drop manual order change committer
  const handleRowDrop = async (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    // Get list of currently visible sorted/filtered posters
    const filteredList = [...filteredPosters];
    const [draggedItem] = filteredList.splice(draggedIndex, 1);
    filteredList.splice(targetIndex, 0, draggedItem);

    // Update order indices based on their visual order
    const updatedPosters = posters.map(p => {
      const idxInFiltered = filteredList.findIndex(item => item.id === p.id);
      if (idxInFiltered !== -1) {
        return { ...p, orderIndex: idxInFiltered };
      }
      return p;
    });

    setPosters(updatedPosters);
    triggerToast("Updating custom curated sequence order...", "info");

    try {
      const updatePromises = filteredList.map((item, idx) => {
        return fetch('/api/db/custom-posters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...item, orderIndex: idx }) });
      });
      await Promise.all(updatePromises);
      await logAction("ORDER_REPOSITION", `Manually curated poster grid Display Sequences`);
      triggerToast("New manual portfolio curation sequence synced successfully!", "success");
    } catch (err) {
      console.error("Failed to sync sequence orderIndex to Neon:", err);
    }

    setDraggedIndex(null);
  };

  // Real-time Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Fetch Audit Logs from Neon DB
  useEffect(() => {
    const fetchLogs = () => {
      fetch('/api/db/audit-logs')
        .then(async r => { const t = await r.text(); try { return t ? JSON.parse(t) : {}; } catch { return {}; } })
        .then(res => {
          if (res.status === 'success') {
            setAuditLogs(res.data);
          }
        })
        .catch(err => console.warn("Failed to fetch audit logs:", err));
    };
    fetchLogs();
    // Poll every 30 seconds for new logs
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Monitor logs for real-time CRUD activity alerts
  useEffect(() => {
    if (prevLogsRef.current.length > 0 && auditLogs.length > prevLogsRef.current.length) {
      const newLogs = auditLogs.filter(l => !prevLogsRef.current.some(pl => pl.id === l.id));
      // Detect CRUD operations on custom_posters
      const crudNewLogs = newLogs.filter(l => 
        l.action.includes('POSTER') || 
        l.action.includes('EXPIRATION') || 
        l.action.includes('STATUS') || 
        l.action.includes('ADAPTATION')
      );
      if (crudNewLogs.length > 0) {
        setActivityToast(crudNewLogs[0]);
        const timer = setTimeout(() => {
          setActivityToast(null);
        }, 6000);
        return () => clearTimeout(timer);
      }
    }
    prevLogsRef.current = auditLogs;
  }, [auditLogs]);

  // Synchronously scan and archive any expired custom poster elements weekly scheduler
  useEffect(() => {
    if (posters && posters.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const expired = posters.filter(p => p.expiryDate && p.expiryDate <= todayStr && p.status !== 'Archived');
      if (expired.length > 0) {
        expired.forEach(async (p) => {
          try {
            await fetch('/api/db/custom-posters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...p, status: 'Archived', archived: true }) });
            await logAction("AUTOMATED_EXPIRATION", `System automatically archived expired poster "${p.title}" on current date boundary (Expired: ${p.expiryDate})`);
          } catch (e) {
            console.error("Auto archival check error:", e);
          }
        });
      }
    }
  }, [posters]);

  // Helper to commit audit log entry to Neon DB
  const logAction = async (action: string, logDetails: string) => {
    const logId = 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const logData: AuditLog = {
      id: logId,
      timestamp: Date.now(),
      action,
      details: logDetails,
      adminEmail: auth.currentUser?.email || 'admin@creativenode.in'
    };
    try {
      await fetch('/api/db/audit-logs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...logData }) });
      // Update local state immediately for responsive UI
      setAuditLogs(prev => [logData, ...prev].slice(0, 200));
    } catch (err) {
      console.warn("Failed to save audit log to Neon. Inserting locally.", err);
      setAuditLogs(prev => [logData, ...prev]);
    }
  };

  // Instantly toggle live/draft status via right click context menu or inline switch
  const handleQuickStatusToggle = async (posterId: string, newStatus: 'Live' | 'Pending Approval' | 'Draft' | 'Archived') => {
    const matchedPoster = posters.find(p => p.id === posterId);
    if (!matchedPoster) return;

    const updatedData: PosterTemplate = {
      ...matchedPoster,
      status: newStatus,
      archived: newStatus === 'Archived'
    };

    try {
      await fetch('/api/db/custom-posters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) });
      await logAction("QUICK_STATUS_TOGGLE", `Quick updated status for "${matchedPoster.title}" to "${newStatus}"`);
      triggerToast(`Successfully toggled status to "${newStatus}" for "${matchedPoster.title}".`, 'success');
    } catch (err: any) {
      console.error("Quick status toggle failed:", err);
      setPosters(prev => prev.map(p => p.id === posterId ? updatedData : p));
      await logAction("LOCAL_STATUS_TOGGLE_FALLBACK", `Saved status toggle locally for "${matchedPoster.title}"`);
      triggerToast(`Saved locally: ${err.message}`, 'info');
    }
  };

  // AI Generation Handler
  const handleGenerateAIContent = async () => {
    if (!brandName.trim()) {
      triggerToast("Please enter a Brand Name first.", "alert");
      return;
    }
    setIsGenerating(true);
    triggerToast("Generating elite poster copy with AI...", "info");
    
    try {
      const res = await fetch('/api/generate-poster-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName: brandName.trim() })
      });
      
      if (!res.ok) throw new Error("Failed to generate content");
      
      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.subtitle) setSubtitle(data.subtitle);
      if (data.details) setDetails(data.details);
      
      triggerToast("AI content generated successfully!", "success");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to generate AI content.", "alert");
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit Handler for Add / Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !subtitle.trim() || !details.trim()) {
      triggerToast("Please populate all primary specification values.", "alert");
      return;
    }

    const id = editingId || 'custom-project-' + Date.now();
    const keywords = (keywordsString || '').split(',').map(k => k.trim()).filter(k => k.length > 0);

    const templateData: PosterTemplate = {
      id,
      title: title.trim(),
      subtitle: subtitle.trim(),
      details: details.trim(),
      theme,
      bgType,
      bgValue: bgValue.trim(),
      accentColor,
      textColor,
      fontTitle,
      fontSubtitle,
      align,
      geometricElement,
      category,
      keywords,
      ...(badge.trim() ? { badge: badge.trim() } : {}),
      archived: status === 'Archived',
      status,
      expiryDate: expiryDate || '',
      dateCreated: dateCreated || new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch('/api/db/custom-posters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(templateData) });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const t = await res.text();
      let resData: any = {};
      try { resData = t ? JSON.parse(t) : {}; } catch (e) {}
      if (resData.status === 'error') throw new Error(resData.message);
      
      const logMessage = editingId 
        ? `Modified poster specs for ID: "${id}" (Title: "${title.trim()}", Status: "${status}")`
        : `Deployed new poster spec ID: "${id}" (Title: "${title.trim()}", Status: "${status}")`;
      const actionType = editingId ? "UPDATE_POSTER" : "CREATE_POSTER";
      await logAction(actionType, logMessage);
      localStorage.removeItem('atelier-crm-modal-draft');
      triggerToast(
        editingId 
          ? `Poster specs "${title}" modified successfully!` 
          : `Custom poster blueprint "${title}" posted to live spec database!`, 
        "success"
      );
      handleResetForm();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Neon Save Error:", err);
      setPosters(prev => {
        const filtered = prev.filter(p => p.id !== id);
        return [...filtered, templateData];
      });
      await logAction(
        editingId ? "LOCAL_UPDATE_FALLBACK" : "LOCAL_CREATE_FALLBACK",
        `Saved locally due to write error for poster: "${title.trim()}"`
      );
      localStorage.removeItem('atelier-crm-modal-draft');
      triggerToast("Saved locally. Neon DB sync pending.", "info");
      handleResetForm();
      setIsModalOpen(false);
    }
  };

  const handleEditClick = (item: PosterTemplate) => {
    setEditingId(item.id);
    setTitle(item.title);
    setSubtitle(item.subtitle);
    setDetails(item.details);
    setTheme(item.theme);
    setBgType(item.bgType);
    setBgValue(item.bgValue);
    setAccentColor(item.accentColor);
    setTextColor(item.textColor);
    setFontTitle(item.fontTitle);
    setFontSubtitle(item.fontSubtitle);
    setBadge(item.badge || '');
    setAlign(item.align);
    setGeometricElement(item.geometricElement || 'none');
    setCategory(item.category === 'all' ? 'minimalist' : item.category);
    setKeywordsString((item.keywords || []).join(', '));
    setStatus(item.status || (item.archived ? 'Archived' : 'Live'));
    setExpiryDate(item.expiryDate || '');
    setDateCreated(item.dateCreated || '');
    
    setIsPreviewActive(false);
    setIsModalOpen(true);
    triggerToast(`Editing specifications for "${item.title}".`, "info");
  };

  const handleDeleteClick = async (item: PosterTemplate) => {
    if (!window.confirm(`Delete "${item.title}" permanently?`)) return;
    try {
      const res = await fetch(`/api/db/custom-posters/${item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      // Remove from local state on success
      setPosters(prev => prev.filter(p => p.id !== item.id));
      await logAction("DELETE_POSTER", `Purged: "${item.title}" (ID: ${item.id})`);
      triggerToast(`"${item.title}" deleted.`, "success");
    } catch (err) {
      console.error("Delete failed:", err);
      // Fallback: remove locally anyway
      setPosters(prev => prev.filter(p => p.id !== item.id));
      await logAction("DELETE_POSTER_LOCAL", `Locally purged: "${item.title}"`);
      triggerToast(`Removed from local cache.`, "success");
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`This will permanently delete ALL ${posters.length} poster(s) from the database. Are you sure?`)) return;
    let deleted = 0;
    for (const p of posters) {
      try {
        await fetch(`/api/db/custom-posters/${p.id}`, { method: 'DELETE' });
        deleted++;
      } catch (_) { /* ignore individual errors */ }
    }
    setPosters([]);
    setSelectedIds([]);
    await logAction("DELETE_ALL_POSTERS", `Purged all ${deleted} poster specifications from system.`);
    triggerToast(`All ${deleted} posters purged. Canvas is clean.`, "success");
  };

  // Bulk Actions
  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (filteredPosters: PosterTemplate[]) => {
    if (selectedIds.length === filteredPosters.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPosters.map(item => item.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete these ${selectedIds.length} poster specifications?`)) {
      return;
    }

    const deletePromises = selectedIds.map(async (id) => {
      const matchedPoster = posters.find(p => p.id === id);
      try {
        await fetch(`/api/db/custom-posters/${id}`, { method: 'DELETE' });
        return { success: true, title: matchedPoster?.title || id };
      } catch (err) {
        return { success: false, id, title: matchedPoster?.title || id };
      }
    });

    const results = await Promise.all(deletePromises);
    const succeeded = results.filter(r => r.success);
    
    await logAction(
      "BULK_DELETE_POSTERS", 
      `Bulk purged ${succeeded.length} files: ${succeeded.map(s => `"${s.title}"`).join(', ')}`
    );

    triggerToast(`Bulk deleted ${succeeded.length} layout specifications dynamically!`, 'success');
    setSelectedIds([]);
  };

  const handleBulkArchiveToggle = async () => {
    if (selectedIds.length === 0) return;
    
    // Choose behavior based on first item: if first item is active, archive them. Else, unarchive them
    const firstSelected = posters.find(p => p.id === selectedIds[0]);
    const nextArchivedState = !firstSelected?.archived;

    const archivePromises = selectedIds.map(async (id) => {
      const matchedPoster = posters.find(p => p.id === id);
      if (!matchedPoster) return;

      const updatedData = { ...matchedPoster, archived: nextArchivedState };
      try {
        await fetch('/api/db/custom-posters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) });
        return { success: true, title: matchedPoster.title };
      } catch (err) {
        return { success: false, title: matchedPoster.title };
      }
    });

    const results = await Promise.all(archivePromises);
    const succeeded = results.filter(r => r !== undefined && r.success);

    await logAction(
      nextArchivedState ? "BULK_ARCHIVE_POSTERS" : "BULK_UNARCHIVE_POSTERS",
      `${nextArchivedState ? 'Archived' : 'Activated'} ${succeeded.length} layouts: ${succeeded.map(s => s && `"${s.title}"`).join(', ')}`
    );

    triggerToast(
      `${succeeded.length} design specifications ${nextArchivedState ? 'archived' : 're-activated'} successfully!`, 
      'success'
    );
    setSelectedIds([]);
  };

  const handleBulkMetadataUpdate = async () => {
    if (selectedIds.length === 0) return;
    if (!bulkCategory && !bulkBadge && !bulkStatus) {
      triggerToast("Please pick a category, enter a badge, or select a workflow status to apply in bulk.", "alert");
      return;
    }

    const updatePromises = selectedIds.map(async (id) => {
      const matchedPoster = posters.find(p => p.id === id);
      if (!matchedPoster) return;

      const updatedData = { 
        ...matchedPoster,
        ...(bulkCategory ? { category: bulkCategory as any } : {}),
        ...(bulkBadge !== "" ? { badge: bulkBadge.trim() } : {}),
        ...(bulkStatus !== "" ? { status: bulkStatus as any } : {})
      };
      // Keep badge out if empty string was passed to clear it
      if (bulkBadge === "CLEAR_BADGE" && updatedData.badge) {
        delete updatedData.badge;
      }

      // Sync archive status if workflow status changed to Archived
      if (bulkStatus === 'Archived') {
        updatedData.archived = true;
      } else if (bulkStatus === 'Live' || bulkStatus === 'Pending Approval' || bulkStatus === 'Draft') {
        updatedData.archived = false;
      }

      try {
        await fetch('/api/db/custom-posters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) });
        return { success: true, title: matchedPoster.title };
      } catch (err) {
        return { success: false, title: matchedPoster.title };
      }
    });

    const results = await Promise.all(updatePromises);
    const succeeded = results.filter(r => r !== undefined && r.success);

    await logAction(
      "BULK_METADATA_UPDATE",
      `Bulk updated tags & status for ${succeeded.length} files: ${succeeded.map(s => s && `"${s.title}"`).join(', ')}`
    );

    triggerToast(`Successfully bulk updated ${succeeded.length} poster blueprints.`, 'success');
    setBulkCategory('');
    setBulkBadge('');
    setBulkStatus('');
    setSelectedIds([]);
    setShowBulkControls(false);
  };

  const exportAuditLogsCSV = () => {
    if (auditLogs.length === 0) {
      triggerToast("No audit records available to export.", "alert");
      return;
    }
    setShowAuditExportConfirm(true);
  };

  const performAuditExport = () => {
    const startMs = exportStartDate ? new Date(exportStartDate).getTime() : 0;
    const endMs = exportEndDate ? new Date(exportEndDate).getTime() + 86400000 : Infinity;

    const filteredLogs = auditLogs.filter(log => log.timestamp >= startMs && log.timestamp <= endMs);

    if (filteredLogs.length === 0) {
      triggerToast("No log records match specified date filters.", "alert");
      return;
    }

    const headers = ["Log ID", "ISO Timestamp", "Action Class", "Description Details", "Administrator Context"];
    const rows = filteredLogs.map(log => [
      log.id,
      new Date(log.timestamp).toISOString(),
      log.action,
      log.details.replace(/"/g, '""'),
      log.adminEmail
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `atelier_system_audit_logs_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(`System audit logs (${filteredLogs.length} events) exported successfully.`, "success");
    logAction("EXPORT_AUDIT_LOGS", `Exported ${filteredLogs.length} filtered event history logs to CSV format`);
  };

  const exportPostersCSV = () => {
    const startMs = exportStartDate ? new Date(exportStartDate).getTime() : 0;
    const endMs = exportEndDate ? new Date(exportEndDate).getTime() + 86400000 : Infinity;

    const filteredPosters = posters.filter(p => {
      let itemMs = 0;
      if ('createdAt' in (p as any) && (p as any).createdAt) {
        itemMs = new Date((p as any).createdAt).getTime();
      } else if (p.id.startsWith('custom-project-')) {
        const tsStr = p.id.replace('custom-project-', '');
        const ts = parseInt(tsStr, 10);
        if (!isNaN(ts)) {
          itemMs = ts;
        }
      }
      if (itemMs === 0) {
        return !exportStartDate; // include presets only if they don't specify start date range
      }
      return itemMs >= startMs && itemMs <= endMs;
    });

    if (filteredPosters.length === 0) {
      triggerToast("No custom entries match specified date filters.", "alert");
      return;
    }

    const headers = [
      "Poster ID", 
      "Title", 
      "Subtitle", 
      "Conceptual Narrative Details", 
      "Theme Way", 
      "Category Sector", 
      "Workflow Status",
      "Backdrop Type", 
      "Backdrop Specification", 
      "Color Accent Scheme", 
      "Color Text Scheme", 
      "Title Typography", 
      "Subtitle Typography",
      "Display Badge",
      "Structural Orientation",
      "Geometric Elements Theme"
    ];

    const rows = filteredPosters.map(p => [
      p.id,
      p.title.replace(/"/g, '""'),
      p.subtitle.replace(/"/g, '""'),
      p.details.replace(/"/g, '""'),
      p.theme.replace(/"/g, '""'),
      p.category,
      p.status || (p.archived ? "Archived" : "Live"),
      p.bgType,
      p.bgValue.replace(/"/g, '""'),
      p.accentColor,
      p.textColor,
      p.fontTitle,
      p.fontSubtitle,
      (p.badge || "").replace(/"/g, '""'),
      p.align,
      p.geometricElement || "none"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `atelier_custom_posters_collection_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(`Custom poster specifications (${filteredPosters.length} rows) exported successfully.`, "success");
    logAction("EXPORT_POSTERS_CSV", `Exported ${filteredPosters.length} custom poster specifications to CSV`);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setBrandName('');
    setTitle('');
    setSubtitle('');
    setDetails('');
    setTheme('Obsidian Gold');
    setBgType('image');
    setBgValue('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80');
    setAccentColor('#d4af37');
    setTextColor('#ffffff');
    setFontTitle('Space Grotesk');
    setFontSubtitle('JetBrains Mono');
    setBadge('');
    setAlign('center');
    setGeometricElement('circle');
    setCategory('minimalist');
    setKeywordsString('Minimalist, Premium, Geometry, Modern');
    setStatus('Live');
    setExpiryDate('');
    setDateCreated('');
    setIsPreviewActive(false);
    localStorage.removeItem('atelier-crm-modal-draft');
  };

  // Recharts Mock Analytics Data Calculation based on database
  const activeCount = posters.filter(p => !p.archived).length;
  const archivedCount = posters.filter(p => p.archived).length;
  const totalCustomUploaded = posters.filter(p => p.id.startsWith('custom-')).length;

  const weeklySubmissionData = [
    { name: 'Week 21', Count: 3 + Math.min(2, totalCustomUploaded) },
    { name: 'Week 22', Count: 4 },
    { name: 'Week 23', Count: 5 + Math.floor(totalCustomUploaded * 0.4) },
    { name: 'Week 24', Count: activeCount }
  ];

  const engagementMetricsData = posters.slice(0, 5).map((item, index) => ({
    name: item.title.slice(0, 10) + '...',
    Views: 240 + (index * 75) + (item.bgType === 'image' ? 120 : 40),
    Shares: 22 + (index * 9) + (item.badge ? 30 : 0),
    Previews: 112 + (index * 42)
  }));

  const categoryDistributionData = [
    { name: 'Minimalist', value: posters.filter(p => p.category === 'minimalist').length },
    { name: 'Fashion', value: posters.filter(p => p.category === 'fashion').length },
    { name: 'Cyber Fitness', value: posters.filter(p => p.category === 'fitness').length },
    { name: 'Offers/Retail', value: posters.filter(p => p.category === 'offers').length }
  ].filter(d => d.value > 0);

  // Filtered Poster list based on criteria (combining title, ID, category and status)
  const filteredPosters = posters.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
                          p.title.toLowerCase().includes(term) ||
                          p.id.toLowerCase().includes(term) ||
                          p.category.toLowerCase().includes(term) ||
                          p.subtitle.toLowerCase().includes(term) ||
                          p.theme.toLowerCase().includes(term);
    
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    
    const itemStatus = p.status || (p.archived ? 'Archived' : 'Live');
    const matchesStatus = statusFilter === 'all' || itemStatus === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0c] border-t border-zinc-900/60 py-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8 text-left select-none">
      
      {/* ── Premium CRM Header ── */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-zinc-950 p-8 shadow-2xl">
        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-amber-500/4 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] text-black bg-gradient-to-r from-amber-400 to-yellow-300 px-3 py-1 rounded-full font-extrabold shadow-md shadow-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                SYSTEM ROOT ACTIVE
              </span>
              <span className="font-mono text-[9px] text-zinc-400 bg-zinc-900/70 border border-zinc-700/60 px-2.5 py-1 rounded-full">
                {auth.currentUser?.email || 'puspharaj.m2003@gmail.com'}
              </span>
              <span className="font-mono text-[9px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                DB Connected
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-none mb-2">
              Mudalvar <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent italic font-light">Control Suite</span>
            </h2>
            <p className="text-zinc-500 text-sm max-w-xl leading-relaxed">
              Real-time Neon DB sync · Audit logs · Analytics · Poster specification management
            </p>
          </div>

          {/* Right actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            {/* Deploy button */}
            <button
              onClick={() => { handleResetForm(); setIsModalOpen(true); }}
              className="inline-flex items-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Deploy New Poster</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Sync button */}
              <button
                onClick={async () => {
                  setIsSyncing(true);
                  try {
                    await new Promise(resolve => setTimeout(resolve, 800));
                    const r = await fetch('/api/db/custom-posters');
                    const t = await r.text();
                    let res: any = {};
                    try { res = t ? JSON.parse(t) : {}; } catch (e) {}
                    const count = res.data?.length || 0;
                    triggerToast(`Sync Complete: ${count} blueprints verified.`, "success");
                    await logAction("MANUAL_SYNC", `Verified ${count} poster records from Neon`);
                  } catch (e: any) {
                    triggerToast(`Sync failure: ${e.message}`, 'alert');
                  } finally {
                    setIsSyncing(false);
                  }
                }}
                className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-700/60 text-zinc-400 hover:text-white hover:border-zinc-600 transition cursor-pointer relative group"
                title="Force sync with Neon DB"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
              </button>

              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                  className={`p-3 rounded-xl bg-zinc-900/80 border transition cursor-pointer relative ${
                    posters.filter(p => p.status === 'Pending Approval').length > 0 ? 'border-amber-500/40' : 'border-zinc-700/60 hover:border-zinc-600'
                  }`}
                  title="Notifications"
                >
                  <Bell className={`w-4 h-4 ${posters.filter(p => p.status === 'Pending Approval').length > 0 ? 'text-amber-400 animate-bounce' : 'text-zinc-400 hover:text-white'}`} />
                  {posters.filter(p => p.status === 'Pending Approval').length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[7px] font-extrabold text-white">
                      {posters.filter(p => p.status === 'Pending Approval').length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotificationCenter && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowNotificationCenter(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl p-4 z-40 space-y-4 font-mono text-[9.5px] backdrop-blur-md"
                      >
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                          <span className="font-extrabold text-zinc-200 uppercase tracking-wider text-[10px]">Notification Centre</span>
                          <span className="text-[7.5px] text-zinc-500 uppercase">Live</span>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[7.5px] text-zinc-500 uppercase font-extrabold block">Awaiting Approval ({posters.filter(p => p.status === 'Pending Approval').length})</span>
                          {posters.filter(p => p.status === 'Pending Approval').length === 0 ? (
                            <p className="text-zinc-600 italic py-1">No items pending.</p>
                          ) : (
                            <div className="max-h-28 overflow-y-auto space-y-1">
                              {posters.filter(p => p.status === 'Pending Approval').map(item => (
                                <div key={item.id} className="bg-zinc-900/60 p-1.5 border border-zinc-800 rounded-lg flex items-center justify-between gap-2">
                                  <span className="text-zinc-300 font-bold truncate max-w-[150px]">{item.title}</span>
                                  <button
                                    type="button"
                                    onClick={async () => { await handleQuickStatusToggle(item.id, 'Live'); setShowNotificationCenter(false); }}
                                    className="text-[7.5px] hover:bg-amber-500 hover:text-black shrink-0 border border-amber-500/30 text-amber-400 bg-amber-950/25 px-1.5 py-0.5 rounded font-extrabold uppercase leading-none transition"
                                  >
                                    Approve
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="border-t border-zinc-800 pt-2 flex justify-between">
                          <button type="button" onClick={() => { setStatusFilter('Pending Approval'); setActiveTab('inventory'); setShowNotificationCenter(false); }} className="text-amber-400 hover:text-amber-300 font-extrabold text-[8px] uppercase tracking-wider transition">View all →</button>
                          <button type="button" onClick={() => { setActiveTab('logs'); setShowNotificationCenter(false); }} className="text-zinc-500 hover:text-zinc-400 text-[8px] uppercase transition">Audit logs</button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="relative flex flex-wrap items-center gap-1 mt-8 pt-6 border-t border-zinc-800/60">
          {[
            { key: 'analytics', icon: BarChart3, label: 'Analytics' },
            { key: 'inventory', icon: Database, label: `Inventory (${posters.length})` },
            { key: 'logs', icon: History, label: `Audit (${auditLogs.length})` },
            { key: 'client-hub', icon: LayoutGrid, label: 'Client Hub' },
            ...(isSuperAdmin ? [{ key: 'admin', icon: ShieldCheck, label: 'Super-Admin' }] : []),
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-[10px] uppercase font-bold transition-all cursor-pointer ${
                activeTab === key
                  ? key === 'admin'
                    ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                    : key === 'client-hub'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-zinc-700/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Finder */}
      <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-2.5">
          <CalendarRange className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-zinc-300 block uppercase tracking-wider text-[10px]">Temporal Rangefinder</span>
            <span className="text-[8.5px] text-zinc-600">Filter CSV exports by timestamp bounds.</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800 px-3 py-1.5 rounded-xl">
            <span className="text-[8.5px] text-zinc-500 uppercase">Start</span>
            <input type="date" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} className="bg-transparent border-none text-[10px] text-zinc-300 outline-none w-28 focus:text-white" />
          </div>
          <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800 px-3 py-1.5 rounded-xl">
            <span className="text-[8.5px] text-zinc-500 uppercase">End</span>
            <input type="date" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} className="bg-transparent border-none text-[10px] text-zinc-300 outline-none w-28 focus:text-white" />
          </div>
          {(exportStartDate || exportEndDate) && (
            <button onClick={() => { setExportStartDate(''); setExportEndDate(''); }} className="px-2.5 py-1.5 rounded-lg border border-red-900/40 text-red-500 hover:text-white transition text-[9px] uppercase font-bold cursor-pointer">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ────────────────────────────────── TAB 1: HQ ANALYTICS ────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="animate-fade-in space-y-8">
          {/* Bento Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-zinc-800/60 p-5 rounded-2xl flex flex-col justify-between hover:border-amber-500/30 transition-all group shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block mb-3 group-hover:text-zinc-400">Active Specs</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-mono text-white font-bold">{activeCount}</span>
                <span className="text-[10px] text-emerald-400 font-bold">live</span>
              </div>
              <div className="text-[8.5px] font-mono text-zinc-600 mt-4 border-t border-zinc-800/60 pt-2 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" /> Currently live in grid
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-zinc-800/60 p-5 rounded-2xl flex flex-col justify-between hover:border-amber-500/30 transition-all group shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block mb-3 group-hover:text-zinc-400">Archived Specs</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-mono text-zinc-400 font-bold">{archivedCount}</span>
                <span className="text-[10px] text-zinc-500">blueprints</span>
              </div>
              <div className="text-[8.5px] font-mono text-zinc-600 mt-4 border-t border-zinc-800/60 pt-2 flex items-center gap-1">
                <Archive className="w-3 h-3 text-amber-500" /> Preserved but hidden
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-zinc-800/60 p-5 rounded-2xl flex flex-col justify-between hover:border-amber-500/30 transition-all group shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/8 rounded-full blur-2xl pointer-events-none" />
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block mb-3 group-hover:text-zinc-400">Admin Uploads</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-mono text-amber-400 font-bold">{totalCustomUploaded}</span>
                <span className="text-[10px] text-zinc-500">entries</span>
              </div>
              <div className="text-[8.5px] font-mono text-zinc-600 mt-4 border-t border-zinc-800/60 pt-2 flex items-center gap-1">
                <Database className="w-3 h-3 text-amber-400" /> Synced to cloud
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-zinc-800/60 p-5 rounded-2xl flex flex-col justify-between hover:border-amber-500/30 transition-all group shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block mb-3 group-hover:text-zinc-400">Mock Scans</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-mono text-white font-bold">1,842</span>
                <span className="text-[10px] text-emerald-400 font-bold">+18% wk</span>
              </div>
              <div className="text-[8.5px] font-mono text-zinc-600 mt-4 border-t border-zinc-800/60 pt-2 flex items-center gap-1">
                <Eye className="w-3 h-3 text-emerald-500" /> Dynamic customer scans
              </div>
            </div>
          </div>

          {/* Visualization Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart 1: Submission Activity (8 Columns) */}
            <div className="lg:col-span-8 bg-zinc-905 border border-zinc-900 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <span className="font-mono text-xs text-gold-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Weekly Spec Submission Trend
                </span>
                <span className="font-mono text-[9px] text-zinc-500">Live DB Track</span>
              </div>
              
              <div ref={lineChartRef} className="h-64 w-full">
                {lineChartSize.width > 0 && lineChartSize.height > 0 && (
                  <LineChart width={lineChartSize.width} height={lineChartSize.height} data={weeklySubmissionData} margin={{ top: 10, right: 15, left: -25, bottom: 5 }}>
                    <CartesianGrid stroke="#18181b" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#52525b" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                    <YAxis stroke="#52525b" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                      labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', fontSize: '10px', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#d4af37', fontSize: '10px', fontFamily: 'sans-serif' }}
                    />
                    <Line type="monotone" dataKey="Count" stroke="#d4af37" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ fill: '#d4af37' }} />
                  </LineChart>
                )}
              </div>
            </div>

            {/* Chart 2: Category distribution (4 Columns) */}
            <div className="lg:col-span-4 bg-zinc-905 border border-zinc-900 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="border-b border-zinc-900 pb-3">
                <span className="font-mono text-xs text-gold-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Category Density
                </span>
              </div>

              <div ref={pieChartRef} className="h-44 w-full relative flex items-center justify-center">
                {pieChartSize.width > 0 && pieChartSize.height > 0 && (
                  <PieChart width={pieChartSize.width} height={pieChartSize.height}>
                    <Pie
                      data={categoryDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryDistributionData.map((entry, index) => {
                        const COLORS = ['#d4af37', '#e2e8f0', '#52525b', '#f59e0b'];
                        return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '10px' }}
                    />
                  </PieChart>
                )}
                
                {/* Center count marker */}
                <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-mono font-bold text-white leading-none">{posters.length}</span>
                  <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-500">Totals</span>
                </div>
              </div>

              {/* Legend checklist */}
              <div className="space-y-1.5 font-mono text-[9px] border-t border-zinc-900 pt-3">
                {categoryDistributionData.map((item, idx) => {
                  const COLORS = ['#d4af37', '#e2e8f0', '#52525b', '#f59e0b'];
                  return (
                    <div key={item.name} className="flex justify-between items-center text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-bold text-zinc-300">{item.value} layouts</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 3: Simulated Engagement parameters */}
            <div className="lg:col-span-12 bg-zinc-905 border border-zinc-900 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <span className="font-mono text-xs text-gold-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> High-Traffic Spec Engagements (Top 5 Blueprints)
                </span>
                <span className="font-mono text-[8.5px] text-zinc-550 lowercase italic">Calculated live via user event loops</span>
              </div>

              <div ref={barChartRef} className="h-64 w-full">
                {barChartSize.width > 0 && barChartSize.height > 0 && (
                  <BarChart width={barChartSize.width} height={barChartSize.height} data={engagementMetricsData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid stroke="#18181b" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#52525b" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                    <YAxis stroke="#52525b" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
                      labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', fontSize: '10px', fontFamily: 'monospace' }}
                      itemStyle={{ fontSize: '10px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 9, fontFamily: 'monospace' }} />
                    <Bar dataKey="Views" fill="#52525b" />
                    <Bar dataKey="Previews" fill="#d4af37" />
                    <Bar dataKey="Shares" fill="#e2e8f0" />
                  </BarChart>
                )}
              </div>
            </div>

          </div>

          {/* Third Row: Auto-Expiry Task Scheduler & Recent Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            
            {/* Auto-Expiry Task Scheduler Grid Card (7 columns) */}
            <div className="lg:col-span-7 bg-zinc-905 border border-zinc-900 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <span className="font-mono text-xs text-gold-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                  <CalendarRange className="w-3.5 h-3.5 text-gold-500" /> Auto-Expiry Task Scheduler
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const expired = posters.filter(p => p.expiryDate && p.expiryDate <= todayStr && p.status !== 'Archived');
                    if (expired.length === 0) {
                      triggerToast("No pending/expired posters found matching current date criteria.", "info");
                      return;
                    }
                    
                    let count = 0;
                    for (const p of expired) {
                      try {
                        await fetch('/api/db/custom-posters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...p, status: 'Archived', archived: true }) });
                        await logAction("AUTOMATED_EXPIRATION", `Triggered automated midnight expiration archival for: "${p.title}"`);
                        count++;
                      } catch (e) {
                        console.error(e);
                      }
                    }
                    triggerToast(`Successfully archived ${count} expired poster elements.`, "success");
                  }}
                  className="bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg text-[9px] font-mono uppercase tracking-wider flex items-center gap-1 transition select-none cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 text-gold-400" /> Force Midnight Scan
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-[10px]">
                  <thead>
                    <tr className="border-b border-zinc-900/60 text-zinc-550 uppercase">
                      <th className="py-2.5 font-bold">Poster Details</th>
                      <th className="py-2.5 font-bold">Current Status</th>
                      <th className="py-2.5 font-bold">Auto-Expiration Date</th>
                      <th className="py-2.5 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/20">
                    {posters.filter(p => !p.id.startsWith('preset-')).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-zinc-650 italic">No custom posters configured to schedule tasks.</td>
                      </tr>
                    ) : (
                      posters.filter(p => !p.id.startsWith('preset-')).map(p => {
                        return (
                          <tr key={p.id} className="hover:bg-zinc-900/10">
                            <td className="py-2.5 font-sans">
                              <span className="font-extrabold text-white block leading-tight">{p.title}</span>
                              <span className="font-mono text-[8.5px] text-zinc-500 uppercase">{p.category} | {p.id}</span>
                            </td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold ${
                                p.status === 'Live' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/70' :
                                p.status === 'Archived' ? 'bg-zinc-900/70 text-zinc-500 border border-zinc-800' :
                                'bg-amber-950/40 text-amber-400 border border-amber-900/60'
                              }`}>
                                {p.status || (p.archived ? 'Archived' : 'Live')}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <input 
                                type="date"
                                value={p.expiryDate || ''}
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  try {
                                    await fetch('/api/db/custom-posters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...p, expiryDate: newDate }) });
                                    await logAction("SCHEDULE_EXPIRATION_SET", `Assigned automatic expiration epoch trigger on "${p.title}" to ${newDate || 'None'}`);
                                    triggerToast(`Expiration date for "${p.title}" registered as ${newDate || 'Deactivated'}.`, "success");
                                  } catch (err) {
                                    triggerToast("Failed to set scheduling task date criteria", "alert");
                                  }
                                }}
                                className="bg-zinc-950 border border-zinc-850 hover:border-zinc-750 text-zinc-300 font-mono text-[9px] rounded px-2 py-1 outline-none focus:border-gold-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 text-center">
                              {p.expiryDate ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await fetch('/api/db/custom-posters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...p, expiryDate: '' }) });
                                      await logAction("SCHEDULE_EXPIRATION_CLEAR", `Cancelled scheduling task auto-expiration parameters on "${p.title}"`);
                                      triggerToast("Automatic archival schedule disabled.", "info");
                                    } catch (err) {
                                      triggerToast("Failed to clear schedule parameters", "alert");
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-300 transition uppercase font-bold text-[8.5px] cursor-pointer"
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <span className="text-zinc-650 block text-[8.5px] italic">Not scheduled</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity Feed Card (5 columns) */}
            <div className="lg:col-span-5 bg-zinc-905 border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
                  <span className="font-mono text-xs text-gold-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-gold-500" /> Recent Activity Feed
                  </span>
                  <span className="font-mono text-[7px] text-zinc-650 uppercase">DB Operations Logs</span>
                </div>

                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {auditLogs
                      .filter(l => 
                        l.action.includes('POSTER') || 
                        l.action.includes('EXPIRATION') || 
                        l.action.includes('STATUS') || 
                        l.action.includes('ADAPTATION') ||
                        l.action.includes('THEME')
                      )
                      .slice(0, 5)
                      .map((log) => {
                        const isCreate = log.action.includes('CREATE');
                        const isDelete = log.action.includes('DELETE');
                        const isExpiry = log.action.includes('EXPIRATION');
                        return (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.25 }}
                            className="bg-zinc-950/75 border border-zinc-900 p-3 rounded-xl flex items-start gap-2.5 font-mono text-[10px]"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                              isCreate ? 'bg-emerald-500 animate-pulse' :
                              isDelete ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                              isExpiry ? 'bg-amber-500 animate-bounce' :
                              'bg-indigo-400'
                            }`} />
                            <div className="space-y-1 w-full text-left">
                              <div className="flex justify-between items-start">
                                <span className="font-extrabold text-zinc-300 text-[9px] uppercase tracking-wide">{log.action}</span>
                                <span className="text-[7.5px] text-zinc-650 font-bold">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                              </div>
                              <p className="text-zinc-400 text-[9.5px] font-sans leading-tight">{log.details}</p>
                              <span className="text-[7.5px] text-zinc-650 uppercase font-semibold flex items-center gap-0.5 pt-0.5">
                                <ShieldCheck className="w-2.5 h-2.5 text-zinc-600 block" /> By {(log.adminEmail || '').split('@')[0]}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                  </AnimatePresence>
                </div>
              </div>

              <div className="border-t border-zinc-900/60 pt-3 mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('logs')}
                  className="w-full text-center hover:text-white transition font-mono uppercase text-[9px] tracking-widest block text-zinc-500 font-extrabold cursor-pointer"
                >
                  View Chronological Audit Trail &rarr;
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────── TAB 2: SECURE TABLE INVENTORY ────────────────────────────────── */}
      {activeTab === 'inventory' && (
        <div className="animate-fade-in space-y-6">
          
          {/* Action Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900/60 to-zinc-900/30 backdrop-blur-sm p-4 rounded-2xl border border-zinc-800/60 shadow-lg">
            {/* Left: search and filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search by title, ID, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-zinc-950/80 border border-zinc-700/60 rounded-xl pl-9 pr-4 py-2.5 text-[11px] text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:shadow-[0_0_0_2px_rgba(245,158,11,0.1)] transition w-56 font-mono"
                />
              </div>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-zinc-950/80 border border-zinc-700/60 rounded-xl px-3 py-2.5 text-[11px] text-zinc-300 focus:outline-none focus:border-amber-500/50 transition font-mono cursor-pointer">
                <option value="all">All Sectors</option>
                <option value="minimalist">Minimalist Luxury</option>
                <option value="fitness">Cyber Fitness</option>
                <option value="fashion">Fashion Editorial</option>
                <option value="offers">Retail & Offers</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-zinc-950/80 border border-zinc-700/60 rounded-xl px-3 py-2.5 text-[11px] text-zinc-300 focus:outline-none focus:border-amber-500/50 transition font-mono cursor-pointer">
                <option value="all">All Statuses</option>
                <option value="Live">Live</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Archived">Archived</option>
              </select>
              <span className="text-[10px] font-mono text-zinc-500 pl-1 shrink-0">
                <strong className="text-zinc-200 font-bold">{filteredPosters.length}</strong> / {posters.length} specs
              </span>
              {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
                <button onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setStatusFilter('all'); }} className="font-mono text-[10px] text-zinc-500 hover:text-white uppercase shrink-0 px-2 py-1.5 rounded-lg hover:bg-zinc-800/60 transition flex items-center gap-1 cursor-pointer">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Right: actions */}
            <div className="flex items-center flex-wrap gap-2 font-mono text-[10px]">
              <button onClick={exportPostersCSV} className="py-2.5 px-3 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-700/60 text-zinc-300 font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-95 hover:border-zinc-600" title="Export CSV">
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => setShowBulkControls(!showBulkControls)}
                className={`py-2.5 px-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border ${
                  showBulkControls ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-zinc-950/80 hover:bg-zinc-900 text-zinc-500 hover:text-white border-zinc-700/60'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Bulk {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
              </button>
              {posters.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="py-2.5 px-3 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 text-red-400 hover:text-red-300 font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                  title="Permanently delete all posters"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge All ({posters.length})</span>
                </button>
              )}
              <button
                onClick={() => { handleResetForm(); setIsModalOpen(true); }}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98] shadow-md shadow-amber-500/15"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Deploy New Spec</span>
              </button>
            </div>
          </div>

          {/* Bulk Controls Pane */}
          <AnimatePresence>
            {(showBulkControls || selectedIds.length > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gold-950/20 border border-gold-500/15 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-[10px] overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse shrink-0" />
                  <span className="text-zinc-300 font-bold">
                    Bulk Editing Operations: <span className="text-gold-400">{selectedIds.length} Selected Blueprints</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  
                  {/* Select parameters to update */}
                  <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-900 flex-1 sm:flex-initial">
                    <span className="text-zinc-600 text-[8.5px] uppercase pl-1 shrink-0">Sect:</span>
                    <select
                      value={bulkCategory}
                      onChange={(e) => setBulkCategory(e.target.value)}
                      className="bg-transparent text-[9.5px] text-zinc-300 focus:outline-none pr-1.5 cursor-pointer"
                    >
                      <option value="">No change</option>
                      <option value="minimalist">Minimalist</option>
                      <option value="fitness">Fitness</option>
                      <option value="fashion">Fashion</option>
                      <option value="offers">Offers</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-900 flex-1 sm:flex-initial">
                    <span className="text-zinc-600 text-[8.5px] uppercase pl-1 shrink-0">Badge:</span>
                    <select
                      value={bulkBadge}
                      onChange={(e) => setBulkBadge(e.target.value)}
                      className="bg-transparent text-[9.5px] text-zinc-300 focus:outline-none pr-1.5 cursor-pointer"
                    >
                      <option value="">No change</option>
                      <option value="NEW RELEASE">NEW RELEASE</option>
                      <option value="LIMITED SPEC">LIMITED SPEC</option>
                      <option value="EXCLUSIVE">EXCLUSIVE MUDALVAR</option>
                      <option value="CLEAR_BADGE">Clear badge</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-900 flex-1 sm:flex-initial">
                    <span className="text-zinc-600 text-[8.5px] uppercase pl-1 shrink-0">Status:</span>
                    <select
                      value={bulkStatus}
                      onChange={(e) => setBulkStatus(e.target.value)}
                      className="bg-transparent text-[9.5px] text-zinc-300 focus:outline-none pr-1.5 cursor-pointer"
                    >
                      <option value="">No change</option>
                      <option value="Live">Live</option>
                      <option value="Pending Approval">Pending</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  {selectedIds.length === 0 ? (
                    <span className="text-zinc-600 text-[9px] italic block py-2 px-1">Check rows below to trigger</span>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      
                      <button
                        onClick={handleBulkMetadataUpdate}
                        disabled={!bulkCategory && !bulkBadge && !bulkStatus}
                        className={`px-3 py-2 rounded-lg font-bold border transition ${
                          bulkCategory || bulkBadge || bulkStatus
                            ? 'bg-gold-500 hover:bg-gold-400 text-black border-gold-600 cursor-pointer'
                            : 'bg-zinc-900 text-zinc-650 border-zinc-850 cursor-not-allowed'
                        }`}
                      >
                        Apply Updates
                      </button>

                      <button
                        onClick={handleBulkArchiveToggle}
                        className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer transition flex items-center gap-1.5"
                      >
                        <Archive className="w-3.5 h-3.5" /> Toggle Archive
                      </button>

                      <button
                        onClick={handleBulkDelete}
                        className="px-3 py-2 rounded-lg bg-red-950/45 hover:bg-red-950/80 border border-red-900/40 text-red-400 hover:text-red-300 cursor-pointer transition flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Purge Selection
                      </button>

                    </div>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Premium Table View */}
          <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left font-mono text-[11px] divide-y divide-zinc-800/50 select-none">
                
                {/* Table Header */}
                <thead className="bg-zinc-900/60 text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                  <tr>
                    <th className="py-4 px-5 text-center w-12">
                      <button type="button" onClick={() => toggleSelectAll(filteredPosters)} className="p-1 text-zinc-600 hover:text-white transition cursor-pointer" title="Select all">
                        {selectedIds.length === filteredPosters.length && filteredPosters.length > 0 ? <MinusSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4" />}
                      </button>
                    </th>
                    <th className="py-4 px-3 w-44">Artwork</th>
                    <th className="py-4 px-3 w-64">Design Specs</th>
                    <th className="py-4 px-3 w-44">Brand Theme</th>
                    <th className="py-4 px-3">Tags</th>
                    <th className="py-4 px-3 w-36">Status</th>
                    <th className="py-4 px-5 text-right w-48">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-zinc-800/30 bg-zinc-950/20">
                  {filteredPosters.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          {posters.length === 0 ? (
                            /* Truly empty — no posters in DB */
                            <>
                              <div className="relative">
                                <div className="w-20 h-20 rounded-3xl bg-zinc-900/80 border border-zinc-800/60 flex items-center justify-center shadow-xl">
                                  <PlusCircle className="w-9 h-9 text-zinc-700" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                                  <span className="text-amber-400 text-[8px] font-bold">0</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-zinc-300 font-bold text-base mb-1">Canvas is empty</p>
                                <p className="text-zinc-600 text-[11px] font-mono max-w-xs mx-auto leading-relaxed">
                                  No poster specifications have been deployed yet. Create your first one to get started.
                                </p>
                              </div>
                              <button
                                onClick={() => { handleResetForm(); setIsModalOpen(true); }}
                                className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] cursor-pointer"
                              >
                                <PlusCircle className="w-4 h-4" />
                                <span>Deploy First Poster</span>
                              </button>
                            </>
                          ) : (
                            /* Has posters but filters hide them */
                            <>
                              <Database className="w-10 h-10 text-zinc-800" />
                              <div>
                                <p className="text-zinc-400 font-bold text-[13px] mb-1">No results match your filters</p>
                                <p className="text-zinc-600 text-[11px] font-mono">{posters.length} poster(s) exist in the database.</p>
                              </div>
                              <button onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setStatusFilter('all'); }} className="text-amber-400 text-[10px] font-mono uppercase hover:text-amber-300 transition cursor-pointer border border-amber-500/20 px-3 py-1.5 rounded-lg hover:bg-amber-500/5">
                                Clear all filters
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPosters.map((item, index) => {
                      const isSelected = selectedIds.includes(item.id);
                      return (
                        <tr 
                          key={item.id}
                          draggable
                          onDragStart={() => setDraggedIndex(index)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleRowDrop(index)}
                          onDragEnd={() => setDraggedIndex(null)}
                          onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, poster: item }); }}
                          className={`group hover:bg-zinc-800/20 transition-all cursor-grab active:cursor-grabbing select-none ${
                            isSelected ? 'bg-amber-500/5 border-l-2 border-l-amber-500/40' : ''
                          } ${draggedIndex === index ? 'opacity-35 bg-amber-950/30 border-2 border-dashed border-amber-500/40' : ''}`}
                          title="Right-click for quick actions"
                        >
                          {/* Selector */}
                          <td className="py-3.5 px-5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-zinc-700 cursor-grab font-bold select-none pr-1 group-hover:text-zinc-500">⠿</span>
                              <button type="button" onClick={() => toggleSelectRow(item.id)} className="p-1 transition text-zinc-600 hover:text-amber-400 cursor-pointer">
                                {isSelected ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>

                          {/* Thumbnail / ID */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-14 bg-zinc-950 rounded-lg border border-zinc-800/60 overflow-hidden relative shrink-0 flex items-center justify-center text-zinc-800 shadow-md">
                                {item.bgType === 'image' ? (
                                  <img src={item.bgValue} loading="lazy" alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition" />
                                ) : (
                                  <div className="w-full h-full opacity-70" style={{ background: item.bgValue }} />
                                )}
                                <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[6px] text-center uppercase text-zinc-500 font-bold p-0.5 truncate">
                                  {item.bgType}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <span className="text-[8px] text-zinc-600 block leading-tight">#{index + 1}</span>
                                <span className="text-zinc-400 font-bold block truncate max-w-[80px] text-[10px]" title={item.id}>
                                  {item.id.replace('custom-project-', 'cust_')}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Artwork Specs */}
                          <td className="py-3.5 px-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                <span className="text-white font-bold font-sans text-[12px] truncate max-w-[160px]">{item.title}</span>
                                {item.badge && (
                                  <span className="text-[7px] border border-amber-500/30 text-amber-400 bg-amber-950/20 px-1 py-0.5 rounded font-mono font-bold leading-none shrink-0 uppercase">
                                    {item.badge}
                                  </span>
                                )}
                                {item.archived && (
                                  <span className="text-[7px] border border-amber-500/40 text-amber-500 bg-amber-950/25 px-1 py-0.5 rounded font-mono font-bold leading-none shrink-0 uppercase">ARCHIVED</span>
                                )}
                              </div>
                              <span className="text-zinc-500 block truncate text-[10px] uppercase mt-0.5">{item.subtitle}</span>
                              <span className="text-zinc-600 block line-clamp-1 font-sans text-[10px] mt-0.5 pr-1">{item.details}</span>
                            </div>
                          </td>

                          {/* Brand theme */}
                          <td className="py-3.5 px-3 text-zinc-400">
                            <span className="font-bold text-zinc-200 block text-[11px]">{item.theme}</span>
                            <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px]">
                              <span className="w-3 h-3 rounded-sm border border-zinc-700 shrink-0 shadow-sm" style={{ backgroundColor: item.accentColor }} />
                              <span className="text-zinc-500 shrink-0">{item.accentColor}</span>
                              <span className="text-zinc-700">|</span>
                              <span className="text-zinc-500 shrink-0">{(item.fontTitle || '').split(' ').slice(0,1)}</span>
                            </div>
                          </td>

                          {/* Tags */}
                          <td className="py-3.5 px-3 text-zinc-500">
                            <span className="inline-block px-2 py-0.5 rounded-lg border border-zinc-800/60 bg-zinc-900/60 text-[9px] text-zinc-400 font-bold uppercase leading-none mb-1.5">
                              {item.category === 'fitness' ? 'cyber fitness' : item.category === 'all' ? 'generic' : item.category}
                            </span>
                            <p className="text-[9px] text-zinc-600 line-clamp-1 pr-1">
                              {(item.keywords || []).slice(0, 3).join(', ').toLowerCase()}
                            </p>
                          </td>

                          {/* Workflow Status */}
                          <td className="py-3.5 px-3">
                            {(() => {
                              const itemStatus = item.status || (item.archived ? 'Archived' : 'Live');
                              if (itemStatus === 'Live') {
                                return (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/25 bg-emerald-950/30 text-[9px] text-emerald-400 font-extrabold uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Live</span>
                                  </span>
                                );
                              } else if (itemStatus === 'Pending Approval') {
                                return (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-500/25 bg-amber-950/30 text-[9px] text-amber-400 font-extrabold uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    <span>Pending</span>
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-700/40 bg-zinc-900/60 text-[9px] text-zinc-500 font-extrabold uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                                    <span>Archived</span>
                                  </span>
                                );
                              }
                            })()}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button onClick={() => setQuickPreviewPoster(item)} className="p-2 rounded-lg hover:bg-zinc-800/60 hover:text-emerald-400 text-zinc-500 transition flex items-center gap-1 cursor-pointer text-[9px] font-bold uppercase" title="Preview">
                                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                              </button>
                              <button onClick={() => { setDrawerPoster(item); const matchedThemeKey = Object.keys(THEME_STYLES).find(k => THEME_STYLES[k].name.toLowerCase() === (item.theme || '').toLowerCase()) || 'obsidian-gold'; setDrawerTheme(matchedThemeKey); }} className="p-2 rounded-lg hover:bg-zinc-800/60 hover:text-amber-400 text-zinc-500 transition flex items-center gap-1 cursor-pointer" title="Sandbox">
                                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                              </button>
                              <button onClick={() => handleEditClick(item)} className="p-2 rounded-lg hover:bg-amber-500/10 hover:text-amber-400 text-zinc-500 border border-transparent hover:border-amber-500/20 transition flex items-center gap-1.5 cursor-pointer font-bold uppercase text-[9px]" title="Edit">
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button onClick={() => handleDuplicateClick(item)} className="p-2 rounded-lg hover:bg-zinc-800/60 hover:text-blue-400 text-zinc-500 transition cursor-pointer" title="Duplicate">
                                <Copy className="w-3.5 h-3.5 text-blue-500" />
                              </button>
                              <button onClick={() => handleDeleteClick(item)} className="p-2 rounded-lg hover:bg-red-950/30 hover:text-red-400 text-zinc-600 transition cursor-pointer" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>

              </table>
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 3: AUDIT LOGS ── */}
      {activeTab === 'logs' && (
        <div className="animate-fade-in space-y-5">
          <div className="p-5 bg-gradient-to-r from-zinc-900/60 to-zinc-900/30 border border-zinc-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs backdrop-blur-sm">
            <div>
              <span className="text-zinc-200 font-bold block uppercase tracking-wider text-[11px]">Chronological Audit Trail</span>
              <span className="text-zinc-600 text-[10px]">Secured event history — Mudalvar Admin context</span>
            </div>
            <button onClick={exportAuditLogsCSV} className="py-2.5 px-4 rounded-xl bg-zinc-950/80 border border-zinc-700/60 hover:bg-zinc-900 text-zinc-300 font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer uppercase text-[10px] hover:border-zinc-600">
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-2xl overflow-hidden max-h-[600px] overflow-y-auto backdrop-blur-sm">
            <div className="divide-y divide-zinc-800/40 font-mono text-[10px]">
              {auditLogs.length === 0 ? (
                <div className="p-16 text-center flex flex-col items-center gap-3">
                  <History className="w-10 h-10 text-zinc-800" />
                  <span className="text-zinc-600 italic text-[11px]">No events logged yet.</span>
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-zinc-900/20 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3 group">
                    <div className="flex gap-3 min-w-0">
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center shrink-0 pt-1">
                        <div className={`w-2 h-2 rounded-full mt-0.5 ${
                          log.action.includes('DELETE') ? 'bg-red-500' :
                          log.action.includes('CREATE') ? 'bg-amber-400' :
                          log.action.includes('UPDATE') ? 'bg-blue-400' :
                          'bg-zinc-600'
                        }`} />
                        <div className="w-px flex-1 bg-zinc-800/60 mt-1 min-h-[16px]" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase shrink-0 border ${
                            log.action.includes('DELETE') 
                              ? 'border-red-900/40 text-red-400 bg-red-950/20' 
                              : log.action.includes('CREATE') 
                              ? 'border-amber-500/30 text-amber-400 bg-amber-950/20' 
                              : log.action.includes('UPDATE')
                              ? 'border-blue-800/40 text-blue-400 bg-blue-950/20'
                              : 'border-zinc-700/40 text-zinc-400 bg-zinc-900/60'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-zinc-200 font-bold leading-snug text-[11px] truncate max-w-[400px]">{log.details}</span>
                        </div>
                        <p className="text-zinc-600 text-[9px] leading-tight">
                          <span className="text-zinc-500">{(log.adminEmail || '').split('@')[0]}</span>
                          <span className="text-zinc-700 mx-1">·</span>
                          {(log.adminEmail || '').split('@')[1]}
                        </p>
                      </div>
                    </div>
                    <div className="text-zinc-600 text-[9px] flex items-center gap-1 shrink-0 self-start sm:self-auto pl-5 sm:pl-0">
                      <Calendar className="w-3 h-3 text-zinc-700" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE / MODIFY FORM ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-45 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
            >
              
              {/* Modal header */}
              <div className="p-6 border-b border-zinc-800/60 bg-gradient-to-r from-zinc-900/80 to-zinc-950 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-amber-400 font-bold block mb-1">MUDALVAR WORKSPACE COMMAND</span>
                  <h3 className="font-bold text-xl text-white tracking-tight leading-none">
                    {editingId ? 'Modify Specification Blueprint' : 'Deploy New Poster Specification'}
                  </h3>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 px-3 border border-zinc-700/60 hover:border-zinc-600 bg-zinc-900/80 hover:text-white text-zinc-400 rounded-xl transition-all font-mono text-[9px] cursor-pointer flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5" /> Close
                </button>
              </div>

              {/* Toggle dynamic Preview header banner */}
              <div className="p-3 bg-zinc-900/45 border-b border-zinc-900 flex items-center justify-between font-mono text-[9.5px]">
                <span className="text-zinc-450 uppercase pl-3 font-bold flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-gold-400" /> 
                  Configuration Environment
                </span>
                
                <div className="flex items-center gap-2">
                  {isPreviewActive && (
                    <div className="flex items-center gap-1.5 bg-zinc-950 p-1 px-3 rounded-full border border-zinc-805 text-[8px] font-mono">
                      <span className="text-zinc-500 uppercase shrink-0">Global Theme Preview:</span>
                      <select
                        value={previewTheme}
                        onChange={(e) => setPreviewTheme(e.target.value)}
                        className="bg-transparent text-[8.5px] text-zinc-300 focus:outline-none pr-1.5 cursor-pointer font-bold uppercase tracking-wider"
                      >
                        <option value="obsidian-gold">Obsidian Gold</option>
                        <option value="swiss-brutalist">Swiss Brutalist</option>
                        <option value="nordic-frost">Nordic Slate</option>
                        <option value="crimson-luxe">Crimson Luxe</option>
                        <option value="emerald-matrix">Emerald Matrix</option>
                      </select>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (adminPreviewPoster) {
                        setAdminPreviewPoster?.(null);
                        triggerToast("Portfolio grid live simulation deactivated.", "info");
                      } else {
                        const draftPoster: PosterTemplate = {
                          id: editingId || 'temp-preview-id',
                          title: title.trim() || 'Simulated Blueprint Title',
                          subtitle: subtitle.trim() || 'Simulated Subtitle',
                          details: details.trim() || 'Simulated description details layout narrative...',
                          theme,
                          bgType,
                          bgValue: bgValue.trim(),
                          accentColor,
                          textColor,
                          fontTitle,
                          fontSubtitle,
                          align,
                          geometricElement,
                          category: category as any,
                          keywords: (keywordsString || '').split(',').map(k => k.trim()).filter(k => k.length > 0),
                          badge: badge.trim(),
                          status: 'Live', // Force Live so it bypasses approval filtering during simulation
                          archived: false
                        };
                        setAdminPreviewPoster?.(draftPoster);
                        triggerToast("Simulation Active: Switch to the Portfolio Grid tab to see this blueprint in-situ!", "success");
                      }
                    }}
                    className={`p-1 px-3.5 border rounded-full font-bold transition flex items-center gap-1.5 cursor-pointer text-[9.5px] ${
                      adminPreviewPoster ? 'bg-emerald-950 text-emerald-400 border-emerald-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {adminPreviewPoster ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                    <span>{adminPreviewPoster ? "Simulating Live in Main Grid" : "Simulate Live in Main Grid"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreviewActive(!isPreviewActive)}
                    className="p-1 px-3.5 border border-gold-500/20 bg-gold-950/20 text-gold-400 hover:text-gold-300 rounded-full font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    {isPreviewActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isPreviewActive ? 'Show Form Variables' : 'Show Grid Mockup Preview'}</span>
                  </button>
                </div>
              </div>

              {/* Form & Card Preview section container */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                
                {isPreviewActive ? (
                  /* Live Grid Mock Preview Render matching the actual portfolio card */
                  <div className={`flex flex-col items-center justify-center py-10 px-4 rounded-3xl w-full transition-all duration-300 ${
                    previewTheme === 'swiss-brutalist' 
                      ? 'bg-[#faf9f6]/95 border border-zinc-200/90 shadow' 
                      : previewTheme === 'nordic-frost' 
                      ? 'bg-[#1c2430]' 
                      : previewTheme === 'crimson-luxe' 
                      ? 'bg-[#2a040b]' 
                      : previewTheme === 'emerald-matrix' 
                      ? 'bg-zinc-950 border border-emerald-500/10' 
                      : 'bg-zinc-950 border border-zinc-900/60'
                  }`}>
                    <div className="w-72 sm:w-80 h-[480px] rounded-3xl overflow-hidden relative shadow-2xl border border-zinc-900 flex flex-col justify-between p-6 select-none"
                         style={{ 
                           background: bgType === 'image' ? `url(${bgValue}) center/cover no-repeat` : bgType === 'gradient' ? bgValue : bgValue,
                           backgroundColor: bgType === 'color' ? bgValue : 'transparent',
                           color: textColor
                         }}
                    >
                      {/* Grid overlay for Swiss precision looks if checked */}
                      {geometricElement === 'grid' && (
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                      )}

                      {/* Top Header details */}
                      <div className="flex justify-between items-start z-10">
                        <div>
                          <span className="font-mono text-[6.5px] tracking-wider block opacity-75 uppercase">specifications sheet</span>
                          <span className="font-mono text-[8px] uppercase tracking-widest font-extrabold" style={{ color: accentColor }}>
                            {theme || 'Obsidian'}
                          </span>
                        </div>
                        {badge && (
                          <span className="text-[7px] border rounded bg-black/60 px-1.5 py-0.5 uppercase tracking-wide leading-none" style={{ borderColor: accentColor, color: accentColor }}>
                            {badge}
                          </span>
                        )}
                      </div>

                      {/* Geometric Overlays */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {geometricElement === 'circle' && (
                          <div className="w-32 h-32 rounded-full border border-dashed opacity-25 animate-spin-slow" style={{ borderColor: accentColor }} />
                        )}
                        {geometricElement === 'lines' && (
                          <div className="w-full h-1/3 border-y border-dashed opacity-15" style={{ borderColor: accentColor }} />
                        )}
                        {geometricElement === 'border' && (
                          <div className="absolute inset-4 border border-zinc-500/20" />
                        )}
                      </div>

                      {/* Main Typography specifications layout */}
                      <div className={`z-10 text-${align} space-y-2`}>
                        <h4 className="font-bold tracking-tight uppercase text-lg sm:text-xl md:text-2xl" style={{ fontFamily: fontTitle }}>
                          {title || 'alpine spec'}
                        </h4>
                        <p className="font-mono text-[8.5px] py-1 tracking-wider uppercase border-t opacity-80" style={{ fontFamily: fontSubtitle, borderColor: `${accentColor}30` }}>
                          {subtitle || 'championship class layout'}
                        </p>
                        <p className="text-[8.5px] font-sans leading-relaxed opacity-70 line-clamp-4">
                          {details || 'Exquisite modern detailing describing vector coordinate alignments, packaging codes and printing specifics.'}
                        </p>
                      </div>

                      {/* Footer signatures */}
                      <div className="z-10 flex justify-between items-end border-t border-white/10 pt-2.5 font-mono text-[6px] opacity-60">
                        <span>© creativenode studio</span>
                        <span>layout spec: #{editingId ? 'edit_mode' : 'live_preview'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Input Fields Form */
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Basic details */}
                    <div className="md:col-span-7 bg-zinc-900/10 border border-zinc-900 rounded-2xl p-5 md:p-6 space-y-4">
                      
                      <div className="flex flex-col sm:flex-row gap-4 items-end bg-amber-950/10 border border-amber-500/20 p-4 rounded-xl mb-4">
                        <div className="flex-1 w-full">
                          <label className="text-[9px] font-mono text-amber-400 uppercase block mb-1 font-bold flex items-center gap-1.5"><Sparkles className="w-3 h-3"/> Brand Name (AI Assist)</label>
                          <input
                            type="text"
                            placeholder="e.g. Nike, Tesla, Creativenode..."
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            className="w-full bg-zinc-950 border border-amber-900/50 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-amber-500 transition font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleGenerateAIContent}
                          disabled={isGenerating || !brandName.trim()}
                          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs"
                        >
                          {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          {isGenerating ? "Generating..." : "Auto-Generate with AI"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Primary Artwork Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. ALPINE RACING"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-gold-500 transition font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Creative Tagline / Subtitle *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. MONACO 1993 SPECTACLE"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-gold-500 transition font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Modernist Design Concept Narrative (Details) *</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Exquisite narrative describing layout structures, mathematical principles, and target clientele grids..."
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-gold-500 transition font-sans leading-relaxed text-[11px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Layout Presentation Sector</label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as any)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-zinc-300 focus:outline-none focus:border-gold-500 transition font-mono"
                          >
                            <option value="minimalist">Minimalist Luxury</option>
                            <option value="fitness">Cyber Fitness</option>
                            <option value="fashion">Fashion Editorial</option>
                            <option value="offers">Retail & Offers</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Keywords Index (Comma-separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. Swiss, Brutalist, Elite"
                            value={keywordsString}
                            onChange={(e) => setKeywordsString(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-gold-500 transition font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Appliqué Theme Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Classic Gold"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-gold-500 transition font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Launcher Badge (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. NEW RELEASE"
                            value={badge}
                            onChange={(e) => setBadge(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-gold-500 transition font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Layout Alignment</label>
                          <select
                            value={align}
                            onChange={(e) => setAlign(e.target.value as any)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-zinc-300 focus:outline-none focus:border-gold-500 transition font-mono"
                          >
                            <option value="left">Left Aligned</option>
                            <option value="center">Centered</option>
                            <option value="right">Right Aligned</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Workflow Status</label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-zinc-300 focus:outline-none focus:border-gold-500 transition font-mono"
                          >
                            <option value="Live">Live / Active</option>
                            <option value="Pending Approval">Pending Approval</option>
                            <option value="Archived">Archived</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Date Created</label>
                          <input
                            type="date"
                            value={dateCreated}
                            onChange={(e) => setDateCreated(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-gold-500 transition font-mono cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Auto-Expiration Date</label>
                          <input
                            type="date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-gold-500 transition font-mono cursor-pointer"
                          />
                        </div>
                      </div>

                    </div>

                    {/* Aesthetic tokens styling */}
                    <div className="md:col-span-5 bg-zinc-900/10 border border-zinc-900 rounded-2xl p-5 md:p-6 space-y-4">
                      
                      {/* Background Ground */}
                      <div className="space-y-2 p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="text-[8.5px] font-mono text-zinc-400 uppercase font-bold">Backdrop Ground</span>
                          <div className="flex gap-1 bg-zinc-900 p-0.5 rounded border border-zinc-800 text-[8px] font-mono">
                            {['image', 'color', 'gradient'].map((bt) => (
                              <button
                                key={bt}
                                type="button"
                                onClick={() => setBgType(bt as any)}
                                className={`px-2 py-0.5 rounded uppercase hover:text-white transition cursor-pointer ${
                                  bgType === bt ? 'bg-zinc-805 text-gold-400 font-bold' : 'text-zinc-550'
                                }`}
                              >
                                {bt}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <input
                            type="text"
                            required
                            placeholder={bgType === 'image' ? 'https://images.unsplash.com/photo...' : bgType === 'gradient' ? 'linear-gradient(to right, #000, #222)' : '#000000'}
                            value={bgValue}
                            onChange={(e) => setBgValue(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-lg px-3 py-1.5 text-[10.5px] text-white focus:outline-none focus:border-gold-500 transition font-mono mb-2"
                          />
                          {bgType === 'image' && (
                            <div className="relative border border-dashed border-zinc-800 rounded-lg p-3 text-center bg-zinc-950/40 space-y-2 mb-2">
                              <span className="text-[8.5px] font-mono text-zinc-500 block uppercase">Or upload background portrait file</span>
                              <input 
                                type="file"
                                id="crm-poster-file-upload-input"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  
                                  triggerToast("Initializing secure image compressor...", "info");
                                  
                                  try {
                                    const reader = new FileReader();
                                    reader.readAsDataURL(file);
                                    reader.onload = (event) => {
                                      const img = new Image();
                                      img.src = event.target?.result as string;
                                      img.onload = async () => {
                                        const canvas = document.createElement('canvas');
                                        let width = img.width;
                                        let height = img.height;
                                        const maxWidth = 1200;
                                        
                                        if (width > maxWidth) {
                                          height = Math.round(height * (maxWidth / width));
                                          width = maxWidth;
                                        }
                                        
                                        canvas.width = width;
                                        canvas.height = height;
                                        
                                        const ctx = canvas.getContext('2d');
                                        if (!ctx) {
                                          triggerToast("Canvas compressor engine failure.", "alert");
                                          return;
                                        }
                                        ctx.drawImage(img, 0, 0, width, height);
                                        
                                        canvas.toBlob(async (blob) => {
                                          if (!blob) {
                                            triggerToast("Failed to output compressed blob.", "alert");
                                            return;
                                          }
                                          
                                          try {
                                            triggerToast(`Uploading compressed image (${width}x${height}px) to server...`, "info");
                                            const formData = new FormData();
                                            formData.append('file', blob, file.name);
                                            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                                            const uploadText = await uploadRes.text();
                                            let uploadJson: any = {};
                                            try { uploadJson = uploadText ? JSON.parse(uploadText) : {}; } catch (e) {}
                                            if (uploadJson.status === 'success') {
                                              setBgValue(uploadJson.url);
                                              triggerToast("Background asset successfully uploaded & bound!", "success");
                                            } else {
                                              throw new Error(uploadJson.message);
                                            }
                                          } catch (uploadError: any) {
                                            triggerToast(`Upload error: ${uploadError?.message || uploadError}`, "alert");
                                          }
                                        }, 'image/jpeg', 0.85);
                                      };
                                    };
                                  } catch (compressErr: any) {
                                    triggerToast(`Compressor error: ${compressErr?.message}`, "alert");
                                  }
                                }}
                                className="hidden"
                              />
                              <label
                                htmlFor="crm-poster-file-upload-input"
                                className="inline-flex py-1.5 px-3 bg-zinc-900 border border-zinc-800 text-[8.5px] font-mono rounded text-zinc-300 font-extrabold cursor-pointer transition hover:bg-zinc-850 hover:border-gold-500/25 uppercase select-none"
                              >
                                Select portrait image
                              </label>
                            </div>
                          )}
                          {bgType === 'image' && bgValue && (
                            <button
                              type="button"
                              onClick={() => setIsCropperOpen(true)}
                              className="w-full bg-zinc-900 hover:bg-zinc-850 text-gold-400 border border-zinc-800 hover:border-gold-500/20 py-1.5 px-3 rounded-lg text-[9px] font-mono uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Sliders className="w-3 h-3 text-gold-500" />
                              <span>Crop Backdrop Aspect Parameters</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Accent colors */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Accent color</label>
                          <div className="flex gap-1 items-center">
                            <input
                              type="color"
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="w-7 h-7 rounded border border-zinc-800 cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="flex-1 w-full bg-zinc-950 border border-zinc-850 rounded-xl px-1.5 py-1 text-[10px] text-white focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Text color</label>
                          <div className="flex gap-1 items-center">
                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-7 h-7 rounded border border-zinc-800 cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="flex-1 w-full bg-zinc-950 border border-zinc-850 rounded-xl px-1.5 py-1 text-[10px] text-white focus:outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Typography pairs */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Headline Font</label>
                          <select
                            value={fontTitle}
                            onChange={(e) => setFontTitle(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-gold-500 transition font-mono"
                          >
                            <option value="Inter">Inter Sans</option>
                            <option value="Space Grotesk">Space Grotesk</option>
                            <option value="Playfair Display">Playfair Display Serif</option>
                            <option value="JetBrains Mono">JetBrains Mono</option>
                            <option value="Outfit">Outfit</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Subtitle Font</label>
                          <select
                            value={fontSubtitle}
                            onChange={(e) => setFontSubtitle(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-gold-500 transition font-mono"
                          >
                            <option value="Inter">Inter Sans</option>
                            <option value="Space Grotesk">Space Grotesk</option>
                            <option value="Playfair Display">Playfair Display Serif</option>
                            <option value="JetBrains Mono">JetBrains Mono</option>
                            <option value="Outfit">Outfit</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Geometric Vector Overlay</label>
                        <select
                          value={geometricElement}
                          onChange={(e) => setGeometricElement(e.target.value as any)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 text-xs text-zinc-300 focus:outline-none focus:border-gold-500 transition font-mono"
                        >
                          <option value="circle">Concentric Circle</option>
                          <option value="lines">Modern Grid Lines</option>
                          <option value="grid">Swiss Matrix Grid</option>
                          <option value="border">Editorial Frame Borders</option>
                          <option value="none">No vector overlays</option>
                        </select>
                      </div>

                      {/* Modal Submit trigger */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-mono font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>{editingId ? 'COMMIT CHANGES' : 'DEPLOY POSTER'}</span>
                        </button>
                      </div>

                    </div>

                  </form>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. Secure Audit Logs Export Confirmation Modal */}
      {showAuditExportConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span className="text-xs font-mono text-zinc-300 font-extrabold uppercase">Confirm Security Audit Export</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400 leading-relaxed">
              Advisory: You are about to compile and download the entire chronological security trace history log file as a structured CSV document. This file contains administrative authentication details and database timestamps.
            </p>
            <div className="text-[9.5px] font-mono text-zinc-500 py-1.5 px-3 rounded bg-zinc-900 border border-zinc-850">
              Total log events: {auditLogs.length} entries detected
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAuditExportConfirm(false)}
                className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800 rounded-xl font-mono text-[9px] uppercase transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAuditExportConfirm(false);
                  performAuditExport();
                }}
                className="flex-1 py-2 bg-gold-400 hover:bg-gold-500 text-black font-extrabold rounded-xl font-mono text-[9px] uppercase transition cursor-pointer"
              >
                Confirm Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Interactive Backdrop Image Cropping Workshop */}
      {isCropperOpen && bgType === 'image' && bgValue && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-gold-400" />
                <span className="text-xs font-mono text-zinc-200 font-bold uppercase tracking-wider">Crop Studio Parameters</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCropperOpen(false)}
                className="p-1 hover:text-white text-zinc-550 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Canvas visual space */}
              <div className="flex justify-center bg-zinc-900/45 p-2 rounded-xl border border-zinc-900 min-h-[220px] max-h-[350px] overflow-hidden items-center">
                <canvas 
                  ref={cropCanvasRef} 
                  className="max-w-full max-h-[330px] rounded object-contain border border-zinc-800 shadow" 
                />
              </div>

              {/* Slider variables controls */}
              <div className="space-y-3 font-mono text-[9.5px]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>Horizontal Offset X:</span>
                      <span className="text-gold-400">{cropX}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max={Math.max(0, 100 - cropW)} 
                      value={cropX} 
                      onChange={(e) => setCropX(Number(e.target.value))} 
                      className="w-full accent-gold-500 bg-zinc-900 cursor-pointer h-1 rounded"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>Vertical Offset Y:</span>
                      <span className="text-gold-400">{cropY}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max={Math.max(0, 100 - cropH)} 
                      value={cropY} 
                      onChange={(e) => setCropY(Number(e.target.value))} 
                      className="w-full accent-gold-500 bg-zinc-900 cursor-pointer h-1 rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>Crop Width Span:</span>
                      <span className="text-gold-400">{cropW}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max={100 - cropX} 
                      value={cropW} 
                      onChange={(e) => setCropW(Number(e.target.value))} 
                      className="w-full accent-gold-500 bg-zinc-900 cursor-pointer h-1 rounded text-gold-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>Crop Height Span:</span>
                      <span className="text-gold-400">{cropH}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max={100 - cropY} 
                      value={cropH} 
                      onChange={(e) => setCropH(Number(e.target.value))} 
                      className="w-full accent-gold-500 bg-zinc-900 cursor-pointer h-1 rounded text-gold-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-zinc-900/60 border border-zinc-900 rounded-xl space-y-1 font-mono text-[9px] text-zinc-500 leading-normal">
                <span className="text-gold-500 font-bold block mb-0.5">Crop Instructions:</span>
                <span>Adjust offset sliders to slide the bounding crop frame box over your target subject area. Restricting dimensions will compress and crop the dynamic bitmap asset.</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsCropperOpen(false)}
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800 rounded-xl font-mono text-[10px] uppercase transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeCropAction}
                className="flex-1 py-2.5 bg-gold-400 hover:bg-gold-500 text-black font-extrabold rounded-xl font-mono text-[10px] uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Render & Apply Crop</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────── SYSTEM CONTEXT QUICK-ACTION POPUP MENU ────────────────────────────────── */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-45" onClick={() => setContextMenu(null)} />
          <div 
            className="fixed z-50 bg-zinc-950 border border-zinc-850 rounded-2xl shadow-2xl p-2 w-52 font-mono text-[9px]"
            style={{ 
              top: Math.min(contextMenu.y, window.innerHeight - 180), 
              left: Math.min(contextMenu.x, window.innerWidth - 220) 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2.5 py-1.5 border-b border-zinc-900 text-zinc-550 uppercase tracking-widest text-[7.5px] font-bold">
              Database Core Control
            </div>
            <div className="space-y-1 mt-1.5">
              <button
                onClick={() => {
                  handleQuickStatusToggle(contextMenu.poster.id, 'Live');
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-950/40 hover:text-emerald-400 transition flex items-center justify-between cursor-pointer"
              >
                <span>Mudalvar Push: LIVE</span>
                {(contextMenu.poster.status || (contextMenu.poster.archived ? 'Archived' : 'Live')) === 'Live' && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
              <button
                onClick={() => {
                  handleQuickStatusToggle(contextMenu.poster.id, 'Draft');
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-802 hover:text-white transition flex items-center justify-between cursor-pointer"
              >
                <span>Save: DRAFT (Invisible)</span>
                {(contextMenu.poster.status || (contextMenu.poster.archived ? 'Archived' : 'Live')) === 'Draft' && <Check className="w-3 h-3 text-zinc-300" />}
              </button>
              <button
                onClick={() => {
                  handleQuickStatusToggle(contextMenu.poster.id, 'Pending Approval');
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-950/40 hover:text-amber-400 transition flex items-center justify-between cursor-pointer"
              >
                <span>Hold: PENDING</span>
                {(contextMenu.poster.status || (contextMenu.poster.archived ? 'Archived' : 'Live')) === 'Pending Approval' && <Check className="w-3 h-3 text-amber-400" />}
              </button>
              <button
                onClick={() => {
                  handleQuickStatusToggle(contextMenu.poster.id, 'Archived');
                  setContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-950/30 hover:text-red-400 transition flex items-center justify-between cursor-pointer"
              >
                <span>Reloc: ARCHIVE</span>
                {(contextMenu.poster.status || (contextMenu.poster.archived ? 'Archived' : 'Live')) === 'Archived' && <Check className="w-3 h-3 text-red-400" />}
              </button>
              
              <div className="border-t border-zinc-900/80 pt-1 mt-1">
                <button
                  onClick={() => {
                    setQuickPreviewPoster(contextMenu.poster);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1 border border-zinc-900 rounded-lg hover:bg-zinc-900 transition flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-2.5 h-2.5 text-zinc-500" />
                  <span>Inspect Blueprint specs</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ────────────────────────────────── DRAWER: THEME ADAPTIVE SANDBOX ────────────────────────────────── */}
      <AnimatePresence>
        {drawerPoster && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setDrawerPoster(null)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-zinc-950 border-l border-zinc-900 shadow-2xl z-45 flex flex-col font-mono text-[10px]"
            >
              <div className="p-5 border-b border-zinc-900 bg-zinc-905 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[7.5px] text-gold-400 font-extrabold uppercase block tracking-widest">EXPERIMENTAL THEME SANDBOX</span>
                  <span className="text-white font-bold font-sans text-[13px] tracking-tight leading-none truncate max-w-[250px] block mt-1">
                    Adaptive Preview: {drawerPoster.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerPoster(null)}
                  className="p-1 px-2 border border-zinc-850 hover:border-zinc-700 bg-zinc-900 hover:text-white text-zinc-550 rounded-lg transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* Simulated Theme buttons */}
                <div className="space-y-2">
                  <label className="text-[8.5px] text-zinc-550 uppercase font-extrabold block">Select Global Simulation Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(THEME_STYLES).map(k => {
                      const isActive = drawerTheme === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => {
                            setDrawerTheme(k);
                            triggerToast(`Simulating "${THEME_STYLES[k].name}" canvas rules.`, 'info');
                          }}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between h-14 ${
                            isActive ? 'border-gold-500 bg-gold-950/10' : 'border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-800'
                          }`}
                        >
                          <span className={`${isActive ? 'text-gold-400' : 'text-zinc-400'} font-bold text-[9px]`}>
                            {THEME_STYLES[k].name}
                          </span>
                          <span className="text-[7.5px] text-zinc-650 uppercase">
                            {THEME_STYLES[k].isDark ? 'Dark Theme' : 'Light Theme'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Experimental Layout adaptation controls */}
                <div className="space-y-4 pt-3 border-t border-zinc-900/60">
                  <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                    <span className="text-zinc-400 font-extrabold text-[8.5px] uppercase">Alignment</span>
                    <div className="flex gap-1.5">
                      {(['left', 'center', 'right'] as const).map(al => (
                        <button
                          key={al}
                          type="button"
                          onClick={() => setDrawerPoster(prev => prev ? { ...prev, align: al } : null)}
                          className={`px-2 py-1 rounded text-[8.5px] uppercase font-bold transition-all ${
                            drawerPoster.align === al ? 'bg-gold-500 text-black' : 'bg-zinc-900 text-zinc-550 hover:bg-zinc-850'
                          }`}
                        >
                          {al}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                    <span className="text-zinc-400 font-extrabold text-[8.5px] uppercase">Geometric Motif</span>
                    <div className="flex gap-1">
                      {(['circle', 'lines', 'grid', 'border', 'none'] as const).map(gm => (
                        <button
                          key={gm}
                          type="button"
                          onClick={() => setDrawerPoster(prev => prev ? { ...prev, geometricElement: gm } : null)}
                          className={`px-1.5 py-1 rounded text-[8px] uppercase font-bold transition-all ${
                            drawerPoster.geometricElement === gm ? 'bg-gold-500 text-black' : 'bg-zinc-900 text-zinc-550 hover:bg-zinc-850'
                          }`}
                        >
                          {gm}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Simulated Adaptive Card Canvas based on chosen simulated theme properties */}
                <div className="space-y-2 pt-3 border-t border-zinc-900/60">
                  <label className="text-[8.5px] text-zinc-550 uppercase font-extrabold block">LIVE SIMULATION AREA</label>
                  
                  <div className="flex justify-center p-3.5 bg-zinc-950 rounded-2xl border border-zinc-900">
                    
                    {/* The adapted card */}
                    <div
                      className="w-64 h-[380px] rounded-2.5xl overflow-hidden relative shadow-2xl flex flex-col justify-between p-5 border select-none transition-all duration-300"
                      style={{
                        backgroundColor: THEME_STYLES[drawerTheme].isDark ? THEME_STYLES[drawerTheme].bg : '#ffffff',
                        color: THEME_STYLES[drawerTheme].isDark ? THEME_STYLES[drawerTheme].text : '#1c1917',
                        borderColor: THEME_STYLES[drawerTheme].border
                      }}
                    >
                      {/* Geometric grid ornament */}
                      {drawerPoster.geometricElement === 'grid' && (
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:12px_12px] opacity-40 pointer-events-none" />
                      )}

                      {/* Header details */}
                      <div className="flex justify-between items-start z-10">
                        <div>
                          <span className="font-mono text-[5.5px] tracking-wider block opacity-75 uppercase">SPECIFICATIONS</span>
                          <span className="font-mono text-[7px] uppercase tracking-widest font-extrabold" style={{ color: THEME_STYLES[drawerTheme].accent }}>
                            {THEME_STYLES[drawerTheme].name}
                          </span>
                        </div>
                        {drawerPoster.badge && (
                          <span className="text-[6px] border rounded bg-black/60 px-1 py-0.2 uppercase tracking-wide leading-none font-bold" style={{ borderColor: THEME_STYLES[drawerTheme].accent, color: THEME_STYLES[drawerTheme].accent }}>
                            {drawerPoster.badge}
                          </span>
                        )}
                      </div>

                      {/* Centre Geometric elements emulation */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 overflow-hidden">
                        {drawerPoster.geometricElement === 'circle' && (
                          <div className="w-48 h-48 rounded-full border-2 border-dashed" style={{ borderColor: THEME_STYLES[drawerTheme].accent }} />
                        )}
                        {drawerPoster.geometricElement === 'lines' && (
                          <div className="w-full flex flex-col gap-2 rotate-12">
                            <hr className="w-full" style={{ borderColor: THEME_STYLES[drawerTheme].accent }} />
                            <hr className="w-[80%]" style={{ borderColor: THEME_STYLES[drawerTheme].accent }} />
                            <hr className="w-[60%]" style={{ borderColor: THEME_STYLES[drawerTheme].accent }} />
                          </div>
                        )}
                        {drawerPoster.geometricElement === 'border' && (
                          <div className="absolute inset-3 border-2 border-dotted" style={{ borderColor: THEME_STYLES[drawerTheme].accent }} />
                        )}
                      </div>

                      {/* Poster Title text adaptation based on styling alignments */}
                      <div className={`mt-auto z-10 space-y-1.5 ${
                        drawerPoster.align === 'center' ? 'text-center' : drawerPoster.align === 'right' ? 'text-right' : 'text-left'
                      }`}>
                        <h4 className="text-sm font-sans font-extrabold tracking-tight" style={{ color: THEME_STYLES[drawerTheme].isDark ? '#ffffff' : '#09090b' }}>
                          {drawerPoster.title}
                        </h4>
                        <p className="text-[8px] leading-tight opacity-75 truncate uppercase tracking-wider" style={{ color: THEME_STYLES[drawerTheme].accent }}>
                          {drawerPoster.subtitle}
                        </p>
                        <p className="text-[7.5px] leading-normal opacity-50 line-clamp-2 pr-1 font-sans">
                          {drawerPoster.details}
                        </p>
                      </div>

                      {/* Bottom Footer block details */}
                      <div className="flex justify-between items-center text-[5.5px] opacity-45 pt-2 border-t border-zinc-900/10 mt-2 z-10">
                        <span>#ATELIER_SIMULATION</span>
                        <span>{drawerPoster.category.toUpperCase()} SECTOR</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              <div className="p-4 border-t border-zinc-900 bg-zinc-905 flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={async () => {
                    // Permanently commit the theme adaptation to Firestore
                    const updatedPosterWithTheme: PosterTemplate = {
                      ...drawerPoster,
                      theme: THEME_STYLES[drawerTheme].name,
                      accentColor: THEME_STYLES[drawerTheme].accent,
                      textColor: THEME_STYLES[drawerTheme].isDark ? '#ffffff' : '#09090b',
                      bgType: 'color',
                      bgValue: THEME_STYLES[drawerTheme].bg
                    };

                    try {
                      await fetch('/api/db/custom-posters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedPosterWithTheme) });
                      await logAction("COMMIT_THEME_ADAPTATION", `Adapted and committed theme choice "${THEME_STYLES[drawerTheme].name}" onto layout ID: ${drawerPoster.id}`);
                      triggerToast(`Beautiful theme choice committed successfully to "${drawerPoster.title}"!`, 'success');
                      setDrawerPoster(null);
                    } catch (err: any) {
                      triggerToast(`Failed to commit layout changes: ${err.message}`, 'alert');
                    }
                  }}
                  className="flex-1 bg-gold-400 hover:bg-gold-500 font-extrabold text-black hover:text-black hover:border-transparent py-2 px-4 rounded-xl text-center cursor-pointer transition active:scale-95"
                >
                  Save Theme Selection Live
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerPoster(null)}
                  className="border border-zinc-850 hover:border-zinc-700 hover:text-white bg-zinc-900 text-zinc-400 py-2 px-4 rounded-xl cursor-pointer transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────── MODAL: QUICK DETAILS DESIGN SHEET PREVIEW ────────────────────────────────── */}
      <AnimatePresence>
        {quickPreviewPoster && (
          <>
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-45 transition-opacity" onClick={() => setQuickPreviewPoster(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setQuickPreviewPoster(null)}
            >
              <div 
                className="bg-zinc-950 border border-zinc-900 p-6 md:p-8 rounded-3xl max-w-lg w-full relative shadow-2xl text-left select-none space-y-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
                  <div>
                    <span className="text-[8px] font-mono text-gold-400 font-extrabold uppercase tracking-widest block">specifications blueprint details sheets</span>
                    <span className="text-white text-base font-bold tracking-tight">{quickPreviewPoster.title}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setQuickPreviewPoster(null)}
                    className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* The beautifully rendered actual card */}
                <div className="flex justify-center py-2.5">
                  <div 
                    className="w-72 h-[420px] rounded-3xl overflow-hidden relative shadow-2xl border border-zinc-900 flex flex-col justify-between p-6 select-none"
                    style={{ 
                      background: quickPreviewPoster.bgType === 'image' ? `url(${quickPreviewPoster.bgValue}) center/cover no-repeat` : quickPreviewPoster.bgValue,
                      backgroundColor: quickPreviewPoster.bgType === 'color' ? quickPreviewPoster.bgValue : 'transparent',
                      color: quickPreviewPoster.textColor
                    }}
                  >
                    {quickPreviewPoster.geometricElement === 'grid' && (
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none" />
                    )}

                    <div className="flex justify-between items-start z-10">
                      <div>
                        <span className="font-mono text-[6.5px] block opacity-75 uppercase">spec blueprint</span>
                        <span className="font-mono text-[8px] uppercase tracking-widest font-extrabold" style={{ color: quickPreviewPoster.accentColor }}>
                          {quickPreviewPoster.theme}
                        </span>
                      </div>
                      {quickPreviewPoster.badge && (
                        <span className="text-[7px] border rounded bg-black/60 px-1.5 py-0.5 uppercase tracking-wide leading-none" style={{ borderColor: quickPreviewPoster.accentColor, color: quickPreviewPoster.accentColor }}>
                          {quickPreviewPoster.badge}
                        </span>
                      )}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 overflow-hidden">
                      {quickPreviewPoster.geometricElement === 'circle' && (
                        <div className="w-56 h-56 rounded-full border-2 border-dashed" style={{ borderColor: quickPreviewPoster.accentColor }} />
                      )}
                      {quickPreviewPoster.geometricElement === 'lines' && (
                        <div className="w-full flex flex-col gap-2.5 rotate-12">
                          <hr className="w-full" style={{ borderColor: quickPreviewPoster.accentColor }} />
                          <hr className="w-[80%]" style={{ borderColor: quickPreviewPoster.accentColor }} />
                        </div>
                      )}
                      {quickPreviewPoster.geometricElement === 'border' && (
                        <div className="absolute inset-4 border-2 border-dotted" style={{ borderColor: quickPreviewPoster.accentColor }} />
                      )}
                    </div>

                    <div className={`mt-auto z-10 space-y-2 ${
                      quickPreviewPoster.align === 'center' ? 'text-center' : quickPreviewPoster.align === 'right' ? 'text-right' : 'text-left'
                    }`}>
                      <h4 className="text-base font-sans font-extrabold tracking-tight" style={{ color: quickPreviewPoster.textColor }}>
                        {quickPreviewPoster.title}
                      </h4>
                      <p className="text-[9px] font-mono leading-tight opacity-85 truncate uppercase tracking-wider" style={{ color: quickPreviewPoster.accentColor }}>
                        {quickPreviewPoster.subtitle}
                      </p>
                      <p className="text-[8.5px] leading-normal opacity-60 line-clamp-3 font-sans">
                        {quickPreviewPoster.details}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-[6px] opacity-40 pt-2 border-t border-zinc-900/10 mt-2 z-10">
                      <span>#ATELIER_GRID_PREVIEW</span>
                      <span>{quickPreviewPoster.category.toUpperCase()} DIVISION</span>
                    </div>

                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-3 flex items-center justify-between text-[10px] font-mono">
                  <div className="text-zinc-550 flex flex-col">
                    <span>SECTOR: <strong className="text-zinc-400 uppercase">{quickPreviewPoster.category}</strong></span>
                    <span>ALIGNMENT: <strong className="text-zinc-400 uppercase">{quickPreviewPoster.align}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuickPreviewPoster(null)}
                    className="py-1.5 px-4 rounded-xl bg-gold-400 text-black font-extrabold uppercase transition hover:bg-gold-500 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Real-time Toast CRUD animation alert */}
      <AnimatePresence>
        {activityToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-zinc-950 border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.85)] rounded-2xl p-4 flex gap-3 text-left font-mono"
            id="crm-realtime-activity-toast-alert"
          >
            <div className="w-8 h-8 rounded-full bg-gold-400/10 border border-gold-500/25 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-gold-400 rotate-12 animate-pulse" />
            </div>
            <div className="space-y-1 select-none w-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-gold-400 uppercase tracking-widest">Real-time DB Alteration</span>
                <button 
                  onClick={() => setActivityToast(null)}
                  className="text-zinc-550 hover:text-zinc-300 transition text-[9px] uppercase font-bold"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-[11px] text-zinc-200 font-sans leading-tight font-medium pb-1">{activityToast.details}</p>
              <div className="flex gap-1.5 items-center">
                <span className="bg-zinc-900 border border-zinc-850 text-zinc-400 rounded px-1.5 py-0.5 text-[8px] uppercase font-semibold">
                  {activityToast.action}
                </span>
                <span className="text-[8px] text-zinc-550">
                  {new Date(activityToast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────────────────────────── TAB 5: NEON CLIENT HUB ────────────────────────────────── */}
      {activeTab === 'client-hub' && (
        <div className="animate-fade-in space-y-8 mt-12 pb-24">
          
          <div className="flex flex-col gap-2 border-b border-indigo-900/50 pb-6 mb-8">
            <h3 className="font-display text-3xl text-indigo-400 font-bold tracking-tight">Neon Database CRM</h3>
            <p className="text-sm text-zinc-400">Directly synchronized with the production Neon PostgreSQL data lake.</p>
          </div>

          {isFetchingNeon ? (
            <div className="flex items-center justify-center p-20">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {/* Clients Table Bento Box */}
              <div className="bg-zinc-950/80 backdrop-blur-2xl border border-indigo-500/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-indigo-500/5">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-white font-bold text-xl flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-400" /> Managed Clients
                  </h4>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => setIsClientModalOpen(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg transition font-bold">+ New Client</button>
                    <span className="bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full font-mono">{neonData.clients.length} Total</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-400 font-sans">
                    <thead className="bg-zinc-900/50 text-zinc-300 font-mono text-[10px] uppercase tracking-widest">
                      <tr>
                        <th className="py-3 px-4 rounded-tl-xl">ID</th>
                        <th className="py-3 px-4">Client Name & Tagline</th>
                        <th className="py-3 px-4">Project Slug</th>
                        <th className="py-3 px-4">Sort Rank</th>
                        <th className="py-3 px-4 rounded-tr-xl"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/80">
                      {neonData.clients.map(client => (
                        <tr key={client.id} className="hover:bg-zinc-900/30 transition-colors">
                          <td className="py-3 px-4 font-mono text-zinc-500 text-xs" title={client.id}>#{client.id.substring(0,8)}</td>
                          <td className="py-3 px-4 font-bold text-zinc-200">{client.name} <br/><span className="text-xs font-normal text-zinc-600">{client.tagline}</span></td>
                          <td className="py-3 px-4 font-mono text-xs">{client.slug}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider" style={{ color: client.accent, backgroundColor: `${client.accent}20`, borderColor: `${client.accent}40`, borderWidth: '1px' }}>
                              #{client.sort_order}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button onClick={() => handleClientDelete(client.id)} className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Poster Designs & Websites Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Posters Box */}
                <div className="bg-zinc-950/80 backdrop-blur-2xl border border-rose-500/20 rounded-3xl p-6 shadow-2xl shadow-rose-500/5">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-rose-400" /> Campaign Posters
                    </h4>
                    <div className="flex gap-2 items-center">
                      <button onClick={() => setIsPosterModalOpen(true)} className="bg-rose-500 hover:bg-rose-600 text-white text-xs px-3 py-1.5 rounded-lg transition font-bold">+ New Poster</button>
                      <span className="text-rose-400 font-mono text-xs">{neonData.posterDesigns.length} Active</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {neonData.posterDesigns.map(poster => (
                      <div key={poster.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:border-rose-500/30 transition shadow-inner">
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-zinc-200 truncate">{poster.title}</p>
                          <p className="text-[10px] text-zinc-500 font-mono tracking-widest mt-1 truncate">Path: {poster.image_path}</p>
                        </div>
                        <div className="flex items-center ml-4 shrink-0">
                          <span className="text-[10px] font-mono bg-zinc-950 px-2.5 py-1 rounded-md text-zinc-400 border border-zinc-800 tracking-wider uppercase">Order: {poster.sort_order}</span>
                          <button onClick={() => handleClientPosterDelete(poster.id)} className="text-red-400 hover:text-red-300 ml-4"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Websites Box */}
                <div className="bg-zinc-950/80 backdrop-blur-2xl border border-sky-500/20 rounded-3xl p-6 shadow-2xl shadow-sky-500/5">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-sky-400" /> Web Deployments
                    </h4>
                    <div className="flex gap-2 items-center">
                      <button onClick={() => setIsWebsiteModalOpen(true)} className="bg-sky-500 hover:bg-sky-600 text-white text-xs px-3 py-1.5 rounded-lg transition font-bold">+ New Site</button>
                      <span className="text-sky-400 font-mono text-xs">{neonData.websites.length} Live</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {neonData.websites.map(site => (
                      <div key={site.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:border-sky-500/30 transition shadow-inner">
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-zinc-200 truncate">{site.title}</p>
                          <p className="text-[10px] text-zinc-500 font-mono tracking-widest mt-1 truncate">Path: {site.image_path}</p>
                        </div>
                        <div className="flex items-center ml-4 shrink-0">
                          <span className={`text-[10px] font-mono px-2.5 py-1 rounded-md border tracking-wider uppercase ${site.approved ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-zinc-950 text-zinc-400 border-zinc-800'}`}>
                            {site.approved ? 'Approved' : 'Pending'}
                          </span>
                          <button onClick={() => handleWebsiteDelete(site.id)} className="text-red-400 hover:text-red-300 ml-4"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* CRM Forms Modals */}
          {isClientModalOpen && (
            <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold text-white mb-4">Add Client</h3>
                <form onSubmit={handleClientFormSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Client Name</label>
                    <input required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Slug</label>
                    <input required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={clientForm.slug} onChange={e => setClientForm({...clientForm, slug: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Tagline</label>
                    <input type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={clientForm.tagline} onChange={e => setClientForm({...clientForm, tagline: e.target.value})} />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-zinc-400 mb-1 block">Accent</label>
                      <input type="color" className="w-full h-10 rounded" value={clientForm.accent} onChange={e => setClientForm({...clientForm, accent: e.target.value})} />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-zinc-400 mb-1 block">Sort Order</label>
                      <input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={clientForm.sort_order} onChange={e => setClientForm({...clientForm, sort_order: parseInt(e.target.value) || 0})} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button type="button" onClick={() => setIsClientModalOpen(false)} className="flex-1 bg-zinc-900 text-white rounded p-2 hover:bg-zinc-800">Cancel</button>
                    <button type="submit" className="flex-1 bg-indigo-500 text-white rounded p-2 hover:bg-indigo-600 font-bold">Save Client</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isPosterModalOpen && (
            <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold text-white mb-4">Add Poster</h3>
                <form onSubmit={handleClientPosterSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Client</label>
                    <select required className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={clientPosterForm.client_id} onChange={e => setClientPosterForm({...clientPosterForm, client_id: e.target.value})}>
                      <option value="">Select a client...</option>
                      {neonData.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Title</label>
                    <input required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={clientPosterForm.title} onChange={e => setClientPosterForm({...clientPosterForm, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Image URL / Path</label>
                    <input required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={clientPosterForm.image_path} onChange={e => setClientPosterForm({...clientPosterForm, image_path: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Sort Order</label>
                    <input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={clientPosterForm.sort_order} onChange={e => setClientPosterForm({...clientPosterForm, sort_order: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button type="button" onClick={() => setIsPosterModalOpen(false)} className="flex-1 bg-zinc-900 text-white rounded p-2 hover:bg-zinc-800">Cancel</button>
                    <button type="submit" className="flex-1 bg-rose-500 text-white rounded p-2 hover:bg-rose-600 font-bold">Save Poster</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isWebsiteModalOpen && (
            <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold text-white mb-4">Add Website</h3>
                <form onSubmit={handleWebsiteSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Client</label>
                    <select required className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={websiteForm.client_id} onChange={e => setWebsiteForm({...websiteForm, client_id: e.target.value})}>
                      <option value="">Select a client...</option>
                      {neonData.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Title / URL</label>
                    <input required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={websiteForm.title} onChange={e => setWebsiteForm({...websiteForm, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Thumbnail URL / Path</label>
                    <input required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={websiteForm.image_path} onChange={e => setWebsiteForm({...websiteForm, image_path: e.target.value})} />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-zinc-400 mb-1 block">Approved</label>
                      <select className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={websiteForm.approved ? 'true' : 'false'} onChange={e => setWebsiteForm({...websiteForm, approved: e.target.value === 'true'})}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-zinc-400 mb-1 block">Sort Order</label>
                      <input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white" value={websiteForm.sort_order} onChange={e => setWebsiteForm({...websiteForm, sort_order: parseInt(e.target.value) || 0})} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button type="button" onClick={() => setIsWebsiteModalOpen(false)} className="flex-1 bg-zinc-900 text-white rounded p-2 hover:bg-zinc-800">Cancel</button>
                    <button type="submit" className="flex-1 bg-sky-500 text-white rounded p-2 hover:bg-sky-600 font-bold">Save Website</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
