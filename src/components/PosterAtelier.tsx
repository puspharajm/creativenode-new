import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Download, RotateCcw, Share2, Eye, EyeOff, Mic, MicOff,
  Layout, Type, Palette, ArrowRight, Check, CheckCircle2, History, AlertCircle, RefreshCw, X,
  Undo, Redo, Grid, ArrowUp, ArrowDown, Layers, Trash2, Sliders, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { PosterComposition, PosterTemplate, DesignBrief } from '../types';
import { PORTFOLIO_PRESETS, PRICING_TIERS } from '../data';
import ConfettiCanvas from './ConfettiCanvas';
import PrintPreviewModal from './PrintPreviewModal';

export interface PremiumAsset {
  id: string;
  category: 'shape' | 'ornament' | 'texture';
  label: string;
  content: string;
}

export const PREMIUM_ASSETS: PremiumAsset[] = [
  {
    id: 'asset-shape-crosshair',
    category: 'shape',
    label: 'Brutalist Target Crosshair',
    content: `<svg viewBox="0 0 100 100" fill="none" class="w-full h-full stroke-current" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3,3"/><line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" stroke-width="1"/><line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" stroke-width="1"/></svg>`
  },
  {
    id: 'asset-shape-starburst',
    category: 'shape',
    label: '12-Point Starburst',
    content: `<svg viewBox="0 0 100 100" fill="currentColor" class="w-full h-full" xmlns="http://www.w3.org/2000/svg"><path d="M50 0 L55 35 L90 14 L65 44 L100 50 L65 56 L90 86 L55 65 L50 100 L45 65 L10 86 L35 56 L0 50 L35 44 L10 14 L45 35 Z"/></svg>`
  },
  {
    id: 'asset-shape-rings',
    category: 'shape',
    label: 'Concentric Focal Rings',
    content: `<svg viewBox="0 0 100 100" fill="none" class="w-full h-full stroke-current" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="30" stroke="currentColor" stroke-width="1.5"/><circle cx="50" cy="50" r="15" stroke="currentColor" stroke-width="1"/></svg>`
  },
  {
    id: 'asset-shape-wave',
    category: 'shape',
    label: 'Fluid Alignment Wave',
    content: `<svg viewBox="0 0 100 40" fill="none" class="w-full h-full stroke-current" xmlns="http://www.w3.org/2000/svg"><path d="M 0,20 Q 12.5,5 25,20 T 50,20 T 75,20 T 100,20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`
  },
  {
    id: 'asset-shape-cube',
    category: 'shape',
    label: 'Isometric Brutalist Cube',
    content: `<svg viewBox="0 0 100 100" fill="none" class="w-full h-full stroke-current" xmlns="http://www.w3.org/2000/svg"><path d="M50 15 L85 35 L85 75 L50 95 L15 75 L15 35 Z" stroke="currentColor" stroke-width="2"/><path d="M50 15 L50 95 M15 35 L50 55 M85 35 L50 55" stroke="currentColor" stroke-width="1.5"/></svg>`
  },
  {
    id: 'asset-ornament-bracket',
    category: 'ornament',
    label: 'Swiss Bracket [SYSTEM]',
    content: `[ SYSTEM // ATELIER V.2 ]`
  },
  {
    id: 'asset-ornament-warn',
    category: 'ornament',
    label: 'Security Notice Stamp',
    content: `▲ ATELIER COMPLIANT SECURITY`
  },
  {
    id: 'asset-ornament-metrics',
    category: 'ornament',
    label: 'DPI Alignment stamp',
    content: `300DPI OUTPUT_ACTIVE [ 44x8 ]`
  },
  {
    id: 'asset-texture-scanlines',
    category: 'texture',
    label: 'Subtle Scanline Array',
    content: `<svg viewBox="0 0 100 100" fill="none" class="w-full h-full stroke-current" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="5" x2="100" y2="5" stroke="currentColor" stroke-width="0.5"/><line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" stroke-width="0.5"/><line x1="0" y1="35" x2="100" y2="35" stroke="currentColor" stroke-width="0.5"/><line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" stroke-width="0.5"/><line x1="0" y1="65" x2="100" y2="65" stroke="currentColor" stroke-width="0.5"/><line x1="0" y1="80" x2="100" y2="80" stroke="currentColor" stroke-width="0.5"/><line x1="0" y1="95" x2="100" y2="95" stroke="currentColor" stroke-width="0.5"/></svg>`
  },
  {
    id: 'asset-texture-ticks',
    category: 'texture',
    label: 'Serrated Ruler Guide',
    content: `<svg viewBox="0 0 100 20" fill="none" class="w-full h-full stroke-current" xmlns="http://www.w3.org/2000/svg"><path d="M 0,10 H 100" stroke="currentColor" stroke-width="1.5"/><path d="M 0,5 V 15 M 10,5 V 15 M 20,5 V 15 M 30,5 V 15 M 40,5 V 15 M 50,5 V 15 M 60,5 V 15 M 70,5 V 15 M 80,5 V 15 M 90,5 V 15 M 100,5 V 15" stroke="currentColor" stroke-width="1"/></svg>`
  }
];

interface PosterAtelierProps {
  initialTemplateId?: string | null;
  onClearInitialTemplate?: () => void;
  onBriefAdded?: () => void;
  userTier?: 'free' | 'pro' | 'sovereign';
  getDailyCount?: () => number;
  getDailyLimit?: () => number;
  onIncrementDesignCount?: () => boolean;
}

function getRelativeLuminance(hex: string): number {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }
  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

  const R = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const G = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const B = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function getContrastRatio(hexBg: string, hexFg: string): number {
  try {
    const l1 = getRelativeLuminance(hexBg);
    const l2 = getRelativeLuminance(hexFg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch (e) {
    return 1.0;
  }
}

export default function PosterAtelier({ 
  initialTemplateId, 
  onClearInitialTemplate,
  onBriefAdded,
  userTier = 'free',
  getDailyCount = () => 0,
  getDailyLimit = () => 2,
  onIncrementDesignCount = () => true
}: PosterAtelierProps) {
  // Find initial template or use standard
  const initialTemplate = PORTFOLIO_PRESETS.find(p => p.id === initialTemplateId) || PORTFOLIO_PRESETS[2]; // Default to Golden Ratio

  const getStoredComposition = (): PosterComposition => {
    // Session Storage has primary recovery priority for interactive dynamic resilience
    const sessionSaved = sessionStorage.getItem('creativenode_session_stored_composition');
    if (sessionSaved) {
      try {
        return JSON.parse(sessionSaved);
      } catch (e) {}
    }
    const saved = localStorage.getItem('creativenode_atelier_saved_composition');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      title: initialTemplate.title,
      subtitle: initialTemplate.subtitle,
      details: initialTemplate.details,
      theme: initialTemplate.theme,
      bgType: initialTemplate.bgType,
      bgValue: initialTemplate.bgValue,
      accentColor: initialTemplate.accentColor,
      textColor: initialTemplate.textColor,
      fontTitle: initialTemplate.fontTitle,
      fontSubtitle: initialTemplate.fontSubtitle,
      align: initialTemplate.align,
      geometricElement: initialTemplate.geometricElement || 'circle'
    };
  };

  const getStoredRatio = (): 'feed' | 'story' | 'banner' => {
    // Session Storage ratio config recovery check
    const sessionSaved = sessionStorage.getItem('creativenode_session_aspect_ratio');
    if (sessionSaved === 'feed' || sessionSaved === 'story' || sessionSaved === 'banner') {
      return sessionSaved;
    }
    const saved = localStorage.getItem('creativenode_atelier_saved_ratio');
    if (saved === 'feed' || saved === 'story' || saved === 'banner') {
      return saved;
    }
    return 'feed';
  };

  const [composition, setComposition] = useState<PosterComposition>(getStoredComposition);
  const [aspectRatio, setAspectRatio] = useState<'feed' | 'story' | 'banner'>(getStoredRatio);

  // Split control panels state - parameters adjustments vs layer reordering sidebar controls
  const [activeConsoleTab, setActiveConsoleTab] = useState<'parameters' | 'layers' | 'assets' | 'history'>('parameters');

  // Premium Assets and Canvas Filters States
  const [placedAssets, setPlacedAssets] = useState<any[]>(() => {
    const sessionSaved = sessionStorage.getItem('creativenode_session_placed_assets');
    if (sessionSaved) {
      try {
        return JSON.parse(sessionSaved);
      } catch (e) {}
    }
    const saved = localStorage.getItem('creativenode_placed_assets');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Version history tracking the last 5 configuration states of the poster
  const [versionHistory, setVersionHistory] = useState<{ composition: PosterComposition; placedAssets: any[] }[]>([]);
  const [historyToRevert, setHistoryToRevert] = useState<{ composition: PosterComposition; placedAssets: any[], displayTitle: string } | null>(null);

  useEffect(() => {
    if (!composition) return;
    
    const timer = setTimeout(() => {
      setVersionHistory(prev => {
        const lastSnapshot = prev[0];
        const currentSnapshot = { 
          composition, 
          placedAssets: JSON.parse(JSON.stringify(placedAssets)) 
        };
        
        if (lastSnapshot && 
            JSON.stringify(lastSnapshot.composition) === JSON.stringify(composition) &&
            JSON.stringify(lastSnapshot.placedAssets) === JSON.stringify(placedAssets)) {
          return prev;
        }
        
        const updated = [currentSnapshot, ...prev];
        return updated.slice(0, 5); // Max 5 last states
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [composition, placedAssets]);

  // Listener for instant dashboard reactive template restorations
  useEffect(() => {
    const handleRestore = () => {
      const restoredComp = sessionStorage.getItem('creativenode_session_stored_composition');
      if (restoredComp) {
        try {
          const parsed = JSON.parse(restoredComp);
          setComposition(parsed);
        } catch (e) {}
      }
      const restoredAssetsRaw = sessionStorage.getItem('creativenode_session_placed_assets');
      if (restoredAssetsRaw) {
        try {
          setPlacedAssets(JSON.parse(restoredAssetsRaw));
        } catch (e) {}
      } else {
        setPlacedAssets([]);
      }
    };
    window.addEventListener('creativenode-composition-restored', handleRestore);
    return () => window.removeEventListener('creativenode-composition-restored', handleRestore);
  }, []);

  // Custom QR states
  const [customQrUrl, setCustomQrUrl] = useState(() => {
    return sessionStorage.getItem('creativenode_session_custom_qr_url') || 'https://creativenode.studio';
  });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [showQrOnCanvas, setShowQrOnCanvas] = useState(() => {
    return sessionStorage.getItem('creativenode_session_show_qr_on_canvas') === 'true';
  });
  const [qrPosition, setQrPosition] = useState(() => {
    const sessionSaved = sessionStorage.getItem('creativenode_session_qr_position');
    if (sessionSaved) {
      try {
        return JSON.parse(sessionSaved);
      } catch (e) {}
    }
    return { x: 80, y: 75, scale: 12 };
  });

  // CSS Web Filter selection states
  const [cssFilter, setCssFilter] = useState<'none' | 'grayscale' | 'sepia' | 'contrast' | 'invert'>(() => {
    return (sessionStorage.getItem('creativenode_session_css_filter') as any) || 'none';
  });
  const [cssFilterTarget, setCssFilterTarget] = useState<'background' | 'all'>(() => {
    return (sessionStorage.getItem('creativenode_session_css_filter_target') as any) || 'background';
  });

  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [hasDraft, setHasDraft] = useState(() => {
    return localStorage.getItem('creativenode_atelier_draft') !== null;
  });

  // Sync placed assets persistence
  useEffect(() => {
    localStorage.setItem('creativenode_placed_assets', JSON.stringify(placedAssets));
  }, [placedAssets]);

  // Generate QR Code data URL dynamically
  useEffect(() => {
    if (!customQrUrl) return;
    QRCode.toDataURL(customQrUrl, {
      margin: 1,
      width: 256,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
    .then(url => {
      setQrCodeDataUrl(url);
    })
    .catch(err => {
      console.error("QR Code generate error:", err);
    });
  }, [customQrUrl]);

  // Interactive Layer Order Stacking Sequence state (from bottom backdrop to topmost foreground)
  const [layerOrder, setLayerOrder] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('creativenode_layer_order');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return ['background', 'geometric', 'badge', 'branding', 'footer'];
  });

  // State to track session auto-save timeouts for inactive saves
  const [inactivityTimeoutId, setInactivityTimeoutId] = useState<any>(null);

  // States for 30-second background auto-saver
  const [lastAutoSaved, setLastAutoSaved] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const draftData = {
        composition,
        aspectRatio,
        placedAssets,
        customQrUrl,
        showQrOnCanvas,
        qrPosition,
        cssFilter,
        cssFilterTarget,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('creativenode_atelier_draft', JSON.stringify(draftData));
      setHasDraft(true);
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastAutoSaved(nowStr);
    }, 30000);

    return () => clearInterval(timer);
  }, [composition, aspectRatio, placedAssets, customQrUrl, showQrOnCanvas, qrPosition, cssFilter, cssFilterTarget]);

  // Swiss coordinate precise line grid overlay state
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // Undo/Redo stack definitions
  const [history, setHistory] = useState<PosterComposition[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const isUndoingRedoingRef = useRef<boolean>(false);

  // Mode layouts: 'design' or 'fullscreen'
  const [previewMode, setPreviewMode] = useState<'design' | 'fullscreen'>('design');

  // Custom Toast State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'alert' }[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'alert' = 'success') => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Initialize history on mount
  useEffect(() => {
    const currentComp = getStoredComposition();
    setHistory([currentComp]);
    setCurrentIndex(0);
  }, []);

  // Sync current composition or ratio edits to browser storage and historical stack
  useEffect(() => {
    localStorage.setItem('creativenode_atelier_saved_composition', JSON.stringify(composition));
    localStorage.setItem('creativenode_atelier_saved_ratio', aspectRatio);

    if (isUndoingRedoingRef.current) {
      isUndoingRedoingRef.current = false;
      return;
    }

    setHistory(prev => {
      const cutAhead = prev.slice(0, currentIndex + 1);
      if (cutAhead.length > 0 && JSON.stringify(cutAhead[cutAhead.length - 1]) === JSON.stringify(composition)) {
        return prev;
      }
      const updated = [...cutAhead, composition];
      setCurrentIndex(updated.length - 1);
      return updated;
    });
  }, [composition, aspectRatio]);

  // Auto-save to sessionStorage on every modification + 30-second inactivity recovery check
  useEffect(() => {
    // Instant session storage backup upon modifications
    sessionStorage.setItem('creativenode_session_stored_composition', JSON.stringify(composition));
    sessionStorage.setItem('creativenode_session_aspect_ratio', aspectRatio);
    sessionStorage.setItem('creativenode_session_placed_assets', JSON.stringify(placedAssets));
    sessionStorage.setItem('creativenode_session_custom_qr_url', customQrUrl);
    sessionStorage.setItem('creativenode_session_show_qr_on_canvas', String(showQrOnCanvas));
    sessionStorage.setItem('creativenode_session_qr_position', JSON.stringify(qrPosition));
    sessionStorage.setItem('creativenode_session_css_filter', cssFilter);
    sessionStorage.setItem('creativenode_session_css_filter_target', cssFilterTarget);
  }, [composition, aspectRatio, placedAssets, customQrUrl, showQrOnCanvas, qrPosition, cssFilter, cssFilterTarget]);

  useEffect(() => {
    // Setup the idle countdown
    const handleResetIdleTimer = () => {
      if (inactivityTimeoutId) {
        clearTimeout(inactivityTimeoutId);
      }

      const tId = setTimeout(() => {
        sessionStorage.setItem('creativenode_session_stored_composition', JSON.stringify(composition));
        sessionStorage.setItem('creativenode_session_aspect_ratio', aspectRatio);
        sessionStorage.setItem('creativenode_session_placed_assets', JSON.stringify(placedAssets));
        sessionStorage.setItem('creativenode_session_custom_qr_url', customQrUrl);
        sessionStorage.setItem('creativenode_session_show_qr_on_canvas', String(showQrOnCanvas));
        sessionStorage.setItem('creativenode_session_qr_position', JSON.stringify(qrPosition));
        sessionStorage.setItem('creativenode_session_css_filter', cssFilter);
        sessionStorage.setItem('creativenode_session_css_filter_target', cssFilterTarget);
        addToast("Workspace seamlessly backed up to session storage.", "success");
      }, 30000); // 30 seconds

      setInactivityTimeoutId(tId);
    };

    handleResetIdleTimer();

    return () => {
      if (inactivityTimeoutId) {
        clearTimeout(inactivityTimeoutId);
      }
    };
  }, [composition, aspectRatio, placedAssets, customQrUrl, showQrOnCanvas, qrPosition, cssFilter, cssFilterTarget]);

  // Layer reordering helpers
  const getZIndex = (layerKey: string) => {
    const idx = layerOrder.indexOf(layerKey);
    return idx !== -1 ? (idx + 2) * 10 : 30;
  };

  const getLayerMetadata = (layerKey: string) => {
    switch (layerKey) {
      case 'branding':
        return { label: 'Title & Subheading Assembly', icon: Type };
      case 'geometric':
        return { label: 'Silhouette Geometry Accents', icon: Grid };
      case 'badge':
        return { label: 'Header Exclusive Stamp', icon: CheckCircle2 };
      case 'footer':
        return { label: 'Layout Footer Metadata Specs', icon: AlertCircle };
      case 'background':
      default:
        return { label: 'Backplate Theme Scrim', icon: Layout };
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const reordered = [...layerOrder];
    const [removed] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, removed);
    setLayerOrder(reordered);
    sessionStorage.setItem('creativenode_layer_order', JSON.stringify(reordered));
    addToast("Layers custom repositioned. Canvas depth levels adjusted.", "success");
  };

  const handleMoveLayer = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index + 1 : index - 1;
    if (targetIndex < 0 || targetIndex >= layerOrder.length) return;

    const reordered = [...layerOrder];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    setLayerOrder(reordered);
    sessionStorage.setItem('creativenode_layer_order', JSON.stringify(reordered));
    addToast("Layers depth level shifted.", "success");
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      const nextIdx = currentIndex - 1;
      isUndoingRedoingRef.current = true;
      setCurrentIndex(nextIdx);
      setComposition(history[nextIdx]);
      addToast("Atelier change reverted.", "info");
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      const nextIdx = currentIndex + 1;
      isUndoingRedoingRef.current = true;
      setCurrentIndex(nextIdx);
      setComposition(history[nextIdx]);
      addToast("Atelier change redone.", "info");
    }
  };

  // Confetti explosion active state
  const [showConfetti, setShowConfetti] = useState(false);

  // Web Speech API dictation states
  const [isListeningNotes, setIsListeningNotes] = useState(false);
  const [isListeningClient, setIsListeningClient] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

  // Parse shareable configuration from current URL query parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedTitle = params.get('title');
    const sharedSubtitle = params.get('subtitle');
    const sharedTheme = params.get('theme');
    const sharedAccent = params.get('accent');
    const sharedDetails = params.get('details');
    const sharedBgType = params.get('bgType');
    const sharedBgValue = params.get('bgValue');

    if (sharedTitle) {
      setComposition({
        title: decodeURIComponent(sharedTitle).toUpperCase(),
        subtitle: sharedSubtitle ? decodeURIComponent(sharedSubtitle) : '',
        details: sharedDetails ? decodeURIComponent(sharedDetails) : '',
        theme: sharedTheme ? decodeURIComponent(sharedTheme) : 'Custom Look',
        bgType: (sharedBgType || 'image') as any,
        bgValue: sharedBgValue ? decodeURIComponent(sharedBgValue) : '',
        accentColor: sharedAccent ? decodeURIComponent(sharedAccent) : '#d4af37',
        textColor: '#ffffff',
        fontTitle: 'Space Grotesk',
        fontSubtitle: 'Inter',
        align: 'center',
        geometricElement: 'circle'
      });
      // Clean query params so it acts like a normal session afterwards
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Delay toast briefly to catch user attention
      setTimeout(() => {
        addToast("Loaded shared custom poster preset into config canvas!", "success");
      }, 800);
    }
  }, []);

  // Track initial template changes to load them directly from parent (e.g. portfolio slider "Customize")
  useEffect(() => {
    if (initialTemplateId) {
      const template = PORTFOLIO_PRESETS.find(p => p.id === initialTemplateId);
      if (template) {
        setComposition({
          title: template.title,
          subtitle: template.subtitle,
          details: template.details,
          theme: template.theme,
          bgType: template.bgType,
          bgValue: template.bgValue,
          accentColor: template.accentColor,
          textColor: template.textColor,
          fontTitle: template.fontTitle,
          fontSubtitle: template.fontSubtitle,
          align: template.align,
          geometricElement: template.geometricElement || 'circle'
        });
        addToast(`Preloaded "${template.title}" template metrics!`, "success");
      }
      if (onClearInitialTemplate) {
        onClearInitialTemplate();
      }
    }
  }, [initialTemplateId]);

  // Form states
  const [customBgUrl, setCustomBgUrl] = useState('');
  
  // Design Briefing Order states
  const [isSubmittingBrief, setIsSubmittingBrief] = useState(false);
  const [clientName, setClientName] = useState('');
  const [contactChannel, setContactChannel] = useState<'whatsapp' | 'instagram' | 'call' | 'email'>('whatsapp');
  const [contactValue, setContactValue] = useState('');
  const [selectedTier, setSelectedTier] = useState('standard');
  const [deliverySpeed, setDeliverySpeed] = useState<'express' | 'standard'>('standard');
  const [extraNotes, setExtraNotes] = useState('');
  
  const [briefSuccessMsg, setBriefSuccessMsg] = useState(false);
  const [exportAnimation, setExportAnimation] = useState(false);

  // Keyboard escape states
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSubmittingBrief) {
          setIsSubmittingBrief(false);
          addToast("Specs intake panel closed.", "info");
        }
        if (previewMode === 'fullscreen') {
          setPreviewMode('design');
          addToast("Design workspace pane restored.", "info");
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isSubmittingBrief, previewMode]);

  // Theme presets click
  const applyPreset = (preset: PosterTemplate) => {
    setComposition({
      title: preset.title,
      subtitle: preset.subtitle,
      details: preset.details,
      theme: preset.theme,
      bgType: preset.bgType,
      bgValue: preset.bgValue,
      accentColor: preset.accentColor,
      textColor: preset.textColor,
      fontTitle: preset.fontTitle,
      fontSubtitle: preset.fontSubtitle,
      align: preset.align,
      geometricElement: preset.geometricElement || 'circle'
    });
    addToast(`Appliqué style: ${preset.theme}`, "success");
  };

  // Reset composition
  const handleReset = () => {
    applyPreset(PORTFOLIO_PRESETS[2]); // Golden ratio baseline
    setCustomBgUrl('');
    addToast("Atelier design workspace parameters reset to baseline.", "info");
  };

  // Custom Bg submit
  const handleCustomBgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customBgUrl.trim()) {
      setComposition(prev => ({
        ...prev,
        bgType: 'image',
        bgValue: customBgUrl
      }));
      addToast("Successfully linked and loaded custom background backdrop image!", "success");
    }
  };

  // Copy shareable configurator state link
  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?title=${encodeURIComponent(composition.title)}&subtitle=${encodeURIComponent(composition.subtitle)}&theme=${encodeURIComponent(composition.theme)}&accent=${encodeURIComponent(composition.accentColor)}&details=${encodeURIComponent(composition.details)}&bgType=${encodeURIComponent(composition.bgType)}&bgValue=${encodeURIComponent(composition.bgValue)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      addToast("Perfect copy! Live shareable layout config link created and written to clipboard.", "success");
    }).catch(() => {
      addToast("Failed to copy link directly. Please test security options.", "alert");
    });
  };

  // Manual save canvas backup
  const handleManualSave = () => {
    localStorage.setItem('creativenode_atelier_saved_composition', JSON.stringify(composition));
    localStorage.setItem('creativenode_atelier_saved_ratio', aspectRatio);
    localStorage.setItem('creativenode_placed_assets', JSON.stringify(placedAssets));
    addToast("Backup secured! Your design layout has been manually saved to storage. [Ctrl+S]", "success");
  };

  const handleSaveDraft = () => {
    const draftData = {
      composition,
      aspectRatio,
      placedAssets,
      customQrUrl,
      showQrOnCanvas,
      qrPosition,
      cssFilter,
      cssFilterTarget,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('creativenode_atelier_draft', JSON.stringify(draftData));
    setHasDraft(true);
    addToast("Draft design paused and saved! Resume anytime.", "success");
  };

  const resumeDraft = () => {
    const data = localStorage.getItem('creativenode_atelier_draft');
    if (data) {
      try {
        const draftData = JSON.parse(data);
        if (draftData.composition) setComposition(draftData.composition);
        if (draftData.aspectRatio) setAspectRatio(draftData.aspectRatio);
        if (draftData.placedAssets) setPlacedAssets(draftData.placedAssets);
        if (draftData.customQrUrl) setCustomQrUrl(draftData.customQrUrl);
        if (draftData.showQrOnCanvas !== undefined) setShowQrOnCanvas(draftData.showQrOnCanvas);
        if (draftData.qrPosition) setQrPosition(draftData.qrPosition);
        if (draftData.cssFilter) setCssFilter(draftData.cssFilter);
        if (draftData.cssFilterTarget) setCssFilterTarget(draftData.cssFilterTarget);
        
        setHasDraft(false);
        addToast("Draft composition successfully restored!", "success");
      } catch (err) {
        console.error("Failed to restore draft:", err);
        addToast("Failed to compile corrupt draft specifications.", "alert");
      }
    }
  };

  const discardDraft = () => {
    localStorage.removeItem('creativenode_atelier_draft');
    setHasDraft(false);
    addToast("Draft design dismissed.", "info");
  };

  // High-fidelity production PDF export
  const handleExportPDF = () => {
    setExportAnimation(true);
    addToast("Rasterizing poster composition into Vector PDF package...", "info");
    
    setTimeout(() => {
      setExportAnimation(false);
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        // Background color
        if (composition.bgType === 'color') {
          const hex = composition.bgValue.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16) || 15;
          const g = parseInt(hex.substring(2, 4), 16) || 15;
          const b = parseInt(hex.substring(4, 6), 16) || 15;
          doc.setFillColor(r, g, b);
          doc.rect(0, 0, 210, 297, 'F');
        } else {
          doc.setFillColor(15, 15, 15);
          doc.rect(0, 0, 210, 297, 'F');
        }

        // Apply visual grid metrics lines
        doc.setDrawColor(44, 44, 44);
        doc.setLineWidth(0.3);
        for (let i = 1; i < 6; i++) {
          doc.line((i * 210) / 6, 0, (i * 210) / 6, 297);
        }
        for (let i = 1; i < 8; i++) {
          doc.line(0, (i * 297) / 8, 210, (i * 297) / 8);
        }

        // Title and branding specs
        doc.setTextColor(212, 175, 55); // Gold Accent
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(22);
        doc.text("CREATIVENODE POSTER STANDARD", 20, 30);

        doc.setTextColor(170, 170, 170);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.text("ATELIER HIGH-FIDELITY SPECS PRINT VERSION", 20, 38);

        // Separator Line
        doc.setDrawColor(212, 175, 55);
        doc.setLineWidth(0.8);
        doc.line(20, 44, 190, 44);

        // Core fields
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text("1. CUSTOM BLUEPRINT DETAILS", 20, 58);
        
        doc.setFontSize(11);
        doc.setTextColor(180, 180, 180);
        doc.text(`Poster Theme Preset:   ${composition.theme}`, 20, 70);
        doc.text(`Backplate Source Type: ${composition.bgType.toUpperCase()}`, 20, 78);
        doc.text(`Graphic Heading:       "${composition.title}"`, 20, 86);
        doc.text(`Graphic Subtitle:      "${composition.subtitle}"`, 20, 94);
        doc.text(`Selected Fonts:        Title: ${composition.fontTitle} | Sub: ${composition.fontSubtitle}`, 20, 102);
        doc.text(`Accent Line Color:     ${composition.accentColor}`, 20, 110);
        doc.text(`Silhouette Geometry:  ${composition.geometricElement}`, 20, 118);
        doc.text(`Applied CSS Filter:    ${cssFilter.toUpperCase()} (Target: ${cssFilterTarget})`, 20, 126);

        // Split details paragraph
        const wrapText = doc.splitTextToSize(composition.details, 170);
        doc.text("Graphic Description Copy:", 20, 136);
        doc.setFont("Helvetica", "oblique");
        doc.text(wrapText, 25, 144);

        // 2. Added Premium Assets list
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text("2. INTEGRATED PREMIUM GRAPHICS", 20, 180);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(180, 180, 180);
        if (placedAssets.length === 0) {
          doc.text("No custom geometric or ornamental stamps added to the poster.", 20, 192);
        } else {
          placedAssets.forEach((pa, index) => {
            if (index < 5) {
              doc.text(`- [Asset #${index+1}] ${pa.label} (Placed at X:${Math.round(pa.x)}% Y:${Math.round(pa.y)}%, Scale: ${pa.scale}%)`, 20, 192 + (index * 8));
            }
          });
        }

        // Portfolio Custom QR stamp on PDF
        if (showQrOnCanvas && qrCodeDataUrl) {
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(255, 255, 255);
          doc.text("3. PORTFOLIO QR SPECS", 20, 240);

          doc.setFont("Helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(180, 180, 180);
          doc.text(`Link Location: ${customQrUrl}`, 20, 248);

          // Add QR Code Image directly onto the PDF
          doc.addImage(qrCodeDataUrl, 'PNG', 150, 230, 40, 40);
        }

        // Bottom border licensed
        doc.setDrawColor(212, 175, 55);
        doc.setLineWidth(0.5);
        doc.line(20, 276, 190, 276);

        doc.setFont("Helvetica", "oblique");
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        doc.text("Authorized by Atelier Poster Licensing Engine. Built with full-stack React & Tailwind components.", 20, 283);

        doc.save(`${composition.title.toLowerCase().replace(/\s+/g, '_')}-production-package.pdf`);
        addToast("PDF production-ready file generated and saved successfully! [Ctrl+E]", "success");
      } catch (err) {
        console.error("PDF generator fail:", err);
        addToast("PDF output could not compile. Exporting raw spec text file as fallback.", "alert");
        handleDownloadMockup();
      }
    }, 1200);
  };

  const handleRemoveAsset = (id: string) => {
    setPlacedAssets(prev => prev.filter(pa => pa.id !== id));
    if (selectedAssetId === id) setSelectedAssetId(null);
    addToast("Asset removed from poster canvas.", "info");
  };

  const placeAssetCenter = (asset: PremiumAsset) => {
    const newPlaced = {
      id: 'placed-' + Date.now() + Math.random().toString(36).substring(2, 6),
      assetId: asset.id,
      category: asset.category,
      label: asset.label,
      content: asset.content,
      x: 35,
      y: 40,
      scale: asset.category === 'shape' ? 25 : asset.category === 'texture' ? 40 : 25,
      baseColorMatch: true
    };
    setPlacedAssets(prev => [...prev, newPlaced]);
    setSelectedAssetId(newPlaced.id);
    addToast(`Placed ${asset.label} in workspace. Reposition as needed!`, "success");
  };

  // Register Global window events for shortcuts link-ups
  useEffect(() => {
    const triggerSave = () => handleManualSave();
    const triggerExport = () => handleExportPDF();

    window.addEventListener('atelier-trigger-save', triggerSave);
    window.addEventListener('atelier-trigger-export', triggerExport);

    return () => {
      window.removeEventListener('atelier-trigger-save', triggerSave);
      window.removeEventListener('atelier-trigger-export', triggerExport);
    };
  }, [composition, aspectRatio, placedAssets, showQrOnCanvas, qrCodeDataUrl, customQrUrl, cssFilter, cssFilterTarget]);

  // Speech dictated typing helper
  const startSpeechRecognition = (fieldName: 'notes' | 'client') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast("Web Speech dictation is not natively supported in this browser.", "alert");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    if (fieldName === 'notes') {
      setIsListeningNotes(true);
    } else {
      setIsListeningClient(true);
    }

    addToast("Voice dictionary listening active... Please speak into your system microphone.", "info");

    recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      if (fieldName === 'notes') {
        setExtraNotes(prev => prev ? `${prev} ${resultText}` : resultText);
        addToast("Added dictated words directly into design directives!", "success");
      } else {
        setClientName(resultText);
        addToast("Dictated brand/client name registered!", "success");
      }
    };

    recognition.onerror = (e: any) => {
      console.warn("Speech recognition error hook: ", e);
      addToast("Sound levels brief: Dictation interrupted or timed out.", "info");
      setIsListeningNotes(false);
      setIsListeningClient(false);
    };

    recognition.onend = () => {
      setIsListeningNotes(false);
      setIsListeningClient(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListeningNotes(false);
      setIsListeningClient(false);
    }
  };

  // Export mock download
  const handleDownloadMockup = () => {
    setExportAnimation(true);
    addToast("Processing vector matrix packages...", "info");
    setTimeout(() => {
      setExportAnimation(false);
      // Create a virtual file mock download
      const content = `CREATIVENODE POSTER SPECIFICATION\n==============================\nTheme: ${composition.theme}\nHeadline: ${composition.title}\nSubtitle: ${composition.subtitle}\nSecondary Copy: ${composition.details}\nAccent Color: ${composition.accentColor}\nText Color: ${composition.textColor}\nTitle Font: ${composition.fontTitle}\nVisual Aspect: ${aspectRatio.toUpperCase()}\nGeometric: ${composition.geometricElement}\nBackground: ${composition.bgValue}\nGenerated offline in CreativeNode Live Atelier.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${composition.title.toLowerCase().replace(/\s+/g, '-')}-spec.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Notify user via Toast
      addToast("Download finalized. Package specifications exported as .TXT document successfully!", "success");
    }, 1200);
  };

  // Submit Project Brief to local storage
  const handleSubmitBrief = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !contactValue.trim()) return;

    // Check design quota restrictions first!
    const activeCount = getDailyCount();
    const limit = getDailyLimit();
    if (activeCount >= limit) {
      addToast(`Quota exceeded! You have reached your limit of ${limit} designs per day. Upgrade to increase capacity.`, "alert");
      return;
    }

    const wasIncremented = onIncrementDesignCount();
    if (!wasIncremented) {
      addToast(`Quota exceeded! You have reached your limit of ${limit} designs per day. Upgrade to increase capacity.`, "alert");
      return;
    }

    const newBrief: DesignBrief = {
      id: 'brief-' + Date.now(),
      createdAt: new Date().toLocaleString(),
      clientName,
      contactChannel,
      contactValue,
      composition,
      selectedTier,
      deliverySpeed,
      extraNotes
    };

    // Save to local storage
    const currentBriefsStr = localStorage.getItem('creativenode_briefs');
    const briefs: DesignBrief[] = currentBriefsStr ? JSON.parse(currentBriefsStr) : [];
    briefs.unshift(newBrief);
    localStorage.setItem('creativenode_briefs', JSON.stringify(briefs));

    setBriefSuccessMsg(true);
    setIsSubmittingBrief(false);

    // Call callback to sync lists in App
    if (onBriefAdded) {
      onBriefAdded();
    }

    // Trigger full screen energetic confetti burst
    setShowConfetti(true);
    addToast("Spectacular setup! Your design brief was generated and saved to history successfully.", "success");

    // Close confetti after 4.5 seconds to let CPU relax
    setTimeout(() => {
      setShowConfetti(false);
    }, 4500);

    // Reset brief input states
    setClientName('');
    setContactValue('');
    setExtraNotes('');

    setTimeout(() => {
      setBriefSuccessMsg(false);
    }, 4000);
  };

  // Generate Whatsapp Link based on design parameters
  const getWhatsAppMessage = () => {
    const formattedText = `Hello CreativeNode, I configured a custom poster design layout:\n\n*Title*: ${composition.title}\n*Subtitle*: ${composition.subtitle}\n*Tier*: ${selectedTier.toUpperCase()}\n*Accents*: ${composition.accentColor}\n*Speed*: ${deliverySpeed === 'express' ? 'Express Rush' : 'Standard'}\n*My Name*: ${clientName || 'Inquirer'}\n\nPlease confirm setup!`;
    return `https://wa.me/916369278905?text=${encodeURIComponent(formattedText)}`;
  };
  return (
    <section id="atelier-section" className="relative py-20 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Dynamic confetti overlay */}
      {showConfetti && <ConfettiCanvas />}

      {/* Decorative ambient lights */}
      <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-gold-900/10 blur-3xl pointer-events-none -mr-40" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full bg-red-900/10 blur-3xl pointer-events-none -ml-40" />

      {/* Header with exquisite descriptive titles */}
      <div className="text-center md:text-left mb-12">
        <span className="font-mono text-xs text-gold-500 uppercase tracking-widest bg-gold-950/40 border border-gold-900/40 px-3 py-1 rounded-full inline-block mb-3">
          Interactive Atelier V.2
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-medium text-white tracking-tight leading-tight">
          Configure Your <span className="font-editorial italic font-normal text-gold-400">Design System</span>
        </h2>
        <p className="text-zinc-400 text-sm md:text-base max-w-lg mt-3 font-sans">
          Experiment with authentic luxury combinations. Customise text modules, structural overlays, and geometry. Generate your unique brief instantly.
        </p>
      </div>

      {/* Draft Restore Alert Box */}
      {hasDraft && (
        <div className="mb-8 p-4 rounded-xl border border-gold-500/20 bg-gold-950/20 text-gold-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <Sliders className="w-5 h-5 shrink-0 text-gold-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white text-sm font-sans">Unfinished Design Draft Found</h4>
              <p className="text-xs text-gold-400/80 mt-0.5">
                You have a paused creative design draft in local backup memory. Would you like to resume your progress?
              </p>
            </div>
          </div>
          <div className="flex gap-2 font-mono text-[9px] uppercase tracking-wide shrink-0 font-extrabold">
            <button
              onClick={resumeDraft}
              className="px-3.5 py-1.5 rounded-lg bg-gold-500 text-black hover:bg-gold-400 cursor-pointer transition select-none animate-pulse"
            >
              Resume Draft
            </button>
            <button
              onClick={discardDraft}
              className="px-3 py-1.5 rounded-lg border border-red-900/30 hover:border-red-900 text-red-400 hover:bg-red-900/10 cursor-pointer transition select-none"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {briefSuccessMsg && (
        <div id="brief-success-notification" className="mb-8 p-4 rounded-xl border border-emerald-900 bg-emerald-950/40 text-emerald-300 flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <h4 className="font-medium font-display text-white">Project Brief Registered Successfully</h4>
            <p className="text-xs text-emerald-400/80 mt-1">
              Your customized specifications are saved down below in the briefs ledger. Contact our team to begin modeling your master assets!
            </p>
            <div className="mt-3 flex gap-4">
              <a 
                href={getWhatsAppMessage()}
                target="_blank" 
                rel="noreferrer" 
                className="text-xs bg-emerald-500 text-black font-semibold py-1.5 px-3 rounded hover:bg-emerald-400 transition"
              >
                Send via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Work Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* Left Side: Controls Panel (5 Columns on LG) - Hidden in Full Screen Mode */}
        {previewMode === 'design' && (
          <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 relative">
            <div className="absolute top-0 right-0 bg-zinc-900 text-[9px] font-mono text-zinc-500 border-l border-b border-zinc-800 px-3 py-1 uppercase rounded-tr-2xl rounded-bl-md">
              Control Console
            </div>

            <div className="space-y-6">
              {/* Console Tab Selector */}
              <div className="grid grid-cols-4 gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-900">
                <button
                  type="button"
                  onClick={() => setActiveConsoleTab('parameters')}
                  className={`py-2 rounded-lg text-[9px] font-mono tracking-tight uppercase transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer select-none ${
                    activeConsoleTab === 'parameters'
                      ? 'bg-zinc-800 text-gold-400 font-extrabold border border-zinc-700/40'
                      : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveConsoleTab('layers')}
                  className={`py-2 rounded-lg text-[9px] font-mono tracking-tight uppercase transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer select-none ${
                    activeConsoleTab === 'layers'
                      ? 'bg-zinc-800 text-gold-400 font-extrabold border border-zinc-700/40'
                      : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Layers</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveConsoleTab('assets')}
                  className={`py-2 rounded-lg text-[9px] font-mono tracking-tight uppercase transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer select-none ${
                    activeConsoleTab === 'assets'
                      ? 'bg-zinc-800 text-gold-400 font-extrabold border border-zinc-700/40'
                      : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Assets</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveConsoleTab('history')}
                  className={`py-2 rounded-lg text-[9px] font-mono tracking-tight uppercase transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer select-none ${
                    activeConsoleTab === 'history'
                      ? 'bg-zinc-800 text-gold-400 font-extrabold border border-zinc-700/40'
                      : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>History</span>
                </button>
              </div>

              {activeConsoleTab === 'parameters' && (
                <div className="space-y-6">
                  {/* Quick Templates Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" /> Presets
                    <span className="text-[9px] text-zinc-600 ml-1 font-normal lowercase tracking-wide italic">(autosaved)</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleUndo}
                      disabled={currentIndex <= 0}
                      className="text-[10px] font-mono text-zinc-400 hover:text-gold-400 disabled:opacity-30 disabled:hover:text-zinc-400 flex items-center gap-0.5 transition cursor-pointer"
                      title="Undo last parameter alteration"
                    >
                      <Undo className="w-2.5 h-2.5" /> Undo
                    </button>
                    <button
                      type="button"
                      onClick={handleRedo}
                      disabled={currentIndex >= history.length - 1}
                      className="text-[10px] font-mono text-zinc-400 hover:text-gold-400 disabled:opacity-30 disabled:hover:text-zinc-400 flex items-center gap-0.5 transition cursor-pointer"
                      title="Redo previous parameter alteration"
                    >
                      <Redo className="w-2.5 h-2.5" /> Redo
                    </button>
                    <span className="h-3 w-[1px] bg-zinc-800" />
                    <button 
                      onClick={handleReset}
                      className="text-[10px] font-mono text-zinc-400 hover:text-gold-400 flex items-center gap-0.5 transition"
                      title="Reset base templates"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> Reset
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {PORTFOLIO_PRESETS.slice(0, 6).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className={`p-2 rounded-lg border text-left bg-zinc-900/60 hover:bg-zinc-900 transition flex flex-col justify-between h-20 group relative overflow-hidden ${
                        composition.theme === preset.theme ? 'border-gold-500/80' : 'border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-[9px] font-mono text-zinc-500 group-hover:text-gold-400 transition truncate block">
                        {preset.theme.split(' ')[0]}
                      </span>
                      <span 
                        className="text-xs font-display text-white font-medium line-clamp-1 truncate block"
                        style={{ fontFamily: preset.fontTitle === 'Playfair Display' ? 'serif' : preset.fontTitle === 'Space Grotesk' ? 'sans-serif' : 'monospace' }}
                      >
                        {preset.title.split(' ')[0]}
                      </span>
                      {composition.theme === preset.theme && (
                        <div className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-gold-400" />
                      )}
                    </button>
                  ))}
                </div>

                {/* JSON PRESETS IMPORT ATELIER COMPONENT */}
                <div id="preset-uploader-container" className="mt-3.5 flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 border-dashed">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-mono text-gold-400 font-bold uppercase tracking-wider">Re-Import Workspace Preset</span>
                    <span className="text-[8px] text-zinc-500 font-mono">Upload a downloaded .json preset layout</span>
                  </div>
                  <label className="px-2.5 py-1.5 bg-zinc-90 w-auto bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-gold-505 hover:border-gold-500 text-zinc-400 hover:text-white rounded-lg text-[9px] font-mono cursor-pointer transition select-none">
                    Upload JSON
                    <input 
                      type="file" 
                      accept=".json" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          try {
                            const parsed = JSON.parse(evt.target?.result as string);
                            if (parsed && typeof parsed === 'object') {
                              // Accept both full and partial structures
                              setComposition(prev => ({
                                ...prev,
                                title: (parsed.title || prev.title || 'BESPOKE DESIGN').toUpperCase(),
                                subtitle: (parsed.subtitle || prev.subtitle || 'STUDIO PRESET').toUpperCase(),
                                details: (parsed.details || prev.details || 'EXCEPTIONAL MODERNIST COMPOSITION METRIC').toUpperCase(),
                                theme: parsed.theme || prev.theme || 'Imported Custom',
                                bgType: parsed.bgType || prev.bgType || 'color',
                                bgValue: parsed.bgValue || prev.bgValue || '#0A0A0D',
                                accentColor: parsed.accentColor || prev.accentColor || '#D4AF37',
                                textColor: parsed.textColor || prev.textColor || '#FFFFFF',
                                fontTitle: parsed.fontTitle || prev.fontTitle || 'Space Grotesk',
                                fontSubtitle: parsed.fontSubtitle || prev.fontSubtitle || 'Inter',
                                align: parsed.align || prev.align || 'center',
                                geometricElement: parsed.geometricElement || prev.geometricElement || 'none'
                              }));
                              if (parsed.aspectRatio) {
                                setAspectRatio(parsed.aspectRatio);
                              }
                              addToast(`Success! Preset "${parsed.title || 'Custom Layout'}" re-imported.`, "success");
                            } else {
                              addToast("Corrupted or invalid JSON preset schema structure.", "alert");
                            }
                          } catch (err) {
                            console.error("JSON parse failed:", err);
                            addToast("Failed to parse preset file. Check formatting.", "alert");
                          }
                        };
                        reader.readAsText(file);
                        e.target.value = ''; // Reset input
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Typography Module */}
              <div className="border-t border-zinc-900 pt-4">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3 block flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-gold-400" /> Typography & Copy
                </span>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Headline Text</label>
                    <input
                      type="text"
                      value={composition.title}
                      onChange={(e) => setComposition(prev => ({ ...prev, title: e.target.value.toUpperCase() }))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500 transition"
                      maxLength={32}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Subtitle Line</label>
                      <input
                        type="text"
                        value={composition.subtitle}
                        onChange={(e) => setComposition(prev => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500 transition"
                        maxLength={40}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Secondary Copy</label>
                      <input
                        type="text"
                        value={composition.details}
                        onChange={(e) => setComposition(prev => ({ ...prev, details: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500 transition"
                        maxLength={70}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Title Font</label>
                      <select
                        value={composition.fontTitle}
                        onChange={(e) => setComposition(prev => ({ ...prev, fontTitle: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-gold-500 transition"
                      >
                        <option value="Space Grotesk">Space Grotesk (Tech)</option>
                        <option value="Playfair Display">Playfair (Luxury Serif)</option>
                        <option value="JetBrains Mono">JetBrains Mono (Avant)</option>
                        <option value="Inter">Inter (Strict Minimal)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Composition Align</label>
                      <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <button
                            key={align}
                            onClick={() => setComposition(prev => ({ ...prev, align }))}
                            className={`py-1 text-[10px] font-mono capitalize rounded transition ${
                              composition.align === align ? 'bg-gold-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aesthetics & Elements */}
              <div className="border-t border-zinc-900 pt-4">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3 block flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-gold-400" /> Structure & Theme
                </span>
                <div className="space-y-4">
                  {/* Accent Colors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Accent Color</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={composition.accentColor}
                          onChange={(e) => setComposition(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer outline-none"
                        />
                        <input
                          type="text"
                          value={composition.accentColor}
                          onChange={(e) => setComposition(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Text Fill</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={composition.textColor}
                          onChange={(e) => setComposition(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer outline-none"
                        />
                        <input
                          type="text"
                          value={composition.textColor}
                          onChange={(e) => setComposition(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Real-time WCAG accessibility warnings block */}
                  {(() => {
                    const isSolidBg = composition.bgType === 'color';
                    const bgHex = isSolidBg ? composition.bgValue : '#0d0d0d';
                    const textHex = composition.textColor || '#ffffff';
                    const accentHex = composition.accentColor || '#d4af37';
                    
                    const textContrast = getContrastRatio(bgHex, textHex);
                    const accentContrast = getContrastRatio(bgHex, accentHex);
                    
                    const textFails = textContrast < 4.5;
                    const accentFails = accentContrast < 3.0;
                    
                    if (!textFails && !accentFails) return null;
                    
                    const autoFixColors = () => {
                      const bgLum = getRelativeLuminance(bgHex);
                      const optimalText = bgLum < 0.2 ? '#FFFFFF' : '#121214';
                      const optimalAccent = bgLum < 0.2 ? '#D4AF37' : '#9A3412';
                      
                      setComposition(prev => ({
                        ...prev,
                        textColor: textFails ? optimalText : prev.textColor,
                        accentColor: accentFails ? optimalAccent : prev.accentColor
                      }));
                    };

                    return (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.96, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="p-3.5 bg-red-950/20 border border-red-500/35 rounded-xl space-y-2 mt-2 text-xs font-mono"
                      >
                        <div className="flex items-start gap-2 text-red-400">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="font-extrabold uppercase text-[9.5px] tracking-wide">Contrast Compliance Alert</span>
                            <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                              {textFails && accentFails ? (
                                "Both the text and accent colors fail WCAG 2.1 accessibility benchmarks on this backdrop, hindering legibility."
                              ) : textFails ? (
                                "Your body text color contrast ratio fails WCAG 4.5:1, making standard elements difficult to decipher."
                              ) : (
                                "Your geometric accent style ratio stays below 3.0:1, violating physical print visibility standards."
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-black/40 p-2 rounded-lg border border-red-950/30">
                          <div className="flex gap-3 text-[9px] text-zinc-400">
                            {textFails && (
                              <div>
                                TEXT: <span className="text-red-400 font-extrabold">{textContrast.toFixed(2)}:1</span>
                              </div>
                            )}
                            {accentFails && (
                              <div>
                                ACCENT: <span className="text-red-400 font-extrabold">{accentContrast.toFixed(2)}:1</span>
                              </div>
                            )}
                          </div>
                          
                          <button
                            type="button"
                            onClick={autoFixColors}
                            className="bg-red-500 hover:bg-red-400 text-black px-2.5 py-1 rounded text-[8.5px] uppercase font-extrabold tracking-wider transition cursor-pointer shrink-0"
                          >
                            Auto-Fix Contrast
                          </button>
                        </div>
                      </motion.div>
                    );
                  })()}

                  {/* Design Compass Accessibility Tool Card */}
                  <div className="bg-zinc-950/45 border border-zinc-900 rounded-xl p-3.5 space-y-3 font-mono">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-gold-400">
                        <Compass className="w-3.5 h-3.5 text-gold-400 rotate-45" />
                        <span>Design Compass</span>
                      </div>
                      <span className="text-[7.5px] bg-zinc-900/60 px-1.5 py-0.5 rounded text-zinc-500 uppercase tracking-widest border border-zinc-350/5">WCAG 2.1 Compliant</span>
                    </div>
                    
                    <div className="space-y-2 text-[10.5px]">
                      {(() => {
                        const isSolidBg = composition.bgType === 'color';
                        const bgHex = isSolidBg ? composition.bgValue : '#0d0d0d';
                        const textHex = composition.textColor || '#ffffff';
                        const accentHex = composition.accentColor || '#d4af37';
                        
                        const textContrast = getContrastRatio(bgHex, textHex);
                        const accentContrast = getContrastRatio(bgHex, accentHex);
                        
                        const getComplianceText = (contrast: number) => {
                          if (contrast >= 7) return { status: 'AAA', label: 'Excellent Compliance', color: 'text-green-400 border-green-500/25 bg-green-950/20' };
                          if (contrast >= 4.5) return { status: 'AA', label: 'Comp-Pass [AA]', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/15' };
                          if (contrast >= 3) return { status: 'Large Text', label: 'Caution Required', color: 'text-yellow-500 border-yellow-500/20 bg-yellow-950/15' };
                          return { status: 'Fail', label: 'Contrast Warning', color: 'text-red-400 border-red-500/20 bg-red-950/15' };
                        };
                        
                        const textCompliance = getComplianceText(textContrast);
                        const accentCompliance = getComplianceText(accentContrast);
                        
                        return (
                          <div className="space-y-2">
                            {/* Main text contrast */}
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between items-center text-[9px]">
                                <span className="text-zinc-500 uppercase">Text Contrast ratio</span>
                                <span className="text-zinc-300 font-extrabold">{textContrast.toFixed(2)}:1</span>
                              </div>
                              <div className={`flex items-center justify-between border rounded px-2 py-1 text-[8.5px] leading-none ${textCompliance.color}`}>
                                <span>{textCompliance.label}</span>
                                <span className="font-extrabold uppercase tracking-wide">[{textCompliance.status}]</span>
                              </div>
                            </div>
                            
                            {/* Accent contrast */}
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between items-center text-[9px]">
                                <span className="text-zinc-500 uppercase">Accent Contrast ratio</span>
                                <span className="text-zinc-300 font-extrabold">{accentContrast.toFixed(2)}:1</span>
                              </div>
                              <div className={`flex items-center justify-between border rounded px-2 py-1 text-[8.5px] leading-none ${accentCompliance.color}`}>
                                <span>{accentCompliance.label}</span>
                                <span className="font-extrabold uppercase tracking-wide">[{accentCompliance.status}]</span>
                              </div>
                            </div>
                            
                            {!isSolidBg && (
                              <p className="text-[8.5px] text-zinc-500 italic font-sans leading-relaxed pt-1 flex items-center gap-1.5">
                                <span>ℹ️</span> 
                                <span>Evaluating against absolute midnight backdrop reference.</span>
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Overlays / Geometry wireframes */}
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Signature Vector Overlay</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {(['none', 'circle', 'lines', 'grid', 'border'] as const).map((elem) => (
                        <button
                          key={elem}
                          onClick={() => setComposition(prev => ({ ...prev, geometricElement: elem }))}
                          className={`py-1.5 text-[10px] font-mono capitalize rounded border transition truncate ${
                            composition.geometricElement === elem 
                              ? 'border-gold-500 bg-gold-950/20 text-gold-300 font-semibold' 
                              : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          {elem}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aspect Ratio Sizers */}
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Canvas Proportions</label>
                    <div className="grid grid-cols-3 gap-1 px-1 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
                      <button
                        onClick={() => setAspectRatio('feed')}
                        className={`py-1 text-[10px] font-mono rounded capitalize transition ${
                          aspectRatio === 'feed' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        Feed (4:5)
                      </button>
                      <button
                        onClick={() => setAspectRatio('story')}
                        className={`py-1 text-[10px] font-mono rounded capitalize transition ${
                          aspectRatio === 'story' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        Story (9:16)
                      </button>
                      <button
                        onClick={() => setAspectRatio('banner')}
                        className={`py-1 text-[10px] font-mono rounded capitalize transition ${
                          aspectRatio === 'banner' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        Flyer (1:1)
                      </button>
                    </div>
                  </div>

                  {/* Inject Custom Background URL */}
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Hotlink Custom Background IMG</label>
                    <form onSubmit={handleCustomBgSubmit} className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Paste Unsplash/Image url..."
                        value={customBgUrl}
                        onChange={(e) => setCustomBgUrl(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 transition"
                      />
                      <button
                        type="submit"
                        disabled={!customBgUrl}
                        className="bg-gold-500 hover:bg-gold-400 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-semibold text-xs py-1.5 px-3 rounded-lg transition shrink-0"
                      >
                        Apply
                      </button>
                    </form>
                    <p className="text-[9px] text-zinc-500 mt-1">Accepts absolute URLs (e.g., https://images.unsplash.com/...)</p>
                  </div>

                  {/* CSS-based Image Filters */}
                  <div className="border-t border-zinc-900 pt-3.5 mt-3.5 space-y-2">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block">Atelier visual CSS Filters</label>
                    <div className="grid grid-cols-5 gap-1">
                      {([
                        { id: 'none', label: 'None' },
                        { id: 'grayscale', label: 'Gray' },
                        { id: 'sepia', label: 'Sepia' },
                        { id: 'contrast', label: 'Hi-Con' },
                        { id: 'invert', label: 'Invert' }
                      ] as const).map((filt) => (
                        <button
                          key={filt.id}
                          type="button"
                          onClick={() => {
                            setCssFilter(filt.id);
                            addToast(`Applied ${filt.label} filter!`, 'success');
                          }}
                          className={`py-1.5 text-[8.5px] font-semibold font-mono rounded transition cursor-pointer ${
                            cssFilter === filt.id
                              ? 'bg-gold-500 text-black font-extrabold'
                              : 'bg-zinc-900 border border-zinc-900 text-zinc-500 hover:text-white hover:border-zinc-800'
                          }`}
                        >
                          {filt.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">Apply To:</span>
                      <div className="flex gap-3">
                        <label className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 cursor-pointer select-none">
                          <input
                            type="radio"
                            name="filterTarget"
                            checked={cssFilterTarget === 'background'}
                            onChange={() => setCssFilterTarget('background')}
                            className="accent-gold-500"
                          />
                          Background Only
                        </label>
                        <label className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 cursor-pointer select-none">
                          <input
                            type="radio"
                            name="filterTarget"
                            checked={cssFilterTarget === 'all'}
                            onChange={() => setCssFilterTarget('all')}
                            className="accent-gold-500"
                          />
                          Entire Poster
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Website QR Generator */}
                  <div className="border-t border-zinc-900 pt-3.5 mt-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Portfolio QR Code Injector</span>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={showQrOnCanvas}
                          onChange={(e) => {
                            setShowQrOnCanvas(e.target.checked);
                            addToast(e.target.checked ? "QR Code rendered on design canvas floor." : "QR Code hidden.", "info");
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-7 h-4 bg-zinc-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 after:border-zinc-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-gold-500 peer-checked:after:bg-black peer-checked:after:border-black" />
                        <span className="ml-2 text-[9px] font-mono text-zinc-500 uppercase">Show QR</span>
                      </label>
                    </div>

                    {showQrOnCanvas && (
                      <div className="space-y-2.5 bg-zinc-900/10 border border-zinc-900/50 p-2.5 rounded-lg animate-fade-in mt-1.5 font-sans text-left">
                        <div>
                          <label className="text-[8px] font-mono text-zinc-500 uppercase block mb-1">Portfolio Link Target URL</label>
                          <input
                            type="url"
                            value={customQrUrl}
                            onChange={(e) => setCustomQrUrl(e.target.value)}
                            placeholder="https://yourportfolio.com"
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-gold-500"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[8px] font-mono text-zinc-500 uppercase block">Scale width ({qrPosition.scale}%)</span>
                            <input
                              type="range"
                              min="8"
                              max="24"
                              value={qrPosition.scale}
                              onChange={(e) => setQrPosition(prev => ({ ...prev, scale: parseInt(e.target.value) }))}
                              className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-gold-500"
                            />
                          </div>
                          <div>
                            <span className="text-[8px] font-mono text-zinc-500 uppercase block">Coordinate</span>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[9px] font-mono text-zinc-500 bg-zinc-950 px-1 py-0.5 rounded border border-zinc-900">X: {Math.round(qrPosition.x)}%</span>
                              <span className="text-[9px] font-mono text-zinc-500 bg-zinc-950 px-1 py-0.5 rounded border border-zinc-900">Y: {Math.round(qrPosition.y)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeConsoleTab === 'layers' && (
                /* Dynamic Drag and Drop Layer Management board */
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-1 bg-gold-950/10 border border-gold-950/20 py-1.5 px-3 rounded-lg">
                      <Layers className="w-4 h-4 text-gold-400" />
                      <span>Physical Depth Sequencer</span>
                    </span>
                    <p className="text-[10.5px] text-zinc-500 font-sans leading-relaxed mt-1">
                      Drag layers or use arrow buttons to alter the overlapping stacking sequence. Move headlines behind circles or backgrounds forward.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {layerOrder.slice().reverse().map((layerKey, idx) => {
                      const originalIdx = layerOrder.indexOf(layerKey);
                      const meta = getLayerMetadata(layerKey);
                      const Icon = meta.icon;

                      return (
                        <div
                          key={layerKey}
                          draggable
                          onDragStart={(e) => handleDragStart(e, originalIdx)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, originalIdx)}
                          className="flex items-center justify-between bg-zinc-900/40 hover:bg-zinc-900/90 border border-zinc-900 p-3 rounded-xl transition duration-150 cursor-grab active:cursor-grabbing group select-none relative overflow-hidden"
                          title="Drag to rearrange composition depth"
                        >
                          {/* Left colored border accent */}
                          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gold-400/25 group-hover:bg-gold-400 transition" />

                          <div className="flex items-center gap-3 pl-1.55">
                            <div className="text-[10px] bg-zinc-950 px-2 py-0.5 rounded text-zinc-500 font-mono font-bold group-hover:text-gold-400 transition">
                              {layerOrder.length - originalIdx}
                            </div>
                            <div className="text-left font-sans">
                              <span className="text-white text-xs font-medium block">{meta.label}</span>
                              <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider block">
                                Z-INDEX: <span className="text-zinc-400 font-bold">{(originalIdx + 2) * 10}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Move down in stacked index */}
                            <button
                              type="button"
                              onClick={() => handleMoveLayer(originalIdx, 'down')}
                              disabled={originalIdx === 0}
                              className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 transition cursor-pointer"
                              title="Lower layer depth"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Move up in stacked index */}
                            <button
                              type="button"
                              onClick={() => handleMoveLayer(originalIdx, 'up')}
                              disabled={originalIdx === layerOrder.length - 1}
                              className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 transition cursor-pointer"
                              title="Raise layer depth"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            <span className="text-zinc-600 font-mono text-xs select-none pl-1">☰</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-900 p-3.5 rounded-xl text-center">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase block tracking-wider font-bold">ACTIVE BLUEPRINT RULE</span>
                    <p className="text-[10px] text-zinc-400 italic font-sans leading-normal mt-1.5">
                      Changing dynamic stack arrangement changes whether signature grid lines pass behind titles, or overlays obscure decorative header details.
                    </p>
                  </div>
                </div>
              )}

              {activeConsoleTab === 'assets' && (
                /* Premium Assets Sidebar Panel Drawer */
                <div className="space-y-4 animate-fade-in text-left">
                  <div>
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-1 bg-gold-950/10 border border-gold-950/30 py-1.5 px-3 rounded-lg">
                      <Sparkles className="w-4 h-4 text-gold-400" />
                      <span>Brutalist Premium Assets</span>
                    </span>
                    <p className="text-[10.5px] text-zinc-500 font-sans leading-relaxed mt-1">
                      Drag these geometric elements, ornaments, or texture grids directly onto the poster board, or click to place centered.
                    </p>
                  </div>

                  {/* Active Placed Asset Fine-Tune Controller */}
                  {selectedAssetId ? (
                    (() => {
                      const selActive = placedAssets.find(pa => pa.id === selectedAssetId);
                      if (!selActive) return null;
                      return (
                        <div className="bg-zinc-900/40 border border-gold-500/30 p-3.5 rounded-xl space-y-3 relative">
                          <div className="absolute top-0 right-0 bg-zinc-900 border-l border-b border-zinc-800 px-2 py-0.5 text-[8px] font-mono text-gold-400 uppercase rounded-tr-xl rounded-bl-md">
                            Selected Element
                          </div>

                          <div className="text-left">
                            <span className="text-white text-[11px] font-bold block">{selActive.label}</span>
                            <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider">TYPE: {selActive.category}</span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div>
                              <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-0.5">
                                <span>Scale size ({selActive.scale}%)</span>
                                <span className="text-gold-400 font-semibold">{selActive.scale}%</span>
                              </div>
                              <input
                                type="range"
                                min="5"
                                max="85"
                                value={selActive.scale}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  setPlacedAssets(prev => prev.map(pa => pa.id === selectedAssetId ? { ...pa, scale: val } : pa));
                                }}
                                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-[9px] font-mono text-zinc-500 block mb-0.5">X Axis ({Math.round(selActive.x)}%)</span>
                                <input
                                  type="range"
                                  min="0"
                                  max="95"
                                  value={selActive.x}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setPlacedAssets(prev => prev.map(pa => pa.id === selectedAssetId ? { ...pa, x: val } : pa));
                                  }}
                                  className="w-full h-0.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
                                />
                              </div>
                              <div>
                                <span className="text-[9px] font-mono text-zinc-500 block mb-0.5">Y Axis ({Math.round(selActive.y)}%)</span>
                                <input
                                  type="range"
                                  min="0"
                                  max="95"
                                  value={selActive.y}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setPlacedAssets(prev => prev.map(pa => pa.id === selectedAssetId ? { ...pa, y: val } : pa));
                                  }}
                                  className="w-full h-0.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-gold-500"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-zinc-900/50">
                              <label className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selActive.baseColorMatch}
                                  onChange={(e) => {
                                    const val = e.target.checked;
                                    setPlacedAssets(prev => prev.map(pa => pa.id === selectedAssetId ? { ...pa, baseColorMatch: val } : pa));
                                  }}
                                  className="accent-gold-500"
                                />
                                Match Theme Colors
                              </label>

                              <button
                                type="button"
                                onClick={() => handleRemoveAsset(selActive.id)}
                                className="text-[10px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="py-3 px-3 bg-zinc-900/30 border border-zinc-900 rounded-xl text-center">
                      <p className="text-[10px] text-zinc-500 italic">Select any placed element on the poster preview to adjust its coordinates, scaling, or colors.</p>
                    </div>
                  )}

                  {/* Curated list */}
                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-none">
                    {(['shape', 'ornament', 'texture'] as const).map((cat) => {
                      const items = PREMIUM_ASSETS.filter(a => a.category === cat);
                      return (
                        <div key={cat} className="space-y-2">
                          <h4 className="text-[9px] font-mono font-bold uppercase text-zinc-500 border-b border-zinc-900 pb-1 tracking-wider">
                            {cat === 'shape' ? 'Geometric Silhouette Shapes' : cat === 'ornament' ? 'Structural Typography Ornaments' : 'Abstract Screen Textures'}
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {items.map((asset) => (
                              <div
                                key={asset.id}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('application/creativenode-asset', asset.id);
                                }}
                                onClick={() => placeAssetCenter(asset)}
                                className="flex flex-col items-center justify-between p-3 bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-900 rounded-xl cursor-grab active:cursor-grabbing transition text-center group relative overflow-hidden"
                                title="Drag over to poster or click to place centered"
                              >
                                {/* Drag handle indicator */}
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition text-[8px] text-zinc-650 font-mono">
                                  DRAG ☰
                                </div>

                                <div className="w-12 h-12 flex items-center justify-center p-1 bg-black/35 rounded-lg mb-2 text-gold-400 border border-zinc-900 shrink-0">
                                  {asset.category === 'ornament' ? (
                                    <div className="text-[7px] font-mono text-white tracking-tighter truncate w-full p-1 leading-none uppercase font-extrabold">{asset.content}</div>
                                  ) : (
                                    <div className="w-8 h-8 opacity-75" dangerouslySetInnerHTML={{ __html: asset.content }} />
                                  )}
                                </div>

                                <span className="text-[9px] font-sans font-medium text-zinc-300 leading-tight block w-full truncate">{asset.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Version History side console panel tab */}
              {activeConsoleTab === 'history' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                      <History className="w-3.5 h-3.5 text-gold-400" /> Rolling Version snapshots
                    </span>
                    <p className="text-[10.5px] text-zinc-400 mt-1 leading-normal">
                      Tracks your last 5 manual adjustments or parameter modification states. Revert anytime instantly.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 scrollbar-none pb-4">
                    {versionHistory.length > 0 ? (
                      versionHistory.map((histState, index) => {
                        const isActive = JSON.stringify(composition) === JSON.stringify(histState.composition) &&
                                         JSON.stringify(placedAssets) === JSON.stringify(histState.placedAssets);
                        const displayTitle = histState.composition.title || "Untitled Composition";
                        
                        return (
                          <div 
                            key={index}
                            className={`p-3 rounded-xl border transition flex flex-col justify-between gap-1 text-left ${
                              isActive 
                                ? 'bg-gold-500/5 border-gold-500/50' 
                                : 'bg-zinc-900/45 border-zinc-900/80 hover:border-zinc-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-semibold">
                                {index === 0 ? "● Curative Snapshot" : `Snapshot #${versionHistory.length - index}`}
                              </span>
                              
                              {isActive && (
                                <span className="text-[7.5px] font-mono font-bold uppercase tracking-widest text-[#dfb76c] bg-[#dfb76c]/15 px-1.5 py-0.5 rounded border border-[#dfb76c]/35 animate-pulse">
                                  active
                                </span>
                              )}
                            </div>
                            <div className="flex gap-3 mt-1.5">
                              <div 
                                className="w-10 h-12 rounded border border-zinc-700 bg-cover bg-center shrink-0" 
                                style={{
                                  backgroundColor: histState.composition.bgType === 'color' ? histState.composition.bgValue : '#111',
                                  backgroundImage: histState.composition.bgType === 'image' ? `url(${histState.composition.bgValue})` : 'none'
                                }}
                              />
                              <div>
                                <p className="font-display font-bold text-xs text-white truncate max-w-[140px]">
                                  {displayTitle}
                                </p>

                            <div className="text-[9px] font-mono text-zinc-500 flex flex-wrap gap-1.5 leading-none pt-1">
                              <span>Font: {histState.composition.fontTitle}</span>
                              <span>•</span>
                              <span>Align: {histState.composition.align}</span>
                              <span>•</span>
                                <span className="uppercase">Graphic: {histState.composition.geometricElement}</span>
                              </div>
                            </div>
                          </div>

                            <div className="flex justify-end pt-2 border-t border-zinc-900/55 mt-2">
                              <button
                                type="button"
                                disabled={isActive}
                                onClick={() => {
                                  setHistoryToRevert({ composition: histState.composition, placedAssets: histState.placedAssets, displayTitle });
                                }}
                                className={`font-mono text-[8.5px] uppercase tracking-wider px-2.5 py-1 rounded-md transition select-none ${
                                  isActive 
                                    ? 'text-zinc-600 bg-zinc-950 cursor-not-allowed opacity-45' 
                                    : 'text-gold-400 bg-zinc-900 hover:bg-zinc-800 cursor-pointer border border-zinc-800 hover:border-zinc-700'
                                }`}
                              >
                                Revert Change
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 bg-zinc-900/10 border border-dashed border-zinc-900 rounded-xl text-center">
                        <History className="w-5 h-5 text-zinc-700 mx-auto mb-2" />
                        <h5 className="font-mono text-[10px] text-zinc-505 uppercase">Awaiting Changes</h5>
                        <p className="text-[10px] text-zinc-600 mt-1 leading-relaxed">
                          Slide, write or modify design elements to start writing automatic snapshot history cards.
                        </p>
                      </div>
                    )}
                  </div>
                  {/* Revert Confirmation Dialog */}
                  {historyToRevert && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl glassmorphism-card animate-fade-in">
                        <h3 className="text-white font-bold text-lg mb-2">Revert to snapshot?</h3>
                        <p className="text-zinc-400 text-sm mb-6">
                          You are about to restore the canvas to "{historyToRevert.displayTitle}". This will overwrite your current unsaved progress. Proceed?
                        </p>
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => setHistoryToRevert(null)}
                            className="px-4 py-2 text-xs font-mono font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              setComposition(historyToRevert.composition);
                              setPlacedAssets(historyToRevert.placedAssets);
                              addToast(`Restored design configuration to snapshot: "${historyToRevert.displayTitle}"`, "success");
                              setHistoryToRevert(null);
                            }}
                            className="px-4 py-2 text-xs font-mono font-bold text-black bg-red-400 hover:bg-red-500 rounded-lg shadow-lg transition"
                          >
                            Confirm Revert
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CTA: Brief generation triggers */}
              <div className="border-t border-zinc-900 pt-5 flex flex-col gap-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Export Actions</span>
                  {/* Design Readiness Indicator */}
                  <div className="flex items-center gap-1.5 opacity-90 animate-fade-in" title="Design configuration complete">
                    <div className="relative flex items-center justify-center w-4 h-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full blur-[4px] opacity-60"></div>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 relative z-10 drop-shadow-[0_0_2px_rgba(52,211,153,0.8)]" />
                    </div>
                    <span className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">Design Ready</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadMockup}
                    className="flex-1 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-900/40 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" /> Export Spec
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="flex-1 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-900/40 text-gold-300 text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 animate-pulse"
                  >
                    <Share2 className="w-3.5 h-3.5 text-gold-400" /> Copy Share Link
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex-1 border border-gold-500/20 bg-gold-950/20 hover:bg-gold-950/40 text-gold-400 text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer hover:border-gold-500/40"
                    title="Save draft composition so you can pause and resume later"
                  >
                    <Sliders className="w-3.5 h-3.5 text-gold-400" /> Save Design Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSubmittingBrief(true)}
                    className="flex-1 bg-gold-400 hover:bg-gold-300 text-black text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-gold-500/10 active:scale-95 hover:shadow-gold-500/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Submit Blueprint
                  </button>
                </div>
                {lastAutoSaved && (
                  <div className="text-center mt-1">
                    <span className="text-[10px] font-mono text-zinc-500">
                      Auto-saved in background at {lastAutoSaved}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right Side: High-Prestige Virtual Poster Canvas Frame (Hides control sidebar wholly in Fullscreen Mode) */}
        <div className={`${previewMode === 'fullscreen' ? 'lg:col-span-12 w-full max-w-2xl mx-auto py-8' : 'lg:col-span-7'} flex flex-col items-center justify-center transition-all duration-500`}>
          <div className="w-full max-w-lg aspect-[4/5] bg-zinc-950 border border-zinc-900/80 rounded-2xl p-4 md:p-8 flex items-center justify-center relative box-border group">
            
            {/* Floating Action Menu pill for design/fullscreen toggles */}
            <div className="absolute -top-3.5 right-4 bg-zinc-900 border border-zinc-800 px-1.5 py-1 rounded-full flex items-center gap-1 shadow-2xl backdrop-blur z-30">
              <button
                type="button"
                onClick={() => {
                  setPreviewMode('design');
                  addToast("Double-panel design workbench restored.", "info");
                }}
                className={`p-1.5 px-3 rounded-full transition text-[9px] font-mono uppercase tracking-wider flex items-center gap-1 ${
                  previewMode === 'design' ? 'bg-gold-500 text-black font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Layout className="w-3 h-3" />
                <span>Workbench</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewMode('fullscreen');
                  addToast("Theater Mode expanded. [ESC] or button to return.", "info");
                }}
                className={`p-1.5 px-3 rounded-full transition text-[9px] font-mono uppercase tracking-wider flex items-center gap-1 ${
                  previewMode === 'fullscreen' ? 'bg-gold-500 text-black font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Theater View</span>
              </button>

              <span className="h-3.5 w-[1px] bg-zinc-800 mx-0.5" />

              <button
                type="button"
                onClick={() => {
                  setShowGrid(prev => !prev);
                  addToast(showGrid ? "Swiss grid hidden." : "Modular Swiss Grid layout lines displayed.", "info");
                }}
                className={`p-1.5 px-3 rounded-full transition text-[9px] font-mono uppercase tracking-wider flex items-center gap-1 ${
                  showGrid ? 'bg-red-950/50 text-red-400 border border-red-900/30 font-semibold' : 'text-zinc-500 hover:text-zinc-350'
                }`}
                title="Toggle precision Swiss alignment modular grid lines"
              >
                <Grid className="w-3 h-3" />
                <span>Swiss Grid</span>
              </button>

              <span className="h-3.5 w-[1px] bg-zinc-800 mx-0.5" />

              <button
                type="button"
                onClick={() => {
                  setShowPrintPreview(true);
                  addToast("Physical Print Frame Mockup activated.", "success");
                }}
                className="p-1.5 px-3 rounded-full text-zinc-500 hover:text-gold-400 hover:bg-zinc-900 transition text-[9px] font-mono uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                title="View design in a physical wall frame"
              >
                <Eye className="w-3 h-3 text-gold-400" />
                <span>Wall Frame Preview</span>
              </button>
            </div>

            {/* Visual Indicators */}
            <div className="absolute top-4 left-4 font-mono text-[9px] text-zinc-500 flex gap-4">
              <span>CANVAS_STATE V2</span>
              <span>GRID_LOCK_ACTIVE: {showGrid ? 'ON' : 'OFF'}</span>
            </div>
            
            <div className="absolute top-4 right-4 text-xs font-mono text-zinc-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE_ATELIER_PREVIEW</span>
            </div>

            {/* Poster Frame */}
            <div 
              id="live-poster-rendering-canvas"
              onClick={() => setSelectedAssetId(null)}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                const clientX = e.clientX;
                const clientY = e.clientY;
                const xPercent = ((clientX - rect.left) / rect.width) * 100;
                const yPercent = ((clientY - rect.top) / rect.height) * 100;

                // 1. Relocate existing element
                const existingId = e.dataTransfer.getData('application/creativenode-drag-existing');
                if (existingId) {
                  if (existingId === 'qr-custom-element') {
                    setQrPosition(prev => ({
                      ...prev,
                      x: Math.max(0, Math.min(100, xPercent)),
                      y: Math.max(0, Math.min(100, yPercent))
                    }));
                  } else {
                    setPlacedAssets(prev => prev.map(pa => pa.id === existingId ? {
                      ...pa,
                      x: Math.max(0, Math.min(100, xPercent)),
                      y: Math.max(0, Math.min(100, yPercent))
                    } : pa));
                    setSelectedAssetId(existingId);
                  }
                  return;
                }

                // 2. Add new asset from sidebar list
                const assetId = e.dataTransfer.getData('application/creativenode-asset');
                if (assetId) {
                  const asset = PREMIUM_ASSETS.find(a => a.id === assetId);
                  if (asset) {
                    const newPlaced = {
                      id: 'placed-' + Date.now() + Math.random().toString(36).substring(2, 6),
                      assetId: asset.id,
                      category: asset.category,
                      label: asset.label,
                      content: asset.content,
                      x: Math.max(0, Math.min(100, xPercent)),
                      y: Math.max(0, Math.min(100, yPercent)),
                      scale: asset.category === 'shape' ? 25 : asset.category === 'texture' ? 40 : 25,
                      baseColorMatch: true
                    };
                    setPlacedAssets(prev => [...prev, newPlaced]);
                    setSelectedAssetId(newPlaced.id);
                    addToast(`Dropped and placed ${asset.label}!`, 'success');
                  }
                }
              }}
              className={`atelier-studio-canvas w-full max-w-sm rounded shadow-2xl overflow-hidden relative border border-zinc-800/50 transition-all duration-500 flex flex-col justify-between p-6 md:p-8 shrink-0 select-none ${
                aspectRatio === 'story' ? 'aspect-[9/16]' : aspectRatio === 'banner' ? 'aspect-[1/1]' : 'aspect-[4/5]'
              }`}
              style={{
                filter: cssFilterTarget === 'all' && cssFilter !== 'none' ? (
                  cssFilter === 'grayscale' ? 'grayscale(100%)' :
                  cssFilter === 'sepia' ? 'sepia(100%)' :
                  cssFilter === 'contrast' ? 'contrast(180%) brightness(95%)' :
                  cssFilter === 'invert' ? 'invert(100%)' : ''
                ) : ''
              }}
            >
              {/* Autosave Indicator */}
              <div className="absolute top-4 right-4 z-[60] flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm px-2 py-1 rounded border border-white/5">
                <div className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold-500"></span>
                </div>
                {lastAutoSaved ? (
                  <span className="text-[7px] font-mono text-zinc-300 uppercase tracking-widest">Saved</span>
                ) : (
                  <span className="text-[7px] font-mono text-zinc-300 uppercase tracking-widest">Live</span>
                )}
              </div>

              {/* Actual Background Color & Image Base with Background Filter option */}
              <div 
                className="absolute inset-0 pointer-events-none" 
                style={{ 
                  zIndex: 1, 
                  backgroundColor: composition.bgType === 'color' ? composition.bgValue : '#0d0d0d',
                  backgroundImage: composition.bgType === 'image' ? `url(${composition.bgValue})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: cssFilterTarget === 'background' && cssFilter !== 'none' ? (
                    cssFilter === 'grayscale' ? 'grayscale(100%)' :
                    cssFilter === 'sepia' ? 'sepia(100%)' :
                    cssFilter === 'contrast' ? 'contrast(180%) brightness(95%)' :
                    cssFilter === 'invert' ? 'invert(100%)' : ''
                  ) : ''
                }}
              />
              {/* Precision Modular Swiss Grid alignment vector lines */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none z-20">
                  {/* Vertical modular column lines */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={`v-grid-${i}`}
                      className="absolute inset-y-0 border-r border-dashed border-red-500/25"
                      style={{ left: `${((i + 1) * 100) / 6}%` }}
                    />
                  ))}
                  {/* Horizontal modular row lines */}
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={`h-grid-${i}`}
                      className="absolute inset-x-0 border-b border-dashed border-red-500/25"
                      style={{ top: `${((i + 1) * 100) / 8}%` }}
                    />
                  ))}
                  {/* Subtle coordinate markers */}
                  <div className="absolute bottom-1 right-2 font-mono text-[7px] text-red-550 opacity-45 select-none bg-black/60 px-1 py-0.5 rounded">
                    SYS COLx6 ROWx8
                  </div>
                </div>
              )}

              {/* Backdrop Scrim & Grain Overlay Layer */}
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: getZIndex('background') }}>
                <div className="absolute inset-0 bg-grain mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
              </div>

              {/* Geometric Accent Overlays Layer (Holds Circles, line metrics and the right side ticks) */}
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: getZIndex('geometric') }}>
                {composition.geometricElement === 'circle' && (
                  <div 
                    className="absolute inset-x-0 mx-auto aspect-square rounded-full border border-dashed opacity-25"
                    style={{ 
                      borderColor: composition.accentColor,
                      width: '70%',
                      top: '18%'
                    }}
                  />
                )}

                {composition.geometricElement === 'lines' && (
                  <div className="absolute inset-0 p-8 flex flex-col justify-between opacity-20">
                    <div className="w-full border-b border-dashed" style={{ borderColor: composition.accentColor }} />
                    <div className="w-full border-b border-dashed" style={{ borderColor: composition.accentColor }} />
                    <div className="w-full border-b border-dashed" style={{ borderColor: composition.accentColor }} />
                  </div>
                )}

                {composition.geometricElement === 'grid' && (
                  <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: `radial-gradient(${composition.accentColor} 1px, transparent 1px)`, backgroundSize: '16px 16px' }} />
                )}

                {composition.geometricElement === 'border' && (
                  <div 
                    className="absolute inset-4 border animate-pulse"
                    style={{ borderColor: composition.accentColor, borderWidth: '1px' }}
                  />
                )}

                {/* Decorative side ruler ticks */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 h-1/3 flex flex-col justify-between font-mono text-[7px] text-zinc-600 opacity-65">
                  <span>01</span>
                  <span>•</span>
                  <span>02</span>
                  <span>•</span>
                  <span>03</span>
                </div>
              </div>

              {/* Header Category Stamp Stamp Badge Layer */}
              <div className="relative" style={{ zIndex: getZIndex('badge') }}>
                <div className={`flex items-center justify-between font-mono text-[9.5px] uppercase tracking-widest`} style={{ color: composition.textColor }}>
                  <span className="opacity-80">CREATIVENODE // EXCLUSIVE</span>
                  {initialTemplate.badge && (
                    <span 
                      className="px-2 py-0.5 rounded border text-[8px] tracking-normal font-bold font-mono"
                      style={{ borderColor: composition.accentColor, color: composition.accentColor }}
                    >
                      {initialTemplate.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Subheading & Title Assembly Typographies Layer */}
              <div className="relative my-auto py-6" style={{ zIndex: getZIndex('branding') }}>
                <div 
                  className={`flex flex-col justify-center h-full ${
                    composition.align === 'center' ? 'text-center items-center' : composition.align === 'right' ? 'text-right items-end' : 'text-left items-start'
                  }`}
                >
                  {/* Subtitle / Brand label */}
                  <span 
                    className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] font-semibold mb-2 drop-shadow-md"
                    style={{ 
                      color: composition.accentColor,
                      fontFamily: composition.fontSubtitle === 'Space Grotesk' ? '"Space Grotesk", sans-serif' : composition.fontSubtitle === 'Playfair Display' ? '"Playfair Display", serif' : composition.fontSubtitle === 'JetBrains Mono' ? '"JetBrains Mono", monospace' : '"Inter", sans-serif'
                    }}
                  >
                    {composition.subtitle}
                  </span>

                  {/* Massive Hero Headline styled precisely */}
                  <h3 
                    className="text-2xl md:text-4xl font-extrabold tracking-tighter leading-tight drop-shadow-xl"
                    style={{ 
                      color: composition.textColor,
                      fontFamily: composition.fontTitle === 'Space Grotesk' ? '"Space Grotesk", sans-serif' : composition.fontTitle === 'Playfair Display' ? '"Playfair Display", serif' : composition.fontTitle === 'JetBrains Mono' ? '"JetBrains Mono", monospace' : '"Inter", sans-serif'
                    }}
                  >
                    {composition.title}
                  </h3>

                  {/* Simulated Signature Line if custom Gold Ratio */}
                  {composition.theme.includes('Gold') && (
                    <div className="w-12 h-[2px] bg-gradient-to-r from-amber-400 to-amber-700/0 mt-4 rounded" />
                  )}
                </div>
              </div>

              {/* Footing details indices Layer */}
              <div className="relative mt-auto border-t pt-4 border-white/10" style={{ zIndex: getZIndex('footer'), color: composition.textColor }}>
                <div className={composition.align === 'center' ? 'text-center' : composition.align === 'right' ? 'text-right' : 'text-left'}>
                  <p className="font-mono text-[9px] uppercase tracking-wide opacity-70 line-clamp-2 leading-relaxed">
                    {composition.details}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[8px] font-mono text-zinc-500">
                    <span>ATELIER PROD. V2</span>
                    <span>© 2026</span>
                  </div>
                </div>
              </div>

              {/* Placed Premium Assets Layer */}
              {placedAssets && placedAssets.map((asset) => {
                const isSelected = selectedAssetId === asset.id;
                return (
                  <div
                    key={asset.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAssetId(asset.id);
                      setActiveConsoleTab('assets');
                    }}
                    className={`absolute cursor-move select-none group/asset ${
                      isSelected ? 'ring-2 ring-gold-500 ring-offset-2 ring-offset-black rounded-lg' : 'hover:ring-1 hover:ring-zinc-500/40'
                    }`}
                    style={{
                      left: `${asset.x}%`,
                      top: `${asset.y}%`,
                      width: `${asset.scale}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 80,
                      color: asset.baseColorMatch ? composition.accentColor : '#ffffff'
                    }}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/creativenode-drag-existing', asset.id);
                    }}
                  >
                    {/* Render Content */}
                    <div className="w-full h-full pointer-events-none">
                      {asset.category === 'ornament' ? (
                        <div 
                          className="font-mono text-center truncate select-none leading-none tracking-tight font-extrabold uppercase border border-current px-2 py-1 bg-black/40 backdrop-blur-[1px]"
                          style={{ fontSize: 'calc(0.4rem + 0.35vw)' }}
                        >
                          {asset.content}
                        </div>
                      ) : (
                        <div 
                          className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter transition duration-200"
                          dangerouslySetInnerHTML={{ __html: asset.content }}
                        />
                      )}
                    </div>

                    {/* Miniature close tag button for selected element */}
                    {isSelected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAsset(asset.id);
                        }}
                        className="absolute -top-3 -right-3 w-5 h-5 bg-rose-500 hover:bg-rose-400 text-black rounded-full flex items-center justify-center font-bold text-[10px] shadow-md transition cursor-pointer"
                        title="Delete asset"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Dynamic Drag-and-Drop QR Code stamp */}
              {showQrOnCanvas && qrCodeDataUrl && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAssetId('qr-custom-element');
                    setActiveConsoleTab('parameters');
                  }}
                  className={`absolute p-1 bg-white border cursor-move select-none rounded ${
                    selectedAssetId === 'qr-custom-element'
                      ? 'border-gold-500 ring-2 ring-gold-500 ring-offset-2 ring-offset-black'
                      : 'border-zinc-850 hover:border-zinc-650'
                  }`}
                  style={{
                    left: `${qrPosition.x}%`,
                    top: `${qrPosition.y}%`,
                    width: `${qrPosition.scale}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 90
                  }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/creativenode-drag-existing', 'qr-custom-element');
                  }}
                >
                  <img 
                    src={qrCodeDataUrl} 
                    alt="Portfolio website QR stamp"
                    className="w-full h-full block pointer-events-none select-none"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-[4px] font-mono font-bold text-center text-zinc-900 leading-none tracking-tighter mt-0.5 select-none uppercase">
                    Scan Portfolio
                  </div>
                </div>
              )}
            </div>

            {/* Export loading spinner absolute overlay */}
            {exportAnimation && (
              <div className="absolute inset-0 bg-black/90 rounded-2xl flex flex-col items-center justify-center text-white z-50">
                <RefreshCw className="w-10 h-10 text-gold-400 animate-spin mb-3" />
                <span className="font-mono text-sm tracking-widest text-gold-200">RENDERING DESIGN MOCKUP...</span>
                <span className="text-zinc-500 text-xs mt-1">Generating spec package details</span>
              </div>
            )}
          </div>
          <p className="text-zinc-500 text-[11px] font-mono mt-3">
            Simulated high-res asset rendering. Real deliverables feature sharp vectors, pure 300DPI, and premium layers.
          </p>
        </div>
      </div>

      {/* Brief submission Drawer modal */}
      {isSubmittingBrief && (
        <div id="brief-modal-overlay" className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl w-full max-w-lg p-6 relative overflow-hidden">
            {/* Ambient gold card banner */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold-500/0 via-gold-400 to-gold-500/0" />
            
            <h3 className="font-display text-xl font-medium text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-400 animate-pulse" /> Register Project Brief
            </h3>
            <p className="text-xs text-zinc-400 mt-1 mb-3">
              Securely lock key constraints alongside your styled composition setup. Saved specs can be deployed immediately to high range.
            </p>

            <div className="flex items-center justify-between mb-5 bg-zinc-900/40 border border-zinc-900 rounded-xl p-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block font-mono">Subscription Access</span>
                <span className="text-xs font-bold text-white uppercase font-sans flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
                  {userTier} Studio
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block font-mono">Daily Quota Usage</span>
                <span className="text-xs font-bold text-gold-400 font-mono mt-0.5 block">
                  {getDailyCount()} / {getDailyLimit() === 9999 ? '∞' : getDailyLimit()} Specs
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitBrief} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase block">Your Full Name *</label>
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={() => startSpeechRecognition('client')}
                      className={`text-[9px] font-mono flex items-center gap-1.5 py-0.5 px-2.5 rounded-full transition ${
                        isListeningClient 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulseScale' 
                          : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-855 border border-zinc-800'
                      }`}
                    >
                      {isListeningClient ? <MicOff className="w-3 h-3 text-red-400" /> : <Mic className="w-3 h-3 text-zinc-500" />}
                      <span>{isListeningClient ? 'Listening...' : 'Dictate'}</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe / Brand Manager"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Contact Protocol *</label>
                  <select
                    value={contactChannel}
                    onChange={(e) => {
                      setContactChannel(e.target.value as any);
                      setContactValue('');
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-gold-500 transition"
                  >
                    <option value="whatsapp">WhatsApp Protocol</option>
                    <option value="instagram">Instagram ID</option>
                    <option value="email">Email Secure</option>
                    <option value="call">Direct Call</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Protocol Value *</label>
                  <input
                    type="text"
                    required
                    placeholder={
                      contactChannel === 'whatsapp' ? 'e.g. +91 63692...' 
                      : contactChannel === 'instagram' ? 'e.g. @creativenode' 
                      : contactChannel === 'email' ? 'e.g. design@brand.co' 
                      : 'e.g. Call number'
                    }
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Investment Tier</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-gold-500 transition"
                  >
                    {PRICING_TIERS.map(tier => (
                      <option key={tier.id} value={tier.id}>
                        {tier.name} (₹{tier.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Turnaround Options</label>
                  <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setDeliverySpeed('standard')}
                      className={`py-1 text-[10px] font-mono rounded capitalize transition ${
                        deliverySpeed === 'standard' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Regular
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliverySpeed('express')}
                      className={`py-1 text-[10px] font-mono rounded capitalize transition ${
                        deliverySpeed === 'express' ? 'bg-gold-500 text-black font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Express Rush
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase block">Brief Copy Directives / Extra Requirements</label>
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={() => startSpeechRecognition('notes')}
                      className={`text-[9px] font-mono flex items-center gap-1.5 py-0.5 px-2.5 rounded-full transition ${
                        isListeningNotes 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulseScale' 
                          : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-855 border border-zinc-800'
                      }`}
                    >
                      {isListeningNotes ? <MicOff className="w-3 h-3 text-red-400" /> : <Mic className="w-3 h-3 text-zinc-500" />}
                      <span>{isListeningNotes ? 'Listening...' : 'Dictate Spec'}</span>
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  placeholder="Need special gold gradients, custom logo, high grain style..."
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500 transition resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsSubmittingBrief(false)}
                  className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs py-2 px-5 rounded-lg flex items-center gap-1.5 transition active:scale-95"
                >
                  Confirm Submission <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Stack Toasts list notifications */}
      <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`bg-zinc-950 border px-4 py-3 rounded-xl shadow-2xl flex items-start gap-2.5 pointer-events-auto min-w-[280px] ${
                toast.type === 'success' ? 'border-emerald-500/30 text-zinc-150 shadow-emerald-950/20' : 
                toast.type === 'alert' ? 'border-red-500/30 text-zinc-150 shadow-red-950/20' : 
                'border-zinc-800 text-zinc-300'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />}
              {toast.type === 'info' && <Sparkles className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />}
              {toast.type === 'alert' && <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />}
              
              <div className="flex-1 text-[11px] font-sans leading-relaxed text-zinc-200">
                {toast.message}
              </div>
              
              <button
                type="button"
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-zinc-650 hover:text-white transition shrink-0"
              >
                <X className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Print preview wall mockup modal */}
      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        composition={composition}
        placedAssets={placedAssets}
      />
    </section>
  );
}
