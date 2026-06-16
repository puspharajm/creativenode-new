import { PosterTemplate, ServiceItem, PricingTier } from './types';

export const SERVICE_ITEMS: ServiceItem[] = [
  {
    id: '01',
    index: '01',
    title: 'Social Media Posters',
    subtitle: 'Scroll-Stopping Assets',
    description: 'Engineered to break through standard digital noise. Custom layout grids, dynamic typography hierarchies, and premium graphic overlays crafted strictly for high-end conversion and brand authority.',
    deliverables: ['Custom Grid Designs', 'Optimal Aspect Ratios', 'RGB Color Profile', 'High-Res PNG/JPG exports'],
    duration: '24-48 Hours'
  },
  {
    id: '02',
    index: '02',
    title: 'Business Promotions',
    subtitle: 'Strategic Pitch-Decks & Flyers',
    description: 'Establish ultimate prestige and corporate dominance. Sleek product mockups, striking color harmonies, and editorial typesetting for invitations, corporate events, and service launches.',
    deliverables: ['Print-Ready (300 DPI CMYK)', 'Layered Source Files (.PSD/.AI)', 'Exclusive Font Licensing Options', 'Multiple Revision Rounds'],
    duration: '2-3 Working Days'
  },
  {
    id: '03',
    index: '03',
    title: 'Festival & Offer Designs',
    subtitle: 'Seasonal Sales Masterpieces',
    description: 'Limited-edition visual compositions optimized for peak festival seasons and luxury sales. Capture traditional elements and balance them with high-end modern layout principles.',
    deliverables: ['Story (9:16) & Feed (1:1) Formats', 'Custom Hand-Drawn / Metallic Vector Elements', 'Animated Variations (Optional Add-on)', 'Urgency-Focused Copy Placement'],
    duration: '24 Hours Rush Available'
  },
  {
    id: '04',
    index: '04',
    title: 'Premium Brand Creatives',
    subtitle: 'Signature Brand Authority',
    description: 'For brands seeking bespoke, artistic masterpieces. Complete design authority that pairs deep noir backgrounds, gold leaf imagery, and Swiss avant-garde typography for unmatched presentation.',
    deliverables: ['Vanguard Typography Design', 'Custom-sought stock licensing', 'High-end vector brand mark', 'All formats + premium packaging files'],
    duration: '4-6 Working Days'
  }
];

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic Edition',
    price: 150,
    deliveryDays: '48 Hour Delivery',
    revisionLimit: '2 Standard Revisions',
    features: [
      '1 Custom High-Res Flyer (RGB)',
      'Modern Editorial Typography Alignment',
      'Standard Social Feed Ratio (1:1 / 4:5)',
      'Signature Black/White or Accent color choice',
      'Web-Optimized PNG Output'
    ],
    isPremium: false,
    isPopular: false
  },
  {
    id: 'standard',
    name: 'Standard Atelier',
    price: 200,
    deliveryDays: '24 Hour Priority Delivery',
    revisionLimit: '5 Deep Revisions',
    features: [
      '1 Premium Creative Poster Design',
      'Cross-Platform Aspect Ratios (Feed + Stories)',
      'Curated Stock Asset Integration',
      'Advanced Geometric Overlay Accents (Grid/Border)',
      'Fully Print-Ready File Format (CMYK PDF)',
      'Full Source File Deliverable (.PSD / .AI)'
    ],
    isPremium: false,
    isPopular: true
  },
  {
    id: 'professional',
    name: 'Professional Masterpiece',
    price: 499,
    deliveryDays: '12-24 Hour Rush Option Included',
    revisionLimit: 'Unlimited Craft Refinements',
    features: [
      'Bespoke Avant-Garde Handcrafted Concept',
      'Bespoke Typography & Gold Foil Leaf Styling',
      'Full Suite Formats: (Feed, Stories, Poster Print, Banner)',
      '1-on-1 Creative Director Consult (via WhatsApp)',
      'Full Copyright & Commercial Exploitation Rights',
      'VIP Design Priority & Retainer On-boarding'
    ],
    isPremium: true,
    isPopular: false
  }
];

export const PORTFOLIO_PRESETS: PosterTemplate[] = [
  {
    id: 'kinetic-authority',
    title: 'KINETIC AUTHORITY',
    subtitle: 'JP FITNESS STUDIO',
    details: 'HIGH PERFORMANCE TRAINING • CYBERPUNK EDITION • BREAK YOUR MOULD',
    theme: 'Cyberpunk Noir',
    bgType: 'image',
    bgValue: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600',
    accentColor: '#ef4444',
    textColor: '#ffffff',
    fontTitle: 'Space Grotesk',
    fontSubtitle: 'Space Grotesk',
    category: 'fitness',
    align: 'left',
    geometricElement: 'lines',
    badge: 'KINETIC V.2',
    keywords: ['Brutalist', 'Typography', 'Bold', 'Cyberpunk', 'Fitness'],
    dateCreated: '2026-05-10'
  },
  {
    id: 'autumn-awareness',
    title: 'AWARENESS',
    subtitle: 'THE AUTUMN EDIT',
    details: 'THE MINIMALIST COUTURE SHOW • OCTOBER EXCLUSIVE • MILAN ATELIER',
    theme: 'Editorial Cream',
    bgType: 'image',
    bgValue: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600',
    accentColor: '#c5a059',
    textColor: '#18181b',
    fontTitle: 'Playfair Display',
    fontSubtitle: 'Inter',
    category: 'fashion',
    align: 'center',
    geometricElement: 'border',
    badge: 'AUTUMN EDIT',
    keywords: ['Swiss', 'Editorial', 'Minimalist', 'Typography', 'Fashion'],
    dateCreated: '2026-05-15'
  },
  {
    id: 'the-golden-ratio',
    title: 'THE GOLDEN RATIO',
    subtitle: 'CREATIVENODE SIGNATURE',
    details: 'EXPLORING THE MATHEMATICAL PERFECTION • PRIVATE MASTERS LIST',
    theme: 'Luxury Charcoal Gold',
    bgType: 'image',
    bgValue: 'https://images.unsplash.com/photo-1627163430004-c763f6732695?q=80&w=600',
    accentColor: '#eca115',
    textColor: '#ffffff',
    fontTitle: 'Playfair Display',
    fontSubtitle: 'JetBrains Mono',
    category: 'minimalist',
    align: 'right',
    geometricElement: 'circle',
    badge: 'SIGNATURE 01',
    keywords: ['Swiss', 'Luxury', 'Classic', 'Minimalist', 'Typography', 'Signature'],
    dateCreated: '2026-05-20'
  },
  {
    id: 'ramadan-spiritual',
    title: 'NOUR AL-BAYAN',
    subtitle: 'RAMADAN KAREEM',
    details: 'SPIRITUAL ARCHITECTURE • CELEBRATING FAITH & MINIMAL GEOMETRY',
    theme: 'Emerald Gold Arch',
    bgType: 'image',
    bgValue: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=600',
    accentColor: '#e0b355',
    textColor: '#ffffff',
    fontTitle: 'Playfair Display',
    fontSubtitle: 'Space Grotesk',
    category: 'offers',
    align: 'center',
    geometricElement: 'border',
    badge: 'MUBARAK',
    keywords: ['Traditional', 'Spiritual', 'Minimalist', 'Gold', 'Creative'],
    dateCreated: '2026-05-25'
  },
  {
    id: 'absolute-sculpt',
    title: 'ABSOLUTE SCULPT',
    subtitle: 'CHROME ATHLETICS',
    details: 'REDEFINE PHYSICAL STRUCTURE • METALLIC TEXTURE • EST. 2026',
    theme: 'Steel Monochrome',
    bgType: 'image',
    bgValue: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600',
    accentColor: '#e5e7eb',
    textColor: '#ffffff',
    fontTitle: 'Space Grotesk',
    fontSubtitle: 'JetBrains Mono',
    category: 'fitness',
    align: 'left',
    geometricElement: 'grid',
    badge: 'CHROME09',
    keywords: ['Brutalist', 'Metallic', 'Minimalist', 'Fitness'],
    dateCreated: '2026-06-01'
  },
  {
    id: 'silent-tokyo',
    title: 'SILENT IN TOKYO',
    subtitle: 'EXHIBIT BY NAKAMURA',
    details: 'NEON SHADOWS • CONTEMPORARY TOKYO GRAPHIC DESIGN',
    theme: 'Tokyo Midnight Cyber',
    bgType: 'image',
    bgValue: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=600',
    accentColor: '#ec4899',
    textColor: '#fdf2f8',
    fontTitle: 'JetBrains Mono',
    fontSubtitle: 'JetBrains Mono',
    category: 'minimalist',
    align: 'right',
    geometricElement: 'lines',
    badge: 'TOKYO 26',
    keywords: ['Swiss', 'Midnight', 'Cyberpunk', 'Typography', 'Brutalist'],
    dateCreated: '2026-06-05'
  }
];
