import React, { useEffect, useState } from 'react';
import { 
  FileText, Calendar, Trash2, Send, ShieldCheck, Copy, Check, Search, Download, Mail, X, CheckSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { DesignBrief } from '../types';

interface BriefingDashboardProps {
  changeTrigger: number;
}

export default function BriefingDashboard({ changeTrigger }: BriefingDashboardProps) {
  const [briefs, setBriefs] = useState<DesignBrief[]>([]);
  const [briefSearchQuery, setBriefSearchQuery] = useState('');
  const [copiedBriefId, setCopiedBriefId] = useState<string | null>(null);

  // States for multi-select Bulk Rename
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [renamePrefix, setRenamePrefix] = useState('Project_Series_2026');
  const [renamePattern, setRenamePattern] = useState<'sponsor_date_index' | 'custom_prefix_index'>('sponsor_date_index');

  // Toggle selection of single brief
  const toggleSelectBrief = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle select all briefs
  const toggleSelectAll = () => {
    if (selectedIds.length === briefs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(briefs.map(b => b.id));
    }
  };

  // Bulk rename applied callback
  const handleBulkRename = () => {
    if (selectedIds.length === 0) return;
    
    // Sort selected briefs so they follow order of creation or placement
    const updated = briefs.map((b, index) => {
      if (selectedIds.includes(b.id)) {
        let newName = b.clientName;
        const indexStr = String(index + 1).padStart(2, '0');
        
        if (renamePattern === 'sponsor_date_index') {
          // Uniform naming pattern matching 'Sponsor_Date_Series'
          const cleanSponsor = b.clientName.trim().replace(/[^a-zA-Z0-9]/g, '_');
          newName = `${cleanSponsor}_2026_${indexStr}`;
        } else {
          // Custom prefix series matching CustomPrefix_Index
          const cleanPrefix = renamePrefix.trim().replace(/[^a-zA-Z0-9]/g, '_');
          newName = `${cleanPrefix}_${indexStr}`;
        }
        
        return {
          ...b,
          clientName: newName
        };
      }
      return b;
    });

    localStorage.setItem('creativenode_briefs', JSON.stringify(updated));
    setBriefs(updated);
    setSelectedIds([]);
    
    // Dispatch standard storage event so other components refresh counts
    window.dispatchEvent(new Event('storage'));
  };

  // Mock email notification state
  const [mockEmail, setMockEmail] = useState<{
    id: string;
    to: string;
    clientName: string;
    status: string;
    subject: string;
    body: string;
  } | null>(null);

  // Sync state with localstorage on mount and triggers
  const loadBriefs = () => {
    const data = localStorage.getItem('creativenode_briefs');
    if (data) {
      try {
        setBriefs(JSON.parse(data));
      } catch (err) {
        console.error("Error parsing briefs:", err);
      }
    } else {
      setBriefs([]);
    }
  };

  useEffect(() => {
    loadBriefs();
  }, [changeTrigger]);

  const handleDelete = (id: string) => {
    const updated = briefs.filter(b => b.id !== id);
    localStorage.setItem('creativenode_briefs', JSON.stringify(updated));
    setBriefs(updated);
  };

  const handleCopySpec = (brief: DesignBrief) => {
    const specText = `=== CREATIVENODE DESIGN BRIEF ===\nID: ${brief.id}\nClient: ${brief.clientName}\nProtocol: ${brief.contactChannel} (${brief.contactValue})\nTier: ${brief.selectedTier.toUpperCase()}\nSpeed: ${brief.deliverySpeed === 'express' ? 'EXPRESS RUSH' : 'STANDARD'}\nStatus: ${brief.status || 'Draft'}\n\nTitle Config:\n- Headline Text: "${brief.composition.title}"\n- Subtitle Text: "${brief.composition.subtitle}"\n- Accent Color: ${brief.composition.accentColor}\n- Theme preset: ${brief.composition.theme}\n- Description notes: "${brief.composition.details}"\n\nExtra Client Requests: "${brief.extraNotes || 'None'}"`;
    navigator.clipboard.writeText(specText);
    setCopiedBriefId(brief.id);
    setTimeout(() => {
      setCopiedBriefId(null);
    }, 2000);
  };

  const getWhatsAppBriefLink = (brief: DesignBrief) => {
    const specMessage = `Hello CreativeNode Studio, I registered a design brief!\n\n*Name*: ${brief.clientName}\n*Tier*: ${brief.selectedTier.toUpperCase()}\n*Title Config*: "${brief.composition.title}"\n*Status*: ${brief.status || 'Draft'}\n*Speed*: ${brief.deliverySpeed === 'express' ? 'Express Rush' : 'Standard'}\n*My notes*: ${brief.extraNotes || 'None'}`;
    return `https://wa.me/916369278905?text=${encodeURIComponent(specMessage)}`;
  };

  // Status visual map helper
  const statusColors = {
    'Draft': 'bg-zinc-800 text-zinc-300 border-zinc-700',
    'In Production': 'bg-amber-950/40 text-amber-400 border-amber-900/50',
    'Proof Ready': 'bg-indigo-950/40 text-indigo-400 border-indigo-900/50',
    'Finished': 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
  };

  // High-fidelity PDF document generation using jsPDF
  const handleDownloadPDF = (brief: DesignBrief) => {
    const doc = new jsPDF();
    
    // Premium dark header banner
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, 210, 42, 'F');
    
    // Grid Lines on PDF header
    doc.setDrawColor(44, 44, 44);
    doc.line(40, 0, 40, 42);
    doc.line(170, 0, 170, 42);
    
    // Core Title
    doc.setTextColor(212, 175, 55); // Premium Gold
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("CREATIVENODE POSTER STUDIO", 15, 18);
    
    doc.setTextColor(160, 160, 160);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text("HIGH-PRESTIGE DIGITAL SPECIFICATION SHEET & BRIEF BLUEPRINT", 15, 26);
    doc.text(`PRINT DATE: ${new Date().toLocaleDateString()} / UTC`, 15, 32);
    doc.text(`RECORD IDENTIFIED: #${brief.id.slice(0, 8)}`, 142, 18);
    
    // Gold Accent separator
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1);
    doc.line(15, 42, 195, 42);
    
    // SECTION 1: Client Information
    doc.setTextColor(30, 30, 30);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.text("1. CUSTOMER IDENTITY & ACCOUNT PROTOCOLS", 15, 56);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10.5);
    doc.text(`Client Brand Sponsor:   ${brief.clientName}`, 15, 66);
    doc.text(`Dispatch Channel:       ${brief.contactChannel.toUpperCase()} (${brief.contactValue})`, 15, 73);
    doc.text(`Selected Service Tier:  ${brief.selectedTier.toUpperCase()} package`, 15, 80);
    doc.text(`Response Velocity:      ${brief.deliverySpeed === 'express' ? 'EXPRESS RUSH DELIVERABLE' : 'STANDARD DESIGN CYCLE'}`, 15, 87);
    doc.text(`Active Ledger Status:   ${brief.status || 'Draft'}`, 15, 94);
    doc.text(`System Reference UUID:  ${brief.id}`, 15, 101);
    
    // Section dividor
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(15, 108, 195, 108);
    
    // SECTION 2: Typography & Composition parameters
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.text("2. DESIGN SYSTEM & COMPOSITION PARAMETERS", 15, 118);
    
    doc.setFont("Helvetica", "normal");
    doc.text(`Graphic Headline:      "${brief.composition.title}"`, 15, 128);
    doc.text(`Graphic Subtitle:      "${brief.composition.subtitle}"`, 15, 135);
    doc.text(`Applied Aesthetics:    ${brief.composition.theme}`, 15, 142);
    doc.text(`Accent Line Palette:   ${brief.composition.accentColor}`, 15, 149);
    doc.text(`Geometric Alignment:   ${brief.composition.geometricElement || 'circle'}`, 15, 156);
    
    // Multi-line description text wrapping
    doc.text("Composition Abstract:", 15, 163);
    doc.setFont("Helvetica", "oblique");
    const summarySplit = doc.splitTextToSize(brief.composition.details, 175);
    doc.text(summarySplit, 20, 170);
    
    // Section dividor
    doc.setFont("Helvetica", "normal");
    doc.line(15, 185, 195, 185);
    
    // SECTION 3: Custom directives
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.text("3. ADHOC CLIENT STUDIO DIRECTIVES", 15, 195);
    
    doc.setFont("Helvetica", "normal");
    const notesSplit = doc.splitTextToSize(brief.extraNotes || "No supplementary directives provided. Standard composition parameters enforced.", 175);
    doc.text(notesSplit, 15, 205);
    
    // Bottom border brand line
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.7);
    doc.line(15, 250, 195, 250);
    
    doc.setFont("Helvetica", "oblique");
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for choosing CreativeNode. This layout specification blueprint guarantees exact print reproduction.", 15, 258);
    doc.text("Authorized by Atelier Poster Engine. © CreativeNode Studio Inc. https://ai.studio/build", 15, 263);
    
    // Direct file save
    doc.save(`creativenode_brief_${brief.clientName.replace(/\s+/g, '_').toLowerCase()}.pdf`);
  };

  // Status Change Selector with mock email trigger
  const handleStatusChange = (briefId: string, newStatus: 'Draft' | 'In Production' | 'Proof Ready' | 'Finished') => {
    const updated = briefs.map(b => {
      if (b.id === briefId) {
        return { ...b, status: newStatus };
      }
      return b;
    });
    localStorage.setItem('creativenode_briefs', JSON.stringify(updated));
    setBriefs(updated);

    const brief = briefs.find(b => b.id === briefId);
    if (brief && (newStatus === 'Proof Ready' || newStatus === 'Finished')) {
      setMockEmail({
        id: 'mail-' + Date.now(),
        to: `${brief.clientName.toLowerCase().replace(/\s+/g, '_')}@design-partner.com`,
        clientName: brief.clientName,
        status: newStatus,
        subject: newStatus === 'Proof Ready' 
          ? "🎨 STUDIO DISPATCH: Design Proof is Ready for Review!" 
          : "🎉 EXPORT COMPLETE: Finalized CreativeNode Layout Ready!",
        body: newStatus === 'Proof Ready'
          ? `Hello ${brief.clientName},\n\nThe creative proof has been generated for "${brief.composition.title}". Please evaluate the spec details and respond back to sign off on full production.\n\nBest,\nAtelier Director`
          : `Hello ${brief.clientName},\n\nWe have successfully run high-precision export processes on your design system. Enclosed are your final poster templates and specification manuals.`
      });
    }
  };

  // Filtering list by business name (clientName) or project title (composition.title / composition.subtitle)
  const filteredBriefs = briefs.filter(b => {
    const s = `${b.clientName} ${b.composition.title} ${b.composition.subtitle} ${b.selectedTier}`.toLowerCase();
    return s.includes(briefSearchQuery.toLowerCase());
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Floating Mock Email Card Notification */}
      <AnimatePresence>
        {mockEmail && (
          <motion.div
            initial={{ opacity: 0, y: -70, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -40 }}
            transition={{ type: 'spring', stiffness: 150, damping: 18 }}
            className="fixed top-20 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-zinc-950 border border-gold-500/50 rounded-2xl shadow-2xl p-5 z-[100] overflow-hidden"
          >
            {/* Holographic scanner active bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold-500 via-amber-400 to-gold-500" />
            
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
              <span className="flex items-center gap-1.5 font-mono text-[9px] text-gold-400 uppercase tracking-widest font-semibold">
                <Mail className="w-3.5 h-3.5 animate-bounce" /> Mock Studio Mail Out
              </span>
              <button 
                onClick={() => setMockEmail(null)}
                className="text-zinc-500 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="text-zinc-500">
                <span className="text-zinc-600 mr-2 uppercase text-[9px]">To:</span> {mockEmail.to}
              </div>
              <div className="text-zinc-300 font-semibold border-b border-zinc-900 pb-2">
                <span className="text-zinc-600 mr-2 uppercase text-[9px]">Subject:</span> {mockEmail.subject}
              </div>
              <div className="text-zinc-400 whitespace-pre-line leading-relaxed py-2 bg-zinc-900/40 px-3 rounded-lg border border-zinc-900 text-[11px] h-32 overflow-y-auto scrollbar-none">
                {mockEmail.body}
              </div>
              <p className="text-[9px] text-zinc-600 text-right italic">
                Active notifications dispatched to client inbox simulated successfully
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gold-400" />
          <span className="font-mono text-xs text-gold-300 uppercase tracking-widest">
            Atelier Briefing Ledger ({briefs.length} Saved Records)
          </span>
        </div>

        {/* Search Past Designs input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Filter past designs by brand or title..."
            value={briefSearchQuery}
            onChange={(e) => setBriefSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-850 px-9 py-1.5 text-xs text-white placeholder-zinc-600 rounded-lg focus:outline-none focus:border-gold-500 transition font-mono"
          />
          {briefSearchQuery && (
            <button
              onClick={() => setBriefSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-[9px] font-mono"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Visual Bulk Rename Control Suite */}
      {briefs.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4 text-left text-zinc-300 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-900/60 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-gold-400" />
              <span className="font-mono text-xs text-white uppercase tracking-wider font-semibold">
                Bulk History Organizer ({selectedIds.length} of {briefs.length} selected)
              </span>
            </div>
            
            <button
              onClick={toggleSelectAll}
              type="button"
              className="text-[9px] font-mono text-zinc-400 hover:text-white bg-zinc-900/60 border border-zinc-850 hover:border-zinc-800 px-3 py-1 rounded-lg transition cursor-pointer"
            >
              {selectedIds.length === briefs.length ? 'DESELECT ALL' : 'SELECT ALL RECORDS'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-[9px] font-mono text-zinc-500 uppercase block select-none">Naming Convention Pattern</label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setRenamePattern('sponsor_date_index')}
                  className={`py-1.5 px-3 rounded-lg text-[9px] font-mono transition border cursor-pointer select-none ${
                    renamePattern === 'sponsor_date_index'
                      ? 'border-gold-500 bg-gold-950/20 text-gold-400 font-extrabold'
                      : 'border-zinc-900 bg-zinc-900/40 text-zinc-500 hover:text-zinc-350'
                  }`}
                  title="SponsorName_2026_Index pattern"
                >
                  Sponsor_2026_##
                </button>
                <button
                  type="button"
                  onClick={() => setRenamePattern('custom_prefix_index')}
                  className={`py-1.5 px-3 rounded-lg text-[9px] font-mono transition border cursor-pointer select-none ${
                    renamePattern === 'custom_prefix_index'
                      ? 'border-gold-500 bg-gold-950/20 text-gold-400 font-extrabold'
                      : 'border-zinc-900 bg-zinc-900/40 text-zinc-500 hover:text-zinc-350'
                  }`}
                  title="Custom string with incremental indices"
                >
                  Custom_Prefix_##
                </button>
              </div>
            </div>

            <div className="md:col-span-5 space-y-1.5 font-sans">
              <label className="text-[9px] font-mono text-zinc-500 uppercase block select-none">
                {renamePattern === 'sponsor_date_index' ? 'Sponsor Suffix Date' : 'Convention Brand Prefix'}
              </label>
              <input
                type="text"
                disabled={renamePattern === 'sponsor_date_index'}
                value={renamePattern === 'sponsor_date_index' ? 'Auto-extracting SponsorName_2026_Index' : renamePrefix}
                onChange={(e) => setRenamePrefix(e.target.value)}
                placeholder="e.g. Project_Europe_Gold"
                className="w-full bg-zinc-900/60 border border-zinc-850 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-gold-500 transition font-mono disabled:opacity-40"
              />
            </div>

            <div className="md:col-span-3 text-right">
              <button
                type="button"
                onClick={handleBulkRename}
                disabled={selectedIds.length === 0}
                className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-35 disabled:bg-zinc-900 disabled:text-zinc-500 text-black font-semibold text-xs py-2 px-4 rounded-xl transition cursor-pointer select-none font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 font-extrabold"
              >
                Apply Rename
              </button>
            </div>
          </div>
          <p className="text-[9px] text-zinc-550 italic leading-snug">
            To use, select any history files below, specify your branding pattern configurations, and apply renaming to keep saved records clean.
          </p>
        </div>
      )}

      {filteredBriefs.length === 0 ? (
        <div className="py-12 border border-dashed border-zinc-900 rounded-2xl text-center bg-zinc-950/45 p-6 max-w-xl mx-auto animate-fade-in">
          <FileText className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <h4 className="font-display font-medium text-white text-base">No Matching Records</h4>
          <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
            We couldn't find any saved briefs matching your search queries. Try search term refinement.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBriefs.map((brief) => (
            <div 
              key={brief.id} 
              className={`group relative bg-zinc-950/95 border rounded-xl p-5 md:p-6 transition ${
                selectedIds.includes(brief.id) ? 'border-gold-500/75 bg-zinc-950 shadow-inner' : 'border-zinc-900 hover:border-zinc-800'
              }`}
            >
              {/* Quick tags */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  {/* Select Checkbox Column */}
                  <button
                    type="button"
                    onClick={() => toggleSelectBrief(brief.id)}
                    className="text-zinc-600 hover:text-gold-400 p-1 rounded transition select-none flex items-center justify-center cursor-pointer shrink-0"
                    title="Select for bulk renaming"
                  >
                    {selectedIds.includes(brief.id) ? (
                      <CheckSquare className="w-4 h-4 text-gold-500 fill-gold-500/10" />
                    ) : (
                      <div className="w-4 h-4 border border-zinc-800 hover:border-zinc-700 rounded-md bg-zinc-900/40" />
                    )}
                  </button>

                  <div className="h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
                  <span className="font-display text-sm font-semibold text-white">
                    {brief.clientName}
                  </span>
                  <span className="font-mono text-[9px] text-zinc-600 bg-zinc-900/60 border border-zinc-800 px-2 py-0.5 rounded uppercase">
                    {brief.contactChannel}
                  </span>

                  {/* Active workflow state color badge */}
                  <span className={`text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 border rounded-md transition duration-300 ${statusColors[brief.status || 'Draft']}`}>
                    {brief.status || 'Draft'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{brief.createdAt}</span>
                </div>
              </div>

              {/* Config summary details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 space-y-2">
                  <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-zinc-500 border-b border-zinc-900/40 pb-2">
                    <div>
                      <span className="text-zinc-600 block">TIER SELECT</span>
                      <span className="text-gold-400 font-semibold uppercase">{brief.selectedTier}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 block">DELIVERY SPEED</span>
                      <span className={`font-semibold uppercase ${brief.deliverySpeed === 'express' ? 'text-rose-400' : 'text-zinc-400'}`}>
                        {brief.deliverySpeed} Rush
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-600 block">THEME BASE</span>
                      <span className="text-zinc-300 truncate block">{brief.composition.theme.split(' ')[0]}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs text-zinc-400">
                      <strong className="text-zinc-500 font-mono text-[10px] uppercase mr-2.5">Headline:</strong>
                      <span className="font-display text-white italic font-bold">{brief.composition.title}</span>
                    </p>
                    <p className="text-xs text-zinc-400">
                      <strong className="text-zinc-500 font-mono text-[10px] uppercase mr-2.5">Subtitle:</strong>
                      <span className="text-zinc-200 font-semibold">{brief.composition.subtitle}</span>
                    </p>
                    {brief.extraNotes && (
                      <p className="text-xs text-zinc-500 italic bg-zinc-900/30 p-2 rounded border border-zinc-900/85">
                        <strong className="text-zinc-500 font-mono text-[9px] uppercase not-italic mr-1.5 block mb-1">Directives:</strong>
                        "{brief.extraNotes}"
                      </p>
                    )}
                  </div>

                  {/* Status interactive selector dropdown */}
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-900/30">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase">Set Studio State:</label>
                    <div className="flex flex-wrap gap-1">
                      {(['Draft', 'In Production', 'Proof Ready', 'Finished'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(brief.id, st)}
                          className={`text-[9.5px] font-mono px-2 py-0.5 rounded transition border ${
                            (brief.status || 'Draft') === st
                              ? 'border-gold-500 bg-gold-950/20 text-gold-400 font-bold'
                              : 'border-zinc-900 bg-zinc-900/40 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Side controls & mock trigger */}
                <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-2 md:pl-4 md:border-l border-zinc-900">
                  <button
                    onClick={() => handleCopySpec(brief)}
                    className="flex-1 w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-850/30 hover:border-zinc-800 text-white text-[11px] font-mono py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    {copiedBriefId === brief.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
                    {copiedBriefId === brief.id ? 'Copied Specs' : 'Copy Spec Raw'}
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(brief)}
                    className="flex-1 w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-850/50 hover:border-zinc-800 text-gold-400 text-[11px] font-mono py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                    title="Download certified PDF layout specification sheet"
                  >
                    <Download className="w-3 h-3 text-gold-400" />
                    <span>Download Project PDF</span>
                  </button>

                  <a
                    href={getWhatsAppBriefLink(brief)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 w-full bg-emerald-950/20 border border-emerald-900/45 hover:border-emerald-800/80 text-emerald-300 text-[11px] font-mono py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <Send className="w-3 h-3 shrink-0 text-emerald-400" />
                    <span>Push via WhatsApp</span>
                  </a>

                  <button
                    onClick={() => handleDelete(brief.id)}
                    className="w-full md:w-auto p-2 text-zinc-700 hover:text-rose-500 hover:bg-rose-950/15 rounded-lg transition text-xs font-semibold flex items-center justify-center gap-1 mt-1 font-mono"
                    title="Remove this draft brief"
                  >
                    <Trash2 className="w-3 h-3" /> Remove Record
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
