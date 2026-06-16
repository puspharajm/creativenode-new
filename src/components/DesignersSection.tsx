import React, { useState } from 'react';
import { 
  Award, Globe, Mail, Instagram, ArrowRight, ShieldCheck, Star, Sparkles, 
  UserCheck, Heart, MessageSquare, Info
} from 'lucide-react';

interface DesignerProfile {
  id: string;
  name: string;
  title: string;
  type: 'agency' | 'individual';
  location: string;
  avatarUrl: string;
  focusStyle: string;
  presetMatchId: string; // ID of template in the Portfolio to showcase
  rating: number;
  featuredPresetName: string;
  bio: string;
  stats: {
    projects: number;
    experience: string;
  };
  socials: {
    instagram?: string;
    globe?: string;
    email?: string;
  };
}

const DESIGNER_PROFILES: DesignerProfile[] = [
  {
    id: 'des-studio-zurich',
    name: 'Atelier Zürich Kraft',
    title: 'Elite Swiss Modernist Agency',
    type: 'agency',
    location: 'Zürich, Switzerland',
    avatarUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=120&q=80',
    focusStyle: 'Swiss Grid System & Typographic Structuralism',
    presetMatchId: 'swiss-editorial-luxury',
    rating: 4.9,
    featuredPresetName: 'CHRONOS SWISS FLYER',
    bio: 'Dedicated to the pure traditions of clean sans-serif typography, grid-authoritative layout mathematics, and meticulous editorial tracking.',
    stats: { projects: 450, experience: '7 Years' },
    socials: { globe: 'https://atelier-zurich.ch', email: 'hello@atelier-zurich.ch' }
  },
  {
    id: 'des-tokyo-syn',
    name: 'NeoTokyo Syndicate',
    title: 'Hyper-Futurist Cyber Brand Studio',
    type: 'agency',
    location: 'Shibuya, Tokyo',
    avatarUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=120&q=80',
    focusStyle: 'Cyberpunk Kinetics & Brutalist Overlay Vectors',
    presetMatchId: 'kinetic-authority',
    rating: 5.0,
    featuredPresetName: 'KINETIC FITNESS CHAMPION',
    bio: 'Blending high-octane street layouts with stark typography overlays. Architects behind major global cyber-gaming and athletic apparel campaigns.',
    stats: { projects: 310, experience: '4 Years' },
    socials: { globe: 'https://neotokyo-syndicate.jp', instagram: '@neotokyo.syn' }
  },
  {
    id: 'des-amara',
    name: 'Amara Okafor',
    title: 'Luxury Editorial Typographer',
    type: 'individual',
    location: 'Lagos, Nigeria',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80',
    focusStyle: 'High-end Minimalist Serif Branding',
    presetMatchId: 'luxury-solitaire-watch',
    rating: 4.8,
    featuredPresetName: 'AURUM CHRONOGRAPH SPEC',
    bio: 'Sculpting high-prestige campaigns for independent watchmakers and premium perfume houses across West Africa and Europe.',
    stats: { projects: 125, experience: '5 Years' },
    socials: { instagram: '@amara.types', email: 'amara@creativenode.in' }
  },
  {
    id: 'des-marcello',
    name: 'Marcello Rossi',
    title: 'Nouveau Noir Art Director',
    type: 'individual',
    location: 'Milan, Italy',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    focusStyle: 'Deep Noir Contrast & Scrim Texture Master',
    presetMatchId: 'nouveau-noir-exhibit',
    rating: 4.9,
    featuredPresetName: 'EXHIBIT NOIR VERLET',
    bio: 'Meticulously balancing absolute backplate darkness with fine line grid borders and golden ratios. Specialize in fashion flyer launches.',
    stats: { projects: 180, experience: '6 Years' },
    socials: { instagram: '@marcello.rossi', globe: 'https://rossi-noir.it' }
  }
];

export default function DesignersSection({ onViewPreset }: { onViewPreset: (presetId: string) => void }) {
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'agency' | 'individual'>('all');
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});

  const handleLike = (designerId: string) => {
    setLikesCount(prev => ({
      ...prev,
      [designerId]: (prev[designerId] || 0) + 1
    }));
  };

  const filteredProfiles = activeTypeFilter === 'all' 
    ? DESIGNER_PROFILES 
    : DESIGNER_PROFILES.filter(p => p.type === activeTypeFilter);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 md:px-8 space-y-8 animate-fade-in">
      {/* Page Heading */}
      <div className="border-b border-zinc-900 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs text-gold-400 uppercase tracking-widest block mb-1">Global Creative Network</span>
          <h1 className="font-display text-2xl md:text-4xl font-bold text-white tracking-tight">
            CreativeNode <span className="font-editorial italic font-normal text-gold-400">Designers & Partners</span>
          </h1>
          <p className="text-zinc-500 text-xs font-sans mt-1">
            Explore premium profiles of boutique design agencies, curated modernist partners, and individual typographic masters.
          </p>
        </div>
        
        {/* Verification stamp */}
        <div className="flex items-center gap-1.5 self-start md:self-center bg-zinc-900/60 border border-zinc-850 px-3.5 py-1.5 rounded-lg text-zinc-400">
          <UserCheck className="w-3.5 h-3.5 text-gold-400" />
          <span className="font-mono text-[9px] uppercase tracking-wider">Verified Studio Retainers</span>
        </div>
      </div>

      {/* Directory Filter controls */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex bg-zinc-900/40 p-1 rounded-lg border border-zinc-900 self-start">
            {[
              { id: 'all', label: 'All Creatives' },
              { id: 'agency', label: 'Agencies & Studios' },
              { id: 'individual', label: 'Sovereign Artists' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTypeFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded text-[10px] font-mono tracking-wider uppercase transition cursor-pointer select-none ${
                  activeTypeFilter === tab.id 
                    ? 'bg-gold-500 text-black font-semibold' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest hidden sm:inline">
            Showing {filteredProfiles.length} Registered Design partners
          </span>
        </div>
      </div>

      {/* Grid of Partner & Artist Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredProfiles.map((designer) => (
          <div 
            key={designer.id} 
            className="bg-zinc-950 border border-zinc-900 hover:border-gold-500/25 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start gap-6 transition duration-300 hover:shadow-xl shadow-gold-500/[0.02]"
          >
            {/* Left side: Avatar Profile Portrait */}
            <div className="relative shrink-0 select-none">
              <img 
                src={designer.avatarUrl} 
                alt={designer.name} 
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border border-zinc-850"
                referrerPolicy="no-referrer"
              />
              <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[7.5px] font-mono uppercase tracking-wider font-extrabold shadow border ${
                designer.type === 'agency' 
                  ? 'bg-zinc-900 text-[#D4AF37] border-[#D4AF37]/30' 
                  : 'bg-[#D4AF37] text-black border-transparent'
              }`}>
                {designer.type}
              </span>
            </div>

            {/* Right side: Biography and Metrics */}
            <div className="space-y-4 flex-grow">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg md:text-xl font-bold text-white tracking-widest">
                    {designer.name}
                  </h3>
                  
                  {/* Rating / Likes counter */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLike(designer.id)}
                      className="flex items-center gap-1 text-[9.5px] font-mono text-zinc-500 hover:text-red-400 group cursor-pointer transition select-none bg-zinc-900 px-2 py-0.5 rounded border border-zinc-850 hover:border-red-500/10"
                    >
                      <Heart className={`w-3 h-3 group-hover:scale-115 transition ${likesCount[designer.id] ? 'fill-red-500 text-red-500' : 'text-zinc-500'}`} />
                      <span>{18 + (likesCount[designer.id] || 0)}</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[10px] font-mono text-zinc-500">
                  <span className="text-zinc-400 font-bold uppercase">{designer.title}</span>
                  <span className="hidden sm:inline text-zinc-700">•</span>
                  <span>{designer.location}</span>
                </div>
              </div>

              <p className="text-zinc-400 text-xs font-light leading-relaxed font-sans">
                {designer.bio}
              </p>

              {/* Showcase & Specialties */}
              <div className="grid grid-cols-2 gap-4 bg-zinc-900/35 border border-zinc-900/60 rounded-xl p-3.5 font-mono text-[9px] leading-relaxed">
                <div>
                  <span className="text-zinc-550 block text-[8px] uppercase text-zinc-500 tracking-wider">Expertise Focal</span>
                  <span className="text-zinc-300 font-bold font-sans">{designer.focusStyle}</span>
                </div>
                <div>
                  <span className="text-zinc-550 block text-[8px] uppercase text-zinc-500 tracking-wider">Featured Preset Specs</span>
                  <span className="text-zinc-300 font-bold font-sans">{designer.featuredPresetName}</span>
                </div>
              </div>

              {/* External Social Profiles & Action */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-900 font-mono text-[9.5px]">
                <div className="flex items-center gap-3 text-zinc-500">
                  {designer.socials.globe && (
                    <a href={designer.socials.globe} target="_blank" rel="noreferrer" className="hover:text-gold-400 transition flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Webpage</span>
                    </a>
                  )}
                  {designer.socials.instagram && (
                    <a href="#" className="hover:text-gold-400 transition flex items-center gap-1 select-none">
                      <Instagram className="w-3.5 h-3.5" />
                      <span>{designer.socials.instagram}</span>
                    </a>
                  )}
                  {designer.socials.email && (
                    <a href={`mailto:${designer.socials.email}`} className="hover:text-gold-405 hover:text-[#D4AF37] transition flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Inquire</span>
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onViewPreset(designer.presetMatchId)}
                  className="bg-zinc-900 hover:bg-[#D4AF37]/10 text-[#D4AF37] hover:text-white border border-[#D4AF37]/30 hover:border-[#D4AF37]/50 active:scale-95 px-3 py-1.5 rounded-lg transition duration-200 uppercase tracking-widest font-extrabold flex items-center gap-1"
                >
                  <span>Verify Preset</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Guild tenet description banner */}
      <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-4 flex items-start gap-4">
        <Award className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
        <div className="space-y-1 font-sans">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">CreativeNode Sovereign Guild Charter</h4>
          <p className="text-[10.5px] text-zinc-400 leading-relaxed font-light">
            All listed agencies and independent typographers adhere stringently to the CreativeNode SLA design guidelines. Member profiles are dynamically verified on-chain to ensure pristine layout fidelity, high contrast ratios, and prompt vector delivery for all premium retainer accounts.
          </p>
        </div>
      </div>

    </div>
  );
}
