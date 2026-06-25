import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Navbar } from './components/Navbar';
import { auth, LocalUser } from './auth';
import { 
  Sparkles, Layers, Compass, Coins, MessageSquare, ArrowRight, Phone, Instagram, 
  Menu, X, Award, Shield, Zap, Heart, CheckCircle, ExternalLink, HelpCircle, Eye, RefreshCw,
  Search, Download, Info, Share2, LogOut, User as UserIcon, ShieldAlert, CheckCircle2, ChevronRight,
  Database, UserCheck, Bookmark, Printer, QrCode, MessageCircle, Scissors, Mail, History, Users, Layout, FileArchive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { PORTFOLIO_PRESETS, SERVICE_ITEMS } from './data';
import { PosterTemplate } from './types';
import PosterAtelier from './components/PosterAtelier';
import BriefingDashboard from './components/BriefingDashboard';
import InvestmentCalculator from './components/InvestmentCalculator';
import StudioInsights from './components/StudioInsights';
import DesignPrinciplesModal from './components/DesignPrinciplesModal';
import AuthPortal from './components/AuthPortal';
import UserProfileView from './components/UserProfileView';
import LoadingScreen from './components/LoadingScreen';
import ProjectQRCode from './components/ProjectQRCode';
import PortfolioCard from './components/PortfolioCard';
import CrmPanel from './components/CrmPanel';
import CreativenodePortfolio from './components/CreativenodePortfolio';

const THEME_STYLES: Record<string, {
  name: string;
  isDark: boolean;
  bg: string;          // background color
  text: string;        // primary text
  textMuted: string;   // secondary/muted text
  border: string;      // border color
  borderMuted: string; // lighter border
  accent: string;      // primary gold/accent
  cardBg: string;      // card background
  cardBorder: string;  // card border
  glow: string;        // background glow or shadow
}> = {
  'modernist': {
    name: 'Modernist Swiss',
    isDark: true,
    bg: '#0c0c0e',
    text: '#ffffff',
    textMuted: '#a1a1aa',
    border: '#18181b',
    borderMuted: '#27272a',
    accent: '#eca115', // Premium classic gold
    cardBg: '#121214',
    cardBorder: '#1c1c1f',
    glow: 'rgba(212, 175, 55, 0.05)'
  },
  'brutalist': {
    name: 'Brutalist Raw Mono',
    isDark: true,
    bg: '#000000',
    text: '#ffffff',
    textMuted: '#a1a1aa',
    border: '#ffffff', // Stark physical borders
    borderMuted: '#52525b',
    accent: '#ff007f', // Stark neon
    cardBg: '#050505',
    cardBorder: '#ffffff',
    glow: 'rgba(255, 0, 127, 0.08)'
  },
  'luxury': {
    name: 'Luxury Champagne',
    isDark: true,
    bg: '#0a0a07',
    text: '#f9f6f0',
    textMuted: '#c5a880', // Beautiful champagne text
    border: '#1f1b15',
    borderMuted: '#2e281f',
    accent: '#dfb76c', // Royal soft gold
    cardBg: '#12110e',
    cardBorder: '#29251e',
    glow: 'rgba(223, 183, 108, 0.08)'
  },
  'obsidian-gold': {
    name: 'Obsidian Gold',
    isDark: true,
    bg: '#09090b',
    text: '#ffffff',
    textMuted: '#a1a1aa',
    border: '#18181b',
    borderMuted: '#27272a',
    accent: '#eca115', // Gold
    cardBg: '#09090b',
    cardBorder: '#18181b',
    glow: 'rgba(212, 175, 55, 0.05)'
  },
  'alpine-minimalist': {
    name: 'Alpine Off-White',
    isDark: false,
    bg: '#f4f4f5',
    text: '#09090b',
    textMuted: '#52525b',
    border: '#e4e4e7',
    borderMuted: '#d4d4d8',
    accent: '#4f46e5', // Royal Indigo
    cardBg: '#ffffff',
    cardBorder: '#e4e4e7',
    glow: 'rgba(79, 70, 229, 0.03)'
  },
  'nordic-slate': {
    name: 'Nordic Sage Slate',
    isDark: true,
    bg: '#14211a', // Rich forest sage
    text: '#f5f5f4',
    textMuted: '#a8a29e',
    border: '#1c2e24',
    borderMuted: '#273f32',
    accent: '#22c55e', // Emerald
    cardBg: '#0c1511',
    cardBorder: '#1c2e24',
    glow: 'rgba(34, 197, 94, 0.05)'
  },
  'royal-cobalt': {
    name: 'Royal Cobalt',
    isDark: true,
    bg: '#0b132b',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    border: '#1c2541',
    borderMuted: '#3a506b',
    accent: '#38bdf8', // Electric Sky
    cardBg: '#0f172a',
    cardBorder: '#1e293b',
    glow: 'rgba(56, 189, 248, 0.05)'
  },
  'tokyo-cyber': {
    name: 'Tokyo Neon Cyber',
    isDark: true,
    bg: '#0f0e17',
    text: '#fffffe',
    textMuted: '#a7a9be',
    border: '#1a1829',
    borderMuted: '#2d2948',
    accent: '#ff007f', // Cyber Pink
    cardBg: '#14121f',
    cardBorder: '#231f3c',
    glow: 'rgba(255, 0, 127, 0.05)'
  },
  'bordeaux-burgundy': {
    name: 'Crimson Bordeaux',
    isDark: true,
    bg: '#250610',
    text: '#fff1f2',
    textMuted: '#rose-300',
    border: '#3c0d1e',
    borderMuted: '#58132e',
    accent: '#e11d48', // Crimson Rose
    cardBg: '#1a030b',
    cardBorder: '#320a18',
    glow: 'rgba(225, 29, 72, 0.05)'
  },
  'ethereal-glass': {
    name: 'Ethereal Glass',
    isDark: false,
    bg: '#f8fafc',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    borderMuted: '#f1f5f9',
    accent: '#0ea5e9', // Ocean Blue
    cardBg: 'rgba(255, 255, 255, 0.6)',
    cardBorder: 'rgba(255, 255, 255, 0.8)',
    glow: 'rgba(14, 165, 233, 0.05)'
  },
  'quantum-dark': {
    name: 'Quantum Dark',
    isDark: true,
    bg: '#050212',
    text: '#f8fafc',
    textMuted: '#8b5cf6',
    border: '#2e1065',
    borderMuted: '#4c1d95',
    accent: '#d946ef', // Fuchsia
    cardBg: '#0f0524',
    cardBorder: '#3b0764',
    glow: 'rgba(217, 70, 239, 0.08)'
  },
  'platinum-elite': {
    name: 'Platinum Elite',
    isDark: true,
    bg: '#0a0a0c',
    text: '#fafafa',
    textMuted: '#a3a3a3',
    border: '#1a1a1d',
    borderMuted: '#2a2a2e',
    accent: '#e5e7eb', // Platinum
    cardBg: '#111113',
    cardBorder: '#1e1e21',
    glow: 'rgba(229, 231, 235, 0.04)'
  },
  'midnight-amethyst': {
    name: 'Midnight Amethyst',
    isDark: true,
    bg: '#0d0618',
    text: '#f5f0fa',
    textMuted: '#c4b5d8',
    border: '#1e1030',
    borderMuted: '#2d1b45',
    accent: '#c084fc', // Amethyst
    cardBg: '#140a24',
    cardBorder: '#23143a',
    glow: 'rgba(192, 132, 252, 0.06)'
  },
  'rose-gold-royale': {
    name: 'Rose Gold Royale',
    isDark: true,
    bg: '#1a0d10',
    text: '#fff1f3',
    textMuted: '#fda4af',
    border: '#33181f',
    borderMuted: '#4a1d28',
    accent: '#f43f5e', // Rose Gold
    cardBg: '#200f15',
    cardBorder: '#3d1720',
    glow: 'rgba(244, 63, 94, 0.05)'
  },
  'carbon-fiber': {
    name: 'Carbon Fiber',
    isDark: true,
    bg: '#080808',
    text: '#eaeaea',
    textMuted: '#888888',
    border: '#181818',
    borderMuted: '#282828',
    accent: '#a0a0a0', // Brushed steel
    cardBg: '#0d0d0d',
    cardBorder: '#1a1a1a',
    glow: 'rgba(160, 160, 160, 0.03)'
  }
};

const playHapticClick = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // High-end subtle camera shut / mechanical tick
    osc.type = 'sine';
    // Start with a high frequency tick and drop extremely quickly
    osc.frequency.setValueAtTime(2200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.03);
    
    gain.gain.setValueAtTime(0.012, ctx.currentTime); // very subtle volume
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  } catch (e) {
    // Audio context not initialized or blocked
  }
};

const renderHighlightedText = (text: string, query: string, highlightColorClass: string = "bg-gold-400 text-black font-semibold px-[2px] rounded-sm") => {
  if (!query || !query.trim()) return <>{text}</>;
  
  const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className={highlightColorClass}>{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
};

interface ScrollRevealCardProps {
  children: React.ReactNode;
  index: number;
  key?: React.Key | null;
}

function ScrollRevealCard({ children, index }: ScrollRevealCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={playHapticClick}
      className={`transition-all duration-700 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{
        transitionDelay: `${Math.min(index * 60, 300)}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'portfolio' | 'atelier' | 'services' | 'investment' | 'profile' | 'crm' | 'inspiration' | 'designers' | 'agency_portfolio'>('home');
  const [adminPreviewPoster, setAdminPreviewPoster] = useState<PosterTemplate | null>(null);
  const [portfolioCategory, setPortfolioCategory] = useState<'all' | 'fitness' | 'fashion' | 'minimalist' | 'offers'>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [viewingProject, setViewingProject] = useState<PosterTemplate | null>(null);
  const [showDesignPrinciples, setShowDesignPrinciples] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Search & Keyword states for filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [portfolioSort, setPortfolioSort] = useState<'newest' | 'alphabetical' | 'a-z'>('newest');
  const [printPreviewMedium, setPrintPreviewMedium] = useState<'none' | 'canvas' | 'billboard' | 'physical'>('none');
  const [paperFinish, setPaperFinish] = useState<'matte' | 'glossy' | 'textured'>('matte');
  const [colorAnalysisLoading, setColorAnalysisLoading] = useState(false);
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);

  useEffect(() => {
    if (viewingProject) {
      setColorAnalysisLoading(true);
      const timer = setTimeout(() => {
        setColorAnalysisLoading(false);
        setActiveAnalysisId(viewingProject.id);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setActiveAnalysisId(null);
    }
  }, [viewingProject]);
  const [isGeneratingInstagram, setIsGeneratingInstagram] = useState<string | null>(null);

  // Interactive customizable print QR code generator tool states
  const [qrCustomUrl, setQrCustomUrl] = useState('');
  const [qrFgColor, setQrFgColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');

  // Recent searches tracking states
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentDropdownOpen, setRecentDropdownOpen] = useState(false);

  // Load tracked queries on mount
  useEffect(() => {
    const saved = localStorage.getItem('creativenode_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent search logs:", e);
      }
    }
  }, []);

  const saveSearchQuery = (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== cleanQuery.toLowerCase());
      const updated = [cleanQuery, ...filtered].slice(0, 5);
      localStorage.setItem('creativenode_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  // Debounce query tracking as they type in the search bar
  useEffect(() => {
    if (!searchQuery) return;
    const timer = setTimeout(() => {
      saveSearchQuery(searchQuery);
    }, 1500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Mobile nav state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // State for syncing briefing listings across components
  const [briefsCount, setBriefsCount] = useState(0);
  const [briefsUpdateTrigger, setBriefsUpdateTrigger] = useState(0);

  // User Session & Premium profile states with Firebase tracking
  const [user, setUser] = useState<LocalUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [isAuthPortalOpen, setIsAuthPortalOpen] = useState(false);
  const [vipSlaType, setVipSlaType] = useState<'standard' | 'vip' | 'sovereign'>('vip');
  
  // Clipboard copy confirmation banner state
  const [copiedShareUrl, setCopiedShareUrl] = useState<string | null>(null);

  // System Theme & Subscription Tier States
  const [appTheme, setAppTheme] = useState<string>(() => {
    return localStorage.getItem('creativenode_global_theme') || 'modernist';
  });
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'sovereign'>('free');
  
  // Bookmark tracking for Collections
  const [collections, setCollections] = useState<string[]>([]);
  
  // State for recently viewed posters
  const [recentlyViewed, setRecentlyViewed] = useState<PosterTemplate[]>([]);

  // State for print cost estimator parameters
  const [estimatorSize, setEstimatorSize] = useState<'A4' | 'A3' | 'Poster'>('A3');
  const [estimatorQuality, setEstimatorQuality] = useState<'standard' | 'premium' | 'collector'>('premium');
  const [showQualityHelp, setShowQualityHelp] = useState(false);
  const [showSizeTooltip, setShowSizeTooltip] = useState(false);
  const [showQualityTooltip, setShowQualityTooltip] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // States for visual export progress indicators
  const [exportState, setExportState] = useState<'idle' | 'generating'>('idle');
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState<'PDF' | 'SVG' | 'TIFF' | null>(null);

  // Crop marks toggle state
  const [showCropMarks, setShowCropMarks] = useState(false);
  const [enableHeatmap, setEnableHeatmap] = useState(false);

  // Batch Export configuration and progress states
  const [batchSelectedIds, setBatchSelectedIds] = useState<string[]>([]);
  
  // Real-time searching state, Quick view, and print settings tab
  const [isSearchingActive, setIsSearchingActive] = useState(false);
  const [quickViewProject, setQuickViewProject] = useState<PosterTemplate | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'specs' | 'print'>('specs');
  const [batchExportState, setBatchExportState] = useState<'idle' | 'generating'>('idle');
  const [batchExportProgress, setBatchExportProgress] = useState(0);

  // Effect to load recently viewed posters on mount and sync
  const loadRecentlyViewed = () => {
    try {
      const stored = sessionStorage.getItem('creativenode_recently_viewed');
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load recently viewed", err);
    }
  };

  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  // Real-time animation trigger for searching overlays
  useEffect(() => {
    if (searchQuery || selectedKeyword) {
      setIsSearchingActive(true);
      const timer = setTimeout(() => {
        setIsSearchingActive(false);
      }, 450);
      return () => clearTimeout(timer);
    } else {
      setIsSearchingActive(false);
    }
  }, [searchQuery, selectedKeyword]);

  // Update recently viewed whenever viewingProject changes to a new non-null project
  useEffect(() => {
    if (viewingProject) {
      setQrCustomUrl(`${window.location.origin}${window.location.pathname}?project=${viewingProject.id}`);
      setQrFgColor('#000000');
      setQrBgColor('#ffffff');
      try {
        const storedStr = sessionStorage.getItem('creativenode_recently_viewed');
        let currentList: PosterTemplate[] = [];
        if (storedStr) {
          currentList = JSON.parse(storedStr);
        }
        
        // Filter out if already exists, and limit to 5
        const updatedList = [
          viewingProject,
          ...currentList.filter(p => p.id !== viewingProject.id)
        ].slice(0, 5);
        
        sessionStorage.setItem('creativenode_recently_viewed', JSON.stringify(updatedList));
        setRecentlyViewed(updatedList);

        // Save to localStorage only (no cloud sync needed)
        localStorage.setItem('creativenode_recently_viewed_ids', JSON.stringify(updatedList.map(p => p.id)));
      } catch (err) {
        console.error("Failed to update recently viewed", err);
      }
    }
  }, [viewingProject]);
  
  // Shortcuts cheat-sheet state
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const isShortcutModalOpenRef = useRef(false);
  useEffect(() => {
    isShortcutModalOpenRef.current = isShortcutModalOpen;
  }, [isShortcutModalOpen]);

  // Dynamic Posters system state list
  const [posters, setPosters] = useState<PosterTemplate[]>(() => {
    return PORTFOLIO_PRESETS;
  });

  const postersRef = useRef<PosterTemplate[]>(PORTFOLIO_PRESETS);
  
  useEffect(() => {
    postersRef.current = posters;
  }, [posters]);

  // Fetch custom posters from Neon DB on mount
  useEffect(() => {
    fetch('/api/db/custom-posters')
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success' && res.data.length > 0) {
          const customItems: PosterTemplate[] = res.data;
          setPosters(() => {
            const unoverriddenPresets = PORTFOLIO_PRESETS.filter(p =>
              !customItems.some(c => c.id.trim().toLowerCase() === p.id.trim().toLowerCase())
            );
            const combined = [...unoverriddenPresets, ...customItems];
            const seenIds = new Set<string>();
            return combined.filter(item => {
              const lowerId = item.id.trim().toLowerCase();
              if (seenIds.has(lowerId)) return false;
              seenIds.add(lowerId);
              return true;
            });
          });
        }
      })
      .catch(err => console.warn("Neon custom-posters fetch failed, using presets:", err));
  }, []);

  // Comparison State
  const [comparingProject, setComparingProject] = useState<PosterTemplate | null>(null);
  const [showComparisonSelector, setShowComparisonSelector] = useState(false);

  // Generating Loader ID
  const [isGeneratingPDFId, setIsGeneratingPDFId] = useState<string | null>(null);

  // Custom App-level Toast state
  const [appToast, setAppToast] = useState<{ message: string; type: 'success' | 'info' | 'alert' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'alert' = 'success') => {
    setAppToast({ message, type });
    setTimeout(() => {
      setAppToast(prev => prev?.message === message ? null : prev);
    }, 4000);
  };

  const viewingProjectRef = useRef<PosterTemplate | null>(null);
  useEffect(() => {
    viewingProjectRef.current = viewingProject;
    
    // Clear comparison when current viewing project changes
    if (!viewingProject) {
      setComparingProject(null);
      setShowComparisonSelector(false);
      setPrintPreviewMedium('none');
    } else {
      setPrintPreviewMedium('none');
    }
  }, [viewingProject]);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setUserLoading(false);
    });
    const savedTheme = localStorage.getItem('creativenode_global_theme');
    if (savedTheme && THEME_STYLES[savedTheme]) {
      setAppTheme(savedTheme);
    }
  }, []);

  // CRM Route Guard check: local admin always has access
  useEffect(() => {
    if (activeTab === 'crm') {
      if (userLoading) return;
      // Local admin is always authorized
      if (!user) {
        setActiveTab('home');
        triggerToast("Access denied: Authentication required.", "alert");
      }
    }
  }, [activeTab, user, userLoading]);

  // Deep Link loader for query parameters (?project=xxx)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project');
    if (projectId) {
      const match = posters.find(p => p.id === projectId) || PORTFOLIO_PRESETS.find(p => p.id === projectId);
      if (match) {
        setViewingProject(match);
      }
    }
  }, []);

  // Handle sharing deep link with Clipboard Copy fallback
  const handleShareProject = (e: React.MouseEvent, item: PosterTemplate) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?project=${item.id}`;
    if (navigator.share) {
      navigator.share({
        title: `CreativeNode - ${item.title}`,
        text: `Curated modernist artwork: ${item.subtitle}`,
        url: shareUrl
      }).catch(() => {
        // Fallback to Clipboard
        navigator.clipboard.writeText(shareUrl);
        setCopiedShareUrl(item.title);
        setTimeout(() => setCopiedShareUrl(null), 3000);
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShareUrl(item.title);
      setTimeout(() => setCopiedShareUrl(null), 3000);
    }
  };

  const handleDownloadQRCode = async (projectTitle: string, url: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 1.5,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${projectTitle.toLowerCase().replace(/\s+/g, '_')}_qrcode.png`;
      link.click();
      triggerToast("High-density QR Code downloaded successfully!", "success");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to compile QR code image.", "alert");
    }
  };

  // Sync count of briefings from localStorage on mount and updates
  const syncBriefCount = () => {
    const data = localStorage.getItem('creativenode_briefs');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setBriefsCount(parsed.length);
      } catch (err) {
        setBriefsCount(0);
      }
    } else {
      setBriefsCount(0);
    }
  };

  // Global Keyboard listener for Cmd+N (Atelier Builder), Cmd+H (History spec ledger), and Esc
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // '?' key as help shortcut sheet trigger (unless focusing on an input, textarea or contenteditable element)
      if (e.key === '?') {
        const activeEl = document.activeElement;
        const isInput = activeEl && (
          activeEl.tagName === 'INPUT' || 
          activeEl.tagName === 'TEXTAREA' || 
          activeEl.hasAttribute('contenteditable')
        );
        if (!isInput) {
          e.preventDefault();
          setIsShortcutModalOpen(prev => !prev);
          return;
        }
      }

      // Cmd+N or Ctrl+N to open Atelier Builder
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (user) {
          setActiveTab('atelier');
          triggerToast("Entering Atelier Custom Canvas Page", "info");
        } else {
          setIsAuthPortalOpen(true);
          triggerToast("Please authenticate to access the Atelier", "info");
        }
      }
      
      // Cmd+H or Ctrl+H to switch to History spec ledger
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        const el = document.getElementById('briefs-record-ledger');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      // Ctrl+S / Cmd+S -> triggers portfolio share / copy if modal is open, or atelier-saved
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (viewingProjectRef.current) {
          handleShareProject(e as any, viewingProjectRef.current);
        } else {
          window.dispatchEvent(new Event('atelier-trigger-save'));
        }
      }

      // Ctrl+E / Cmd+E -> triggers 'atelier-trigger-export'
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        window.dispatchEvent(new Event('atelier-trigger-export'));
      }

      // Left & Right arrow keys to switch between viewing projects in detail modal
      if (viewingProjectRef.current) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const currentIndex = postersRef.current.findIndex(p => p.id === viewingProjectRef.current?.id);
          if (currentIndex !== -1) {
            const nextIndex = (currentIndex + 1) % postersRef.current.length;
            setViewingProject(postersRef.current[nextIndex]);
          }
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const currentIndex = postersRef.current.findIndex(p => p.id === viewingProjectRef.current?.id);
          if (currentIndex !== -1) {
            const prevIndex = (currentIndex - 1 + postersRef.current.length) % postersRef.current.length;
            setViewingProject(postersRef.current[prevIndex]);
          }
        }
      }

      // Esc to clear search query or selected keyword or close menu or close project detail modal
      if (e.key === 'Escape') {
        if (isShortcutModalOpenRef.current) {
          setIsShortcutModalOpen(false);
        } else if (viewingProjectRef.current) {
          setViewingProject(null);
        } else {
          setSearchQuery('');
          setSelectedKeyword(null);
          setMobileMenuOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => {
      window.removeEventListener('keydown', handleGlobalShortcuts);
    };
  }, []);

  // Sync saved bookmarks list and local storage parameters
  const syncCollections = () => {
    const data = localStorage.getItem('creativenode_my_collections');
    if (data) {
      try {
        setCollections(JSON.parse(data));
      } catch (err) {}
    } else {
      setCollections([]);
    }
  };

  useEffect(() => {
    syncCollections();
    
    // Listen for custom bookmark sync event triggers
    const handleBookmarkSync = () => syncCollections();
    window.addEventListener('creativenode-collections-sync', handleBookmarkSync);
    
    const savedTheme = localStorage.getItem('creativenode_global_theme');
    if (savedTheme && THEME_STYLES[savedTheme]) {
      setAppTheme(savedTheme);
    }
    
    return () => {
      window.removeEventListener('creativenode-collections-sync', handleBookmarkSync);
    };
  }, []);

  // Synchronize batchSelectedIds with the collections whenever collections change
  useEffect(() => {
    setBatchSelectedIds(collections);
  }, [collections]);

  // Global Dynamic Style Theme Injection to override CSS custom variables cleanly
  useEffect(() => {
    const activeStyle = THEME_STYLES[appTheme] || THEME_STYLES['modernist'];
    const root = document.documentElement;
    
    root.style.setProperty('--color-zinc-950', activeStyle.bg);
    root.style.setProperty('--color-zinc-900', activeStyle.cardBg);
    root.style.setProperty('--color-zinc-850', activeStyle.cardBorder);
    root.style.setProperty('--color-zinc-800', activeStyle.border);
    root.style.setProperty('--color-zinc-500', activeStyle.textMuted);
    root.style.setProperty('--color-zinc-400', activeStyle.textMuted);
    root.style.setProperty('--color-zinc-300', activeStyle.text);
    root.style.setProperty('--color-zinc-100', activeStyle.text);
    root.style.setProperty('--color-white', activeStyle.text);
    root.style.setProperty('--color-gold-500', activeStyle.accent);
    root.style.setProperty('--color-gold-400', activeStyle.accent);

    if (activeStyle.isDark) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }

    document.body.style.backgroundColor = activeStyle.bg;
    document.body.style.color = activeStyle.text;
  }, [appTheme]);

  // Sync active user account tier when user is populated or changes
  useEffect(() => {
    if (user) {
      const savedTier = localStorage.getItem(`creativenode_user_tier_${user.uid}`);
      if (savedTier === 'pro' || savedTier === 'sovereign') {
        setUserTier(savedTier as any);
      } else {
        setUserTier('free');
        localStorage.setItem(`creativenode_user_tier_${user.uid}`, 'free');
      }
    } else {
      setUserTier('free');
    }
  }, [user]);

  const getDailyDesignCount = (): number => {
    if (!user) return 0;
    const today = new Date().toISOString().split('T')[0];
    const key = `creativenode_design_count_${user.uid}_${today}`;
    const count = localStorage.getItem(key);
    return count ? parseInt(count) : 0;
  };

  const getDailyLimit = (): number => {
    if (userTier === 'pro') return 5;
    if (userTier === 'sovereign') return Infinity;
    return 2; // Free
  };

  const recordExportInGallery = (project: any, format: 'PDF' | 'SVG' | 'TIFF') => {
    try {
      const existing = localStorage.getItem('creativenode_export_gallery');
      const list = existing ? JSON.parse(existing) : [];
      
      const composition = {
        title: project.title || "Untitled Masterpiece",
        subtitle: project.subtitle || "Atelier specifications",
        details: project.details || "",
        bgType: project.bgType || "color",
        bgValue: project.bgValue || "#000000",
        align: project.align || "center",
        accentColor: project.accentColor || project.accent || "#eca115",
        textColor: project.textColor || "#ffffff",
        fontTitle: project.fontTitle || "Space Grotesk",
        fontSubtitle: project.fontSubtitle || "Inter",
        geometricElement: project.geometricElement || "circle",
        showQrOnCanvas: !!project.showQrOnCanvas
      };

      const newRecord = {
        id: 'export-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        timestamp: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true, month: 'short', day: 'numeric', year: 'numeric' }),
        title: project.title,
        bgValue: project.bgValue,
        format: format,
        size: format === 'PDF' ? 'A4 Blueprint Detail PDF' : format === 'SVG' ? 'A3 Continuous Vector' : 'Lossless TIFF Master Press',
        composition: composition
      };

      localStorage.setItem('creativenode_export_gallery', JSON.stringify([newRecord, ...list].slice(0, 20)));
      window.dispatchEvent(new Event('creativenode-exports-sync'));
    } catch (e) {
      console.error("Failed to commit export record in App.tsx", e);
    }
  };

  const handleIncrementDesignCount = (): boolean => {
    if (!user) return false;
    const today = new Date().toISOString().split('T')[0];
    const key = `creativenode_design_count_${user.uid}_${today}`;
    const count = getDailyDesignCount();
    const limit = getDailyLimit();
    
    if (count >= limit) {
      return false; // Limit bounds exceeded! Block.
    }
    
    localStorage.setItem(key, String(count + 1));
    setBriefsUpdateTrigger(prev => prev + 1); // trigger state sync refreshes
    return true;
  };

  const handleSaveToCollection = (e: React.MouseEvent, projectId: string, title: string) => {
    e.stopPropagation();
    const data = localStorage.getItem('creativenode_my_collections');
    let ids: string[] = [];
    if (data) {
      try {
        ids = JSON.parse(data);
      } catch (err) {}
    }
    
    if (ids.includes(projectId)) {
      triggerToast(`"${title}" is already bookmarked!`, "info");
      return;
    }
    
    ids.push(projectId);
    localStorage.setItem('creativenode_my_collections', JSON.stringify(ids));
    setCollections(ids);
    
    // Dispatch a custom sync event across profile frame context
    window.dispatchEvent(new Event('creativenode-collections-sync'));
    triggerToast(`Saved "${title}" to your Collections list!`, "success");
  };

  useEffect(() => {
    syncBriefCount();
    
    // Smooth scroll offset adjustment if any elements are triggered
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const handleBriefAdded = () => {
    // Increment update trigger to notify BriefingDashboard to reload
    setBriefsUpdateTrigger(prev => prev + 1);
    syncBriefCount();
  };

  // Triggers template customization
  const handleLoadTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    
    if (user) {
      setActiveTab('atelier');
      triggerToast("Preset loaded into Atelier Studio canvas.", "success");
    } else {
      setIsAuthPortalOpen(true);
      triggerToast("Please authenticate to customize presets.", "info");
    }
  };

  const handleShareToInstagram = async (project: PosterTemplate) => {
    setIsGeneratingInstagram(project.id);
    triggerToast("Generating 9:16 Instagram Story image...", "info");

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get 2D context");

      // Draw background
      const baseBg = project.bgType === 'color' ? project.bgValue : '#0d0d0d';
      ctx.fillStyle = baseBg;
      ctx.fillRect(0, 0, 1080, 1920);

      // Attempt to load background image if it is an image type
      if (project.bgType === 'image' && project.bgValue) {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        
        const loadImg = new Promise<boolean>((resolve) => {
          bgImg.onload = () => resolve(true);
          bgImg.onerror = () => resolve(false);
          // Auto timeout in 1000ms
          setTimeout(() => resolve(false), 1000);
        });

        bgImg.src = project.bgValue;
        const success = await loadImg;
        if (success) {
          // Draw image centered (and cover-scaled)
          const imgRatio = bgImg.width / bgImg.height;
          const canvasRatio = 1080 / 1920;
          let drawW = 1080;
          let drawH = 1920;
          let offsetX = 0;
          let offsetY = 0;

          if (imgRatio > canvasRatio) {
            drawW = 1920 * imgRatio;
            offsetX = (1080 - drawW) / 2;
          } else {
            drawH = 1080 / imgRatio;
            offsetY = (1920 - drawH) / 2;
          }

          ctx.drawImage(bgImg, offsetX, offsetY, drawW, drawH);
          
          // Draw dark translucent overlay over the background image
          ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
          ctx.fillRect(0, 0, 1080, 1920);
        }
      }

      // Add a nice grain effect overlay
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      for (let i = 0; i < 10000; i++) {
        const x = Math.random() * 1080;
        const y = Math.random() * 1920;
        ctx.fillRect(x, y, 2, 2);
      }

      // Draw a gold/accent double-line frame
      ctx.strokeStyle = project.accentColor || '#d4af37';
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 40, 1000, 1840);
      
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(55, 55, 970, 1810);

      // Draw top branding info
      ctx.fillStyle = project.textColor || '#ffffff';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("CREATIVENODE CO. PORTFOLIO", 540, 120);

      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = '16px monospace';
      ctx.fillText("ATELIER DESIGN SPECIFICATION // V3", 540, 150);

      // Draw middle geometric vector shapes
      const accent = project.accentColor || '#d4af37';
      ctx.strokeStyle = accent;
      ctx.fillStyle = accent + '10'; // 10 is hex transparency ~6%
      ctx.lineWidth = 4;
      ctx.beginPath();
      
      const geom = (project.geometricElement || 'circle').toLowerCase();
      if (geom === 'square') {
        const size = 380;
        ctx.rect(540 - size/2, 850 - size/2, size, size);
        ctx.fill();
        ctx.stroke();
      } else if (geom === 'triangle') {
        ctx.moveTo(540, 850 - 200);
        ctx.lineTo(540 + 200, 850 + 160);
        ctx.lineTo(540 - 200, 850 + 160);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Circle default
        ctx.arc(540, 850, 200, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Draw dynamic crosshair grid around the center shape for Swiss engineering style
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, 850);
      ctx.lineTo(980, 850);
      ctx.moveTo(540, 400);
      ctx.lineTo(540, 1300);
      ctx.stroke();

      // Lower text center block
      const alignVal = (project.align || 'center').toLowerCase();
      const textX = alignVal === 'left' ? 120 : alignVal === 'right' ? 960 : 540;
      ctx.textAlign = alignVal as CanvasTextAlign;

      // Subtitle
      ctx.fillStyle = accent;
      ctx.font = 'bold 32px monospace';
      ctx.fillText((project.subtitle || "").toUpperCase(), textX, 1220);

      // Title
      ctx.fillStyle = '#ffffff';
      const isSerif = project.fontTitle === 'Playfair Display';
      ctx.font = `bold 64px ${isSerif ? 'Georgia, serif' : '"Space Grotesk", sans-serif'}`;
      ctx.fillText(project.title, textX, 1310);

      // Divider line
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (alignVal === 'left') {
        ctx.moveTo(120, 1350);
        ctx.lineTo(450, 1350);
      } else if (alignVal === 'right') {
        ctx.moveTo(630, 1350);
        ctx.lineTo(960, 1350);
      } else {
        ctx.moveTo(390, 1350);
        ctx.lineTo(690, 1350);
      }
      ctx.stroke();

      // Details text
      ctx.fillStyle = project.textColor || "rgba(255, 255, 255, 0.75)";
      ctx.font = '30px Georgia, serif';
      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, currentY);
        return currentY;
      };

      const rawDetails = project.details || "A premium, hand-crafted layout aligned with Swiss modular grids, displaying geometric balance.";
      wrapText(rawDetails, textX, 1420, 780, 42);

      // Draw bottom stamp
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Licensed Preset: ${project.theme.toUpperCase()}_v3  |  Ident: #${project.id.slice(0, 8).toUpperCase()}`, 540, 1720);
      ctx.fillText(`© 2026 CREATIVENODE STUDIO. ALL RIGHTS PRESERVED.`, 540, 1760);

      if (project.badge) {
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(540 - 150, 180, 300, 50);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1;
        ctx.strokeRect(540 - 150, 180, 300, 50);
        ctx.fillStyle = accent;
        ctx.font = 'bold 20px monospace';
        ctx.fillText(project.badge.toUpperCase(), 540, 212);
      }

      // Convert to image data URL and trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `instagram_story_${project.title.toLowerCase().replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();

      triggerToast("Instagram Story ready! High-res 9:16 portrait image downloaded.", "success");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to compile Instagram story image asset.", "alert");
    } finally {
      setIsGeneratingInstagram(null);
    }
  };

  const generatePDFObject = (project: PosterTemplate): jsPDF => {
    const doc = new jsPDF();
    
    // Brand Protection Watermark diagonally across center of A4 sheet
    doc.setTextColor(242, 242, 242); // very subtle light gray
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(24);
    doc.text("CREATIVENODE STUDIO - PRO BLUEPRINT", 105, 142, { align: "center", angle: 315 });

    // Header Banner Design with geometric elements
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, 210, 48, 'F');
    
    // Red Accent Border
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1);
    doc.line(15, 48, 195, 48);
    
    // Title
    doc.setTextColor(212, 175, 55); // Gold Accent
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("CREATIVENODE CO. PORTFOLIO", 15, 22);
    
    doc.setTextColor(180, 180, 180);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text("SPECIFICATION SHEET FOR LICENSED PRESET SYSTEM", 15, 32);
    doc.text("RELEASE REPLICA: ORIGINAL ARTWORK BLUEPRINTS", 15, 38);
    doc.text(`Ident: #${project.id.slice(0, 8).toUpperCase()}`, 155, 22);
    doc.text(`SPEC VERSION: 2.10`, 155, 32);
    
    // SECTION 1: Narrative & Brand Profile
    doc.setTextColor(30, 30, 30);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.text("1. CONCEPT PRESET PROFILE", 15, 62);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10.5);
    doc.text(`Project Concept Name:  ${project.title}`, 15, 72);
    doc.text(`Subheading Branding:   ${project.subtitle}`, 15, 79);
    doc.text(`Backdrop Source Style: ${project.bgType.toUpperCase()} reference style`, 15, 86);
    doc.text(`Creative Category:     ${project.category.toUpperCase()} category`, 15, 93);
    doc.text(`Symphony Match Theme:  ${project.theme || 'Modular'} System`, 15, 100);
    
    // Divider line
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(15, 108, 195, 108);
    
    // SECTION 2: Layout & Typography Specs
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.text("2. TYPOGRAPHIC SPECIFICATIONS & COLOR WAY", 15, 120);
    
    doc.setFont("Helvetica", "normal");
    doc.text(`Title Hierarchy Font:   ${project.fontTitle || 'Space Grotesk'}`, 15, 130);
    doc.text(`Body/Secondary Font:    ${project.fontSubtitle || 'Inter'}`, 15, 137);
    doc.text(`Colorway Palette:       Accent: ${project.accentColor} | General: ${project.textColor}`, 15, 144);
    doc.text(`Geometric Accent:       ${project.geometricElement || 'circle'} positioning vector`, 15, 151);
    doc.text(`Selected Tag Index:     ${(project.keywords || []).join(', ').toLowerCase()}`, 15, 158);
    
    // Abstract wrapping
    doc.text("Aesthetic Narrative & Composition Details:", 15, 168);
    doc.setFont("Helvetica", "oblique");
    const summarySplit = doc.splitTextToSize(project.details, 175);
    doc.text(summarySplit, 15, 176);
    
    // Section dividor
    doc.setFont("Helvetica", "normal");
    doc.line(15, 202, 195, 202);
    
    // SECTION 3: Licensing & Production Rules
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("3. PRODUCTION SPECIFICATIONS & INTELLECTUAL COMPLIANCE", 15, 212);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text("Exact reproduction matching 300DPI physical vector offset formats is guaranteed by Atelier exports.", 15, 222);
    doc.text("This blueprint spec is licensed exclusively for brand campaigns and authorized client releases.", 15, 228);
    doc.text("Compiled and distributed automatically by CreativeNode Poster Studio.", 15, 234);
    
    // Footer border line
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.7);
    doc.line(15, 250, 195, 250);
    
    doc.setFont("Helvetica", "oblique");
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    doc.text("This specification layout is generated under secure creative systems. Exact print matches guaranteed.", 15, 258);
    doc.text("Developed by CreativeNode Atelier. © All rights reserved. Registered to https://ai.studio/build", 15, 263);
    
    return doc;
  };

  const handleExportPortfolioProjectPDF = async (project: PosterTemplate) => {
    setExportState('generating');
    setExportType('PDF');
    setExportProgress(15);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    setExportProgress(45); // Allocation and setup
    
    await new Promise(resolve => setTimeout(resolve, 350));
    setExportProgress(75); // Layout rendering & watermarking
    
    await new Promise(resolve => setTimeout(resolve, 200));
    setExportProgress(100); // Final streamline saving

    try {
      const doc = generatePDFObject(project);
      doc.save(`project_${project.title.toLowerCase().replace(/\s+/g, '_')}_specs.pdf`);
      recordExportInGallery(project, 'PDF');
    } catch (err) {
      console.error(err);
      triggerToast("Failed to compile layout PDF data.", "alert");
    } finally {
      setTimeout(() => {
        setExportState('idle');
        setExportType(null);
        setExportProgress(0);
      }, 500);
    }
  };

  const handleBatchPrintMultiPagePDF = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      triggerToast("Please select at least one project to batch print.", "alert");
      return;
    }
    triggerToast("Compiling multi-page printable master layout PDF...", "info");
    
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        let addedFirst = false;
        
        selectedIds.forEach((id) => {
          const project = posters.find(p => p.id === id) || PORTFOLIO_PRESETS.find(p => p.id === id);
          if (!project) return;
          
          if (addedFirst) {
            doc.addPage();
          } else {
            addedFirst = true;
          }
          
          // Brand protection watermark
          doc.setTextColor(245, 245, 245);
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(22);
          doc.text("CREATIVENODE PORTFOLIO SYSTEM", 105, 142, { align: "center", angle: 315 });
          
          // Header Banner Design with geometric elements
          doc.setFillColor(15, 15, 15);
          doc.rect(0, 0, 210, 48, "F");
          
          // Accent Border line
          doc.setDrawColor(212, 175, 55);
          doc.setLineWidth(1);
          doc.line(15, 48, 195, 48);
          
          // Title
          doc.setTextColor(212, 175, 55); 
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(22);
          doc.text("CREATIVENODE CO. PORTFOLIO", 15, 22);
          
          doc.setTextColor(180, 180, 180);
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(9);
          doc.text("SPECIFICATION SHEET FOR LICENSED PRESET SYSTEM", 15, 32);
          doc.text("A4 HIGH-RESOLUTION PRINT GRAPHICS REPLICA", 15, 38);
          doc.text(`Ident: #${project.id.slice(0, 8).toUpperCase()}`, 155, 22);
          doc.text(`SPEC VERSION: 2.10`, 155, 32);
          
          // SECTION 1: Profile info
          doc.setTextColor(30, 30, 30);
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(13);
          doc.text("1. CONCEPT PRESET PROFILE", 15, 62);
          
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(10.5);
          doc.text(`Project Concept Name:  ${project.title}`, 15, 72);
          doc.text(`Subheading Branding:   ${project.subtitle}`, 15, 79);
          doc.text(`Backdrop Source Style: ${project.bgType.toUpperCase()} reference style`, 15, 86);
          doc.text(`Creative Category:     ${project.category.toUpperCase()} category`, 15, 93);
          doc.text(`Symphony Match Theme:  ${project.theme || "Modular"} System`, 15, 100);
          
          // Divider
          doc.setDrawColor(230, 230, 230);
          doc.setLineWidth(0.5);
          doc.line(15, 108, 195, 108);
          
          // SECTION 2
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(13);
          doc.text("2. TYPOGRAPHIC SPECIFICATIONS & COLOR WAY", 15, 120);
          
          doc.setFont("Helvetica", "normal");
          doc.text(`Title Hierarchy Font:   ${project.fontTitle || "Space Grotesk"}`, 15, 130);
          doc.text(`Body/Secondary Font:    ${project.fontSubtitle || "Inter"}`, 15, 137);
          doc.text(`Colorway Palette:       Accent: ${project.accentColor} | General: ${project.textColor}`, 15, 144);
          doc.text(`Geometric Accent:       ${project.geometricElement || "circle"} positioning vector`, 15, 151);
          
          doc.text("Aesthetic Narrative & Composition Details:", 15, 161);
          doc.setFont("Helvetica", "oblique");
          const summarySplit = doc.splitTextToSize(project.details || "Spec details template reference.", 175);
          doc.text(summarySplit, 15, 170);
          
          // Divider
          doc.setFont("Helvetica", "normal");
          doc.line(15, 202, 195, 202);
          
          // SECTION 3
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(12);
          doc.text("3. PRODUCTION SPECIFICATIONS & INTELLECTUAL COMPLIANCE", 15, 212);
          
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(9.5);
          doc.text("Exact reproduction matching 300DPI physical vector offset formats is guaranteed by Atelier exports.", 15, 222);
          doc.text("This blueprint spec is licensed exclusively for brand campaigns and authorized client releases.", 15, 228);
          doc.text("Compiled and distributed automatically by CreativeNode Poster Studio.", 15, 234);
          
          // Footer
          doc.setDrawColor(212, 175, 55);
          doc.setLineWidth(0.7);
          doc.line(15, 250, 195, 250);
          
          doc.setFont("Helvetica", "oblique");
          doc.setFontSize(8.5);
          doc.setTextColor(120, 120, 120);
          doc.text(`Page #${doc.getNumberOfPages()} | Multi-page Batch Print layout. All rights reserved.`, 15, 258);
          doc.text("Developed by CreativeNode Atelier. Registered to https://ai.studio/build", 15, 263);
        });
        
        doc.save(`creativenode_batch_print_catalog_${selectedIds.length}_posters.pdf`);
        triggerToast(`Successfully compiled & downloaded dynamic multi-page printable PDF containing ${selectedIds.length} posters!`, "success");
      } catch (e) {
        console.error("Batch print pdf generation failed:", e);
        triggerToast("Failed to compile multi-page PDF.", "alert");
      }
    }, 1500);
  };

  const adjustColorBrightness = (hex: string, percent: number): string => {
    // If shorthand hex, convert to standard full hex
    let cleanHex = hex;
    if (hex.length === 4) {
      cleanHex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    let R = parseInt(cleanHex.substring(1, 3), 16) || 0;
    let G = parseInt(cleanHex.substring(3, 5), 16) || 0;
    let B = parseInt(cleanHex.substring(5, 7), 16) || 0;

    R = Math.max(0, Math.min(255, R + (R * percent) / 100));
    G = Math.max(0, Math.min(255, G + (G * percent) / 100));
    B = Math.max(0, Math.min(255, B + (B * percent) / 100));

    const rHex = Math.round(R).toString(16).padStart(2, '0');
    const gHex = Math.round(G).toString(16).padStart(2, '0');
    const bHex = Math.round(B).toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  };

  const generateSVGContent = (project: PosterTemplate): string => {
    const bgFill = project.bgType === 'color' ? project.bgValue : '#15151a';
    const textX = project.align === 'center' ? '50%' : project.align === 'right' ? '90%' : '10%';
    const textAnchor = project.align === 'center' ? 'middle' : project.align === 'right' ? 'end' : 'start';
    const accent = project.accentColor || '#D4AF37';
    const textCol = project.textColor || '#ffffff';
    
    return `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1500" width="100%" height="100%">
  <rect width="1200" height="1500" fill="${bgFill}" />
  <g opacity="0.15">
    <circle cx="600" cy="750" r="500" fill="none" stroke="${accent}" stroke-width="2" />
    <line x1="100" y1="750" x2="1100" y2="750" stroke="${accent}" stroke-dasharray="10,10" />
    <line x1="600" y1="100" x2="600" y2="1400" stroke="${accent}" stroke-dasharray="10,10" />
  </g>
  <text x="${textX}" y="400" fill="${accent}" font-family="monospace" font-size="28" letter-spacing="8" text-anchor="${textAnchor}">${project.subtitle.toUpperCase()}</text>
  <text x="${textX}" y="520" fill="${textCol}" font-family="Helvetica, Arial, sans-serif" font-weight="bold" font-size="64" text-anchor="${textAnchor}">${project.title}</text>
  <rect x="50" y="1300" width="1100" height="2" fill="${accent}" opacity="0.3" />
  <text x="100" y="1360" fill="${textCol}" font-family="monospace" font-size="20" opacity="0.6">CREATIVENODE STUDIO SPECS ®2026</text>
  <text x="1100" y="1360" fill="${accent}" font-family="monospace" font-size="20" text-anchor="end">CODE: #${project.id.slice(0, 8).toUpperCase()}</text>
</svg>`;
  };

  const generateTIFFContent = (project: PosterTemplate): Uint8Array => {
    const header = new Uint8Array([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00]);
    const tiff = new Uint8Array(300);
    tiff.set(header, 0);
    const tags = new Uint8Array([
      0x02, 0x00,
      0x00, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0xB0, 0x04, 0x00, 0x00,
      0x01, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0xDC, 0x05, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00
    ]);
    tiff.set(tags, 8);
    const textSpecs = `TIFF EXPORT DETAILS\nTitle: ${project.title}\nTheme: ${project.theme}\nBackground color: ${project.bgValue}\nAccent color: ${project.accentColor}\nText color: ${project.textColor}`;
    const textBytes = new TextEncoder().encode(textSpecs);
    tiff.set(textBytes, 8 + tags.length);
    return tiff;
  };

  const getDominantColorsForPoster = (project: PosterTemplate) => {
    const bg = project.bgType === 'color' ? project.bgValue : '#15151a';
    const accent = project.accentColor || '#D4AF37';
    const text = project.textColor || '#ffffff';
    
    const c4 = accent === '#D4AF37' ? '#AA7C11' : adjustColorBrightness(accent, -18);
    const c5 = bg === '#15151a' || bg === 'color' ? '#2d2d38' : adjustColorBrightness(bg, 25);

    return [
      { hex: bg.toUpperCase(), name: 'Primary Canvas Background' },
      { hex: accent.toUpperCase(), name: 'Main Spectral Color Accent' },
      { hex: text.toUpperCase(), name: 'Secondary Typographic Value' },
      { hex: c4.toUpperCase(), name: 'Coordinating Shadow Tint' },
      { hex: c5.toUpperCase(), name: 'Analogous Studio Contrast' }
    ];
  };

  const [isDownloadingBundle, setIsDownloadingBundle] = useState(false);

  const handleDownloadAssetBundle = async (project: PosterTemplate) => {
    setIsDownloadingBundle(true);
    triggerToast(`Composing high-fidelity asset archive (PDF, SVG, TIFF) for "${project.title}"...`, "info");
    
    try {
      const zip = new JSZip();
      
      // 1. Generate PDF
      const pdfDoc = generatePDFObject(project);
      const pdfData = pdfDoc.output('arraybuffer');
      zip.file(`${project.title} - Specs Sheet.pdf`, pdfData);
      
      // 2. Generate SVG
      const svgContent = generateSVGContent(project);
      zip.file(`${project.title} - Vector Master.svg`, svgContent);
      
      // 3. Generate TIFF
      const tiffContent = generateTIFFContent(project);
      zip.file(`${project.title} - High-Res Raster.tiff`, tiffContent);
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_full_assets_bundle.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      triggerToast(`Assets archive downloaded successfully!`, "success");
    } catch (err) {
      console.error(err);
      triggerToast(`Failed to package high-fidelity asset archive.`, "alert");
    } finally {
      setIsDownloadingBundle(false);
    }
  };

  const handleBatchExportZIP = async () => {
    if (batchSelectedIds.length === 0) return;
    setBatchExportState('generating');
    setBatchExportProgress(10);

    try {
      const zip = new JSZip();
      const total = batchSelectedIds.length;

      for (let i = 0; i < total; i++) {
        const id = batchSelectedIds[i];
        const project = posters.find(p => p.id === id) || PORTFOLIO_PRESETS.find(p => p.id === id);
        if (project) {
          const doc = generatePDFObject(project);
          const pdfData = doc.output('arraybuffer');
          const cleanTitle = project.title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
          zip.file(`${cleanTitle}_specs.pdf`, pdfData);
        }
        
        // Progress update
        const progress = Math.round(((i + 1) / total) * 90);
        setBatchExportProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      setBatchExportProgress(95);
      const content = await zip.generateAsync({ type: 'blob' });
      setBatchExportProgress(100);

      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `creativenode_collection_batch_export.zip`;
      link.click();
      triggerToast(`Batch export successful! Compiled ${total} specifications into ZIP.`, "success");
    } catch (err) {
      console.error("Batch ZIP export failed:", err);
      triggerToast("Failed to compile collection ZIP archive.", "alert");
    } finally {
      setTimeout(() => {
        setBatchExportState('idle');
        setBatchExportProgress(0);
      }, 650);
    }
  };

  const handleDownloadRecentlyViewedZIP = async () => {
    if (recentlyViewed.length === 0) return;
    try {
      triggerToast("Preparing batch zip of recently viewed poster specifications...", "info");
      const zip = new JSZip();
      
      recentlyViewed.forEach((project) => {
        try {
          const doc = generatePDFObject(project);
          const pdfData = doc.output('arraybuffer');
          const cleanTitle = project.title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
          zip.file(`recent_${cleanTitle}_specs.pdf`, pdfData);
        } catch (e) {
          console.error(`Failed to package recently viewed copy: ${project.title}`, e);
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `recently_viewed_architectures.zip`;
      link.click();
      triggerToast(`Batch export successful! Bundled ${recentlyViewed.length} specs into ZIP package.`, "success");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to compile recently viewed ZIP package.", "alert");
    }
  };

  const handleExportPortfolioProjectSVG = async (project: PosterTemplate) => {
    setExportState('generating');
    setExportType('SVG');
    setExportProgress(15);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    setExportProgress(45); // compiling XML vector geometry
    
    await new Promise(resolve => setTimeout(resolve, 350));
    setExportProgress(80); // embedding sRGB colorways
    
    await new Promise(resolve => setTimeout(resolve, 200));
    setExportProgress(100); // generating blob and initiating download

    try {
      const alignVal = (project.align || 'center').toLowerCase();
      const textX = alignVal === 'left' ? 100 : alignVal === 'right' ? 980 : 540;
      const textAnchor = alignVal === 'left' ? 'start' : alignVal === 'right' ? 'end' : 'middle';
      
      const accent = project.accentColor || '#d4af37';
      const textColor = project.textColor || '#ffffff';
      
      let geomMarkup = '';
      const geom = (project.geometricElement || 'circle').toLowerCase();
      if (geom === 'square') {
        geomMarkup = `<rect x="350" y="650" width="380" height="380" stroke="${accent}" stroke-width="4" fill="${accent}" fill-opacity="0.06" />`;
      } else if (geom === 'triangle') {
        geomMarkup = `<polygon points="540,650 740,1010 340,1010" stroke="${accent}" stroke-width="4" fill="${accent}" fill-opacity="0.06" />`;
      } else if (geom === 'lines') {
        geomMarkup = `
          <g stroke="${accent}" stroke-width="4">
            <line x1="200" y1="850" x2="880" y2="850" />
            <line x1="300" y1="750" x2="780" y2="750" stroke-opacity="0.5" stroke-width="2" />
            <line x1="400" y1="950" x2="680" y2="950" stroke-opacity="0.5" stroke-width="2" />
          </g>
        `;
      } else if (geom === 'grid') {
        geomMarkup = `
          <g stroke="${accent}" stroke-width="1.5" stroke-opacity="0.3">
            <line x1="340" y1="650" x2="340" y2="1050" />
            <line x1="440" y1="650" x2="440" y2="1050" />
            <line x1="540" y1="650" x2="540" y2="1050" />
            <line x1="640" y1="650" x2="640" y2="1050" />
            <line x1="740" y1="650" x2="740" y2="1050" />
            <line x1="340" y1="750" x2="740" y2="750" />
            <line x1="340" y1="850" x2="740" y2="850" />
            <line x1="340" y1="950" x2="740" y2="950" />
          </g>
        `;
      } else { // circle
        geomMarkup = `<circle cx="540" cy="850" r="200" stroke="${accent}" stroke-width="4" fill="${accent}" fill-opacity="0.06" />`;
      }
 
      const isSerif = project.fontTitle === 'Playfair Display';
      const fontTitleFamily = isSerif ? 'Georgia, serif' : 'system-ui, sans-serif';
 
      const svgString = `<?xml version="1.0" encoding="utf-8"?>
<!-- CreativeNode Scalable Vector Spec - sRGB Color Profile Compliant -->
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1080 1920" style="enable-background:new 0 0 1080 1920;" xml:space="preserve">
  <style type="text/css">
    .bg-rect { fill: ${project.bgType === 'color' ? project.bgValue : '#0d0d0d'}; }
    .title-text { font-family: ${fontTitleFamily}; font-size: 64px; font-weight: bold; fill: #ffffff; text-anchor: ${textAnchor}; }
    .subtitle-text { font-family: monospace; font-size: 32px; font-weight: bold; fill: ${accent}; text-anchor: ${textAnchor}; }
    .details-text { font-family: Georgia, serif; font-size: 28px; fill: ${textColor}; text-anchor: ${textAnchor}; opacity: 0.85; }
    .branding-text { font-family: monospace; font-size: 24px; font-weight: bold; fill: ${textColor}; text-anchor: middle; }
    .branding-sub { font-family: monospace; font-size: 16px; fill: ${textColor}; text-anchor: middle; opacity: 0.4; }
    .stamp-text { font-family: monospace; font-size: 20px; fill: #ffffff; text-anchor: middle; opacity: 0.3; }
  </style>
  
  <!-- Background -->
  <rect class="bg-rect" width="1080" height="1920" />
  
  ${project.bgType === 'image' && project.bgValue ? `
  <image href="${project.bgValue}" width="1080" height="1920" preserveAspectRatio="xMidYMid slice" opacity="0.55" />
  <rect width="1080" height="1920" fill="rgba(0,0,0,0.3)" />
  ` : ''}
 
  <!-- Structural Frames -->
  <rect x="40" y="40" width="1000" height="1840" fill="none" stroke="${accent}" stroke-width="3" />
  <rect x="55" y="55" width="970" height="1810" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.15" />
  
  <!-- Cross Grid -->
  <g stroke="#ffffff" stroke-width="2" stroke-opacity="0.07">
    <line x1="100" y1="850" x2="980" y2="850" />
    <line x1="540" y1="400" x2="540" y2="1300" />
  </g>
 
  <!-- Branding -->
  <text x="540" y="120" class="branding-text">CREATIVENODE CO. PORTFOLIO</text>
  <text x="540" y="150" class="branding-sub">ATELIER VECTOR SPECIFICATION // V3</text>
 
  <!-- Geometric Elements -->
  ${geomMarkup}
 
  <!-- Texts -->
  <text x="${textX}" y="1220" class="subtitle-text">${(project.subtitle || "").toUpperCase()}</text>
  <text x="${textX}" y="1310" class="title-text">${project.title}</text>
  
  <line x1="${alignVal === 'left' ? 120 : alignVal === 'right' ? 630 : 390}" y1="1350" x2="${alignVal === 'left' ? 450 : alignVal === 'right' ? 960 : 690}" y2="1350" stroke="#ffffff" stroke-width="2" stroke-opacity="0.15" />
 
  <!-- Details Text -->
  <text x="${textX}" y="1420" class="details-text">${project.details || "Swiss modular grids, displaying geometric balance."}</text>
 
  <!-- Bottom Stamp -->
  <text x="540" y="1720" class="stamp-text">Licensed Preset: ${project.theme.toUpperCase()}_v3  |  Ident: #${project.id.slice(0, 8).toUpperCase()}</text>
  <text x="540" y="1760" class="stamp-text">© 2026 CREATIVENODE STUDIO. ALL RIGHTS PRESERVED.</text>
 
  ${project.badge ? `
  <rect x="390" y="180" width="300" height="50" fill="rgba(255,255,255,0.08)" stroke="${accent}" stroke-width="1" />
  <text x="540" y="212" font-family="monospace" font-size="20" font-weight="bold" fill="${accent}" text-anchor="middle">${project.badge.toUpperCase()}</text>
  ` : ''}
</svg>`;
 
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_vector.svg`;
      link.click();
      recordExportInGallery(project, 'SVG');
      triggerToast("Vector SVG file exported successfully with high-contrast color standards.", "success");
    } catch (err) {
      console.error("SVG export err:", err);
      triggerToast("Failed to compile SVG vector data.", "alert");
    } finally {
      setTimeout(() => {
        setExportState('idle');
        setExportType(null);
        setExportProgress(0);
      }, 500);
    }
  };

  const handleExportPortfolioProjectTIFF = async (project: PosterTemplate) => {
    setExportState('generating');
    setExportType('TIFF');
    setExportProgress(15);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    setExportProgress(45); // allocating 300dpi offscreen memory buffers
    
    await new Promise(resolve => setTimeout(resolve, 350));
    setExportProgress(75); // rasterizing background & geometry
    
    await new Promise(resolve => setTimeout(resolve, 200));
    setExportProgress(100); // outputting lossless raster format

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1440; // High-density print resolution 300 DPI scale
      canvas.height = 2560;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not construct 300DPI canvas context.");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill Background color or default obsidian
      const baseBg = project.bgType === 'color' ? project.bgValue : '#0d0d0d';
      ctx.fillStyle = baseBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (project.bgType === 'image' && project.bgValue) {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.src = project.bgValue;
        const hasLoaded = await new Promise<boolean>((resolve) => {
          bgImg.onload = () => resolve(true);
          bgImg.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 2000);
        });
        if (hasLoaded) {
          const imgRatio = bgImg.width / bgImg.height;
          const canvasRatio = canvas.width / canvas.height;
          let drawW = canvas.width;
          let drawH = canvas.height;
          let offsetX = 0;
          let offsetY = 0;

          if (imgRatio > canvasRatio) {
            drawW = canvas.height * imgRatio;
            offsetX = (canvas.width - drawW) / 2;
          } else {
            drawH = canvas.width / imgRatio;
            offsetY = (canvas.height - drawH) / 2;
          }
          ctx.drawImage(bgImg, offsetX, offsetY, drawW, drawH);
          ctx.fillStyle = "rgba(0, 0, 0, 0.45)"; // editorial dark overlay
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }

      // Border bounds
      const accent = project.accentColor || '#d4af37';
      ctx.strokeStyle = accent;
      ctx.lineWidth = 6;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

      // Geometric overlay
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      ctx.fillStyle = accent + '0c'; // 5% opacity
      const geom = (project.geometricElement || 'circle').toLowerCase();
      if (geom === 'square') {
        const size = 500;
        ctx.fillRect(canvas.width / 2 - size / 2, canvas.height / 2 - size / 2, size, size);
        ctx.strokeRect(canvas.width / 2 - size / 2, canvas.height / 2 - size / 2, size, size);
      } else if (geom === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2 - 270);
        ctx.lineTo(canvas.width / 2 + 250, canvas.height / 2 + 180);
        ctx.lineTo(canvas.width / 2 - 250, canvas.height / 2 + 180);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (geom === 'lines') {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 350, canvas.height / 2);
        ctx.lineTo(canvas.width / 2 + 350, canvas.height / 2);
        ctx.moveTo(canvas.width / 2 - 250, canvas.height / 2 - 100);
        ctx.lineTo(canvas.width / 2 + 250, canvas.height / 2 - 100);
        ctx.moveTo(canvas.width / 2 - 250, canvas.height / 2 + 100);
        ctx.lineTo(canvas.width / 2 + 250, canvas.height / 2 + 100);
        ctx.stroke();
      } else if (geom === 'grid') {
        ctx.strokeStyle = accent + '30';
        ctx.beginPath();
        for (let i = -3; i <= 3; i++) {
          ctx.moveTo(canvas.width / 2 + i * 100, canvas.height / 2 - 300);
          ctx.lineTo(canvas.width / 2 + i * 100, canvas.height / 2 + 300);
          ctx.moveTo(canvas.width / 2 - 300, canvas.height / 2 + i * 100);
          ctx.lineTo(canvas.width / 2 + 300, canvas.height / 2 + i * 100);
        }
        ctx.stroke();
      } else { // circle
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 250, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Title & typography aligned options
      const alignVal = (project.align || 'center').toLowerCase();
      const textX = alignVal === 'left' ? 140 : alignVal === 'right' ? canvas.width - 140 : canvas.width / 2;
      ctx.textAlign = alignVal as CanvasTextAlign;

      ctx.fillStyle = accent;
      ctx.font = 'bold 36px monospace';
      ctx.fillText((project.subtitle || "").toUpperCase(), textX, canvas.height - 680);

      const isSerif = project.fontTitle === 'Playfair Display';
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold 80px ${isSerif ? 'Georgia, serif' : '"Space Grotesk", sans-serif'}`;
      ctx.fillText(project.title, textX, canvas.height - 580);

      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = '32px Georgia';
      ctx.fillText(project.details || "Swiss modular posters.", textX, canvas.height - 480);

      // Copyright & sRGB printing validation stamp
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`MAPPED COLOR-PROFILE: LOSSLESS sRGB CHROMA • PRINT DECK OK`, canvas.width / 2, canvas.height - 240);
      ctx.fillText(`© 2026 CREATIVENODE ATELIER INC. REPRODUCTION NOT PERMITTED WITHOUT AUTHENTIC LICENSE.`, canvas.width / 2, canvas.height - 200);

      // Fallback TIFF wrapping trigger
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${project.title.toLowerCase().replace(/\s+/g, '_')}_300dpi.tiff`, { type: 'image/tiff' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(file);
          link.download = file.name;
          link.click();
          recordExportInGallery(project, 'TIFF');
          triggerToast("lossless TIFF format downloaded! CMYK print compatibility profiles configured.", "success");
        }
      }, 'image/png');
    } catch (err) {
      console.error(err);
      triggerToast("Failed to compile lossless TIFF raster graphics.", "alert");
    } finally {
      setTimeout(() => {
        setExportState('idle');
        setExportType(null);
        setExportProgress(0);
      }, 500);
    }
  };

  // Triggers selection of single package tier in investment card which preloads in custom brief
  const handleSelectTier = (tierId: string) => {
    if (user) {
      setActiveTab('atelier');
      triggerToast(`Pre-loaded ${tierId.toUpperCase()} Tier framework in Studio.`, "success");
    } else {
      setIsAuthPortalOpen(true);
      triggerToast("Please authenticate to access the Studio.", "info");
    }
  };

  // Filtered portfolio presets with category, tag, and text search intersection logic
  const filteredPortfolio = (() => {
    let baseList = [...posters];
    if (adminPreviewPoster) {
      const idx = baseList.findIndex(p => p.id === adminPreviewPoster.id);
      if (idx > -1) {
        baseList[idx] = adminPreviewPoster;
      } else {
        baseList = [adminPreviewPoster, ...baseList];
      }
    }

    const filtered = baseList.filter(item => {
      const isCurrentlyPreviewed = adminPreviewPoster && adminPreviewPoster.id === item.id;
      const itemStatus = item.status || (item.archived ? 'Archived' : 'Live');
      
      // Hide archived/pending/draft items unless explicitly being previewed by the administrator
      if (itemStatus !== 'Live' && !isCurrentlyPreviewed) {
        return false;
      }
      if (item.archived && !isCurrentlyPreviewed) {
        return false;
      }

      // 1. Matches Category filter
      const matchesCategory = portfolioCategory === 'all' || item.category === portfolioCategory;
      
      // 2. Matches active Keyword badge filter
      const matchesKeyword = !selectedKeyword || (item.keywords && item.keywords.includes(selectedKeyword));
      
      // 3. Matches query input characters (title, subtitle, details, theme, and item keywords)
      const searchableBlock = `${item.title} ${item.subtitle} ${item.details} ${item.theme} ${(item.keywords || []).join(' ')}`.toLowerCase();
      const matchesSearch = !searchQuery || searchableBlock.includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesKeyword && matchesSearch;
    });

    // Apply sorting logic based on selected option
    return [...filtered].sort((a, b) => {
      if (portfolioSort === 'newest') {
        const dateA = a.dateCreated || '';
        const dateB = b.dateCreated || '';
        if (dateA && dateB) {
          return dateB.localeCompare(dateA);
        }
        if (dateA) return -1;
        if (dateB) return 1;
        return b.id.localeCompare(a.id);
      } else if (portfolioSort === 'alphabetical') {
        const catCompare = a.category.localeCompare(b.category);
        if (catCompare !== 0) return catCompare;
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      } else {
        // Pure A-Z alphabetical title order
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      }
    });
  })();

  // Dynamically compute suggested tags based on active category in portfolio section
  const suggestedTags = React.useMemo(() => {
    const list = posters.filter(p => portfolioCategory === 'all' || p.category === portfolioCategory);
    const tags = new Set<string>();
    list.forEach(p => {
      if (p.keywords) {
        p.keywords.forEach(k => tags.add(k));
      }
    });
    return Array.from(tags).slice(0, 10); // Limit to top 10 unique suggestions
  }, [posters, portfolioCategory]);

  // Rotating featured image in hero backdrops
  const [heroIndex, setHeroIndex] = useState(0);
  const featuredHeroItems = posters.slice(0, 4);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % featuredHeroItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // IntersectionObserver to auto-update activeTab based on scroll location
  useEffect(() => {
    const sections = [
      { id: 'top', tab: 'home' },
      { id: 'portfolio-section', tab: 'portfolio' },
      { id: 'services-section', tab: 'services' },
      { id: 'pricing-section', tab: 'investment' }
    ];

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -55% 0px', // Active triggers
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const matched = sections.find(s => s.id === entry.target.id);
          if (matched) {
            setActiveTab(matched.tab as any);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const activeStyle = THEME_STYLES[appTheme] || THEME_STYLES['modernist'];

  if (isInitialLoading) {
    return <LoadingScreen onComplete={() => setIsInitialLoading(false)} />;
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans relative selection:bg-gold-400 selection:text-black transition-colors duration-300">
      
      {/* Exquisite Vibe Style Adapter Style-Tag */}
      <style>{`
        :root {
          --background-color: ${activeStyle.bg} !important;
          --color-zinc-950: ${activeStyle.bg} !important;
          --color-zinc-900: ${activeStyle.cardBg} !important;
          --color-zinc-850: ${activeStyle.cardBorder} !important;
          --color-zinc-800: ${activeStyle.border} !important;
          --color-zinc-500: ${activeStyle.textMuted} !important;
          --color-zinc-400: ${activeStyle.textMuted} !important;
          --color-zinc-300: ${activeStyle.text} !important;
          --color-zinc-100: ${activeStyle.text} !important;
          --color-white: ${activeStyle.text} !important;
          --color-gold-500: ${activeStyle.accent} !important;
          --color-gold-400: ${activeStyle.accent} !important;
        }
        
        /* Direct class overrides for full-workspace theme adaptation */
        .min-h-screen, body {
          background-color: ${activeStyle.bg} !important;
          color: ${activeStyle.text} !important;
        }
        
        .bg-zinc-950, .bg-zinc-950\\/80 {
          background-color: ${activeStyle.bg} !important;
        }

        .bg-zinc-900, .bg-zinc-900\\/30, .bg-zinc-900\\/40, .bg-zinc-900\\/60 {
          background-color: ${activeStyle.cardBg} !important;
        }

        .border-zinc-900, .border-zinc-850, .border-zinc-800 {
          border-color: ${activeStyle.border} !important;
        }

        .text-white {
          color: ${activeStyle.text} !important;
        }

        .text-zinc-300, .text-zinc-400 {
          color: ${activeStyle.textMuted} !important;
        }

        .text-gold-400, .text-gold-500 {
          color: ${activeStyle.accent} !important;
        }

        /* Accent-colored highlights */
        header .bg-zinc-900 .text-gold-400 {
          color: ${activeStyle.accent} !important;
        }
      `}</style>

      {/* Decorative page layout grids */}
      <div className="absolute inset-y-0 left-12 w-[1px] bg-zinc-900/40 pointer-events-none hidden md:block" />
      <div className="absolute inset-y-0 right-12 w-[1px] bg-zinc-900/40 pointer-events-none hidden md:block" />

      {/* High-End Sticky Glassmorphism Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="h-9 w-9 bg-zinc-900 border border-gold-500/80 rounded-xl flex items-center justify-center font-bold font-display text-white text-base tracking-tighter group-hover:bg-gold-500 group-hover:text-black transition duration-300 shadow shadow-gold-500/10">
                C
              </div>
              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
            </div>
            <div className="text-left font-display">
              <span className="text-white font-extrabold text-sm md:text-base tracking-wider block">CREATIVENODE</span>
              <span className="text-zinc-500 text-[9px] font-mono tracking-widest block uppercase">Professional Poster Services</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-zinc-950/40 border border-zinc-900/90 px-2 py-1 rounded-full relative shadow-inner">
            {[
              { id: 'top', label: 'Home', icon: Compass, tab: 'home' },
              { id: 'portfolio-section', label: 'Portfolio', icon: Layers, tab: 'portfolio' },
              ...(user ? [{ id: 'atelier-tab', label: 'Studio', icon: Sparkles, tab: 'atelier' }] : []),
              { id: 'services-section', label: 'Services', icon: Award, tab: 'services' },
              { id: 'pricing-section', label: 'Investment', icon: Coins, tab: 'investment' }
            ].map((navLink) => {
              const Icon = navLink.icon;
              const isActive = activeTab === navLink.tab;
              return (
                <button
                  key={navLink.tab}
                  onClick={() => {
                    setActiveTab(navLink.tab as any);
                    if (navLink.tab !== 'crm') {
                      setTimeout(() => {
                        const el = document.getElementById(navLink.id);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 50);
                    }
                  }}
                  className={`relative px-4 py-1.5 rounded-full text-[10px] font-mono tracking-widest uppercase transition flex items-center gap-1.5 cursor-pointer select-none ${
                    isActive ? 'text-white font-bold bg-zinc-900/60 border border-zinc-800/80 shadow-md' : 'text-zinc-505 text-zinc-500 hover:text-zinc-355 hover:text-zinc-330 hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 transition duration-250 ${isActive ? 'text-gold-400' : 'text-zinc-650'}`} />
                  <span className="relative z-10">{navLink.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Custom CTA button */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setShowDesignPrinciples(true)}
              className="flex items-center gap-1 bg-zinc-900/65 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[9px] font-mono tracking-widest px-2 h-7 rounded-lg border border-zinc-850 hover:border-zinc-700 transition cursor-pointer select-none"
              title="Open Modernist design instruction academy"
            >
              <Info className="w-3 h-3 text-gold-400" />
              <span>PRINCIPLES</span>
            </button>

            {/* Global Theme dynamic switcher */}
            <div className="flex items-center gap-1 bg-zinc-900/60 px-2 h-7 rounded-lg border border-zinc-850 hover:border-zinc-750 transition text-[9px] font-mono text-zinc-400">
              <span className="text-[8.5px] text-zinc-550 uppercase select-none font-bold">Vibe:</span>
              <select
                value={appTheme}
                onChange={async (e) => {
                  const val = e.target.value;
                  setAppTheme(val);
                  localStorage.setItem('creativenode_global_theme', val);
                  triggerToast(`Style set to ${THEME_STYLES[val]?.name || val}`, "info");

                  // Theme is saved to localStorage only
                  // No cloud sync needed
                }}
                className="bg-transparent text-[9px] text-zinc-250 outline-none focus:outline-none font-bold pr-0.5 cursor-pointer select-none"
              >
                <option value="modernist" className="bg-zinc-950 text-zinc-400 font-mono text-xs">MODERNIST</option>
                <option value="brutalist" className="bg-zinc-950 text-zinc-400 font-mono text-xs">BRUTALIST</option>
                <option value="luxury" className="bg-zinc-950 text-zinc-400 font-mono text-xs">LUXURY</option>
              </select>
            </div>

            {/* Dynamic User Authentication status CTA triggers */}
            {userLoading ? (
              <div className="h-9 w-9 rounded-full bg-zinc-900/50 border border-zinc-900 animate-pulse" />
            ) : user ? (
              /* ADVANCED GATHERED PROFILE ICON WITH PORTRAIT FRAME AND LOGOUT TOGGLE */
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => {
                    setActiveTab('profile');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    triggerToast("Entering Sovereign Profile Ledger", "info");
                  }}
                  className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-805 hover:border-gold-500 bg-zinc-900 p-[2px] transition duration-300 focus:outline-none cursor-pointer"
                  title="Explore your profile collections"
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="User Avatar" 
                      className="h-full w-full rounded-full object-cover group-hover:scale-105 transition duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" 
                      alt="Modern Creator Portrait" 
                      className="h-full w-full rounded-full object-cover group-hover:scale-105 transition duration-300"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {/* Glowing Emerald Online Orb */}
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-zinc-950 bg-emerald-500 animate-pulse shadow-md" />
                </button>
                
                {/* Minimal text identification and direct lock out anchor */}
                <div className="flex flex-col text-left font-mono pr-1 select-none">
                  <span className="text-[9px] text-white font-bold leading-none tracking-wide truncate max-w-[80px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[7.5px] text-zinc-500 uppercase tracking-widest leading-none mt-0.5">Atelier Pro</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerToast("Sovereign Session cleanly terminated.", "info");
                  }}
                  className="h-7 w-7 rounded-lg border border-zinc-900 hover:border-red-500/15 bg-zinc-950 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 flex items-center justify-center transition cursor-pointer"
                  title="Lock Out"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthPortalOpen(true)}
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-gold-400 hover:text-gold-300 text-xs font-mono tracking-wide px-3.5 h-9 rounded-xl border border-zinc-900 hover:border-gold-900/20 transition cursor-pointer select-none"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>STUDIO PORTAL</span>
              </button>
            )}

            {briefsCount > 0 && (
              <a 
                href="#briefs-record-ledger"
                className="flex items-center gap-2 bg-gradient-to-r from-gold-950/40 to-zinc-900 border border-gold-900/40 h-9 px-3.5 rounded-xl text-[10.5px] font-mono text-gold-300"
              >
                <span>SPEC BRIEFS</span>
                <span className="bg-gold-500 text-black font-extrabold h-4.5 min-w-4.5 px-1 flex items-center justify-center rounded-full text-[9px]">
                  {briefsCount}
                </span>
              </a>
            )}
          </div>

          {/* Mobile hamburger */}
          <button 
            className="md:hidden text-zinc-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-900 bg-zinc-950/95 py-4 px-6 space-y-3 font-mono text-center col-span-full">
            {[
              { id: 'top', label: 'Home', tab: 'home' },
              { id: 'portfolio-section', label: 'Curated Portfolio', tab: 'portfolio' },
              ...(user ? [
                { id: 'atelier-tab', label: 'Interactive Atelier', tab: 'atelier' },
                { id: 'profile-tab', label: 'My Profile', tab: 'profile' }
              ] : []),
              { id: 'services-section', label: 'Services Catalog', tab: 'services' },
              { id: 'pricing-section', label: 'Investment Matrix', tab: 'investment' }
            ].map((link) => (
              <button
                key={link.tab}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveTab(link.tab as any);
                  if (link.tab !== 'crm') {
                    setTimeout(() => {
                      const el = document.getElementById(link.id);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 50);
                  }
                }}
                className="block w-full py-2.5 text-zinc-400 hover:text-white text-xs uppercase tracking-wider transition border-b border-zinc-900/30 select-none cursor-pointer"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <a
                href="https://wa.me/916369278905"
                target="_blank"
                rel="noreferrer"
                className="w-full text-center bg-gold-500 text-black py-2 rounded-lg text-xs font-semibold"
              >
                Direct WhatsApp Chat
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main id="top" className="relative">
        {activeTab === 'crm' && user && user.email === 'puspharaj.m2003@gmail.com' ? (
          <CrmPanel 
            posters={posters} 
            setPosters={setPosters} 
            triggerToast={triggerToast} 
            adminPreviewPoster={adminPreviewPoster}
            setAdminPreviewPoster={setAdminPreviewPoster}
            themeStyles={THEME_STYLES}
          />
        ) : activeTab === 'agency_portfolio' ? (
          <CreativenodePortfolio 
            onBack={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            triggerToast={triggerToast}
          />
        ) : activeTab === 'profile' ? (
          <UserProfileView 
            user={user}
            userTier={userTier}
            setUserTier={(tier) => {
              setUserTier(tier);
              if (user) {
                localStorage.setItem(`creativenode_user_tier_${user.uid}`, tier);
              }
            }}
            appTheme={appTheme}
            setAppTheme={(theme) => {
              setAppTheme(theme);
              localStorage.setItem('creativenode_global_theme', theme);
            }}
            themeStyles={THEME_STYLES}
            getDailyDesignCount={getDailyDesignCount}
            getDailyLimit={getDailyLimit}
            onViewProject={(project) => setViewingProject(project)}
            setActiveTab={setActiveTab}
            onProfileUpdate={() => {
              // Profile update handled locally
              setUser(prev => prev ? { ...prev } : prev);
            }}
            recentlyViewed={recentlyViewed}
            clearRecentlyViewed={() => {
              sessionStorage.removeItem('creativenode_recently_viewed');
              localStorage.removeItem('creativenode_recently_viewed_ids');
              setRecentlyViewed([]);
              triggerToast("Recently viewed history cleared.", "info");
            }}
            onBatchPrint={handleBatchPrintMultiPagePDF}
          />
        ) : activeTab === 'atelier' ? (
          /* SOVEREIGN STANDALONE ATELIER STUDIO PAGE */
          user ? (
            <div className="py-8 max-w-7xl mx-auto px-4 md:px-8">
              {/* Header info for separate Studio page */}
              <div className="mb-8 border-b border-zinc-900 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-xs text-gold-400 uppercase tracking-widest block mb-1">Interactive Creative Engine</span>
                  <h1 className="font-display text-2xl md:text-4xl font-bold text-white tracking-tight">
                    CreativeNode <span className="font-editorial italic font-normal text-gold-400">Atelier Studio</span>
                  </h1>
                  <p className="text-zinc-500 text-xs font-sans mt-1">
                    Configure custom typographic poster layouts in real-time, generate automated design briefings, and test live visual grid specs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="self-start md:self-center font-mono text-[10px] text-zinc-400 hover:text-white uppercase tracking-widest bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                >
                  ← Back to Main Menu
                </button>
              </div>
              
              <PosterAtelier 
                initialTemplateId={selectedTemplateId} 
                onClearInitialTemplate={() => setSelectedTemplateId(null)}
                onBriefAdded={handleBriefAdded}
                userTier={userTier}
                getDailyCount={getDailyDesignCount}
                getDailyLimit={getDailyLimit}
                onIncrementDesignCount={handleIncrementDesignCount}
              />
            </div>
          ) : (
            /* Non-authenticated fallback */
            <div className="py-16 text-center max-w-md mx-auto">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold-400 block mb-2 font-extrabold animate-pulse">
                SECURE DESIGN INTERCON
              </span>
              <h3 className="font-display text-lg md:text-xl font-extrabold text-white tracking-widest uppercase mb-2">
                STUDIO ACCESS RESTRICTED
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed mb-6">
                Please authenticate your account to enter the separate Atelier Studio page and customize graphics.
              </p>
              <button
                type="button"
                onClick={() => setIsAuthPortalOpen(true)}
                className="bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs py-2.5 px-6 rounded-xl transition font-mono uppercase tracking-widest cursor-pointer shadow-md shadow-gold-500/10"
              >
                Authenticate Account
              </button>
            </div>
          )
        ) : (
          <>

        {/* Hero Section: Majestic Deep-Noir and gold presentation */}
        <section className="relative min-h-[85vh] flex flex-col justify-center py-16 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
          {/* Subtle Ambient light spots */}
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-gold-950/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-amber-900/10 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            {/* Left Hero side (Copywriter Masterwork) */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-xs font-mono tracking-wide text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-gold-500 animate-pulse" />
                <span>Exquisite Visual Dominance Est. 2026</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-none">
                Bespoke Poster <br />
                <span className="font-editorial italic font-normal text-gold-400 bg-gradient-to-r from-gold-300 via-gold-400 to-amber-600 bg-clip-text text-transparent">Artwork Specialists</span>
              </h1>

              <p className="font-sans text-sm md:text-base leading-relaxed text-zinc-400 max-w-xl mx-auto lg:mx-0">
                CreativeNode merges elite Swiss modernist structure with cinematic deep noir aesthetics. We sculpt visual campaigns for premium athletic brands, high fashion houses, and corporate directors globally.
              </p>

              {/* Statistics Row */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-zinc-900 max-w-lg mx-auto lg:mx-0">
                <div>
                  <span className="font-outfit text-2xl md:text-3xl font-extrabold text-gold-400 block">2,400+</span>
                  <span className="font-mono text-[9px] text-zinc-500 tracking-wider uppercase block">Posters Delivered</span>
                </div>
                <div>
                  <span className="font-outfit text-2xl md:text-3xl font-extrabold text-white block">99.8%</span>
                  <span className="font-mono text-[9px] text-zinc-500 tracking-wider uppercase block">On-Time SLA</span>
                </div>
                <div>
                  <span className="font-outfit text-2xl md:text-3xl font-extrabold text-white block">24 HR</span>
                  <span className="font-mono text-[9px] text-zinc-500 tracking-wider uppercase block">Available Turnaround</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <button
                  onClick={() => {
                    if (user) {
                      setActiveTab('atelier');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      triggerToast("Opening standalone Atelier Studio page", "info");
                    } else {
                      setIsAuthPortalOpen(true);
                      triggerToast("Please authenticate to configure canvas.", "info");
                    }
                  }}
                  className="bg-gold-500 hover:bg-gold-400 text-black font-display font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition shadow shadow-gold-500/10 cursor-pointer"
                >
                  Configure Live Canvas <Sparkles className="w-4 h-4 text-black" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('portfolio-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900 text-white font-mono text-xs uppercase tracking-widest py-3 px-6 rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  Explore Portfolio <Layers className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Hero side (Interactive Spotlight Card carousel slider representation) */}
            <div className="lg:col-span-5 flex flex-col justify-center items-center">
              <div className="w-full max-w-sm aspect-[4/5] bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between relative shadow-2xl relative overflow-hidden group">
                
                {/* Image under the vignette */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
                  style={{ 
                    backgroundImage: `url(${featuredHeroItems[heroIndex].bgValue})`,
                    filter: 'brightness(0.65)'
                  }}
                />
                
                {/* Elegant overlay scrims */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/30 pointer-events-none" />
                <div className="absolute inset-0 bg-grain mix-blend-overlay pointer-events-none" />

                {/* Top header stats */}
                <div className="relative z-10 flex items-center justify-between font-mono text-[9px] text-gold-400">
                  <span>SPOTLIGHT SERIES // 2026</span>
                  <span className="bg-black/70 px-2 py-0.5 rounded border border-gold-900/60 font-bold">
                    {heroIndex + 1} OF {featuredHeroItems.length}
                  </span>
                </div>

                {/* Centered layout elements */}
                <div className="relative z-10 my-auto py-8 text-center flex flex-col items-center">
                  <span className="font-mono text-xs text-gold-400 uppercase tracking-widest mb-1.5">
                    {featuredHeroItems[heroIndex].subtitle}
                  </span>
                  <h3 className="font-editorial text-2xl md:text-3.5xl font-extrabold text-white leading-tight drop-shadow-xl font-medium tracking-tight">
                    {featuredHeroItems[heroIndex].title}
                  </h3>
                  <div className="w-10 h-[1.5px] bg-gold-400 mt-4 rounded" />
                </div>

                {/* Footer details */}
                <div className="relative z-10 mt-auto border-t border-white/10 pt-3 flex items-end justify-between font-mono text-[9.5px]">
                  <div className="text-left">
                    <span className="text-zinc-500 text-[8px] uppercase block">Theme Presets Included</span>
                    <span className="text-white font-medium">{featuredHeroItems[heroIndex].theme}</span>
                  </div>
                  <button
                    onClick={() => handleLoadTemplate(featuredHeroItems[heroIndex].id)}
                    className="bg-white hover:bg-gold-400 text-black rounded px-3 py-1 font-mono text-[9.5px] font-bold tracking-normal transition uppercase flex items-center gap-1.5"
                  >
                    <span>Load Template</span> <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Slider indicator dots */}
              <div className="flex gap-2.5 mt-5">
                {featuredHeroItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      heroIndex === idx ? 'w-8 bg-gold-400' : 'w-2 bg-zinc-800 hover:bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Recently Viewed Component */}
          {recentlyViewed.length > 0 && (
            <div className="mt-16 pt-8 border-t border-zinc-900 w-full relative z-10 max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-bold">RECENTLY VIEWED SPECIFICATIONS</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadRecentlyViewedZIP}
                    className="text-[9.5px] font-mono text-gold-400 hover:text-gold-300 font-bold border border-gold-400/20 bg-gold-950/15 hover:bg-gold-950/30 px-2.5 py-1 rounded transition uppercase cursor-pointer flex items-center gap-1"
                  >
                    <span>Download All (ZIP)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem('creativenode_recently_viewed');
                      setRecentlyViewed([]);
                      triggerToast("Recently viewed history cleared.", "info");
                    }}
                    className="text-[9.5px] font-mono text-zinc-550 hover:text-zinc-300 transition uppercase cursor-pointer"
                  >
                    Clear History
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {recentlyViewed.map((poster) => (
                  <div
                    key={poster.id}
                    onClick={() => {
                      setViewingProject(poster);
                      triggerToast(`Previewing: ${poster.title}`, "info");
                    }}
                    className="group bg-zinc-900/30 hover:bg-zinc-900/85 border border-zinc-900 hover:border-gold-500/30 rounded-xl p-3.5 cursor-pointer transition duration-300 text-left relative overflow-hidden"
                  >
                    {/* Tiny background element for visualization */}
                    <div 
                      className="absolute inset-0 opacity-10 pointer-events-none transition group-hover:scale-105 duration-300 select-none bg-cover bg-center"
                      style={{ 
                        backgroundColor: poster.bgType === 'color' ? poster.bgValue : '#0d0d0d',
                        backgroundImage: poster.bgType === 'image' ? `url(${poster.bgValue})` : undefined
                      }}
                    />
                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[60px]">
                      <div>
                        <span className="text-[7.5px] font-mono uppercase tracking-widest text-zinc-500 block mb-0.5" style={{ color: poster.accentColor }}>
                          {poster.subtitle || 'Atelier'}
                        </span>
                        <h5 className="text-[11px] font-bold text-white tracking-tight line-clamp-1 group-hover:text-gold-400 transition">
                          {poster.title}
                        </h5>
                      </div>
                      <div className="mt-2 text-[7px] font-mono text-zinc-400 border-t border-zinc-900/50 pt-1 flex justify-between items-center">
                        <span className="uppercase text-zinc-500 text-[6.5px]">{poster.category}</span>
                        <span className="text-gold-400/85">View Spec →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Portfolio Showcase with live Category Filters and Search */}
        <section id="portfolio-section" className="py-24 bg-zinc-950 px-4 md:px-8 border-t border-zinc-900">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header with exquisite descriptive titles */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <span className="font-mono text-xs text-gold-400 uppercase tracking-widest block mb-1">
                  Exquisite Collections
                </span>
                <h2 className="font-display text-3xl md:text-5xl font-medium text-white tracking-tight">
                  The <span className="font-editorial italic font-normal text-gold-400">Silent Gallery</span>
                </h2>
                <p className="text-zinc-500 text-xs md:text-sm max-w-md mt-2 font-sans leading-relaxed">
                  Bespoke conceptual releases. Choose from sports-cyber, minimalist gold luxury, or editorial fashion designs.
                </p>
              </div>

              {/* Category filter tabs */}
              <div className="flex flex-wrap gap-1 bg-zinc-900/30 p-1 rounded-xl border border-zinc-900/80 shrink-0 self-start">
                {[
                  { id: 'all', label: 'All Projects' },
                  { id: 'fitness', label: 'Cyber Fitness' },
                  { id: 'fashion', label: 'Fashion Edit' },
                  { id: 'minimalist', label: 'Minimal Gold' },
                  { id: 'offers', label: 'Retail & Offers' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setPortfolioCategory(tab.id as any);
                      (window as any).addStudioToast?.(`Switched portfolio segment to ${tab.label}.`, "info");
                    }}
                    className={`relative py-1.5 px-3.5 rounded-lg text-[10.5px] font-mono tracking-wider uppercase transition-colors duration-200 z-10 ${
                      portfolioCategory === tab.id 
                        ? 'text-black font-semibold' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {portfolioCategory === tab.id && (
                      <motion.div
                        layoutId="activeCategoryIndicator"
                        className="absolute inset-0 bg-gold-500 rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Search & Tag filter controller block */}
            <div className="bg-zinc-950 border border-zinc-900/90 rounded-2xl p-5 md:p-6 space-y-4">
              
              {/* Recent Searches Control Panel Row */}
              <div className="flex items-center justify-between border-b border-zinc-900/65 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-gold-450 bg-[#D4AF37] rounded-full" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">Automatic Search Query Logger</span>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRecentDropdownOpen(!recentDropdownOpen)}
                    className="flex items-center gap-1.5 text-[9.5px] font-mono text-zinc-400 hover:text-[#D4AF37] bg-zinc-900 border border-zinc-850 hover:border-[#D4AF37]/30 px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition cursor-pointer select-none"
                  >
                    <History className="w-3.5 h-3.5 text-gold-400" />
                    <span>Recent Searches ({recentSearches.length})</span>
                    <ChevronRight className="w-2.5 h-2.5 rotate-90 text-zinc-500" />
                  </button>

                  <AnimatePresence>
                    {recentDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-56 bg-zinc-950 border border-zinc-850 rounded-xl max-h-60 overflow-y-auto p-2.5 z-40 shadow-2xl space-y-1 font-mono"
                      >
                        <div className="flex items-center justify-between border-b border-zinc-900 px-2 py-1.5 text-[8.5px] text-zinc-500 uppercase">
                          <span>Logged Queries</span>
                          {recentSearches.length > 0 && (
                            <button
                              onClick={() => {
                                setRecentSearches([]);
                                localStorage.removeItem('creativenode_recent_searches');
                                triggerToast("Search history cleared.", "success");
                              }}
                              className="hover:text-red-400 text-[8px] cursor-pointer"
                            >
                              Clear All
                            </button>
                          )}
                        </div>

                        {recentSearches.length === 0 ? (
                          <div className="py-4 text-center text-[10px] text-zinc-600 italic">
                            No queries logged helper.
                          </div>
                        ) : (
                          recentSearches.map((term, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setSearchQuery(term);
                                setRecentDropdownOpen(false);
                                triggerToast(`Query loaded: "${term}"`, "info");
                              }}
                              className="w-full text-left font-mono text-[10px] hover:text-white px-2 py-1.5 hover:bg-zinc-900/65 rounded-lg text-zinc-400 truncate flex items-center justify-between group cursor-pointer"
                            >
                              <span>{term}</span>
                              <span className="text-[7.5px] text-zinc-650 group-hover:text-gold-400">Apply ↵</span>
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Text query input */}
                <div className="md:col-span-5 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by keyword, preset style, or title text..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 rounded-xl pl-11 pr-10 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 transition font-mono"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-[10px] font-mono"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                {/* Sorting Select Dropdown Menu */}
                <div className="md:col-span-3 relative">
                  <select
                    value={portfolioSort}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setPortfolioSort(val);
                      triggerToast(`Sorted portfolio by ${val === 'newest' ? 'Newest' : val === 'alphabetical' ? 'Alphabetical' : 'A-Z order'}.`, "info");
                    }}
                    className="w-full bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500 transition font-mono cursor-pointer"
                  >
                    <option value="newest" className="bg-zinc-950 text-zinc-300">Sort: Newest</option>
                    <option value="alphabetical" className="bg-zinc-950 text-zinc-300">Sort: Alphabetical</option>
                    <option value="a-z" className="bg-zinc-950 text-zinc-300">Sort: A-Z (Title order)</option>
                  </select>
                </div>

                {/* Popular Keywords presets buttons header */}
                <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-1.5 text-xs font-mono text-zinc-500 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  <span className="shrink-0 uppercase text-[9px] tracking-wider text-zinc-500 mr-1 hidden sm:inline">Styles:</span>
                  {['Typography', 'Brutalist', 'Swiss', 'Minimalist', 'Luxury', 'Midnight', 'Cyberpunk', 'Fitness'].map((word) => (
                    <button
                      key={word}
                      onClick={() => {
                        setSelectedKeyword(selectedKeyword === word ? null : word);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-[9.5px] tracking-tight uppercase font-mono transition shrink-0 ${
                        selectedKeyword === word
                          ? 'border-gold-500 bg-gold-950/30 text-gold-400 font-semibold shadow-inner'
                          : 'border-zinc-900 bg-zinc-900/30 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                      }`}
                    >
                      #{word}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Auto-suggest tag recommendation shelf */}
              {suggestedTags.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t border-zinc-900/40 text-[11px] font-mono select-none">
                  <span className="text-zinc-500 uppercase text-[9px] tracking-widest font-bold shrink-0">Smart Suggestions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedTags.map((tag) => {
                      const isSelected = selectedKeyword === tag || searchQuery.toLowerCase().includes(tag.toLowerCase());
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (selectedKeyword === tag) {
                              setSelectedKeyword(null);
                            } else {
                              setSelectedKeyword(tag);
                              triggerToast(`Suggestive tag filter active: #${tag}`, "info");
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg border text-[9.5px] uppercase tracking-wide transition flex items-center gap-1 cursor-pointer select-none ${
                            isSelected
                              ? 'border-gold-500 bg-gold-950/25 text-gold-400 font-semibold shadow-inner'
                              : 'border-zinc-900/80 bg-zinc-900/30 text-zinc-500 hover:text-zinc-300 hover:border-zinc-805 hover:bg-zinc-900'
                          }`}
                          title={`Instantly filter search portfolio with ${tag}`}
                        >
                          <span>#{tag}</span>
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Advanced search helper badge counter */}
              {(searchQuery || selectedKeyword) && (
                <div className="flex items-center justify-between text-[11px] font-mono text-gold-400/90 pt-1 border-t border-zinc-900/40">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-ping" />
                    <span>Found {filteredPortfolio.length} elegant matching look{filteredPortfolio.length === 1 ? '' : 's'}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedKeyword(null);
                      setPortfolioCategory('all');
                    }}
                    className="text-[10px] text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded transition"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Portfolio Bento Box Grid wrapped in layout animated containers */}
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {isSearchingActive ? (
                  // Shimmering real-time searching skeleton loading indicators
                  Array.from({ length: 3 }).map((_, i) => (
                    <motion.div 
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-zinc-950/70 border border-zinc-900 rounded-2xl p-6 aspect-[4/5] flex flex-col justify-between animate-pulse select-none"
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-1 w-1/3">
                          <div className="h-2 bg-zinc-900 rounded w-full" />
                          <div className="h-3 bg-zinc-900 rounded w-2/3" />
                        </div>
                        <div className="h-4 bg-zinc-900 rounded w-8" />
                      </div>
                      <div className="space-y-3.5 my-auto text-center">
                        <div className="h-3 bg-zinc-900 rounded w-1/3 mx-auto" />
                        <div className="h-5 bg-zinc-900 rounded w-4/5 mx-auto" />
                        <div className="h-2 bg-zinc-900 rounded w-1/4 mx-auto" />
                      </div>
                      <div className="border-t border-zinc-950 pt-4 flex justify-between items-center">
                        <div className="h-2 bg-zinc-900 rounded w-1/2" />
                        <div className="h-6 bg-zinc-900 rounded-lg w-12" />
                      </div>
                    </motion.div>
                  ))
                ) : filteredPortfolio.length > 0 ? (
                  filteredPortfolio.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.92, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -15 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ScrollRevealCard index={idx}>
                        <PortfolioCard
                          item={item}
                          idx={idx}
                          userTier={userTier}
                          adminPreviewPoster={adminPreviewPoster}
                          onView={() => setViewingProject(item)}
                          onQuickView={() => {
                            setQuickViewProject(item);
                            triggerToast(`Quick View: ${item.title}`, "info");
                          }}
                          onShare={(e) => handleShareProject(e, item)}
                          onExportPDF={() => {
                            handleExportPortfolioProjectPDF(item);
                            triggerToast(`Certified "${item.title}" engineering specs saved as global A4 blueprint PDF.`, "success");
                          }}
                          onLoadTemplate={handleLoadTemplate}
                          onSelectKeyword={setSelectedKeyword}
                          searchQuery={searchQuery}
                          collections={collections}
                          onSaveToCollection={handleSaveToCollection}
                          playHapticClick={playHapticClick}
                        />
                      </ScrollRevealCard>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="col-span-full py-16 text-center border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/20"
                  >
                    <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <h4 className="font-display text-white text-sm font-semibold">No Gallery Match Found</h4>
                    <p className="text-zinc-500 text-xs mt-1">Try another keyword tag or clear the filter console.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* Atelier section has been moved to its own standalone page under activeTab === 'atelier' */}

        {/* Services Showcase catalog */}
        <section id="services-section" className="py-24 bg-zinc-950 px-4 md:px-8 border-t border-zinc-900">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Header */}
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span className="font-mono text-xs text-gold-400 uppercase tracking-widest bg-gold-950/40 border border-gold-900/40 px-3 py-1 rounded-full inline-block">
                Tailored Deliverables
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-medium text-white tracking-tight">
                Our <span className="font-editorial italic font-normal text-gold-400">Creative Capabilities</span>
              </h2>
              <p className="text-zinc-400 text-xs md:text-sm font-sans leading-relaxed">
                We craft cohesive design systems. Every composition is modeled across physical sizing, digital grids, and master deliverables.
              </p>
            </div>

            {/* Grid structure (4 Columns matching layout 01, 02, 03, 04) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SERVICE_ITEMS.map((service) => (
                <div 
                  key={service.id}
                  className="bg-zinc-950 border border-zinc-900/95 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-800 transition-all duration-300 relative group"
                >
                  <div>
                    {/* Index Indicator */}
                    <div className="font-mono text-xs text-gold-400 font-bold mb-4 bg-zinc-900 border border-zinc-800/80 w-8 h-8 rounded-lg flex items-center justify-center">
                      {service.index}
                    </div>

                    <h3 className="font-display text-lg font-bold text-white mb-1 group-hover:text-gold-400 transition">
                      {service.title}
                    </h3>
                    <span className="font-mono text-[9.5px] uppercase tracking-wider text-zinc-500 block mb-4">
                      {service.subtitle}
                    </span>

                    <p className="text-zinc-400 text-xs leading-relaxed mb-6 font-sans">
                      {service.description}
                    </p>
                  </div>

                  <div>
                    {/* Deliverables list checklist */}
                    <div className="border-t border-zinc-900/80 pt-4 mb-4 space-y-1.5">
                      <span className="font-mono text-[9px] uppercase text-zinc-500 block mb-1">Key Deliverables</span>
                      {service.deliverables.map((del, i) => (
                        <div key={i} className="flex items-center gap-1.5 font-mono text-[9.5px] text-zinc-400">
                          <CheckCircle className="w-3 h-3 text-gold-500 shrink-0" />
                          <span>{del}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 mt-2">
                      <span>DURATION SLA</span>
                      <span className="text-white font-medium">{service.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Symmetrical Choice Framework (Why Choose Us) */}
            <div className="border border-zinc-900 rounded-3xl bg-zinc-950/70 p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center mt-12 max-w-6xl mx-auto">
              <div>
                <span className="font-mono text-xs text-gold-500 block uppercase mb-1">Studio Foundations</span>
                <h4 className="font-display text-xl font-bold text-white">Why Select CreativeNode?</h4>
                <p className="text-zinc-500 text-xs font-sans mt-2 leading-relaxed">
                  We maintain a limited client roster monthly to preserve visual density, bespoke typographic research, and maximum production speed.
                </p>
              </div>

              <div className="space-y-4 md:border-l md:border-zinc-900 md:pl-8">
                <div className="flex gap-3 items-start">
                  <span className="font-mono text-gold-400 font-bold text-sm bg-zinc-900 border border-zinc-850 h-7 w-7 flex items-center justify-center rounded shrink-0">I</span>
                  <div>
                    <h5 className="font-display font-semibold text-sm text-white">Sovereign Visuals Only</h5>
                    <p className="text-zinc-500 text-[11px] font-sans mt-0.5 leading-relaxed">Zero generic assets or default layouts. Every grid is customized around your logo and copy ratios perfectly.</p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start">
                  <span className="font-mono text-gold-400 font-bold text-sm bg-zinc-900 border border-zinc-850 h-7 w-7 flex items-center justify-center rounded shrink-0">II</span>
                  <div>
                    <h5 className="font-display font-semibold text-sm text-white">Dynamic Turnaround SLA</h5>
                    <p className="text-zinc-500 text-[11px] font-sans mt-0.5 leading-relaxed">Need peak-season campaign flyers in 12 hours? Our VIP priority channels provide swift, lossless rendering support.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 md:border-l md:border-zinc-900 md:pl-8">
                <div className="flex gap-3 items-start">
                  <span className="font-mono text-gold-400 font-bold text-sm bg-zinc-900 border border-zinc-850 h-7 w-7 flex items-center justify-center rounded shrink-0">III</span>
                  <div>
                    <h5 className="font-display font-semibold text-sm text-white">Interactive Sourcing</h5>
                    <p className="text-zinc-500 text-[11px] font-sans mt-0.5 leading-relaxed">Control parameters live on our canvas model editor to establish pre-visual directions directly within minutes.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="font-mono text-gold-400 font-bold text-sm bg-zinc-900 border border-zinc-850 h-7 w-7 flex items-center justify-center rounded shrink-0">IV</span>
                  <div>
                    <h5 className="font-display font-semibold text-sm text-white">Print CMYK Mastery</h5>
                    <p className="text-zinc-500 text-[11px] font-sans mt-0.5 leading-relaxed">Perfect separations for metallic sheets, wood displays, high-end matte billboards, or pure RGB web assets.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing matrix Section: mounts dynamic budget estimator */}
        <section id="pricing-section" className="py-24 bg-zinc-950 px-4 md:px-8 border-t border-zinc-900">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Header */}
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="font-mono text-xs text-gold-400 uppercase tracking-widest">
                Prestigious Pricing Ratios
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-medium text-white tracking-tight">
                Studio <span className="font-editorial italic font-normal text-gold-400">Investment Tiers</span>
              </h2>
              <p className="text-zinc-400 text-xs md:text-sm font-sans">
                Simple transparent billing. Calculate approximate custom package parameters live down below.
              </p>
            </div>

            {/* Mounted Pricing Calculator */}
            <InvestmentCalculator onSelectTier={handleSelectTier} />
          </div>
        </section>

        {/* Persistent Local Storage Specs Ledger Dashboard with D3 Visualizations */}
        <section id="briefs-record-ledger" className="py-20 bg-zinc-950 px-4 md:px-8 border-t border-zinc-900 relative">
          <div className="max-w-5xl mx-auto space-y-12">

            {/* Authenticated conditional screen gateway */}
            {user ? (
              <div className="space-y-12">
                
                {/* Personalized Studio Profile Panel */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-gold-400/5 blur-3xl pointer-events-none animate-pulse" />
                  
                  {/* Header info */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-full bg-gold-500 font-extrabold text-xs text-black flex items-center justify-center uppercase select-none">
                        {user.displayName?.[0] || user.email?.[0] || 'U'}
                      </div>
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold-400 block mb-0.5 font-bold animate-pulse">
                          ESTABLISHED CLIENT STATE
                        </span>
                        <h3 className="font-display text-base font-extrabold text-white leading-tight">
                          {user.displayName || 'Authorized CreativeNode Associate'}
                        </h3>
                        <p className="text-zinc-500 text-[10.5px] font-mono">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 md:self-end">
                      <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-850 rounded-lg text-[9px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ID Synced
                      </span>
                      <button
                        onClick={() => {
                          triggerToast("Session terminated.", "info");
                        }}
                        className="bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-red-950/40 text-zinc-400 hover:text-red-400 font-mono text-[9px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition"
                      >
                        Disconnect Session
                      </button>
                    </div>
                  </div>

                  {/* Settings & Status Grids */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    {/* Column 1: SLA Speed Settings */}
                    <div className="space-y-4 text-left">
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">
                          PERSONALIZED SUPPORT SLA CONSOLE
                        </span>
                        <label className="text-white text-xs font-bold block">Response Response Channels</label>
                        <p className="text-[11px] text-zinc-500 font-sans mt-1 leading-snug">Adjust your dedicated designer lookup speed live under your current session.</p>
                      </div>

                      <div className="flex border border-zinc-900 p-1 rounded-xl bg-zinc-900/30 font-mono text-[9px] tracking-wide text-zinc-500">
                        {[
                          { id: 'standard', label: 'Standard' },
                          { id: 'vip', label: '6H VIP' },
                          { id: 'sovereign', label: '2H Sovereign' }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setVipSlaType(tab.id as any)}
                            className={`flex-1 py-1.5 rounded-lg text-center font-bold tracking-wider transition uppercase ${
                              vipSlaType === tab.id ? 'bg-gold-500 text-black font-extrabold' : 'hover:bg-zinc-900 hover:text-white animate-fade'
                            }`}
                          >
                            {tab.id === 'standard' ? '24H Desk' : tab.id === 'vip' ? '6H VIP' : '2H Owner'}
                          </button>
                        ))}
                      </div>

                      {/* Dynamic message based on selection */}
                      <div className="bg-zinc-900/30 border border-zinc-900/80 p-3 rounded-lg text-[10.5px] font-mono">
                        {vipSlaType === 'standard' && (
                          <p className="text-zinc-400">
                            ✓ Status: Active. Response guaranteed within <span className="text-white font-bold">24 Business Hours</span>.
                          </p>
                        )}
                        {vipSlaType === 'vip' && (
                          <p className="text-gold-400 text-xs">
                            ✓ Premium VIP Channel Active. High-touch response slot allocated within <span className="text-white font-bold">6 Hours priority</span>.
                          </p>
                        )}
                        {vipSlaType === 'sovereign' && (
                          <p className="text-amber-500 text-xs font-semibold">
                            ⚠ High-Tier Sovereign Direct. Owner route assigned. SLA responds within <span className="text-white font-bold">120 Minutes</span> for extreme campaigns.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Storage Sync status indicators */}
                    <div className="space-y-4 text-left border-t md:border-t-0 md:border-l border-zinc-900 pt-6 md:pt-0 md:pl-6">
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">
                          CLOUD SYNCHRONIZATION LEDGER
                        </span>
                        <label className="text-white text-xs font-bold block">Live Datastore Status</label>
                        <p className="text-[11px] text-zinc-500 font-sans mt-1 leading-snug">Brief blueprints and configured templates are synchronized dynamically across instances.</p>
                      </div>

                      <div className="bg-zinc-900/30 p-3.5 rounded-xl border border-zinc-900/80 space-y-2.5 font-mono">
                        <div className="flex items-center justify-between text-[10.5px]">
                          <span className="text-zinc-500">DATABASE RELIABILITY</span>
                          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
                            CLOUD SYNCED
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10.5px]">
                          <span className="text-zinc-500">SAVED SPEC BRIEFS</span>
                          <span className="text-white font-extrabold">{briefsCount} Blueprints</span>
                        </div>
                        <div className="flex items-center justify-between text-[10.5px]">
                          <span className="text-zinc-500">CLIENT ROLE ACCESS</span>
                          <span className="text-gold-400 uppercase text-[9px] font-bold">Executive Partner</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Studio Insights: Dynamic analytical graphs */}
                <StudioInsights changeTrigger={briefsUpdateTrigger} />

                {/* BriefingDashboard displays saved briefs from the custom poster configurator */}
                <BriefingDashboard changeTrigger={briefsUpdateTrigger} />
              </div>
            ) : (
              /* LOCKED COVER GATEWAY */
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-950 border border-dashed border-zinc-900 rounded-3xl p-8 md:p-14 relative overflow-hidden text-center max-w-2xl mx-auto shadow-2xl"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold-500/5 blur-3xl pointer-events-none rounded-full" />
                <div className="h-12 w-12 rounded-full bg-zinc-900/80 border border-zinc-800 text-gold-500 flex items-center justify-center mx-auto mb-4 bg-glass-frost">
                  <UserIcon className="w-5 h-5" />
                </div>
                
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold-400 block mb-2 font-extrabold animate-pulse">
                  SECURE DESIGN INTERCON
                </span>
                <h3 className="font-display text-lg md:text-xl font-extrabold text-white tracking-widest uppercase mb-2">
                  STUDIO LEDGER SECURED
                </h3>
                <p className="text-zinc-400 text-xs mt-2 max-w-md mx-auto leading-relaxed">
                  Authenticate your workspace account to unlock the interactive project briefs history ledger, cloud database synchronization, dynamic metrics visualization, and priority response support dials.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3.5 items-center justify-center">
                  <button
                    onClick={() => setIsAuthPortalOpen(true)}
                    className="bg-gold-400 hover:bg-gold-500 text-black font-semibold text-xs py-2.5 px-6 rounded-xl transition font-mono uppercase tracking-widest cursor-pointer active:scale-95 shadow-md shadow-gold-500/10"
                  >
                    Authenticate Account
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      if (user) {
                        setActiveTab('atelier');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        setIsAuthPortalOpen(true);
                        triggerToast("Please authenticate first", "info");
                      }
                    }}
                    className="text-zinc-500 hover:text-white font-mono text-[10px] uppercase tracking-wider py-2.5 px-4 rounded-xl bg-zinc-900/30 hover:bg-zinc-900 transition border border-zinc-900 hover:border-zinc-850 cursor-pointer"
                  >
                    Return to Atelier
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </section>

        {/* Contact/Inquiry Section */}
        <section id="contact-section" className="py-24 bg-zinc-950 px-4 md:px-8 border-t border-zinc-900 relative">
          {/* Ambient red gold highlight */}
          <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-gold-950/10 to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">
            {/* Left Contact: info indicators */}
            <div className="lg:col-span-5 space-y-6">
              <span className="font-mono text-xs text-gold-400 uppercase tracking-widest bg-gold-950/40 border border-gold-900/40 px-3 py-1 rounded-full inline-block">
                Client Relations
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-medium text-white tracking-tight leading-tight">
                Submit A <br />
                <span className="font-editorial italic font-normal text-gold-400">Bespoke Inquiry</span>
              </h2>
              <p className="text-zinc-400 text-sm font-sans leading-relaxed">
                Ready to establish absolute visual authority? Contact our director desk instantly via WhatsApp, Instagram DM, or configure your specifications on our Atelier tool.
              </p>

              {/* High end contact channels */}
              <div className="space-y-4 pt-4">
                <a 
                  href="https://wa.me/916369278905" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl hover:border-emerald-700/50 hover:bg-zinc-900 transition group"
                >
                  <div className="h-10 w-10 rounded-lg bg-emerald-950/30 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-900/50">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase block">Instant WhatsApp Channel</span>
                    <span className="text-white text-sm font-bold block group-hover:text-emerald-400 transition">+91 63692 78905</span>
                    <span className="text-zinc-500 text-[10px] block">Click for direct client consultant stream</span>
                  </div>
                </a>

                <a 
                  href="https://instagram.com/creativenode.in" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl hover:border-gold-500/50 hover:bg-zinc-900 transition group"
                >
                  <div className="h-10 w-10 rounded-lg bg-rose-950/30 text-rose-400 flex items-center justify-center font-bold text-lg border border-rose-900/50">
                    <Instagram className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-left">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase block">Follow & DM Instagram</span>
                    <span className="text-white text-sm font-bold block group-hover:text-gold-400 transition">@creativenode.in</span>
                    <span className="text-zinc-500 text-[10px] block">Daily released posters & grid breakdowns</span>
                  </div>
                </a>

                <div className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
                  <div className="h-10 w-10 rounded-lg bg-zinc-950 text-gold-400 flex items-center justify-center font-bold text-lg border border-zinc-850">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase block">Studio HQ Location</span>
                    <span className="text-white text-xs font-bold block">Tamil Nadu, India</span>
                    <span className="text-zinc-500 text-[10px] block">Catering strictly to international layouts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact: Quick Support FAQ accordions / Intake briefing banner */}
            <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gold-400 text-black text-[8px] font-mono font-bold px-3 py-1 uppercase rounded-bl">
                Support Desk
              </div>

              <h3 className="font-display text-lg font-bold text-white mb-6">Frequently Inquired Logistics</h3>
              
              <div className="space-y-4 font-sans">
                {/* FAQ 1 */}
                <div className="border-b border-zinc-900 pb-3">
                  <h4 className="text-xs font-semibold text-white uppercase font-mono tracking-wider mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-gold-400" /> What constitutes express turnaround?
                  </h4>
                  <p className="text-zinc-500 text-xs leading-relaxed pl-5">
                    Express designs are prioritized immediately at our desk. Our average turn-around for express projects spans 12-24 hours depending on revisions and volume limits.
                  </p>
                </div>
                
                {/* FAQ 2 */}
                <div className="border-b border-zinc-900 pb-3">
                  <h4 className="text-xs font-semibold text-white uppercase font-mono tracking-wider mb-1 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-gold-400" /> Can I request specific geometric fonts?
                  </h4>
                  <p className="text-zinc-500 text-xs leading-relaxed pl-5">
                    Yes. We license high-end foundry fonts directly. When setting up a brief via the Atelier customizer, specify preferred branding directives.
                  </p>
                </div>

                {/* FAQ 3 */}
                <div className="border-b border-zinc-900 pb-3">
                  <h4 className="text-xs font-semibold text-white uppercase font-mono tracking-wider mb-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-gold-400" /> Do you print and ship physical posters?
                  </h4>
                  <p className="text-zinc-500 text-xs leading-relaxed pl-5">
                    We deliver ultra-high-resolution 300DPI digital printable formats (CMYK PDF) structured to match any custom physical frame size perfectly. High quality shipping files can be printed locally at premium finishes (matte, gloss, canvas).
                  </p>
                </div>
              </div>

              {/* WhatsApp direct CTA bar */}
              <div className="mt-8 bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl text-center space-y-3">
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Have a custom retainer proposal or relational project not listed in basic packages? Talk to our core designer directly.
                </p>
                <a
                  href="https://wa.me/916369278905?text=Hello%20CreativeNode,%20I'm%20looking%20for%20a%20custom%20premium%20poster%20quote!"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex bg-gold-400 hover:bg-gold-300 text-black font-semibold text-xs py-2 px-5 rounded-lg transition active:scale-95 gap-1.5 items-center justify-center font-display uppercase tracking-wider block"
                >
                  Message Director +91 6369278905 <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>
          </>
        )}
      </main>

      {/* Exquisite Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 px-4 md:px-8 text-center text-xs relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left font-display">
            <span className="text-white font-extrabold tracking-wide text-sm block">CREATIVENODE STUDIO</span>
            <span className="text-zinc-500 text-[9.5px] font-mono block">Premium Design Systems. Built for Digital Authority.</span>
          </div>

          <p className="text-zinc-500 font-mono text-[10px]">
            © 2026 CreativeNode Studio. All specifications subject to licensing agreements. Built securely on React & Tailwind v4.
          </p>

          <div className="flex gap-4 font-mono text-[10px] text-zinc-500">
            <a href="https://instagram.com/creativenode.in" target="_blank" rel="noreferrer" className="hover:text-gold-400 transition uppercase">Instagram</a>
            <span>•</span>
            <a href="https://wa.me/916369278905" target="_blank" rel="noreferrer" className="hover:text-gold-400 transition uppercase">WhatsApp Support</a>
          </div>
        </div>
      </footer>

      {/* Portfolio Item Detail View Modal */}
      <AnimatePresence>
        {viewingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingProject(null)}
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 md:p-8 z-[100] backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-zinc-950 border border-zinc-900 rounded-3xl w-full overflow-hidden relative shadow-2xl grid grid-cols-1 md:grid-cols-12 transition-all duration-300 ${comparingProject ? 'max-w-5xl' : 'max-w-4xl'}`}
            >
              {/* Glowing active edge */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-gold-500/10 via-gold-400/80 to-gold-500/10" />

              {/* Close Button on top right corner */}
              <button
                type="button"
                onClick={() => setViewingProject(null)}
                className="absolute top-4 right-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white p-2 rounded-full border border-zinc-850 transition duration-200 z-50 cursor-pointer"
                title="Close modal view"
              >
                <X className="w-4 h-4" />
              </button>

              {/* LEFT COLUMN: Visual Artwork Poster Preview Frame (5 cols on MD) */}
              <div className="md:col-span-5 bg-zinc-900/40 p-6 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-900 relative">
                
                {/* Physical Print Preview interactive toggle icon */}
                <button
                  onClick={() => {
                    const nextMap: Record<string, 'none' | 'canvas' | 'billboard'> = {
                      'none': 'canvas',
                      'canvas': 'billboard',
                      'billboard': 'none'
                    };
                    const next = nextMap[printPreviewMedium] || 'none';
                    setPrintPreviewMedium(next);
                    triggerToast(`Switched presentation mode to: ${next === 'none' ? 'Studio Spec' : next === 'canvas' ? 'Gallery Canvas' : 'Matte Billboard'}`, "info");
                  }}
                  className={`absolute top-4 left-4 z-20 p-2 rounded-xl border transition flex items-center gap-1 text-[9px] font-mono uppercase font-bold select-none cursor-pointer group ${
                    printPreviewMedium !== 'none'
                      ? 'bg-gold-500 border-gold-400 text-black shadow-lg shadow-gold-500/20'
                      : 'bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white border-zinc-850'
                  }`}
                  title="Toggle interactive print preview simulation modes"
                  onMouseEnter={playHapticClick}
                >
                  <Printer className="w-3.5 h-3.5 animate-pulse" />
                  <span>PREVIEW</span>
                </button>

                <div className="relative w-full flex justify-center items-center h-full perspective-[1200px] overflow-visible">
                  {enableHeatmap && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[270px] aspect-[4/5] z-50 pointer-events-none cmyk-coverage-heatmap rounded-xl mix-blend-color-burn" />
                  )}
                  <AnimatePresence mode="wait">
                    {printPreviewMedium === 'canvas' ? (
                      /* SIMULATED GALLERY CANVAS VIEW */
                      <motion.div
                        key="canvas"
                        initial={{ opacity: 0, rotateX: 12, rotateY: -8, scale: 0.91, y: 15 }}
                        animate={{ opacity: 1, rotateX: 0, rotateY: 0, scale: 1, y: 0 }}
                        exit={{ opacity: 0, rotateX: -12, rotateY: 8, scale: 0.91, y: -15 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 18 }}
                        className="w-full h-full rounded bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900/50 to-black/80 flex items-center justify-center p-5 border border-zinc-900 relative shadow-inner overflow-hidden select-none"
                      >
                        <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-30 pointer-events-none" />
                        
                        {/* Shadow block to give thick 3D wooden canvas offset */}
                        <div 
                          className="w-4/5 aspect-[4/5] rounded border-t border-l border-white/20 border-r-4 border-b-4 border-black/80 shadow-[15px_20px_35px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col justify-between p-4 bg-zinc-950 select-none"
                          style={{
                            backgroundColor: viewingProject.bgType === 'color' ? viewingProject.bgValue : '#0d0d0d',
                            backgroundImage: viewingProject.bgType === 'image' ? `url(${viewingProject.bgValue})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 pointer-events-none" />
                          <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-60 pointer-events-none" />
                          
                          {/* Canvas weave effect print overlay */}
                          <div className="absolute inset-0 bg-repeat opacity-45 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: '3px 3px' }} />

                          <div className="relative z-10 flex items-center justify-between font-mono text-[7px] text-white/50 uppercase tracking-widest">
                            <span>Canvas</span>
                            {viewingProject.badge && (
                              <span className="px-1.5 py-0.5 border border-white/20 rounded bg-black/40">
                                {viewingProject.badge}
                              </span>
                            )}
                          </div>

                          <div className={`relative z-10 my-auto flex flex-col ${
                            viewingProject.align === 'center' ? 'text-center items-center' : viewingProject.align === 'right' ? 'text-right items-end' : 'text-left items-start'
                          }`}>
                            <span className="font-mono text-[7.5px] uppercase tracking-[0.2em] mb-0.5" style={{ color: viewingProject.accentColor }}>{viewingProject.subtitle}</span>
                            <h4 className="text-sm font-bold tracking-tighter leading-tight text-white" style={{ fontFamily: viewingProject.fontTitle === 'Playfair Display' ? 'serif' : viewingProject.fontTitle === 'Space Grotesk' ? 'sans-serif' : 'monospace' }}>{viewingProject.title}</h4>
                          </div>

                          <div className="relative z-10 pt-2 border-t border-white/10 flex flex-col text-left font-mono text-[6px]" style={{ color: viewingProject.textColor }}>
                            <p className="line-clamp-2 opacity-70 italic leading-snug">{viewingProject.details}</p>
                          </div>

                          {/* Crop Marks & Bleed Guides Overlay */}
                          {showCropMarks && (
                            <div className="absolute inset-0 pointer-events-none z-30 select-none">
                              {/* Bleed Area boundary dotted red indicator line */}
                              <div className="absolute inset-2 border border-dashed border-red-500/50 flex flex-col justify-between p-1">
                                <span className="text-[5.5px] font-mono text-red-500/70 uppercase tracking-widest font-bold self-start scale-90 origin-top-left">Bleed Line (3mm)</span>
                                <span className="text-[5.5px] font-mono text-red-500/70 uppercase tracking-widest font-bold self-end scale-90 origin-bottom-right">Trim Border Limit</span>
                              </div>

                              {/* Traditional printer corner registration lines */}
                              <div className="absolute top-0 left-2 w-[1px] h-3 bg-zinc-350" />
                              <div className="absolute top-2 left-0 w-3 h-[1px] bg-zinc-350" />
                              
                              <div className="absolute top-0 right-2 w-[1px] h-3 bg-zinc-350" />
                              <div className="absolute top-2 right-0 w-3 h-[1px] bg-zinc-350" />

                              <div className="absolute bottom-0 left-2 w-[1px] h-3 bg-zinc-350" />
                              <div className="absolute bottom-2 left-0 w-3 h-[1px] bg-zinc-350" />

                              <div className="absolute bottom-0 right-2 w-[1px] h-3 bg-zinc-350" />
                              <div className="absolute bottom-2 right-0 w-3 h-[1px] bg-zinc-350" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : printPreviewMedium === 'billboard' ? (
                      /* SIMULATED MATTE BILLBOARD VIEW */
                      <motion.div
                        key="billboard"
                        initial={{ opacity: 0, rotateX: -15, scale: 0.93, y: 18 }}
                        animate={{ opacity: 1, rotateX: 0, scale: 1, y: 0 }}
                        exit={{ opacity: 0, rotateX: 15, scale: 0.93, y: -18 }}
                        transition={{ type: 'spring', stiffness: 90, damping: 17 }}
                        className="w-full h-full rounded bg-gradient-to-b from-zinc-950 via-zinc-900 to-black/45 flex flex-col items-center justify-center p-4 border border-zinc-900 relative overflow-hidden shadow-inner select-none"
                      >
                        {/* Retro Night Spotlights effect */}
                        <div className="absolute top-1 left-12 w-20 h-28 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent blur-md pointer-events-none" />
                        <div className="absolute top-1 right-12 w-20 h-28 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent blur-md pointer-events-none" />

                        {/* Billboard Metal Structural Framing */}
                        <div className="bg-zinc-950 border-4 border-zinc-805 p-1 w-4/5 aspect-[4/5] shadow-[0_12px_40px_rgba(0,0,0,0.9)] relative flex flex-col justify-between rounded">
                          
                          {/* Steel Billboard top lighting lamps mockup details */}
                          <div className="absolute -top-1.5 left-1/4 -translate-y-1 w-2.5 h-1.5 bg-zinc-700 border border-zinc-650 rounded-t" />
                          <div className="absolute -top-1.5 right-1/4 -translate-y-1 w-2.5 h-1.5 bg-zinc-700 border border-zinc-650 rounded-t" />

                          <div 
                            className="w-full h-full relative overflow-hidden flex flex-col justify-between p-4"
                            style={{
                              backgroundColor: viewingProject.bgType === 'color' ? viewingProject.bgValue : '#0d0d0d',
                              backgroundImage: viewingProject.bgType === 'image' ? `url(${viewingProject.bgValue})` : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              filter: 'brightness(0.9) contrast(1.05)'
                            }}
                          >
                            {/* Matte shadow depth overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 pointer-events-none" />
                            <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-80 pointer-events-none" />

                            {/* Halftone matte scanline pattern */}
                            <div className="absolute inset-0 bg-repeat opacity-25 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.1) 50%)', backgroundSize: '100% 4px' }} />

                            <div className="relative z-10 flex items-center justify-between font-mono text-[7px] text-white/50 uppercase tracking-widest">
                              <span>Matt Billboard</span>
                              {viewingProject.badge && (
                                <span className="px-1 py-0.2 border border-white/10 rounded bg-black/55 text-[6px]">
                                  {viewingProject.badge}
                                </span>
                              )}
                            </div>

                            <div className={`relative z-10 my-auto flex flex-col ${
                              viewingProject.align === 'center' ? 'text-center items-center' : viewingProject.align === 'right' ? 'text-right items-end' : 'text-left items-start'
                            }`}>
                              <span className="font-mono text-[7px] uppercase tracking-[0.2em] mb-0.5" style={{ color: viewingProject.accentColor }}>{viewingProject.subtitle}</span>
                              <h4 className="text-[13px] font-bold tracking-tighter leading-tight text-white" style={{ fontFamily: viewingProject.fontTitle === 'Playfair Display' ? 'serif' : viewingProject.fontTitle === 'Space Grotesk' ? 'sans-serif' : 'monospace' }}>{viewingProject.title}</h4>
                            </div>

                            <div className="relative z-10 pt-1.5 border-t border-white/5 flex flex-col text-left font-mono text-[5.5px]" style={{ color: viewingProject.textColor }}>
                              <p className="line-clamp-2 opacity-65 leading-snug">{viewingProject.details}</p>
                            </div>

                            {/* Crop Marks & Bleed Guides Overlay */}
                            {showCropMarks && (
                              <div className="absolute inset-0 pointer-events-none z-30 select-none">
                                {/* Bleed Area boundary dotted red indicator line */}
                                <div className="absolute inset-2 border border-dashed border-red-500/50 flex flex-col justify-between p-1">
                                  <span className="text-[5.5px] font-mono text-red-500/70 uppercase tracking-widest font-bold self-start scale-90 origin-top-left">Bleed Line (3mm)</span>
                                  <span className="text-[5.5px] font-mono text-red-500/70 uppercase tracking-widest font-bold self-end scale-90 origin-bottom-right">Trim Border</span>
                                </div>

                                {/* Traditional printer corner registration lines */}
                                <div className="absolute top-0 left-2 w-[1px] h-3 bg-zinc-350" />
                                <div className="absolute top-2 left-0 w-3 h-[1px] bg-zinc-350" />
                                
                                <div className="absolute top-0 right-2 w-[1px] h-3 bg-zinc-350" />
                                <div className="absolute top-2 right-0 w-3 h-[1px] bg-zinc-350" />

                                <div className="absolute bottom-0 left-2 w-[1px] h-3 bg-zinc-350" />
                                <div className="absolute bottom-2 left-0 w-3 h-[1px] bg-zinc-350" />

                                <div className="absolute bottom-0 right-2 w-[1px] h-3 bg-zinc-350" />
                                <div className="absolute bottom-2 right-0 w-3 h-[1px] bg-zinc-350" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Steel Billboard support legs/pillars projecting down */}
                        <div className="flex gap-12 w-full justify-center -mb-4 mt-0.5">
                          <div className="w-1.5 h-4 bg-zinc-800 border-x border-zinc-750 shadow animate-pulse" />
                          <div className="w-1.5 h-4 bg-zinc-800 border-x border-zinc-750 shadow animate-pulse" />
                        </div>
                      </motion.div>
                    ) : printPreviewMedium === 'physical' ? (
                      /* SIMULATED PHYSICAL PAPER FINISH VIEW WITH SHINE & WEAVE TEXTURE */
                      <motion.div
                        key="physical"
                        initial={{ opacity: 0, rotateX: 10, y: 15 }}
                        animate={{ opacity: 1, rotateX: 0, y: 0 }}
                        exit={{ opacity: 0, rotateX: -10, y: -15 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 18 }}
                        className="w-full h-full rounded-2xl bg-zinc-950 border border-zinc-900 flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-inner select-none"
                      >
                        {/* Realistic ambient drop shadow behind card inside frame */}
                        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-20 pointer-events-none" />

                        {/* Interactive lighting spotlight shine overlay depending on select paperFinish */}
                        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden mix-blend-overlay">
                          {paperFinish === 'glossy' && (
                            <div className="absolute -top-[40%] -left-[40%] w-[180%] h-[180%] bg-[linear-gradient(135deg,rgba(255,255,255,0)_40%,rgba(255,255,255,0.45)_50%,rgba(255,255,255,0)_60%)] animate-pulse" />
                          )}
                          {paperFinish === 'textured' && (
                            <div className="absolute inset-0 bg-repeat opacity-35" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.15) 1px, transparent 0), radial-gradient(rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '4px 4px', backgroundPosition: '0 0, 2px 2px' }} />
                          )}
                          {paperFinish === 'matte' && (
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10" />
                          )}
                        </div>

                        {/* Paper frame mock container */}
                        <div className={`w-4/5 aspect-[4/5] bg-zinc-950 p-2 shadow-[0_20px_45px_rgba(0,0,0,0.85)] border-2 border-zinc-800 rounded relative overflow-hidden flex flex-col justify-between ${
                          paperFinish === 'textured' ? 'ring-1 ring-white/5' : paperFinish === 'glossy' ? 'brightness-105 shadow-[0_25px_50px_rgba(255,255,255,0.03)]' : ''
                        }`}>
                          <div 
                            className="w-full h-full p-4 flex flex-col justify-between relative"
                            style={{
                              backgroundColor: viewingProject.bgType === 'color' ? viewingProject.bgValue : '#111115',
                              backgroundImage: viewingProject.bgType === 'image' ? `url(${viewingProject.bgValue})` : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          >
                            {/* Realistic shadows matching selected paperFinish */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/15 pointer-events-none" />
                            {paperFinish === 'glossy' && (
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none mix-blend-overlay" />
                            )}
                            {paperFinish === 'textured' && (
                              <div className="absolute inset-0 bg-repeat opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)', backgroundSize: '2.5px 2.5px' }} />
                            )}
                            {paperFinish === 'matte' && (
                              <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-35 pointer-events-none" />
                            )}

                            <div className="relative z-10 flex items-center justify-between font-mono text-[7px] text-white/50 uppercase tracking-widest">
                              <span>{paperFinish.toUpperCase()} PRINT</span>
                              <span className="px-1 py-0.2 border border-white/10 rounded bg-black/40 text-[5.5px]">310 GSM</span>
                            </div>

                            <div className={`relative z-10 my-auto flex flex-col ${
                              viewingProject.align === 'center' ? 'text-center items-center' : viewingProject.align === 'right' ? 'text-right items-end' : 'text-left items-start'
                            }`}>
                              <span className="font-mono text-[7px] uppercase tracking-[0.2em] mb-0.5" style={{ color: viewingProject.accentColor }}>{viewingProject.subtitle}</span>
                              <h4 className="text-[13px] font-bold tracking-tighter leading-tight text-white mb-1" style={{ fontFamily: viewingProject.fontTitle === 'Playfair Display' ? 'serif' : viewingProject.fontTitle === 'Space Grotesk' ? 'sans-serif' : 'monospace' }}>{viewingProject.title}</h4>
                            </div>

                            <div className="relative z-10 pt-1.5 border-t border-white/5 flex flex-col text-left font-mono text-[5.5px]" style={{ color: viewingProject.textColor }}>
                              <p className="line-clamp-2 opacity-65 leading-snug">{viewingProject.details}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      /* STANDARD STUDIO FLAT BLUEPRINT PREVIEW */
                      <motion.div 
                        key="flat"
                        initial={{ opacity: 0, rotateY: 15, scale: 0.92, y: 12 }}
                        animate={{ opacity: 1, rotateY: 0, scale: 1, y: 0 }}
                        exit={{ opacity: 0, rotateY: -15, scale: 0.92, y: -12 }}
                        transition={{ type: 'spring', stiffness: 110, damping: 19 }}
                        className="w-full max-w-[270px] aspect-[4/5] rounded-xl shadow-2xl border border-zinc-850 relative overflow-hidden flex flex-col justify-between p-6 select-none"
                        style={{
                          backgroundColor: viewingProject.bgType === 'color' ? viewingProject.bgValue : '#0d0d0d',
                          backgroundImage: viewingProject.bgType === 'image' ? `url(${viewingProject.bgValue})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        {/* Backdrop hotlinked Unsplash image overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 pointer-events-none" />
                        <div className="absolute inset-0 bg-grain mix-blend-overlay pointer-events-none" />

                        {/* Header stamp */}
                        <div className="relative z-10 flex items-center justify-between font-mono text-[8px] text-zinc-400 uppercase tracking-widest">
                          <span>Exclusive Spec</span>
                          {viewingProject.badge && (
                            <span className="px-1.5 py-0.5 border border-white/20 rounded bg-black/40">
                              {viewingProject.badge}
                            </span>
                          )}
                        </div>

                        {/* Composition Body */}
                        <div className={`relative z-10 my-auto flex flex-col ${
                          viewingProject.align === 'center' ? 'text-center items-center' : viewingProject.align === 'right' ? 'text-right items-end' : 'text-left items-start'
                        }`}>
                          <span 
                            className="font-mono text-[9px] uppercase tracking-[0.2em] mb-1 block"
                            style={{ color: viewingProject.accentColor }}
                          >
                            {viewingProject.subtitle}
                          </span>
                          <h4 
                            className="text-lg font-bold tracking-tighter leading-snug text-white"
                            style={{ fontFamily: viewingProject.fontTitle === 'Playfair Display' ? 'serif' : viewingProject.fontTitle === 'Space Grotesk' ? 'sans-serif' : 'monospace' }}
                          >
                            {viewingProject.title}
                          </h4>
                        </div>

                        {/* Footer metadata */}
                        <div className="relative z-10 pt-3 border-t border-white/10 flex flex-col text-left font-mono text-[7px]" style={{ color: viewingProject.textColor }}>
                          <p className="line-clamp-2 opacity-70 italic leading-relaxed">{viewingProject.details}</p>
                          <div className="mt-1 flex items-center justify-between text-[6px] text-zinc-500 uppercase font-bold">
                            <span>PRESET MOCK_V3</span>
                            <span>© 2026</span>
                          </div>
                        </div>

                        {/* Crop Marks & Bleed Guides Overlay */}
                        {showCropMarks && (
                          <div className="absolute inset-0 pointer-events-none z-30 select-none">
                            {/* Bleed Area boundary dotted red indicator line */}
                            <div className="absolute inset-3 border border-dashed border-red-500/50 flex flex-col justify-between p-1.5">
                              <span className="text-[5.5px] font-mono text-red-500/70 uppercase tracking-widest font-bold self-start scale-90 origin-top-left">Bleed Line (3mm)</span>
                              <span className="text-[5.5px] font-mono text-red-500/70 uppercase tracking-widest font-bold self-end scale-90 origin-bottom-right">Trim Border</span>
                            </div>

                            {/* Traditional printer corner registration lines */}
                            <div className="absolute top-0 left-3 w-[1px] h-4 bg-zinc-350" />
                            <div className="absolute top-3 left-0 w-4 h-[1px] bg-zinc-350" />
                            
                            <div className="absolute top-0 right-3 w-[1px] h-4 bg-zinc-350" />
                            <div className="absolute top-3 right-0 w-4 h-[1px] bg-zinc-350" />

                            <div className="absolute bottom-0 left-3 w-[1px] h-4 bg-zinc-350" />
                            <div className="absolute bottom-3 left-0 w-4 h-[1px] bg-zinc-350" />

                            <div className="absolute bottom-0 right-3 w-[1px] h-4 bg-zinc-350" />
                            <div className="absolute bottom-3 right-0 w-4 h-[1px] bg-zinc-350" />

                            {/* Semicircular center targets */}
                            <div className="absolute top-1/2 left-1.5 -translate-y-1/2 flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-full border border-zinc-350 relative flex items-center justify-center">
                                <div className="absolute top-0 left-[4.5px] w-[1px] h-2.5 bg-zinc-350" />
                                <div className="absolute top-[4.5px] left-0 w-2.5 h-[1px] bg-zinc-350" />
                              </div>
                            </div>
                            <div className="absolute top-1/2 right-1.5 -translate-y-1/2 flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-full border border-zinc-350 relative flex items-center justify-center">
                                <div className="absolute top-0 left-[4.5px] w-[1px] h-2.5 bg-zinc-350" />
                                <div className="absolute top-[4.5px] left-0 w-2.5 h-[1px] bg-zinc-350" />
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Print Medium Selector Controls beneath the poster frame */}
                <div className="w-full max-w-[270px] mt-4 flex flex-col space-y-1 text-center">
                  <span className="text-[8px] font-mono text-zinc-550 uppercase tracking-widest font-bold">Physical Print Medium Simulation</span>
                  <div className="flex gap-1 bg-zinc-950 p-1.5 rounded-xl border border-zinc-900 justify-between items-center text-[9px] font-mono">
                    {[
                      { id: 'none', label: 'Flat Spec' },
                      { id: 'canvas', label: 'Canvas' },
                      { id: 'billboard', label: 'Billboard' },
                      { id: 'physical', label: 'Paper Finish' }
                    ].map((medium) => {
                      const active = printPreviewMedium === medium.id;
                      return (
                        <button
                          key={medium.id}
                          onClick={() => {
                            setPrintPreviewMedium(medium.id as any);
                            triggerToast(`Physical medium view set to: ${medium.label}`, "info");
                          }}
                          className={`flex-1 py-1 rounded text-center transition cursor-pointer font-bold ${
                            active 
                              ? 'bg-gold-500 text-black shadow-inner shadow-gold-600/20' 
                              : 'text-zinc-500 hover:text-zinc-350 bg-zinc-900/30'
                          }`}
                        >
                          {medium.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sliding selector for Paper Finish */}
                {printPreviewMedium === 'physical' && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-[270px] mt-2 p-2 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1 text-center"
                  >
                    <span className="text-[7.5px] font-mono text-gold-400 uppercase tracking-widest font-extrabold block">Finish: {paperFinish.toUpperCase()} Spec</span>
                    <div className="flex gap-1 justify-between items-center text-[8.5px] font-mono">
                      {[
                        { id: 'matte', label: 'Matte' },
                        { id: 'glossy', label: 'Glossy' },
                        { id: 'textured', label: 'Textured' }
                      ].map((finish) => {
                        const active = paperFinish === finish.id;
                        return (
                          <button
                            key={finish.id}
                            onClick={() => {
                              setPaperFinish(finish.id as any);
                              triggerToast(`Simulating ${finish.label} paper texture finish...`, "success");
                            }}
                            className={`flex-1 py-1 rounded transition cursor-pointer font-extrabold ${
                              active 
                                ? 'bg-gold-500 text-black shadow-sm' 
                                : 'text-zinc-500 hover:text-zinc-350 bg-zinc-900/30'
                            }`}
                          >
                            {finish.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* DOMINANT SPECTRUM COLOR PALETTE ANALYZER */}
                <div className="w-full max-w-[270px] mt-5 pt-4 border-t border-zinc-900/80 flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Spectral Palette Analyzer</span>
                    <span className="text-[7px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-extrabold">Auto</span>
                  </div>

                  {colorAnalysisLoading ? (
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 flex flex-col items-center justify-center space-y-2 py-4">
                      <RefreshCw className="w-3.5 h-3.5 text-gold-400 animate-spin" />
                      <span className="text-[8.5px] font-mono text-zinc-500 animate-pulse uppercase tracking-wider">Analyzing background swatches...</span>
                    </div>
                  ) : activeAnalysisId === viewingProject.id ? (
                    <div className="bg-zinc-950 p-2 text-left rounded-xl border border-zinc-900 space-y-2">
                      <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-extrabold mb-1">Top 5 Dominant Color Hex Codes</p>
                      <div className="grid grid-cols-5 gap-1">
                        {getDominantColorsForPoster(viewingProject).map((color, colorIdx) => (
                          <button
                            key={colorIdx}
                            onClick={() => {
                              navigator.clipboard.writeText(color.hex);
                              triggerToast(`Copied ${color.hex} to clipboard!`, "success");
                            }}
                            className="group/swatch relative aspect-square rounded border border-black/55 shadow flex items-center justify-center cursor-pointer transition hover:scale-105 active:scale-95"
                            style={{ backgroundColor: color.hex }}
                            title={`Click to copy: ${color.hex}\n(${color.name})`}
                          >
                            <div className="absolute inset-0 bg-black/40 rounded flex items-center justify-center opacity-0 group-hover/swatch:opacity-100 transition duration-150">
                              <span className="text-[7.5px] text-white font-mono font-bold">RAW</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="space-y-1 pt-1.5 border-t border-zinc-900/60 max-h-24 overflow-y-auto">
                        {getDominantColorsForPoster(viewingProject).slice(0, 3).map((color, colorIdx) => (
                          <div key={colorIdx} className="flex items-center justify-between text-[8px] font-mono text-zinc-400">
                            <span className="truncate max-w-[150px]">{color.name}</span>
                            <span className="text-gold-400 hover:underline cursor-pointer font-bold" onClick={() => {
                              navigator.clipboard.writeText(color.hex);
                              triggerToast(`Copied ${color.hex} to clipboard!`, "success");
                            }}>{color.hex}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 flex flex-col items-center justify-center space-y-1.5 py-4">
                      <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wide">Waiting for system calibration...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Studio Specs Metadata & Interactions (7 cols on MD) */}
              <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between mb-2 gap-4">
                    <div className="flex items-center gap-1.5 text-gold-400 font-mono text-[10px] uppercase tracking-widest font-semibold">
                      <Info className="w-3.5 h-3.5" /> High-fidelity Project Details
                    </div>
                     {/* Bookmark 'Save to Collection' Action Button and Batch Export ZIP */}
                     <div className="flex items-center gap-2">
                       {collections.length > 1 && (
                         <button
                           type="button"
                           onClick={handleBatchExportZIP}
                           className={`flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-lg border transition cursor-pointer select-none ${
                             batchExportState === 'generating'
                               ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400 font-semibold'
                               : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-850 hover:border-indigo-500/20 text-zinc-400 hover:text-indigo-400'
                           }`}
                           title="Download a single ZIP file containing high-fidelity PDFs for all selected items in your collection"
                         >
                           {batchExportState === 'generating' ? (
                             <>
                               <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                               <span>Exporting ({batchExportProgress}%)</span>
                             </>
                           ) : (
                             <>
                               <Download className="w-3 h-3 text-indigo-400/80" />
                               <span>Batch Export ZIP</span>
                             </>
                           )}
                         </button>
                       )}
                       
                       <button
                         onClick={(e) => handleSaveToCollection(e, viewingProject.id, viewingProject.title)}
                         className={`flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-lg border transition cursor-pointer select-none ${
                           collections.includes(viewingProject.id)
                             ? 'bg-gold-500/10 border-gold-500/40 text-gold-400 font-semibold'
                             : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-white'
                         }`}
                         title="Save project specs outline to bookmark collection"
                       >
                         <Bookmark className="w-3.5 h-3.5" style={{ fill: collections.includes(viewingProject.id) ? 'currentColor' : 'none' }} />
                         <span>{collections.includes(viewingProject.id) ? 'Saved' : 'Bookmark'}</span>
                       </button>
                     </div>
                  </div>
                  
                  <h3 className="font-display text-2xl font-bold text-white tracking-tight leading-tight mb-2 font-sans">
                    {viewingProject.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 items-center mb-5">
                    <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                      SPEC CODE: <span className="text-zinc-300 font-bold">{viewingProject.category.toUpperCase()} PERSISTENCY</span>
                    </span>
                    <span className="h-3 w-[1px] bg-zinc-800" />
                    <span className="text-[9.5px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded">
                      {viewingProject.theme} Theme
                    </span>
                    <span className="h-3 w-[1px] bg-zinc-800" />
                    <span className="text-[9.5px] font-mono text-gold-400/95 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded">
                      Est. {viewingProject.dateCreated ? new Date(viewingProject.dateCreated).toLocaleDateString([], { year: 'numeric', month: 'short' }) : 'May 2026'}
                    </span>
                  </div>

                  {/* DETAIL ARCHITECTURE TABS SELECTOR */}
                  <div className="flex border-b border-zinc-900 mb-6 font-mono text-[9px] sm:text-[10px]">
                    <button
                      type="button"
                      onClick={() => setDetailModalTab('specs')}
                      className={`pb-2.5 px-4 font-bold border-b-2 transition-all duration-200 select-none cursor-pointer uppercase tracking-widest ${
                        detailModalTab === 'specs'
                          ? 'border-gold-500 text-gold-400'
                          : 'border-transparent text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Spec Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailModalTab('print')}
                      className={`pb-2.5 px-4 font-bold border-b-2 transition-all duration-200 select-none cursor-pointer uppercase tracking-widest ${
                        detailModalTab === 'print'
                          ? 'border-gold-500 text-gold-400'
                          : 'border-transparent text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Print Settings
                    </button>
                  </div>

                  {detailModalTab === 'print' ? (
                    /* PRINT SETTINGS AND CALIBRATION INFO TAB */
                    <div className="detail-modal-print-settings space-y-4 animate-fade-in text-xs font-mono mb-8">
                      <div className="border border-zinc-900 bg-zinc-900/10 p-4 rounded-xl space-y-3">
                        <h4 className="text-gold-400 font-extrabold uppercase tracking-widest text-[9.5px] flex items-center gap-1.5 border-b border-zinc-900/60 pb-1.5">
                          <Layers className="w-3.5 h-3.5" /> Interactive Print Checks
                        </h4>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer text-zinc-400 text-[10px]">
                            <input type="checkbox" checked={enableHeatmap} onChange={e => setEnableHeatmap(e.target.checked)} className="accent-gold-500" />
                            Enable CMYK Coverage Heatmap
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-zinc-400 text-[10px]">
                            <input type="checkbox" checked={showCropMarks} onChange={e => setShowCropMarks(e.target.checked)} className="accent-gold-500" />
                            Bleed-mark guides (3mm trim)
                          </label>
                          <button onClick={() => {
                            triggerToast("Generating Print Proof with color-check strip...", "info");
                            setTimeout(() => {
                              try {
                                const doc = new jsPDF({
                                  orientation: viewingProject.align === 'center' ? 'landscape' : 'portrait',
                                  unit: 'mm',
                                  format: [210, 297]
                                });
                                doc.setFillColor(viewingProject.bgType === 'color' ? viewingProject.bgValue : '#111');
                                doc.rect(0, 0, 210, 297, 'F');
                                
                                doc.setFillColor('#00FFFF'); doc.rect(10, 280, 10, 5, 'F');
                                doc.setFillColor('#FF00FF'); doc.rect(20, 280, 10, 5, 'F');
                                doc.setFillColor('#FFFF00'); doc.rect(30, 280, 10, 5, 'F');
                                doc.setFillColor('#000000'); doc.rect(40, 280, 10, 5, 'F');

                                doc.setTextColor('#FFFFFF');
                                doc.setFontSize(8);
                                doc.text("CMYK PRINT PROOF - CREATIVENODE STUDIO", 60, 284);
                                doc.save(`print-proof-${viewingProject.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
                                triggerToast("Print proof downloaded successfully!", "success");
                              } catch(err) {
                                triggerToast("Failed to generate proof. Ensure jsPDF is installed.", "alert");
                              }
                            }, 1000);
                          }} className="mt-2 w-full bg-gold-500 hover:bg-gold-400 text-black py-1.5 rounded text-[10px] uppercase font-bold transition">
                            Generate Print Proof
                          </button>
                        </div>
                      </div>

                      <div className="border border-zinc-900 bg-zinc-900/10 p-4 rounded-xl space-y-3">
                        <h4 className="text-gold-400 font-extrabold uppercase tracking-widest text-[9.5px] flex items-center gap-1.5 border-b border-zinc-900/60 pb-1.5">
                          <Printer className="w-3.5 h-3.5" /> Physical Paper Weights (GSM)
                        </h4>
                        <p className="text-zinc-400 text-[10.5px] font-sans leading-relaxed">
                          For high-fidelity physical prints, paper density ensures color vibrancy and structural endurance. Match your GSM specifications perfectly:
                        </p>
                        
                        <div className="space-y-2 pl-1.5 pt-1 text-[11px]">
                          <div className="flex items-start gap-2">
                            <span className="text-gold-400 font-bold">180 GSM:</span>
                            <div>
                              <span className="text-white font-semibold block leading-tight">Standard Matte Fine-Art Stock</span>
                              <span className="text-zinc-500 text-[9.5px] block font-sans">Ideal context for flat posters, proof reviews, and standard sRGB office plotter ink.</span>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2 border-t border-zinc-900/40 pt-2">
                            <span className="text-gold-400 font-bold">240 GSM:</span>
                            <div>
                              <span className="text-white font-semibold block leading-tight">Heavyweight Gallery Rag</span>
                              <span className="text-zinc-500 text-[9.5px] block font-sans">Premium velvet coating with profound ink density. Best configuration for offset presses and custom luxury.</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 border-t border-zinc-900/40 pt-2">
                            <span className="text-gold-400 font-bold">310 GSM:</span>
                            <div>
                              <span className="text-white font-semibold block leading-tight">Collector Museum Velvet Cotton-Rag</span>
                              <span className="text-zinc-500 text-[9.5px] block font-sans">100% thick archival cotton base, acid-free with certified lifetime fade resistance.</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border border-zinc-900 bg-zinc-900/10 p-4 rounded-xl space-y-3">
                        <h4 className="text-gold-400 font-extrabold uppercase tracking-widest text-[9.5px] flex items-center gap-1.5 border-b border-zinc-900/60 pb-1.5">
                          <Layers className="w-3.5 h-3.5" /> Offset Press CMYK Targets
                        </h4>
                        <p className="text-zinc-400 text-[10.5px] font-sans leading-relaxed">
                          Follow professional offset separations targeting FOGRA39 standards to avoid screen washouts:
                        </p>

                        <div className="grid grid-cols-2 gap-3 pt-1 text-[10.5px]">
                          <div>
                            <span className="text-zinc-550 uppercase text-[8px] block font-bold">Rich Black Formula</span>
                            <span className="text-white font-bold">C:60% M:40% Y:40% K:100%</span>
                            <span className="text-zinc-500 text-[9px] block font-sans mt-0.5">Eliminates standard grey washouts.</span>
                          </div>
                          <div>
                            <span className="text-zinc-550 uppercase text-[8px] block font-bold">Hydraulic Bleed Bounds</span>
                            <span className="text-white font-bold">3.0 mm Cut-To-Size Margins</span>
                            <span className="text-zinc-500 text-[9px] block font-sans mt-0.5">Assists precision mechanical trimming.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* COMPARISON BLOCK LOGIC */
                    comparingProject ? (
                    /* SIDE BY SIDE COMPARISON VIEW */
                    <div className="space-y-4 border-t border-zinc-900 pt-4 animate-fade-in text-[11px] font-mono">
                      <div className="flex items-center justify-between">
                        <h4 className="font-mono text-xs text-gold-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" /> Side-By-Side Spec Alignment
                        </h4>
                        <button
                          onClick={() => setComparingProject(null)}
                          className="text-[10px] font-mono uppercase bg-zinc-900 hover:bg-zinc-800 text-zinc-400 px-2 py-1 rounded border border-zinc-805 hover:text-white transition cursor-pointer select-none"
                        >
                          Clear Comparison
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border border-zinc-900 bg-zinc-900/10 p-3 rounded-xl">
                        <div className="text-xs">
                          <span className="text-[10px] font-mono text-gold-400/80 block uppercase tracking-wide">Primary Spec</span>
                          <span className="text-white font-bold text-sm block truncate font-sans">{viewingProject.title}</span>
                          <span className="text-zinc-400 font-mono text-[9px] block uppercase">{viewingProject.subtitle}</span>
                        </div>
                        <div className="text-xs border-l border-zinc-900 pl-4">
                          <span className="text-[10px] font-mono text-gold-400/80 block uppercase tracking-wide">Compared Spec</span>
                          <span className="text-white font-bold text-sm block truncate font-sans">{comparingProject.title}</span>
                          <span className="text-zinc-400 font-mono text-[9px] block uppercase">{comparingProject.subtitle}</span>
                        </div>
                      </div>

                      <div className="space-y-2.5 font-mono text-[11px] leading-relaxed">
                        <div className="grid grid-cols-3 py-1 border-b border-zinc-900/60 items-center">
                          <span className="text-zinc-500 uppercase text-[9px] font-bold">Headline Font</span>
                          <span className="text-white font-sans font-semibold">{viewingProject.fontTitle}</span>
                          <span className="text-white font-sans font-semibold border-l border-zinc-900 pl-4">{comparingProject.fontTitle}</span>
                        </div>

                        <div className="grid grid-cols-3 py-1 border-b border-zinc-900/60 items-center">
                          <span className="text-zinc-500 uppercase text-[9px] font-bold">Subtitle Font</span>
                          <span className="text-white font-sans font-semibold">{viewingProject.fontSubtitle}</span>
                          <span className="text-white font-sans font-semibold border-l border-zinc-900 pl-4">{comparingProject.fontSubtitle}</span>
                        </div>

                        <div className="grid grid-cols-3 py-1 border-b border-zinc-900/60 items-center">
                          <span className="text-zinc-500 uppercase text-[9px] font-bold">Accent Color</span>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded border border-white/15" style={{ backgroundColor: viewingProject.accentColor }} />
                            <span className="text-zinc-350">{viewingProject.accentColor}</span>
                          </div>
                          <div className="flex items-center gap-1.5 border-l border-zinc-900 pl-4">
                            <span className="w-3.5 h-3.5 rounded border border-white/15" style={{ backgroundColor: comparingProject.accentColor }} />
                            <span className="text-zinc-350">{comparingProject.accentColor}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 py-1 border-b border-zinc-900/60 items-center">
                          <span className="text-zinc-500 uppercase text-[9px] font-bold">Geometry Vector</span>
                          <span className="text-white uppercase">{viewingProject.geometricElement || "circle"}</span>
                          <span className="text-white uppercase border-l border-zinc-900 pl-4">{comparingProject.geometricElement || "circle"}</span>
                        </div>

                        <div className="grid grid-cols-3 py-1 border-b border-zinc-900/60 items-center">
                          <span className="text-zinc-500 uppercase text-[9px] font-bold">Layout Align</span>
                          <span className="text-zinc-300 uppercase">{viewingProject.align || "left"}</span>
                          <span className="text-zinc-300 uppercase border-l border-zinc-900 pl-4">{comparingProject.align || "left"}</span>
                        </div>

                        <div className="grid grid-cols-3 py-1 items-start">
                          <span className="text-zinc-500 uppercase text-[9px] font-bold">Keywords Index</span>
                          <span className="text-zinc-400 text-[10px] truncate pr-1">{(viewingProject.keywords || []).slice(0, 2).join(', ')}</span>
                          <span className="text-zinc-400 text-[10px] border-l border-zinc-900 pl-4 truncate">{(comparingProject.keywords || []).slice(0, 2).join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  ) : showComparisonSelector ? (
                    /* COMPARISON SELECTOR DIALOG DRAWER */
                    <div className="border-t border-zinc-900 pt-4 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <h4 className="font-mono text-xs text-gold-400 uppercase tracking-widest font-extrabold">
                          Select Spec Blueprint to Align
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowComparisonSelector(false)}
                          className="text-[10px] font-mono uppercase bg-zinc-905 hover:bg-zinc-800 text-zinc-500 hover:text-white px-2 py-1 rounded cursor-pointer transition select-none"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-[170px] overflow-y-auto pr-1">
                        {posters.filter(p => p.id !== viewingProject.id).map(preset => (
                          <div
                            key={preset.id}
                            onClick={() => {
                              setComparingProject(preset);
                              setShowComparisonSelector(false);
                            }}
                            className="bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900 hover:border-gold-500/40 p-2 rounded-xl cursor-pointer transition flex items-center gap-2 select-none"
                            onMouseEnter={playHapticClick}
                          >
                            <div className="w-8 h-10 bg-zinc-950 border border-zinc-800 rounded overflow-hidden relative flex-shrink-0">
                              <img src={preset.bgValue} loading="lazy" alt="" className="w-full h-full object-cover opacity-60 pointer-events-none" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[11px] font-bold text-white block truncate font-sans">{preset.title}</span>
                              <span className="text-[8.5px] font-mono text-zinc-500 uppercase block truncate">{preset.subtitle}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* DEFAULT PROJECT VIEW DETAILS */
                    <>
                      {/* Brand rationale descriptive block */}
                      <div className="bg-zinc-900/35 border border-zinc-900 rounded-xl p-4 mb-6">
                        <span className="font-mono text-[9px] text-zinc-500 uppercase block mb-1 font-bold">Design Concept Narrative</span>
                        <p className="text-zinc-300 text-xs font-sans leading-relaxed">
                          {viewingProject.details || "A majestic modernist layout engineered under custom grid principles, utilizing spacious margins, contrasting typographic weighting, and colorways tailored to represent aesthetic command."}
                        </p>
                      </div>

                      {/* SPECIFICATION SHEET GRID */}
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-1">
                          <h4 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                            Branding Specifications & Token Replicas
                          </h4>
                          <button
                            type="button"
                            onClick={() => setShowComparisonSelector(true)}
                            className="text-[10px] font-mono text-gold-400 hover:text-gold-300 font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer select-none"
                          >
                            <span>Compare System</span> <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs font-mono">
                          <div>
                            <span className="text-zinc-500 text-[9px] uppercase block">Headline Font</span>
                            <span className="text-white font-semibold font-sans">{viewingProject.fontTitle}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[9px] uppercase block">Subtitle Font</span>
                            <span className="text-white font-semibold font-sans">{viewingProject.fontSubtitle}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[9px] uppercase block">Accent Colorway</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="w-3.5 h-3.5 rounded border border-white/10" style={{ backgroundColor: viewingProject.accentColor }} />
                              <span className="text-white font-bold text-[10.5px]">{viewingProject.accentColor}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[9px] uppercase block">Geometric Element</span>
                            <span className="text-white font-semibold uppercase text-[10.5px]">{viewingProject.geometricElement || "circle"} Vector</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[9px] uppercase block">Date Created</span>
                            <span className="text-gold-400 font-extrabold">{viewingProject.dateCreated ? new Date(viewingProject.dateCreated).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) : 'May 10, 2026'}</span>
                          </div>
                          {viewingProject.expiryDate && (
                            <div>
                              <span className="text-zinc-500 text-[9px] uppercase block">Auto-Expiration</span>
                              <span className="text-red-400 font-extrabold">{new Date(viewingProject.expiryDate).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Physical Print QR Link (Interactive QR Code Generation Tool) */}
                      <div className="border border-zinc-900 bg-zinc-950/45 rounded-xl p-5 mt-4 space-y-4">
                        <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2.5">
                          <QrCode className="w-4 h-4 text-gold-400" />
                          <span className="font-mono text-[10px] uppercase tracking-wider text-white font-extrabold">Aesthetic Print Labeling (QR Code Tool)</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 items-center">
                          {/* Left Panel: Preview Frame */}
                          <div className="shrink-0 p-2 bg-white rounded-xl shadow-lg border border-zinc-200">
                            <ProjectQRCode 
                              url={qrCustomUrl || `${window.location.origin}${window.location.pathname}?project=${viewingProject.id}`} 
                              size={120} 
                              fgColor={qrFgColor}
                              bgColor={qrBgColor}
                            />
                          </div>

                          {/* Right Panel: Settings inputs */}
                          <div className="flex-grow w-full text-left font-mono space-y-3.5">
                            {/* Destination link configuration */}
                            <div>
                              <span className="text-[8.5px] text-zinc-500 uppercase block mb-1">Custom Destination Link</span>
                              <input 
                                type="text"
                                value={qrCustomUrl}
                                onChange={(e) => setQrCustomUrl(e.target.value)}
                                placeholder="Route scan target..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-[9.5px] text-white focus:border-gold-550 focus:border-[#D4AF37] outline-none font-mono"
                              />
                            </div>

                            {/* Preset colorways */}
                            <div>
                              <span className="text-[8.5px] text-zinc-500 uppercase block mb-1.5">Label Styling Preset</span>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { label: 'Classic Black/White', fg: '#000000', bg: '#ffffff' },
                                  { label: 'Luxury Charcoal/Gold', fg: '#d4af37', bg: '#09090b' },
                                  { label: 'Minimal Slate/White', fg: '#1e293b', bg: '#f8fafc' },
                                  { label: 'Contrast Crimson/Dark', fg: '#ef4444', bg: '#09090b' }
                                ].map((preset) => {
                                  const isActive = qrFgColor === preset.fg && qrBgColor === preset.bg;
                                  return (
                                    <button
                                      key={preset.label}
                                      type="button"
                                      onClick={() => {
                                        setQrFgColor(preset.fg);
                                        setQrBgColor(preset.bg);
                                      }}
                                      className={`text-[8px] uppercase tracking-normal px-2 py-1 rounded transition select-none cursor-pointer border ${
                                        isActive 
                                          ? 'bg-gold-500 border-gold-400 text-black font-extrabold' 
                                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                                      }`}
                                    >
                                      {preset.label.split(' ')[1] || preset.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Download execution */}
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const defaultUrl = `${window.location.origin}${window.location.pathname}?project=${viewingProject.id}`;
                                    const targetUrl = qrCustomUrl || defaultUrl;
                                    const dataUrl = await QRCode.toDataURL(targetUrl, {
                                      width: 600,
                                      margin: 2,
                                      color: {
                                        dark: qrFgColor,
                                        light: qrBgColor
                                      }
                                    });
                                    const link = document.createElement('a');
                                    link.href = dataUrl;
                                    link.download = `${viewingProject.title.toLowerCase().replace(/\s+/g, '_')}_custom_label_qr.png`;
                                    link.click();
                                    triggerToast("Stylized QR Code downloaded for physical packaging!", "success");
                                  } catch (e) {
                                    triggerToast("Failed to compile custom QR.", "alert");
                                  }
                                }}
                                className="w-full text-center text-[9px] uppercase bg-zinc-900 border border-zinc-800 hover:border-gold-500/30 hover:bg-zinc-850 px-2.5 py-1.5 rounded text-gold-400 font-extrabold tracking-wide transition cursor-pointer select-none"
                              >
                                Download Scannable QR Label
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* PRINT COST ESTIMATOR UTILITY CARD */}
                      <div className="border-t border-zinc-900 pt-6 mt-6">
                        <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3.5">
                            <div className="flex items-center gap-1 w-full relative">
                              <Printer className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Print Cost Estimator</span>
                              
                              {/* Help Icon Tooltip Trigger */}
                              <div className="relative inline-flex items-center ml-0.5">
                                <button
                                  type="button"
                                  onClick={() => setShowQualityHelp(!showQualityHelp)}
                                  onMouseEnter={() => setShowQualityHelp(true)}
                                  onMouseLeave={() => setShowQualityHelp(false)}
                                  className="p-1 text-zinc-550 hover:text-indigo-400 transition cursor-pointer flex items-center justify-center rounded-full hover:bg-zinc-800/40"
                                  title="Explain Paper Qualities"
                                >
                                  <HelpCircle className="w-3 h-3" />
                                </button>
                                
                                {showQualityHelp && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl z-50 text-left">
                                    <div className="text-[10px] font-mono leading-relaxed space-y-2.5 text-zinc-300">
                                      <div>
                                        <span className="text-zinc-100 font-bold uppercase tracking-wider block text-[9px] text-indigo-400">Standard Quality</span>
                                        <span className="text-[9px] text-zinc-400">180gsm matte fine-art stock. Crisp lines, natural texture, standard long-lasting ink.</span>
                                      </div>
                                      <div className="border-t border-zinc-900 pt-2">
                                        <span className="text-zinc-100 font-bold uppercase tracking-wider block text-[9px] text-indigo-400">Premium Quality</span>
                                        <span className="text-[9px] text-zinc-400">240gsm high-density heavy stock. Enhanced black saturation, velvet smooth touch.</span>
                                      </div>
                                      <div className="border-t border-zinc-900 pt-2">
                                        <span className="text-zinc-100 font-bold uppercase tracking-wider block text-[9px] text-indigo-400">Collector Quality</span>
                                        <span className="text-[9px] text-zinc-400">310gsm museum 100% cotton-rag archival. Lifetime certified fade resistance.</span>
                                      </div>
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-x-4 border-x-transparent border-t-4 border-t-zinc-950" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Reset Estimator and Show Print Preview togglers */}
                            <button
                              type="button"
                              onClick={() => {
                                setEstimatorSize('A3');
                                setEstimatorQuality('premium');
                                triggerToast("Estimator options reset to defaults (A3, Premium).", "info");
                              }}
                              className="text-[8px] font-mono text-zinc-500 hover:text-indigo-400 font-bold uppercase tracking-widest cursor-pointer transition select-none flex items-center gap-1 shrink-0"
                              title="Reset all selections"
                            >
                              <RefreshCw className="w-2.5 h-2.5" />
                              <span>Reset</span>
                            </button>
                          </div>

                           <div className="space-y-3 font-mono text-[10px]">
                            <div>
                              <div className="flex items-center gap-1 mb-1 relative">
                                <label className="text-zinc-500 uppercase text-[8px] tracking-wider">Dimensions</label>
                                <button
                                  type="button"
                                  onClick={() => setShowSizeTooltip(!showSizeTooltip)}
                                  onMouseEnter={() => setShowSizeTooltip(true)}
                                  onMouseLeave={() => setShowSizeTooltip(false)}
                                  className="text-zinc-550 hover:text-indigo-400 cursor-pointer text-[10px] select-none font-bold outline-none leading-none flex items-center justify-center h-3.5 w-3.5 rounded-full hover:bg-zinc-800/60 transition"
                                  title="Explain Dimension Impacts"
                                >
                                  ?
                                </button>

                                {showSizeTooltip && (
                                  <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl z-50 text-left normal-case">
                                    <div className="text-[9.5px] leading-relaxed text-zinc-300 font-mono space-y-1.5">
                                      <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wide">Dimension Surcharges:</div>
                                      <div><span className="text-white font-bold">A4 Size:</span> Baseline print cost. Ideal for study matrices and desk boards.</div>
                                      <div><span className="text-white font-bold">A3 Size:</span> +$15 surcharge. Perfect physical format for modernist apartments.</div>
                                      <div><span className="text-white font-bold">Poster Size:</span> +$35 surcharge. Dramatic oversized scale for high-end gallery showcases.</div>
                                    </div>
                                    <div className="absolute top-full left-3 -mt-1 border-x-4 border-x-transparent border-t-4 border-t-zinc-950" />
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-3 gap-1.5">
                                {(['A4', 'A3', 'Poster'] as const).map(size => (
                                  <button
                                    key={size}
                                    type="button"
                                    onClick={() => setEstimatorSize(size)}
                                    className={`py-1 rounded-lg text-center transition select-none cursor-pointer text-[9px] font-bold ${
                                      estimatorSize === size 
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                                        : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-900/40'
                                    }`}
                                  >
                                    {size}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center gap-1 mb-1 relative">
                                <label className="text-zinc-500 uppercase text-[8px] tracking-wider">Paper Quality</label>
                                <button
                                  type="button"
                                  onClick={() => setShowQualityTooltip(!showQualityTooltip)}
                                  onMouseEnter={() => setShowQualityTooltip(true)}
                                  onMouseLeave={() => setShowQualityTooltip(false)}
                                  className="text-zinc-550 hover:text-indigo-400 cursor-pointer text-[10px] select-none font-bold outline-none leading-none flex items-center justify-center h-3.5 w-3.5 rounded-full hover:bg-zinc-800/60 transition"
                                  title="Explain Paper Quality Pricing"
                                >
                                  ?
                                </button>

                                {showQualityTooltip && (
                                  <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-zinc-950 border border-zinc-805 rounded-lg shadow-xl z-50 text-left normal-case">
                                    <div className="text-[9.5px] leading-relaxed text-zinc-300 font-mono space-y-1.5">
                                      <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wide">Quality Price Impact:</div>
                                      <div><span className="text-white font-bold">Standard (180gsm):</span> Standard matte paper. Base price.</div>
                                      <div><span className="text-white font-bold">Premium (240gsm):</span> Velvet tactile touch. +15% paper surcharge.</div>
                                      <div><span className="text-white font-bold">Collector (310gsm):</span> Lifetime 100% cotton archival stock. +35% collector surcharge.</div>
                                    </div>
                                    <div className="absolute top-full left-3 -mt-1 border-x-4 border-x-transparent border-t-4 border-t-zinc-950" />
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-3 gap-1.5">
                                {(['standard', 'premium', 'collector'] as const).map(quality => (
                                  <button
                                    key={quality}
                                    type="button"
                                    onClick={() => setEstimatorQuality(quality)}
                                    className={`py-1 rounded-lg text-center capitalize transition select-none cursor-pointer text-[9px] font-bold ${
                                      estimatorQuality === quality 
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                                        : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-900/40'
                                    }`}
                                  >
                                    {quality}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Show Print Preview toggle control */}
                            <div className="pt-2 flex items-center justify-between border-t border-zinc-900/40">
                              <span className="text-zinc-550 text-[8px] uppercase tracking-wider font-bold">Grid Dimensions Preview</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowPrintPreview(!showPrintPreview);
                                  triggerToast(showPrintPreview ? "Visual grid disabled." : "Visual grid preview enabled.", "info");
                                }}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-mono uppercase font-bold tracking-widest transition cursor-pointer select-none border ${
                                  showPrintPreview 
                                    ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/60' 
                                    : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-350'
                                }`}
                              >
                                <Eye className="w-3 h-3" />
                                <span>{showPrintPreview ? 'Hide Preview' : 'Show Preview'}</span>
                              </button>
                            </div>

                            {/* Crop Marks and Bleed Area toggle */}
                            <div className="pt-2 flex items-center justify-between border-t border-zinc-900/40">
                              <span className="text-zinc-550 text-[8px] uppercase tracking-wider font-bold">Crop Marks & Bleed Guides</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCropMarks(!showCropMarks);
                                  triggerToast(!showCropMarks ? "Printer alignment guides and trim/bleed limits activated." : "Printer crop marks hidden.", "info");
                                }}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-mono uppercase font-bold tracking-widest transition cursor-pointer select-none border ${
                                  showCropMarks 
                                    ? 'bg-rose-950/40 text-rose-400 border-rose-900/60' 
                                    : 'bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-350'
                                }`}
                              >
                                <Scissors className="w-3 h-3" />
                                <span>{showCropMarks ? 'Hide Marks' : 'Show Marks'}</span>
                              </button>
                            </div>

                            {/* Proportional Grid Overlay */}
                            {showPrintPreview && (
                              <div className="mt-2 bg-zinc-950/80 border border-zinc-900 rounded-xl p-3 relative overflow-hidden transition-all duration-300">
                                <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">PROPORTIONAL SCALE COMPARISON (GRID)</span>
                                
                                <div className="aspect-[16/9] bg-zinc-900/30 rounded-lg border border-zinc-900/60 relative flex items-center justify-center p-2">
                                  {/* Outer reference container representing the wall space or maximum size */}
                                  <div className="absolute inset-1.5 border border-dashed border-zinc-800/60 rounded flex items-center justify-center">
                                    <span className="absolute bottom-1 right-1.5 text-[6px] font-mono text-zinc-650">Display Wall (Reference Space)</span>
                                  </div>

                                  {/* Proportional print sizes drawn on top of each other to show size ratio */}
                                  <div className="relative w-full h-full flex items-center justify-center">
                                    {/* Poster size boundary - larger */}
                                    <div className={`border transition-all duration-500 rounded p-1 flex flex-col justify-between ${
                                      estimatorSize === 'Poster' 
                                        ? 'w-[85%] h-[90%] bg-indigo-950/25 border-indigo-500/50 z-30' 
                                        : 'w-[85%] h-[90%] border-zinc-800/30 opacity-30 z-10'
                                    }`}>
                                      <span className="text-[6.5px] font-bold text-zinc-550 font-mono">Poster (24&quot; x 36&quot;)</span>
                                      {estimatorSize === 'Poster' && <span className="text-[7px] font-mono font-bold text-center text-indigo-400 self-center">Active Target (Max Scale)</span>}
                                    </div>
                                    
                                    {/* A3 size boundary - medium */}
                                    <div className={`absolute border transition-all duration-500 rounded p-1 flex flex-col justify-between ${
                                      estimatorSize === 'A3' 
                                        ? 'w-[55%] h-[65%] bg-indigo-950/25 border-indigo-500/50 z-30' 
                                        : 'w-[55%] h-[65%] border-zinc-800/30 opacity-30 z-10'
                                    }`}>
                                      <span className="text-[6.5px] font-bold text-zinc-550 font-mono">A3 (11.7&quot; x 16.5&quot;)</span>
                                      {estimatorSize === 'A3' && <span className="text-[7px] font-mono font-bold text-center text-indigo-400 self-center">Active Target</span>}
                                    </div>

                                    {/* A4 size boundary - smallest */}
                                    <div className={`absolute border transition-all duration-500 rounded p-1 flex flex-col justify-between ${
                                      estimatorSize === 'A4' 
                                        ? 'w-[35%] h-[42%] bg-indigo-950/25 border-indigo-500/50 z-30' 
                                        : 'w-[35%] h-[42%] border-zinc-800/30 opacity-30 z-0'
                                    }`}>
                                      <span className="text-[6.5px] font-bold text-zinc-550 font-mono">A4 (8.3&quot; x 11.7&quot;)</span>
                                      {estimatorSize === 'A4' && <span className="text-[7px] font-mono font-bold text-center text-indigo-400 self-center">Active Target</span>}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-2.5 flex items-center justify-between text-[7px] font-mono text-zinc-500">
                                  <span>Active Selection: <strong className="text-zinc-300">{estimatorSize}</strong></span>
                                  <span>Resolution: <strong className="text-zinc-400">300 DPI Fine-Art</strong></span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3.5 border-t border-zinc-900/80 flex items-center justify-between">
                            <div className="text-left font-mono">
                              <span className="text-[8px] text-zinc-550 uppercase block font-bold leading-none mb-0.5">Est. Fine Art Print Cost</span>
                              <span className="text-sm font-extrabold text-white">
                                ${(() => {
                                  let base = 22;
                                  if (estimatorSize === 'A4') base = 12;
                                  if (estimatorSize === 'Poster') base = 38;

                                  let extra = 0;
                                  if (estimatorQuality === 'premium') extra = 5;
                                  if (estimatorQuality === 'collector') extra = 12;

                                  const multiplier = estimatorQuality === 'standard' ? 1.0 : estimatorQuality === 'premium' ? 1.25 : 1.6;
                                  return Math.round(base * multiplier + extra);
                                })()}
                              </span>
                            </div>
                            <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded uppercase font-bold animate-pulse">
                              Full sRGB Gamut
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* SPECIFICATION QR CODE & WHATSAPP ROW */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {/* QR Code Spec Downloader */}
                        <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between items-center text-center">
                          <div className="w-full flex flex-col items-center">
                            <div className="flex items-center justify-center gap-1.5 mb-2.5">
                              <QrCode className="w-3.5 h-3.5 text-gold-400" />
                              <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest font-bold">SPEC SHEET QR</span>
                            </div>
                            <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-900 filter invert opacity-95">
                              <ProjectQRCode 
                                url={`${window.location.origin}${window.location.pathname}?project=${viewingProject.id}`} 
                                size={70} 
                              />
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleDownloadQRCode(
                              viewingProject.title, 
                              `${window.location.origin}${window.location.pathname}?project=${viewingProject.id}`
                            )}
                            className="w-full mt-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-gold-500/20 text-gold-400 hover:text-white py-1.5 rounded-lg text-[9.5px] font-mono uppercase font-bold tracking-wider transition select-none cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5 text-gold-400/80" />
                            <span>Download QR</span>
                          </button>
                        </div>

                        {/* WhatsApp Custom Enquiry */}
                        <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 flex flex-col justify-between items-center text-center">
                          <div className="w-full flex flex-col items-center">
                            <div className="flex items-center justify-center gap-1.5 mb-2.5">
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Studio Enquire</span>
                            </div>
                            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900/80 w-[78px] h-[78px] flex items-center justify-center">
                              <MessageCircle className="w-9 h-9 text-emerald-500 animate-pulse fill-emerald-500/10" />
                            </div>
                          </div>
                          
                          <a
                            href={`https://wa.me/15550199?text=Hello%20CreativeNode%2520Studio!%2520I%2520would%2520love%2520to%2520order%2520or%2520get%2520more%2520information%2520about%2520the%252520"${encodeURIComponent(viewingProject.title)}"%252520poster%252520specification%252520(${viewingProject.id}).`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full mt-3 bg-emerald-650 hover:bg-emerald-600 text-white py-1.5 rounded-lg text-[9.5px] font-mono uppercase font-bold tracking-wider transition select-none cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
                            <span>Inquiry WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </>
                  ))}
                     {/* Bottom Action interactions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-8 md:pt-4 border-t border-zinc-900 mt-6">
                  {/* Quick Export Floating Action Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (exportState === 'generating') return;
                      handleExportPortfolioProjectPDF(viewingProject);
                    }}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-800 text-gold-400 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 text-xs select-none cursor-pointer"
                    title="Export certified portfolio detail layout as specification PDF document"
                  >
                    {exportState === 'generating' && exportType === 'PDF' ? (
                      <div className="flex items-center gap-1.5 animate-pulse text-gold-400">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Compiling... {exportProgress}%</span>
                      </div>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-gold-400" />
                        <span>Quick Export PDF</span>
                      </>
                    )}
                  </button>

                  {/* Share to Instagram Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isGeneratingInstagram) return;
                      handleShareToInstagram(viewingProject);
                    }}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-pink-500/30 text-pink-400 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 text-xs select-none cursor-pointer"
                    title="Generate perfectly styled 9:16 portrait design image matching Instagram Story layout scale"
                  >
                    {isGeneratingInstagram === viewingProject.id ? (
                      <div className="flex items-center gap-1.5 animate-pulse text-pink-400">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Rendering Story...</span>
                      </div>
                    ) : (
                      <>
                        <Instagram className="w-4 h-4 text-pink-400" />
                        <span>Share to Instagram</span>
                      </>
                    )}
                  </button>

                  {/* Email to Friend Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const subject = encodeURIComponent(`Bespoke Poster Spec: ${viewingProject.title}`);
                      const url = `${window.location.origin}${window.location.pathname}?project=${viewingProject.id}`;
                      const body = encodeURIComponent(`Hi!\n\nI wanted to share this gorgeous bespoke poster design with you: "${viewingProject.title}". It is an exclusive, luxury modernist design concept crafted by CreativeNode Atelier.\n\nExplore the design, system specs, and physical print parameters directly here:\n${url}\n\nHope you find it as inspiring as I did!`);
                      window.location.href = `mailto:?subject=${subject}&body=${body}`;
                      triggerToast("Pre-filled email brief opened.", "success");
                    }}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-blue-500/30 text-blue-400 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 text-xs select-none cursor-pointer"
                    title="Email this poster design spec to a peer or client"
                  >
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>Email Spec</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleLoadTemplate(viewingProject.id);
                      setViewingProject(null);
                    }}
                    className="flex-1 bg-gold-400 hover:bg-gold-300 text-black font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 text-xs select-none cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="uppercase font-mono font-extrabold tracking-wide text-[10px]">Atelier Customize</span>
                  </button>
                </div>

                {/* Production-grade deliverables row */}
                <div className="pt-4 border-t border-zinc-900/60 mt-4">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono uppercase font-bold mb-2.5">
                    <Printer className="w-3 h-3 text-zinc-500" />
                    <span>HIFI ASSETS FOR OFFSET PRINTING & MASTER VECTORS</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      disabled={exportState === 'generating'}
                      onClick={() => handleExportPortfolioProjectSVG(viewingProject)}
                      className={`flex-1 bg-zinc-950 hover:bg-zinc-900 md:border border-zinc-900 hover:border-gold-500/25 text-zinc-400 hover:text-white font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 text-xs select-none cursor-pointer ${exportState === 'generating' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Download clean, infinite scalable SVG vector design specifications"
                    >
                      <Layers className="w-3.5 h-3.5 text-gold-400/80" />
                      <span>{exportState === 'generating' && exportType === 'SVG' ? `SVG Progress (${exportProgress}%)` : 'Export SVG (Vector)'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={exportState === 'generating'}
                      onClick={() => handleExportPortfolioProjectTIFF(viewingProject)}
                      className={`flex-1 bg-zinc-950 hover:bg-zinc-900 md:border border-zinc-900 hover:border-indigo-500/25 text-zinc-400 hover:text-white font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 text-xs select-none cursor-pointer ${exportState === 'generating' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Download 300DPI pixel-perfect lossless TIFF image for offset printing presses"
                    >
                      <Printer className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{exportState === 'generating' && exportType === 'TIFF' ? `TIFF Progress (${exportProgress}%)` : 'Export TIFF (sRGB Glossy)'}</span>
                    </button>
                  </div>
                </div>

                {/* Real-time Progressive Generation Status Monitor */}
                {exportState === 'generating' && (
                  <div className="mt-4 bg-zinc-900/40 border border-indigo-950 rounded-xl p-3.5 space-y-2.5 font-mono text-[10px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating {exportType} Asset...</span>
                      </div>
                      <span className="font-bold text-indigo-300">{exportProgress}%</span>
                    </div>

                    <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900/30">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-gold-400 transition-all duration-300"
                        style={{ width: `${exportProgress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[8px] text-zinc-500 uppercase tracking-widest font-bold">
                      <span>status: {exportProgress === 100 ? 'DOWNLOAD SENT' : 'COMPILING FILESTREAM'}</span>
                      <span>{exportProgress < 40 ? 'Allocating memory' : exportProgress < 85 ? 'Rasterizing layers' : 'Finalizing metadata stream'}</span>
                    </div>
                  </div>
                )}              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modernist Design Principles Guidance Academy */}
      <DesignPrinciplesModal 
        isOpen={showDesignPrinciples} 
        onClose={() => setShowDesignPrinciples(false)} 
      />

      {/* Keyboard Shortcuts Cheat Sheets Modal overlay */}
      <AnimatePresence>
        {isShortcutModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setIsShortcutModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-2xl p-6 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setIsShortcutModalOpen(false)}
                className="absolute right-4 top-4 text-zinc-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-gold-400" />
                <h3 className="text-sm font-bold font-sans uppercase tracking-wider text-white">
                  Studio Keyboard Shortcuts
                </h3>
              </div>

              <p className="text-zinc-500 text-[11px] font-mono leading-relaxed mb-4 border-b border-zinc-900 pb-3">
                Increase your poster design efficiency with physical hotkeys tuned for high-speed atelier workflow.
              </p>

              <div className="space-y-3 font-mono text-[11px]">
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-900/60">
                  <span className="text-zinc-400">Toggle Shortcuts Menu</span>
                  <div className="flex items-center gap-1">
                    <kbd className="bg-zinc-900 text-gold-400 px-2 py-0.5 rounded border border-zinc-800 text-[10px] font-bold">Shift</kbd>
                    <span>+</span>
                    <kbd className="bg-zinc-900 text-gold-400 px-2 py-0.5 rounded border border-zinc-800 text-[10px] font-bold">?</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-900/60">
                  <span className="text-zinc-400">Atelier Studio Customize</span>
                  <div className="flex items-center gap-1">
                    <kbd className="bg-zinc-900 text-zinc-350 px-1.5 py-0.5 rounded border border-zinc-800 text-[9px]">Cmd / Ctrl</kbd>
                    <span>+</span>
                    <kbd className="bg-zinc-900 text-zinc-350 px-1.5 py-0.5 rounded border border-zinc-800 text-[9px]">N</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-900/60">
                  <span className="text-zinc-400">Jump to Activity Log Ledger</span>
                  <div className="flex items-center gap-1">
                    <kbd className="bg-zinc-900 text-zinc-350 px-1.5 py-0.5 rounded border border-zinc-800 text-[9px]">Cmd / Ctrl</kbd>
                    <span>+</span>
                    <kbd className="bg-zinc-900 text-zinc-350 px-1.5 py-0.5 rounded border border-zinc-800 text-[9px]">H</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-900/60">
                  <span className="text-zinc-400">Save Poster / Trigger Collection</span>
                  <div className="flex items-center gap-1">
                    <kbd className="bg-zinc-900 text-zinc-350 px-1.5 py-0.5 rounded border border-zinc-800 text-[9px]">Cmd / Ctrl</kbd>
                    <span>+</span>
                    <kbd className="bg-zinc-900 text-zinc-350 px-1.5 py-0.5 rounded border border-zinc-800 text-[9px]">S</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-900/60">
                  <span className="text-zinc-400">Assemble Specs & Export Tools</span>
                  <div className="flex items-center gap-1">
                    <kbd className="bg-zinc-900 text-zinc-350 px-1.5 py-0.5 rounded border border-zinc-800 text-[9px]">Cmd / Ctrl</kbd>
                    <span>+</span>
                    <kbd className="bg-zinc-900 text-zinc-350 px-1.5 py-0.5 rounded border border-zinc-800 text-[9px]">E</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-900/60">
                  <span className="text-zinc-400">Next / Prev Poster Spec</span>
                  <div className="flex items-center gap-1">
                    <kbd className="bg-zinc-900 text-zinc-350 px-1.5 py-0.5 rounded border border-zinc-800 text-[9px]">←</kbd>
                    <span>/</span>
                    <kbd className="bg-zinc-900 text-zinc-350 px-1.5 py-0.5 rounded border border-zinc-800 text-[9px]">→</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-zinc-400">Dismiss Overlays / Reset Filters</span>
                  <kbd className="bg-zinc-900 text-zinc-350 px-2 py-0.5 rounded border border-zinc-800 text-[10px]">Esc</kbd>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-900 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsShortcutModalOpen(false)}
                  className="bg-gold-400 hover:bg-gold-300 text-black font-semibold font-mono text-[10px] uppercase py-1.5 px-4 rounded-lg cursor-pointer transition select-none"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sovereign Studio Gateway Auth Portal Modal */}
      <AuthPortal 
        isOpen={isAuthPortalOpen}
        onClose={() => setIsAuthPortalOpen(false)}
        onAuthSuccess={(u) => {
          console.log("Welcome client user login:", u);
        }}
      />

      {/* Premium Notification Toast: Deep Link Share Copied & System Alert indicators */}
      <AnimatePresence>
        {(copiedShareUrl || appToast) && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[120] bg-zinc-950/95 border text-zinc-200 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 shadow-2xl backdrop-blur-md max-w-sm ${
              appToast?.type === 'alert' ? 'border-red-500/30' : 'border-gold-500/30'
            }`}
          >
            {appToast?.type === 'alert' ? (
              <ShieldAlert className="w-4.5 h-4.5 text-red-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4.5 h-4.5 text-gold-400 shrink-0" />
            )}
            <div className="font-mono text-left">
              <span className={`text-[9.5px] uppercase tracking-widest block font-bold ${
                appToast?.type === 'alert' ? 'text-red-400' : 'text-gold-400'
              }`}>
                {appToast ? (appToast.type === 'alert' ? 'Quota Notice' : 'System Indicator') : 'Deep-Link Captured'}
              </span>
              <span className="text-zinc-300">
                {appToast ? appToast.message : (
                  <>Copied share link for <strong className="text-white font-semibold">{copiedShareUrl}</strong> to clipboard.</>
                )}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Quick-Contact Button */}
      <div className="fixed bottom-6 left-6 z-[100]">
        <a
          href="https://wa.me/15550199?text=Hello%20CreativeNode%20Studio!%20I%20would%20love%20to%20consult%20on%20a%20professional%20poster%20project%20outline."
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[9px] font-bold tracking-widest uppercase py-2.5 px-3.5 rounded-full shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer select-none"
          title="Direct Quick-Contact WhatsApp Support"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-[125px] transition-all duration-500 ease-out whitespace-nowrap block">
            WhatsApp Contact
          </span>
        </a>
      </div>
    </div>
    </GoogleOAuthProvider>
  );
}
