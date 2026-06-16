import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { 
  CheckCircle, ChevronRight, Layout, Monitor, Smartphone, PenTool, 
  Share2, Award, Zap, Clock, Star, Instagram, Globe, Mail, Phone,
  ChevronDown, X, Menu, ArrowLeft, Download, ShieldAlert, BadgeInfo,
  Grid, FileText, CheckSquare, Square, Check, Briefcase, RefreshCw, Layers, Sparkles, Search, Printer, QrCode
} from 'lucide-react';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';

interface CreativenodePortfolioProps {
  onBack?: () => void;
  triggerToast?: (msg: string, type: 'success' | 'info' | 'alert') => void;
}

const FadeIn = ({ children, delay = 0, direction = 'up', className = '' }: { children: React.ReactNode; delay?: number; direction?: string; className?: string; key?: React.Key }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  const getTransform = () => {
    if (isVisible) return 'translate-x-0 translate-y-0 scale-100';
    switch (direction) {
      case 'up': return 'translate-y-12 scale-95';
      case 'down': return '-translate-y-12 scale-95';
      case 'left': return 'translate-x-12 scale-95';
      case 'right': return '-translate-x-12 scale-95';
      default: return 'translate-y-12 scale-95';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${getTransform()} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  year: string;
  client: string;
  colors: string[];
  colorNames: string[];
  specs: {
    typeface: string;
    proportion: string;
    substrate: string;
    inkType: string;
    contrastRatio: string;
  };
  desc: string;
  popularity: number;
  createdDate: string;
}

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'nalam-diabetes-complications',
    title: "Diabetes Complications Prevention Campaign",
    category: "Health & Fitness Banner",
    year: "2026",
    client: "Nalam Wellness",
    colors: ['#0E6251', '#ECA115', '#121214'],
    colorNames: ['Wellness Emerald', 'Turmeric Orange', 'Deep Obsidian'],
    specs: {
      typeface: 'Montserrat & Inter',
      proportion: '4:5 Spec Layout',
      substrate: 'Somerset Velvet 255gsm',
      inkType: 'Soy-Based Bio-Inks',
      contrastRatio: '16.8:1 Elite Contrast'
    },
    desc: "A bold wellness campaign centering on diabetes complications prevention, emphasizing proactive checks, lifestyle pacing, and high-density text grids.",
    popularity: 92,
    createdDate: "2026-05-18"
  },
  {
    id: 'nalam-vibrant-care',
    title: "Vibrant Energy Lifestyle Poster",
    category: "Wellness Campaign",
    year: "2026",
    client: "Nalam Wellness",
    colors: ['#0E6251', '#DFB76C', '#FFFFFF'],
    colorNames: ['Wellness Green', 'Warm Honey', 'Pristine White'],
    specs: {
      typeface: 'Inter & Montserrat',
      proportion: '4:5 Portrait Grid',
      substrate: 'Canson Edition Etching',
      inkType: 'Premium Pigment dispersion',
      contrastRatio: '14.5:1 High Contrast'
    },
    desc: "'I feel more energetic now' — A corporate testimonial layout with dynamic fitness benchmarks, highlighting user health transformations.",
    popularity: 85,
    createdDate: "2026-05-20"
  },
  {
    id: 'nalam-control-diabetes',
    title: "Control Diabetes - Transform Life",
    category: "Coaching Backdrop",
    year: "2026",
    client: "Nalam Health & Wellness",
    colors: ['#042E27', '#E5BA43', '#004D40'],
    colorNames: ['Abyssal Forest', 'Solar Golden Ochre', 'Vibrant Teal'],
    specs: {
      typeface: 'Outfit & Space Grotesk',
      proportion: '1:1 Square Standard',
      substrate: 'Hahnemühle Photo Rag',
      inkType: 'UltraChrome PRO12 Pigment',
      contrastRatio: '15.2:1 Rich Harmony'
    },
    desc: "An organic design showcasing a gold lotus emblem overlaid on deep green templates, summarizing full-suit life coaching programs.",
    popularity: 88,
    createdDate: "2026-05-25"
  },
  {
    id: 'smr-control-panel-plate',
    title: "Industrial Control Panel Plate Screen",
    category: "Industrial Print Spec",
    year: "2026",
    client: "SMR Groups & Partners",
    colors: ['#F9D015', '#0A0A0A', '#FFFFFF'],
    colorNames: ['High-Vis Yellow', 'Absolute Charcoal', 'Signal White'],
    specs: {
      typeface: 'JetBrains Mono & Fira Code',
      proportion: '1:1.414 (A2 Heavy)',
      substrate: 'Metallic Chrome Synthetic Film',
      inkType: 'UV-Cured Solid Resin',
      contrastRatio: '21.0:1 Absolute Scale'
    },
    desc: "High-contrast commercial screen printing blueprint sheet detailing button dials, switch overlays, and industrial fascias.",
    popularity: 90,
    createdDate: "2026-04-10"
  },
  {
    id: 'smr-foam-board-sign',
    title: "Premium Foam Board Signage Spec",
    category: "Indoor Branding",
    year: "2026",
    client: "SMR Groups & Partners",
    colors: ['#023E8A', '#03045E', '#FFFFFF'],
    colorNames: ['SMR Royal Blue', 'Abyssal Corporate', 'Pristine Board'],
    specs: {
      typeface: 'Space Grotesk & Inter',
      proportion: 'A1 Architect Master',
      substrate: 'Heavy Foamboard 5mm',
      inkType: 'Asphaltum Metallic Infused Acrylic',
      contrastRatio: '18.2:1 Solid Contrast'
    },
    desc: "High-fidelity interior foamboard signage specification with robust geometric grid alignments and rich blue layouts.",
    popularity: 76,
    createdDate: "2026-04-12"
  },
  {
    id: 'smr-hand-screen-print',
    title: "Traditional Screen Printing Master",
    category: "Textile Print Poster",
    year: "2026",
    client: "SMR Screen & Textile",
    colors: ['#D62828', '#003049', '#FDF0D5'],
    colorNames: ['Madras Red', 'Oceanic Navy', 'Warm Cream Silk'],
    specs: {
      typeface: 'Impact & Space Grotesk',
      proportion: 'A3 Poster Specification',
      substrate: 'Somerset Velvet 255gsm',
      inkType: 'Deep-Saturation Water Acrylic',
      contrastRatio: '19.1:1 Heritage Value'
    },
    desc: "Bespoke screen frame blueprint celebrating handmade textile screencasts and screen tension equations with modern scale.",
    popularity: 81,
    createdDate: "2026-04-15"
  },
  {
    id: 'suji-xerox-commercial',
    title: "Tamil High-Speed Xerox Flyer",
    category: "Commercial Collateral",
    year: "2026",
    client: "Suji Cards & Xerox",
    colors: ['#1A237E', '#FFEB3B', '#D50000'],
    colorNames: ['Commercial Cobalt', 'Suji Vivid Yellow', 'Signal Flare Red'],
    specs: {
      typeface: 'Cabinet Grotesk & Times',
      proportion: '1:√2 Golden Swiss Metric',
      substrate: 'Keaykolour Basalt 300gsm',
      inkType: 'Solid Base Carbon Dispersion',
      contrastRatio: '20.5:1 Ultra Clarity'
    },
    desc: "Bold commercial promotional flyer written in high-impact Tamil typography, highlighting speed photocopies and budget bulk rates.",
    popularity: 94,
    createdDate: "2026-03-01"
  },
  {
    id: 'suji-wedding-burgundy',
    title: "Royal Burgundy Wedding Invitations",
    category: "Premium Stationery",
    year: "2026",
    client: "Suji Cards Atelier",
    colors: ['#5C061E', '#DFB76C', '#FFFFFF'],
    colorNames: ['Imperial Burgundy', 'Atelier Soft Gold', 'Pure Alabaster'],
    specs: {
      typeface: 'Playfair Display & Inter',
      proportion: 'Wedding Square 1:1',
      substrate: 'Mulberry Handmade Wove',
      inkType: 'Gold Metallic Foil Infill',
      contrastRatio: '16.5:1 Royal Harmony'
    },
    desc: "Intricately detailed hot foil gold-embossed layout featuring burgundy backing and rose flourishes for premium social invitations.",
    popularity: 95,
    createdDate: "2026-03-05"
  },
  {
    id: 'suji-wedding-temple',
    title: "Traditional Temple Invitation Spec",
    category: "Cultural Stationery",
    year: "2026",
    client: "Suji Cards Traditional",
    colors: ['#800020', '#FFD700', '#FFFFFF'],
    colorNames: ['Bordeaux Red', 'Deccan Temple Gold', 'Pure Light'],
    specs: {
      typeface: 'Cinzel Decorative & Montserrat',
      proportion: 'A4 Portrait Heritage',
      substrate: 'Textured handmade board',
      inkType: 'Heavy Gold Leaf Hot-Press',
      contrastRatio: '17.2:1 Divine Palette'
    },
    desc: "Indian cultural wedding card blueprint featuring golden temple towers, brass bell silhouettes, and divine traditional borders.",
    popularity: 89,
    createdDate: "2026-03-08"
  },
  {
    id: 'tamizh-spice-gourmet-menu',
    title: "Christmas & New Year Gourmet Menu",
    category: "Restaurant Collateral",
    year: "2026",
    client: "Tamizh Spice Gourmet",
    colors: ['#6D4C41', '#FFB300', '#F5F5F0'],
    colorNames: ['Roasted Cocoa', 'Warm Honey Gold', 'Rich Crema'],
    specs: {
      typeface: 'Outfit Medium & Courier',
      proportion: 'A4 Specialty Tall Spec',
      substrate: 'Canson Artist Canvas',
      inkType: 'Soy-Based Organic Pigments',
      contrastRatio: '13.8:1 Gastronomic Warm'
    },
    desc: "Luxury multi-course menu blueprint detailed with golden Arabesque borders, featuring festive foods like Rabbit Fry and Kaadai Roast.",
    popularity: 82,
    createdDate: "2025-12-15"
  },
  {
    id: 'hotel-tamizh-park-christmas',
    title: "Merry Christmas Holiday Greeting",
    category: "Hospitality Media",
    year: "2026",
    client: "Hotel Tamizh Park",
    colors: ['#0A3622', '#D4AF37', '#FFFFFF'],
    colorNames: ['Pine Green Decor', 'Champagne Gold', 'Silent Snow'],
    specs: {
      typeface: 'Playfair Display & Inter',
      proportion: 'A4 Holiday Vignette',
      substrate: 'Somerset Velvet 255gsm',
      inkType: 'Archival Deep Giclée Core',
      contrastRatio: '15.9:1 Festive Spark'
    },
    desc: "A rich hospitality banner template framing dense winter foliage, holiday wreath elements, and elegant copper gold scripts.",
    popularity: 84,
    createdDate: "2025-12-18"
  },
  {
    id: 'hotel-tamizh-park-pongal',
    title: "Authentic Harvest Pongal Wishes",
    category: "Hospitality Media",
    year: "2026",
    client: "Hotel Tamizh Park",
    colors: ['#4A121A', '#EC9A29', '#FAF6F0'],
    colorNames: ['Deep Terracotta', 'Sunbaked Saffron', 'Warm Rice Flour'],
    specs: {
      typeface: 'Inter & Space Grotesk',
      proportion: '1:1 Square Social',
      substrate: 'Mulberry Textured board',
      inkType: 'Soy-Based Bio-Inks',
      contrastRatio: '14.8:1 Vernal Sun'
    },
    desc: "Harvest festival greeting card illustrating clay pots overflowing with sweet pongal, surrounded by sugarcane and sunbeams.",
    popularity: 87,
    createdDate: "2026-01-10"
  },
  {
    id: 'ksp-ramadan-mubarak',
    title: "Ramadan Mubarak Silk Catalog",
    category: "Traditional Fashion",
    year: "2026",
    client: "KSP Pattu Maaligal",
    colors: ['#1B4332', '#D4AF37', '#FFF3CD'],
    colorNames: ['Smaragdine Green', 'Royal Gold Accent', 'Crescent Glow Light'],
    specs: {
      typeface: 'Playfair Display & Times',
      proportion: 'A1 Grand Silk Canvas',
      substrate: 'Hahnemühle Satin Cotton',
      inkType: 'Rich Carbon Solid Pigments',
      contrastRatio: '18.9:1 Islamic Elegance'
    },
    desc: "Ramadan Mubarak festive launch catalog showing crescent moons, hanging lanterns, and premium silk sarees for seasonal fashion.",
    popularity: 93,
    createdDate: "2026-02-15"
  },
  {
    id: 'ksp-tamil-newyear-pattu',
    title: "Mangala Tamil New Year Banner",
    category: "Traditional Fashion",
    year: "2026",
    client: "KSP Pattu Maligai",
    colors: ['#0F2A4A', '#DFB76C', '#FFFFFF'],
    colorNames: ['Mangala Royal Indigo', 'KSP Handloom Gold', 'Sovereign Light'],
    specs: {
      typeface: 'Cinzel Decorative & Inter',
      proportion: 'A1 Exhibition Layout',
      substrate: 'Somerset Watercolor board',
      inkType: 'Gold Foil Screen Press Overlay',
      contrastRatio: '16.9:1 Vernal Splendor'
    },
    desc: "A rich family-focused Tamil New Year banner illustrating temple backgrounds, gold brass lamps, and marigold strings.",
    popularity: 91,
    createdDate: "2026-04-05"
  },
  {
    id: 'hotel-tamizh-park-newyear-2025',
    title: "Happy New Year Golden Star Balloon",
    category: "Corporate Greeting",
    year: "2026",
    client: "Hotel Tamizh Park",
    colors: ['#062315', '#DFB76C', '#FFFFFF'],
    colorNames: ['Deep Forest Spruce', 'Star Balloon Gold', 'Sleet White'],
    specs: {
      typeface: 'Inter & Montserrat',
      proportion: 'A2 Custom Blueprint',
      substrate: 'Canson Graphic Canvas',
      inkType: 'UV-Cured Solid Resin',
      contrastRatio: '19.5:1 Midnight Stars'
    },
    desc: "A magnificent corporate holiday countdown greeting card featuring golden 3D metallic balloons and floating snowflakes.",
    popularity: 80,
    createdDate: "2025-12-30"
  },
  {
    id: 'hotel-tamizh-park-republic-day',
    title: "Tri-Color Republic Day Memorial",
    category: "Sovereign Respect Board",
    year: "2026",
    client: "Hotel Tamizh Park",
    colors: ['#E76F51', '#2A9D8F', '#264653'],
    colorNames: ['Saffron Flag', 'Deep India Green', 'Ashoka Chakra Navy'],
    specs: {
      typeface: 'Outfit Bold & Inter',
      proportion: 'A4 Patriotic Tribute',
      substrate: 'Hahnemühle Photo Rag',
      inkType: 'High-Stability Indigo dispersion',
      contrastRatio: '16.2:1 Indian Tri-color'
    },
    desc: "A minimalist, state-level tribute greeting blending Taj Mahal and India Gate silhouettes with clean geometric layout.",
    popularity: 75,
    createdDate: "2026-01-20"
  },
  {
    id: 'hotel-tamizh-park-residences-screens',
    title: "Luxury Hotel Residences Layouts",
    category: "Mobile Design Showcase",
    year: "2026",
    client: "Hotel Tamizh Park",
    colors: ['#101014', '#DFB76C', '#FFFFFF'],
    colorNames: ['Luxe Onyx shadow', 'Residential Soft Gold', 'Pristine Foam'],
    specs: {
      typeface: 'Space Grotesk & Fira Code',
      proportion: 'A1 Luxury Multi-screen',
      substrate: 'Somerset Velvet Watercolor',
      inkType: 'Solid Carbon dispersion',
      contrastRatio: '17.8:1 Premium Dark'
    },
    desc: "Premium real-estate branding sheet displaying three mockups with suite bedrooms, layout diagrams, and tariff columns.",
    popularity: 79,
    createdDate: "2026-02-05"
  },
  {
    id: 'hotel-tamizh-park-exclusive-room',
    title: "Exclusive Room Booking Poster",
    category: "Specialized Promotion",
    year: "2026",
    client: "Hotel Tamizh Park",
    colors: ['#3A0E0A', '#DFB76C', '#FFFFFF'],
    colorNames: ['Prestige Maroon', 'Atelier Soft Gold', 'Absolute Alabaster'],
    specs: {
      typeface: 'Cabinet Grotesk & Inter',
      proportion: 'A2 Commercial Standard',
      substrate: 'Hahnemühle Photo Rag',
      inkType: 'Hybrid Polycarbonate Lacquer',
      contrastRatio: '15.6:1 Royal Maroon'
    },
    desc: "A marble textured marketing collateral displaying room images framed in dual gold borders with crisp Booking callouts.",
    popularity: 83,
    createdDate: "2026-02-10"
  },
  {
    id: 'hotel-tamizh-park-rates-tariff',
    title: "Affordable Luxury Tariff Structure",
    category: "Pricing Brochure",
    year: "2026",
    client: "Hotel Tamizh Park",
    colors: ['#4A0E17', '#DFB76C', '#FFFFFF'],
    colorNames: ['Burgundy Leather', 'Atelier Pearl Gold', 'Crisp Cotton'],
    specs: {
      typeface: 'Playfair Display & Times',
      proportion: 'A4 Portrait Tariff',
      substrate: 'Heavy Card Gloss 280gsm',
      inkType: 'Solid Carbon dispersion',
      contrastRatio: '16.4:1 Commercial Dark'
    },
    desc: "A beautiful tariff specification card highlighting key details like 24-hr back up, conference halls, and direct client hotline numbers.",
    popularity: 86,
    createdDate: "2026-02-12"
  }
];

export const drawPDFPageContent = (doc: jsPDF, item: PortfolioItem): void => {
  // Page borders
  doc.setDrawColor(212, 175, 55); // #D4AF37 Gold
  doc.setLineWidth(0.8);
  doc.rect(8, 8, 194, 281); // External border
  
  doc.setDrawColor(32, 32, 32);
  doc.setLineWidth(0.25);
  doc.rect(10, 10, 190, 277); // Internal border

  // Header Banner Background
  doc.setFillColor(15, 15, 15);
  doc.rect(10, 10, 190, 24, 'F');
  
  // Header text
  doc.setTextColor(212, 175, 55);
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('CREATIVENODE • DESIGN ATELIER', 20, 19);

  doc.setTextColor(160, 160, 160);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('AUTHENTIC PLATFORM DESIGN BLUEPRINT • SPECIFICATION SHEET', 20, 25);

  // Decorative element in header
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(155, 19, 185, 19);
  doc.setFont('courier', 'bold');
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(7);
  doc.text('CLASS: SPEC-A', 156, 17);

  // Project Title
  doc.setTextColor(20, 20, 20);
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.text(item.title.toUpperCase(), 20, 48);

  // Sub-heading line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(20, 52, 190, 52);

  // Category & Year Metadata
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CATEGORY:', 20, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(item.category, 50, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT:', 20, 68);
  doc.setFont('helvetica', 'normal');
  doc.text(item.client, 50, 68);

  doc.setFont('helvetica', 'bold');
  doc.text('CAMPAIGN YEAR:', 20, 74);
  doc.setFont('helvetica', 'normal');
  doc.text(`${item.year} (Active Standard)`, 50, 74);

  // Left Divider
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(0.1);
  doc.line(20, 82, 190, 82);

  // Section: Creative Purpose
  doc.setTextColor(20, 20, 20);
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.text('I. Creative Purpose & Aesthetic Concept', 20, 92);

  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  
  // Wrap description
  const splitDesc = doc.splitTextToSize(
    `${item.desc} This project showcases CreativeNode's precision aligned layouts, deep architectural space mapping, and absolute typography discipline. Developed directly under the high-fidelity premium spec standard.`, 
    170
  );
  doc.text(splitDesc, 20, 99);

  // Section: Technical Specifications Grid
  doc.setTextColor(20, 20, 20);
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.text('II. Technical Engineering Specifications', 20, 125);

  // Table styling
  doc.setFillColor(248, 248, 248);
  doc.rect(20, 131, 170, 42, 'F');
  
  // Outer Table bounds
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.rect(20, 131, 170, 42);

  // Grid lines
  doc.line(20, 139, 190, 139);
  doc.line(20, 147, 190, 147);
  doc.line(20, 155, 190, 155);
  doc.line(20, 163, 190, 163);
  doc.line(80, 131, 80, 173); // Vertical separator

  // Table Labels & Values
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  
  doc.text('Active Font Pairings', 23, 136);
  doc.text('Calculated Proportion', 23, 144);
  doc.text('Substrate Spec (Print)', 23, 152);
  doc.text('Ink Formulation', 23, 160);
  doc.text('Contrast Standard', 23, 168);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(item.specs.typeface, 84, 136);
  doc.text(item.specs.proportion, 84, 144);
  doc.text(item.specs.substrate, 84, 152);
  doc.text(item.specs.inkType, 84, 160);
  doc.setFont('courier', 'bold');
  doc.setTextColor(212, 175, 55);
  doc.text(item.specs.contrastRatio, 84, 168);

  // Section: Authorized Brand Color Swatches
  doc.setTextColor(20, 20, 20);
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.text('III. Calibrated Brand Colorway Palette', 20, 188);

  // Swatches loop
  item.colors.forEach((col, idx) => {
    const startX = 20 + (idx * 56);
    
    // Draw outer boundary
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.15);
    doc.rect(startX, 194, 50, 18);
    
    // Fill color block
    try {
      // Decode hex
      const r = parseInt(col.substring(1, 3), 16);
      const g = parseInt(col.substring(3, 5), 16);
      const b = parseInt(col.substring(5, 7), 16);
      doc.setFillColor(r, g, b);
      doc.rect(startX + 2, 196, 12, 14, 'F');
    } catch(err) {
      doc.setFillColor(200, 200, 200);
      doc.rect(startX + 2, 196, 12, 14, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    doc.text(item.colorNames[idx], startX + 16, 202);

    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(col, startX + 16, 207);
  });

  // Section: Proof of Quality
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(0.1);
  doc.line(20, 222, 190, 222);

  doc.setTextColor(20, 20, 20);
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.text('IV. Platform Authenticity Assurance', 20, 232);

  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'light');
  doc.setFontSize(8.5);
  doc.text('This visual sheet represents a high-resolution, uncompressed spec blueprint authorized directly by CreativeNode. Standard print sizing renders without loss on designated Hahnemühle materials.', 20, 238, { maxWidth: 170 });

  // Signature / Authentic stamp
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.2);
  doc.rect(142, 246, 48, 20);
  doc.setFillColor(252, 250, 245);
  doc.rect(142, 246, 48, 20, 'F');
  
  doc.setTextColor(212, 175, 55);
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text('APPROVED BY', 145, 251);
  doc.setTextColor(20, 20, 20);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('CREATIVENODE', 145, 257);
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  doc.text('TOKEN REF: #CN-AT-2026', 145, 262);

  // Final Footer
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.3);
  doc.line(10, 273, 190, 273);
  
  doc.setTextColor(140, 140, 140);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('SYSTEM PRESET ID: ' + item.id.toUpperCase(), 15, 281);
  doc.text('EMAIL: CREATIVENODE.IN@GMAIL.COM • PHONE: +91 6369278905', 105, 281);
};

export const generatePDFForItem = (item: PortfolioItem): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  drawPDFPageContent(doc, item);
  return doc;
};

export default function CreativenodePortfolio({ onBack, triggerToast }: CreativenodePortfolioProps) {
  // --- CRM & FORM STATE ---
  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'portfolio' | 'crm'>('portfolio');
  const [isCompilingLocalZip, setIsCompilingLocalZip] = useState(false);
  
  // --- INTERACTIVE SPECIFICATIONS & BATCH DOWNLOAD STATES ---
  const [selectedPortfolioIds, setSelectedPortfolioIds] = useState<string[]>([]);
  const [batchModeActive, setBatchModeActive] = useState(false);
  const [isCompilingBatchZip, setIsCompilingBatchZip] = useState(false);
  const [isCompilingBatchPDF, setIsCompilingBatchPDF] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{
    itemName: string;
    stage: string;
    percentage: number;
    active: boolean;
  } | null>(null);

  // --- NEW GALLERY COMPILER & CONTROL STATES ---
  const [specSearchQuery, setSpecSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'category' | 'popularity'>('latest');
  const [globalPreviewMode, setGlobalPreviewMode] = useState<'digital' | 'print' | 'mockup'>('digital');
  const [cardPreviewModes, setCardPreviewModes] = useState<Record<string, 'digital' | 'print' | 'mockup'>>({});
  const [isCompilingAllZip, setIsCompilingAllZip] = useState(false);

  // Mounted Mock-up environments parameters
  const [globalMockupEnv, setGlobalMockupEnv] = useState<'office' | 'museum'>('office');
  const [cardMockupEnvs, setCardMockupEnvs] = useState<Record<string, 'office' | 'museum'>>({});

  // Specification direct comparison variables
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareHighlightDiffs, setCompareHighlightDiffs] = useState(true);
  
  // Designer / Artist details modal
  const [selectedArtist, setSelectedArtist] = useState<any>(null);

  const [formData, setFormData] = useState({ name: '', email: '', service: 'Social Media Posters' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  // Canvas PNG Generator on the fly for Digital/RGB preview mode
  const downloadPNGForItem = (item: PortfolioItem) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Elegant Background
    const gradient = ctx.createLinearGradient(0, 0, 0, 1000);
    gradient.addColorStop(0, item.colors[0] || '#0A0A0D');
    gradient.addColorStop(1, '#020204');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 1000);

    // Vector grid overlay
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 40; i < 800; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 1000);
      ctx.stroke();
    }
    for (let i = 40; i < 1000; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(800, i);
      ctx.stroke();
    }

    // Creative compass concentric rings
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.06)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(400, 500, 320, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(400, 500, 180, 0, Math.PI * 2);
    ctx.stroke();

    // Golden frame border
    ctx.strokeStyle = '#D4AF37'; 
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 760, 960);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, 740, 940);

    // Dynamic grid points
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(35, 35, 12, 2);
    ctx.fillRect(35, 35, 2, 12);
    ctx.fillRect(753, 35, 12, 2);
    ctx.fillRect(763, 35, 2, 12);

    // Title & Headers
    ctx.textAlign = 'center';
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('C R E A T I V E N O D E   P R E M I U M   R G B', 400, 120);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Georgia, serif';
    ctx.fillText(item.title.toUpperCase(), 400, 210);

    ctx.fillStyle = '#888888';
    ctx.font = '14px monospace';
    ctx.fillText(`CLIENT: ${item.client.toUpperCase()}   |   RELEASE SPEC: ${item.year}`, 400, 280);

    // Subtle divisor
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, 320);
    ctx.lineTo(650, 320);
    ctx.stroke();

    // Render colors
    const swatchWidth = 130;
    const swatchHeight = 90;
    const startX = 400 - (item.colors.length * (swatchWidth + 24) - 24) / 2;
    
    item.colors.forEach((col, idx) => {
      const x = startX + idx * (swatchWidth + 24);
      const y = 380;
      
      ctx.fillStyle = col;
      ctx.fillRect(x, y, swatchWidth, swatchHeight);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, swatchWidth, swatchHeight);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(item.colorNames[idx], x + swatchWidth/2, y + swatchHeight + 25);
      ctx.fillStyle = '#AAAAAA';
      ctx.fillText(col.toUpperCase(), x + swatchWidth/2, y + swatchHeight + 42);
    });

    // Paragraph wrapping text of description
    ctx.fillStyle = '#DFDED9';
    ctx.font = '15px sans-serif';
    const descText = `${item.desc} Fully optimized RGB interactive digital master. High-density calibration, screen-ready proportions, and pristine visual geometry.`;
    const words = descText.split(' ');
    let line = '';
    const maxWidth = 580;
    const lineHeight = 28;
    let yPos = 620;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, 400, yPos);
        line = words[n] + ' ';
        yPos += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 400, yPos);

    // Specs ledger box
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(120, 750, 560, 130);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.fillRect(120, 750, 560, 130);

    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('DIGITAL SCREEN SPECIFICATION LEDGER', 400, 780);

    ctx.fillStyle = '#CCCCCC';
    ctx.font = '11px monospace';
    ctx.fillText(`FONT MATRIX: ${item.specs.typeface.toUpperCase()}`, 400, 815);
    ctx.fillText(`CANVAS CONTRAST RATIO: ${item.specs.contrastRatio.toUpperCase()}`, 400, 840);
    ctx.fillText(`PROPORTION RATIO: ${item.specs.proportion.toUpperCase()}`, 400, 865);

    // Footnotes
    ctx.fillStyle = '#777777';
    ctx.font = 'italic 11px Georgia';
    ctx.fillText('Authentically authorized and preserved by CreativeNode Digital Atelier.', 400, 920);
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('★ VERIFIED DIGITAL ORIGINAL ★', 400, 942);

    // Save
    const url = canvas.toDataURL('image/png');
    const triggerLink = document.createElement('a');
    triggerLink.href = url;
    triggerLink.download = `creativenode_rgb_${item.id}.png`;
    triggerLink.click();
  };

  // Resolves the designer mapping for specific portfolio items
  const getArtistForItem = (item: PortfolioItem) => {
    const titleLower = item.title.toLowerCase();
    const idLower = item.id.toLowerCase();
    if (idLower.includes('nalam') || titleLower.includes('diabetes') || titleLower.includes('wellness')) {
      return {
        id: 'des-amara',
        name: 'Amara Okafor',
        title: 'Luxury Editorial Typographer',
        location: 'Lagos, Nigeria',
        avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80',
        focusStyle: 'High-end Minimalist Serif Branding',
        bio: 'Sculpting high-prestige campaigns for independent watchmakers and premium perfume houses across West Africa and Europe and other fine works.',
        rating: 4.8,
        socials: { instagram: '@amara.types', email: 'amara@creativenode.in' }
      };
    } else if (idLower.includes('smr') || titleLower.includes('smr') || titleLower.includes('cyber') || titleLower.includes('control')) {
      return {
        id: 'des-tokyo-syn',
        name: 'NeoTokyo Syndicate',
        title: 'Hyper-Futurist Cyber Brand Studio',
        location: 'Shibuya, Tokyo',
        avatarUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=120&q=80',
        focusStyle: 'Cyberpunk Kinetics & Brutalist Overlay Vectors',
        bio: 'Blending high-octane street layouts with stark typography overlays. Architects behind major global cyber-gaming and athletic apparel campaigns.',
        rating: 5.0,
        socials: { globe: 'https://neotokyo-syndicate.jp', instagram: '@neotokyo.syn' }
      };
    } else if (idLower.includes('suji') || titleLower.includes('suji') || idLower.includes('recreation') || titleLower.includes('recreation')) {
      return {
        id: 'des-marcello',
        name: 'Marcello Rossi',
        title: 'Nouveau Noir Art Director',
        location: 'Milan, Italy',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        focusStyle: 'Deep Noir Contrast & Scrim Texture Master',
        bio: 'Meticulously balancing absolute backplate darkness with fine line grid borders and golden ratios. Specialize in fashion flyer launches.',
        rating: 4.9,
        socials: { instagram: '@marcello.rossi', globe: 'https://rossi-noir.it' }
      };
    } else {
      return {
        id: 'des-studio-zurich',
        name: 'Atelier Zürich Kraft',
        title: 'Elite Swiss Modernist Agency',
        location: 'Zürich, Switzerland',
        avatarUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=120&q=80',
        focusStyle: 'Swiss Grid System & Typographic Structuralism',
        bio: 'Dedicated to the pure traditions of clean sans-serif typography, grid-authoritative layout mathematics, and meticulous editorial tracking.',
        rating: 4.9,
        socials: { globe: 'https://atelier-zurich.ch', email: 'hello@atelier-zurich.ch' }
      };
    }
  };

  // Downloads raw configuration data for a project as a JSON 'preset' file
  const handleDownloadPresetJSON = (item: PortfolioItem) => {
    // Exact mapping to standard variables expected by PosterAtelier
    const isBrutalist = item.colors[0] === '#121214' || item.colors[1] === '#121214' || item.id.includes('smr');
    const isLuxury = item.id.includes('suji') || item.colors.includes('#D4AF37') || item.colors.includes('#eca115');
    
    let targetTheme = 'Modernist Clean';
    if (isBrutalist) targetTheme = 'Cyberpunk Noir';
    else if (isLuxury) targetTheme = 'Luxury Charcoal Gold';

    const preset = {
      id: item.id,
      title: item.title.toUpperCase(),
      subtitle: item.client.toUpperCase(),
      details: item.desc.toUpperCase(),
      theme: targetTheme,
      bgType: 'color' as 'color',
      bgValue: item.colors[2] || item.colors[0] || '#0A0A0D',
      accentColor: item.colors[1] || '#D4AF37',
      textColor: item.colors[0] || '#FFFFFF',
      fontTitle: item.specs.typeface.split('&')[0].trim(),
      fontSubtitle: item.specs.typeface.split('&')[1]?.trim() || 'Inter',
      align: 'center' as 'center',
      geometricElement: 'grid' as 'grid',
      category: isBrutalist ? 'fitness' : isLuxury ? 'minimalist' : 'fashion',
      aspectRatio: item.specs.proportion.toLowerCase().includes('4:5') ? '4:5' : '1:1'
    };

    const strJSON = JSON.stringify(preset, null, 2);
    const blob = new Blob([strJSON], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    
    const clickLink = document.createElement('a');
    clickLink.href = blobUrl;
    clickLink.download = `creativenode_preset_${item.id}.json`;
    clickLink.click();
    URL.revokeObjectURL(blobUrl);

    if (triggerToast) {
      triggerToast(`Successfully downloaded raw configuration Preset JSON for "${item.title}"! File can be loaded in the Interactive Atelier Studio canvas.`, "success");
    }
  };

  const handleToggleCompare = (id: string, e?: React.FormEvent) => {
    if (e) e.stopPropagation();
    setCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 2) {
        if (triggerToast) triggerToast("Comparing oldest selected items. Maximum of two items compared side-by-side.", "info");
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const renderEnvironmentalMockup = (item: any, envType: 'office' | 'museum') => {
    if (envType === 'office') {
      return (
        <div className="relative w-full h-[180px] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-900 flex items-center justify-center shadow-inner group-hover:border-zinc-700 transition duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-zinc-950 opacity-90" />
          <div className="absolute inset-y-0 left-6 right-6 flex justify-between pointer-events-none opacity-10">
            <div className="w-[1px] bg-white h-full" />
            <div className="w-[1px] bg-white h-full" />
            <div className="w-[1px] bg-white h-full" />
            <div className="w-[1px] bg-white h-full" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/5 pointer-events-none" />
          
          <div className="relative z-10 w-[95px] h-[125px] bg-[#121214] border-[3px] border-zinc-800 rounded shadow-2xl flex flex-col justify-between p-2 transform -rotate-1 hover:rotate-0 transition duration-500 hover:scale-105"
               style={{ backgroundColor: item.colors[0] }}>
            <div className="w-full h-full border border-black/40 bg-zinc-900/10 p-1.5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
              <div className="h-full w-full flex flex-col justify-between" style={{ color: item.colors[1] || '#FFFFFF' }}>
                <div className="text-[5px] font-mono leading-none tracking-tighter truncate font-bold" style={{ color: item.colors[1] }} id={`office-mockup-cat-${item.id}`}>{item.category.toUpperCase()}</div>
                <div className="text-[7.5px] font-bold font-display uppercase tracking-tight leading-none text-center my-auto px-0.5 line-clamp-2" style={{ color: item.colors[2] || '#fff' }} id={`office-mockup-ttl-${item.id}`}>{item.title}</div>
                <div className="flex justify-between items-center text-[3.5px] font-mono leading-none pt-1 border-t border-white/10">
                  <span className="truncate max-w-[45px] opacity-75">{item.client}</span>
                  <span style={{ color: item.colors[1] }}>●</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 right-2 w-14 h-24 pointer-events-none opacity-20 filter blur-xs">
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-zinc-650 w-full h-full">
              <ellipse cx="60" cy="50" rx="10" ry="25" transform="rotate(30 60 50)" />
              <ellipse cx="40" cy="40" rx="8" ry="20" transform="rotate(-20 40 40)" />
              <ellipse cx="70" cy="30" rx="7" ry="18" transform="rotate(45 70 30)" />
            </svg>
          </div>
          <div className="absolute bottom-2 left-3 font-mono text-[8px] text-zinc-500 pointer-events-none select-none uppercase tracking-widest">Office Space Vibe</div>
        </div>
      );
    } else {
      return (
        <div className="relative w-full h-[180px] rounded-xl overflow-hidden bg-[#161214] border border-zinc-900 flex items-center justify-center shadow-inner group-hover:border-zinc-700 transition duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,_var(--tw-gradient-stops))] from-amber-100/10 via-[#1b1418] to-[#120e10]" />
          
          <div className="relative z-10 w-[90px] h-[120px] bg-[#0A0A0C] border-[4px] border-[#D4AF37]/80 rounded shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between p-1.5 transform rotate-0 hover:scale-105 transition duration-500"
               style={{ backgroundColor: item.colors[0] }}>
            <div className="w-full h-full border border-black/40 bg-zinc-900/10 p-1 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none" />
              <div className="h-full w-full flex flex-col justify-between" style={{ color: item.colors[1] || '#FFFFFF' }}>
                <div className="text-[4.5px] font-mono leading-none tracking-tighter truncate font-extrabold text-[#D4AF37]" id={`museum-mockup-cat-${item.id}`}>{item.category}</div>
                <div className="text-[7px] font-bold font-display uppercase tracking-tight leading-tight text-center my-auto line-clamp-3 px-0.5" id={`museum-mockup-ttl-${item.id}`}>{item.title}</div>
                <div className="text-[3.5px] font-mono leading-none text-right opacity-60">MCMLXVI</div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-3.5 bg-zinc-950/95 border border-zinc-900/70 p-1.5 rounded text-[5px] font-mono tracking-tighter text-zinc-400 w-16 pointer-events-none shadow-md">
            <div className="font-extrabold text-[#D4AF37] text-[5.5px]">CREATIVENODE</div>
            <div className="text-white font-sans mt-0.5 scale-90 origin-left truncate">{item.title}</div>
            <div className="text-[4px] text-zinc-500 scale-90 origin-left">Archive No. {item.id.slice(0, 4).toUpperCase()}</div>
          </div>

          <div className="absolute bottom-0 inset-x-0 h-4 bg-zinc-950 border-t border-zinc-900/50 pointer-events-none" />
          <div className="absolute bottom-1 origin-center left-3 font-mono text-[8px] text-zinc-500 pointer-events-none select-none uppercase tracking-widest">Museum Exhibition Vibe</div>
        </div>
      );
    }
  };

  const runDownloadProcessEffects = async (itemName: string, callback: () => void) => {
    setDownloadProgress({
      itemName,
      stage: 'Initializing spec rendering engines...',
      percentage: 15,
      active: true
    });
    
    await new Promise(r => setTimeout(r, 450));
    setDownloadProgress(prev => prev ? {
      ...prev,
      stage: 'Mapping geometric margins and Swiss grids...',
      percentage: 45
    } : null);

    await new Promise(r => setTimeout(r, 400));
    setDownloadProgress(prev => prev ? {
      ...prev,
      stage: 'Calibrating CMYK brand colorway swatches...',
      percentage: 75
    } : null);

    await new Promise(r => setTimeout(r, 350));
    setDownloadProgress(prev => prev ? {
      ...prev,
      stage: 'Injecting approved authenticity signature stamp...',
      percentage: 95
    } : null);

    await new Promise(r => setTimeout(r, 250));
    callback();
    
    setDownloadProgress(prev => prev ? {
      ...prev,
      stage: 'Transmission Complete!',
      percentage: 100
    } : null);
    
    await new Promise(r => setTimeout(r, 500));
    setDownloadProgress(null);
  };

  // Downloading a single project (Dynamic mode detection)
  const handleDownloadSingle = (item: PortfolioItem, overrideMode?: 'digital' | 'print') => {
    const activeMode = overrideMode || cardPreviewModes[item.id] || globalPreviewMode;
    
    if (activeMode === 'digital') {
      if (triggerToast) triggerToast(`Preparing high-res PNG template for "${item.title}"...`, "info");
      runDownloadProcessEffects(item.title, () => {
        try {
          downloadPNGForItem(item);
          if (triggerToast) triggerToast(`Digital PNG for "${item.title}" saved successfully!`, "success");
        } catch (err) {
          console.error("PNG download failed:", err);
          if (triggerToast) triggerToast("Digital PNG export failed.", "alert");
        }
      });
    } else {
      if (triggerToast) triggerToast(`Starting PDF specification export for "${item.title}"...`, "info");
      runDownloadProcessEffects(item.title, () => {
        try {
          const docObj = generatePDFForItem(item);
          docObj.save(`creativenode_spec_${item.id}.pdf`);
          if (triggerToast) triggerToast(`Print PDF Specification for "${item.title}" saved successfully!`, "success");
        } catch (err) {
          console.error("PDF generation failed:", err);
          if (triggerToast) triggerToast("Export failed. Please try again.", "alert");
        }
      });
    }
  };

  // Bulk ZIP download of ALL specification PDF sheets directly
  const handleDownloadAllZIP = async () => {
    setIsCompilingAllZip(true);
    if (triggerToast) triggerToast(`Compiling ALL ${PORTFOLIO_ITEMS.length} design specifications as high-res Print PDFs...`, "info");
    
    setDownloadProgress({
      itemName: 'Full Inventory Spec Sheets',
      stage: 'Starting overall ZIP compiler...',
      percentage: 5,
      active: true
    });
    
    try {
      const zip = new JSZip();
      
      for (let i = 0; i < PORTFOLIO_ITEMS.length; i++) {
        const item = PORTFOLIO_ITEMS[i];
        
        setDownloadProgress({
          itemName: 'All Sheets Compact',
          stage: `Packing [${i+1}/${PORTFOLIO_ITEMS.length}] spec sheet: "${item.title}"...`,
          percentage: Math.round(5 + (i / PORTFOLIO_ITEMS.length) * 85),
          active: true
        });
        
        await new Promise(r => setTimeout(r, 100));
        
        const docObj = generatePDFForItem(item);
        const pdfBlob = docObj.output('blob');
        zip.file(`creativenode_spec_${item.id}.pdf`, pdfBlob);
      }
      
      setDownloadProgress({
        itemName: 'ZIP File Assembly',
        stage: 'Consolidating and compressing PDF archives...',
        percentage: 95,
        active: true
      });
      await new Promise(r => setTimeout(r, 200));

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = "creativenode_all_specifications.zip";
      downloadLink.click();
      URL.revokeObjectURL(downloadUrl);
      
      if (triggerToast) triggerToast(`Consolidated ZIP of ALL ${PORTFOLIO_ITEMS.length} spec sheets downloaded successfully!`, "success");
    } catch (err) {
      console.error("Bulk ZIP compile failed:", err);
      if (triggerToast) triggerToast("Bulk specification zipping failed.", "alert");
    } finally {
      setDownloadProgress(null);
      setIsCompilingAllZip(false);
    }
  };

  const handleDownloadBatchZIP = async () => {
    if (selectedPortfolioIds.length === 0) {
      if (triggerToast) triggerToast("Please select at least one portfolio specification item.", "alert");
      return;
    }
    
    setIsCompilingBatchZip(true);
    if (triggerToast) triggerToast(`Compiling ${selectedPortfolioIds.length} select spec sheets into consolidated ZIP...`, "info");
    
    setDownloadProgress({
      itemName: `${selectedPortfolioIds.length} Spec Sheets`,
      stage: 'Batching select templates...',
      percentage: 10,
      active: true
    });
    
    try {
      const zip = new JSZip();
      
      for (let i = 0; i < selectedPortfolioIds.length; i++) {
        const id = selectedPortfolioIds[i];
        const item = PORTFOLIO_ITEMS.find(p => p.id === id);
        if (!item) continue;
        
        // Progress stage
        setDownloadProgress({
          itemName: `ZIP Output Compilation`,
          stage: `Rendering [${i+1}/${selectedPortfolioIds.length}] ${item.title}...`,
          percentage: Math.round(10 + (i / selectedPortfolioIds.length) * 80),
          active: true
        });
        
        await new Promise(r => setTimeout(r, 180));
        
        const docObj = generatePDFForItem(item);
        const pdfBlob = docObj.output('blob');
        zip.file(`creativenode_spec_${item.id}.pdf`, pdfBlob);
      }
      
      setDownloadProgress({
        itemName: 'ZIP Output Compilation',
        stage: 'Packing high-res PDF archives...',
        percentage: 95,
        active: true
      });
      await new Promise(r => setTimeout(r, 300));

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = "creativenode_specs_bundle_cmyk.zip";
      downloadLink.click();
      URL.revokeObjectURL(downloadUrl);
      
      if (triggerToast) triggerToast(`Consolidated ZIP of ${selectedPortfolioIds.length} specs downloaded successfully!`, "success");
    } catch (err) {
      console.error("Batch build failed:", err);
      if (triggerToast) triggerToast("Batch creation failed.", "alert");
    } finally {
      setDownloadProgress(null);
      setIsCompilingBatchZip(false);
    }
  };

  const handleDownloadBatchPDF = async () => {
    if (selectedPortfolioIds.length === 0) {
      if (triggerToast) triggerToast("Please select at least one portfolio project for batch printing.", "alert");
      return;
    }

    setIsCompilingBatchPDF(true);
    if (triggerToast) triggerToast(`Initiating physical print batch compile for ${selectedPortfolioIds.length} items...`, "info");

    setDownloadProgress({
      itemName: `${selectedPortfolioIds.length} Multi-page Print Specs`,
      stage: 'Preparing physical print canvas...',
      percentage: 10,
      active: true
    });

    try {
      // Create master multi-page PDF Document
      const pdfDoc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      for (let i = 0; i < selectedPortfolioIds.length; i++) {
        const id = selectedPortfolioIds[i];
        const item = PORTFOLIO_ITEMS.find(p => p.id === id);
        if (!item) continue;

        setDownloadProgress({
          itemName: `Physical Print Compilation`,
          stage: `Drawing high-fidelity page [${i + 1}/${selectedPortfolioIds.length}] ${item.title}...`,
          percentage: Math.round(15 + (i / selectedPortfolioIds.length) * 75),
          active: true
        });

        await new Promise(r => setTimeout(r, 200));

        // Add page if this is not the first item
        if (i > 0) {
          pdfDoc.addPage();
        }

        // Draw individual spec contents onto the active page
        drawPDFPageContent(pdfDoc, item);
      }

      setDownloadProgress({
        itemName: 'Physical Print Compilation',
        stage: 'Finalizing page borders and metadata...',
        percentage: 95,
        active: true
      });
      await new Promise(r => setTimeout(r, 200));

      // Save document
      pdfDoc.save(`creativenode_batch_print_${selectedPortfolioIds.length}_pages.pdf`);

      if (triggerToast) triggerToast(`Multi-page PDF of ${selectedPortfolioIds.length} print assets generated successfully!`, "success");
    } catch (err) {
      console.error("Batch print PDF build failed:", err);
      if (triggerToast) triggerToast("Batch print document creation failed.", "alert");
    } finally {
      setDownloadProgress(null);
      setIsCompilingBatchPDF(false);
    }
  };

  const toggleSelectPortfolio = (id: string) => {
    setSelectedPortfolioIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedPortfolioIds.length === PORTFOLIO_ITEMS.length) {
      setSelectedPortfolioIds([]);
    } else {
      setSelectedPortfolioIds(PORTFOLIO_ITEMS.map(p => p.id));
    }
  };

  // Initialize Firebase for CRM Storage
  useEffect(() => {
    try {
      const firebaseConfig = JSON.parse(typeof (window as any).__firebase_config !== 'undefined' ? (window as any).__firebase_config : '{}');
      if (Object.keys(firebaseConfig).length === 0) return;
      
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      
      const initAuth = async () => {
        await signInAnonymously(auth);
      };
      initAuth();
      
      const unsubscribe = onAuthStateChanged(auth, setUser);
      return () => unsubscribe();
    } catch (e) {
      console.log("Firebase not configured in this environment.");
    }
  }, []);

  // Fetch CRM Data from Firebase with LocalStorage Fallback
  useEffect(() => {
    const loadLocalSubmissions = () => {
      try {
        const local = localStorage.getItem('creativenode_leads');
        if (local) setSubmissions(JSON.parse(local));
      } catch (e) { console.error("Local storage error", e); }
    };

    if (!user) {
      loadLocalSubmissions();
      return;
    }
    
    try {
      const db = getFirestore();
      const appId = typeof (window as any).__app_id !== 'undefined' ? (window as any).__app_id : 'default-app-id';
      const q = collection(db, 'artifacts', appId, 'public', 'data', 'creativenode_leads');
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const leads: any[] = [];
        snapshot.forEach((doc) => leads.push({ id: doc.id, ...doc.data() }));
        // Sort newest first
        leads.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        setSubmissions(leads);
        localStorage.setItem('creativenode_leads', JSON.stringify(leads));
      }, (error) => {
        console.warn("Firestore permission denied. Using LocalStorage fallback.");
        loadLocalSubmissions();
      });
      
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore error:", e);
      loadLocalSubmissions();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    const newLead = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    try {
      let savedToFirebase = false;
      if (user) {
        try {
          const db = getFirestore();
          const appId = typeof (window as any).__app_id !== 'undefined' ? (window as any).__app_id : 'default-app-id';
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'creativenode_leads'), {
            ...formData,
            createdAt: serverTimestamp()
          });
          savedToFirebase = true;
        } catch (err) {
          console.warn("Firestore save denied. Falling back to local storage.");
        }
      }

      if (!savedToFirebase) {
        const existing = JSON.parse(localStorage.getItem('creativenode_leads') || '[]');
        const updated = [newLead, ...existing];
        localStorage.setItem('creativenode_leads', JSON.stringify(updated));
        setSubmissions(updated);
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', service: 'Social Media Posters' });
      if (triggerToast) triggerToast("Inquiry received successfully! Details logged to CRM console.", "success");
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Raw source code string representation for packaging
  const handleDownloadCodebaseZIP = async () => {
    setIsCompilingLocalZip(true);
    if (triggerToast) triggerToast("Compiling complete 14-page React-Portfolio codebase archive...", "info");
    
    try {
      const zip = new JSZip();
      
      // Standalone React App.tsx code
      const rawCodeText = `import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { 
  CheckCircle, ChevronRight, Layout, Monitor, Smartphone, PenTool, 
  Share2, Award, Zap, Clock, Star, Instagram, Globe, Mail, Phone,
  ChevronDown, X, Menu
} from 'lucide-react';

const FadeIn = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const ref = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  const getTransform = () => {
    if (isVisible) return 'translate-x-0 translate-y-0 scale-100';
    switch (direction) {
      case 'up': return 'translate-y-12 scale-95';
      case 'down': return '-translate-y-12 scale-95';
      case 'left': return 'translate-x-12 scale-95';
      case 'right': return '-translate-x-12 scale-95';
      default: return 'translate-y-12 scale-95';
    }
  };

  return (
    <div
      ref={ref}
      className={\`transition-all duration-1000 ease-out \${isVisible ? 'opacity-100' : 'opacity-0'} \${getTransform()} \${className}\`}
      style={{ transitionDelay: \`\${delay}ms\` }}
    >
      {children}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [viewMode, setViewMode] = useState('portfolio');
  const [formData, setFormData] = useState({ name: '', email: '', service: 'Social Media Posters' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    try {
      const firebaseConfig = JSON.parse(localStorage.getItem('creativenode_firebase_blueprint') || '{}');
      if (Object.keys(firebaseConfig).length === 0) return;
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      signInAnonymously(auth).then(() => {
        onAuthStateChanged(auth, setUser);
      });
    } catch (e) {
      console.log("Firebase not configured or in sandboxed fallback.");
    }
  }, []);

  // Sync leads from localStorage
  useEffect(() => {
    const local = localStorage.getItem('creativenode_leads');
    if (local) setSubmissions(JSON.parse(local));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setIsSubmitting(true);
    const newLead = { ...formData, id: Date.now().toString(), createdAt: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem('creativenode_leads') || '[]');
    const updated = [newLead, ...existing];
    localStorage.setItem('creativenode_leads', JSON.stringify(updated));
    setSubmissions(updated);
    setSubmitStatus('success');
    setFormData({ name: '', email: '', service: 'Social Media Posters' });
    setIsSubmitting(false);
    setTimeout(() => setSubmitStatus(null), 5000);
  };

  if (viewMode === 'crm') {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-white/10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-serif text-[#D4AF37]">CRM Dashboard</h1>
              <p className="text-white/50 text-sm mt-2 tracking-wider uppercase">Lead Management System</p>
            </div>
            <button onClick={() => setViewMode('portfolio')} className="px-8 py-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black rounded-full transition text-sm font-bold uppercase tracking-widest">
              Back to Portfolio
            </button>
          </div>
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-black/50 border-b border-white/10 text-[#D4AF37] text-xs font-mono uppercase tracking-wider">
                  <th className="p-6">Date received</th>
                  <th className="p-6 font-semibold">Client Name</th>
                  <th className="p-6">Email Contact</th>
                  <th className="p-6">Service Requested</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-white/40 italic">No submissions yet. Leads will appear here automatically.</td>
                  </tr>
                ) : (
                  submissions.map(sub => (
                    <tr key={sub.id} className="border-b border-white/5 hover:bg-white/10 transition-colors text-sm">
                      <td className="p-6 text-white/60">{new Date(sub.createdAt).toLocaleString()}</td>
                      <td className="p-6 font-medium text-white">{sub.name}</td>
                      <td className="p-6"><a href={\`mailto:\${sub.email}\`} className="text-white/80 hover:text-[#D4AF37] transition-colors">\${sub.email}</a></td>
                      <td className="p-6">
                        <span className="px-4 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-xs font-bold tracking-wider uppercase border border-[#D4AF37]/20">
                          {sub.service}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-[#D4AF37] selection:text-black bg-black text-white font-sans">
      <nav className="fixed w-full z-50 bg-black/90 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-serif font-bold text-xl tracking-widest text-[#D4AF37]">
            CREATIVENODE<span className="text-white">.</span>
          </div>
          <a href="#contact" className="border border-[#D4AF37] text-[#D4AF37] px-6 py-2 rounded-full text-sm font-medium hover:bg-[#D4AF37] hover:text-black transition">
            Start a Project
          </a>
        </div>
      </nav>

      {/* Hero Page */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <FadeIn direction="down">
            <h2 className="text-sm md:text-base tracking-[0.3em] uppercase text-white/70 mb-6">
              Premium Digital Branding & Creative Agency
            </h2>
          </FadeIn>
          
          <FadeIn delay={200}>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-9xl font-bold mb-6 tracking-tight text-[#D4AF37]">
              CREATIVENODE
            </h1>
          </FadeIn>

          <FadeIn delay={400}>
            <p className="font-serif text-xl md:text-3xl text-white/90 mb-8 tracking-widest uppercase">
              Design. Build. Innovate.
            </p>
          </FadeIn>

          <FadeIn delay={600}>
            <p className="max-w-2xl mx-auto text-white/80 text-lg md:text-xl font-light mb-12 leading-relaxed">
              Creating powerful visual identities, engaging digital experiences, and strategic branding solutions for modern businesses.
            </p>
          </FadeIn>
          <a href="#contact" className="bg-[#D4AF37] text-black px-8 py-4 rounded-full font-bold hover:bg-white transition-all transform hover:-translate-y-1">Get Started Today</a>
        </div>
      </section>

      {/* Pages/Sections continue... About, Services, Packages, Website Services, Process, CRM Access, Contact Form */}
    </div>
  );
}`;

      zip.file("src/App.tsx", rawCodeText);

      // Create configuration files inside the downloaded zip bundle
      zip.file("package.json", JSON.stringify({
        "name": "creativenode-landing-page",
        "private": true,
        "version": "1.0.0",
        "type": "module",
        "scripts": {
          "dev": "vite",
          "build": "vite build",
          "preview": "vite preview"
        },
        "dependencies": {
          "react": "^19.0.0",
          "react-dom": "^19.0.0",
          "lucide-react": "^0.546.0",
          "firebase": "^12.14.0"
        },
        "devDependencies": {
          "@types/react": "^19.0.0",
          "@types/react-dom": "^19.0.0",
          "@vitejs/plugin-react": "^5.0.0",
          "autoprefixer": "^10.4.21",
          "postcss": "^8.4.35",
          "tailwindcss": "^4.1.0",
          "vite": "^6.2.0"
        }
      }, null, 2));

      zip.file("index.html", `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CREATIVENODE • Standard Agency Portfolio Template</title>
  </head>
  <body class="bg-black text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);

      zip.file("src/main.tsx", `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`);

      zip.file("tailwind.config.js", `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Cinzel", "serif"],
        sans: ["Montserrat", "sans-serif"],
      }
    },
  },
  plugins: [],
}`);

      zip.file("vite.config.ts", `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`);

      zip.file("src/index.css", `@import "tailwindcss";

:root {
  --gold-light: #FBF5B7;
  --gold-primary: #D4AF37;
  --gold-dark: #AA771C;
  --bg-black: #000000;
}

body {
  background-color: var(--bg-black);
  color: #ffffff;
  font-family: 'Montserrat', sans-serif;
  overflow-x: hidden;
}

.font-heading {
  font-family: 'Cinzel', serif;
}

.text-gold {
  color: var(--gold-primary);
}

.gold-gradient-text {
  background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}

.gold-gradient-bg {
  background: linear-gradient(135deg, #BF953F, #AA771C);
}

.glass-card {
  background: rgba(15, 15, 15, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(212, 175, 55, 0.2);
  transition: all 0.4s ease;
}

.glass-card:hover {
  border-color: rgba(212, 175, 55, 0.6);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px -10px rgba(212, 175, 55, 0.2);
}
`);

      zip.file("README.md", `# CREATIVENODE Agency Portfolio Landing Page Template

A comprehensive 14-page premium web agency and brand campaign portfolio. Features modular CRM leads logging, interactive responsive components, and an elegant noir-gold design concept.

## Development Setup

1. Unzip the archives onto your local machine.
2. Install the production dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Start the Vite local development preview:
   \`\`\`bash
   npm run dev
   \`\`\`
`);

      const content = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(content);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = "creativenode_agency_portfolio_template.zip";
      downloadLink.click();
      
      URL.revokeObjectURL(downloadUrl);
      if (triggerToast) triggerToast("Codebase ZIP compiled and downloaded successfully!", "success");
    } catch (e) {
      console.error(e);
      if (triggerToast) triggerToast("Failed to compile local codebase archive.", "alert");
    } finally {
      setIsCompilingLocalZip(false);
    }
  };

  // Generate random particles
  const particles = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: `${Math.random() * 3.5 + 1}px`,
    duration: `${Math.random() * 18 + 12}s`,
    delay: `${Math.random() * 4}s`
  }));

  // Dynamic conditional injection of style
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'creativenode-landing-page-styles';
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700&display=swap');
      
      .cn-font-heading {
        font-family: 'Cinzel', serif;
      }
      .cn-font-sans {
        font-family: 'Montserrat', sans-serif;
      }
      .cn-text-gold {
        color: #D4AF37;
      }
      .cn-gold-gradient-text {
        background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        display: inline-block;
      }
      .cn-gold-gradient-bg {
        background: linear-gradient(135deg, #BF953F, #AA771C);
      }
      .cn-glass-card {
        background: rgba(12, 12, 12, 0.85);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(212, 175, 55, 0.18);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .cn-glass-card:hover {
        border-color: rgba(212, 175, 55, 0.55);
        transform: translateY(-4px);
        box-shadow: 0 12px 32px -10px rgba(212, 175, 55, 0.12);
      }
      .cn-floating-particles {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        overflow: hidden;
        pointer-events: none;
      }
      .cn-particle {
        position: absolute;
        border-radius: 50%;
        background: rgba(212, 175, 55, 0.35);
        box-shadow: 0 0 8px rgba(212, 175, 55, 0.7);
        animation: cn_float 15s infinite linear;
      }
      @keyframes cn_float {
        0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
        10% { opacity: 0.8; }
        90% { opacity: 0.8; }
        100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById('creativenode-landing-page-styles');
      if (el) el.remove();
    };
  }, []);

  if (viewMode === 'crm') {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12 cn-font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-white/10 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold cn-font-heading cn-text-gold">CRM Dashboard</h1>
              <p className="text-white/50 text-xs mt-2 tracking-widest uppercase">Lead Management System</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setViewMode('portfolio')}
                className="px-6 py-2.5 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black rounded-full transition text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                Back to Site
              </button>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                    <th className="p-5">Date Received</th>
                    <th className="p-5">Client Name</th>
                    <th className="p-5">Email Contact</th>
                    <th className="p-5">Service Requested</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-zinc-600 italic font-mono text-[11px]">
                        No client submissions logged. Leads from contact forms will appear here in real-time.
                      </td>
                    </tr>
                  ) : (
                    submissions.map(sub => (
                      <tr key={sub.id} className="border-b border-zinc-900 hover:bg-zinc-900/40 transition-colors text-xs font-mono">
                        <td className="p-5 text-zinc-500">
                          {sub.createdAt 
                            ? (sub.createdAt.toMillis 
                                ? new Date(sub.createdAt.toMillis()).toLocaleString() 
                                : new Date(sub.createdAt).toLocaleString()) 
                            : 'Just now'}
                        </td>
                        <td className="p-5 font-bold text-zinc-100">{sub.name}</td>
                        <td className="p-5">
                          <a href={`mailto:${sub.email}`} className="text-zinc-300 hover:text-[#D4AF37] transition">
                            {sub.email}
                          </a>
                        </td>
                        <td className="p-5">
                          <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-[9px] font-bold tracking-wider uppercase border border-[#D4AF37]/20">
                            {sub.service}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white cn-font-sans selection:bg-[#D4AF37] selection:text-black">
      
      {/* Floating Toolbar for Workspace Navigation and ZIP Compiling */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col sm:flex-row items-center gap-3 bg-zinc-950/90 border border-zinc-850 px-4 py-2.5 rounded-full backdrop-blur-md shadow-2xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-400 hover:text-white uppercase px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Preview</span>
        </button>

        <div className="hidden sm:block w-[1px] h-4 bg-zinc-800" />

        <button
          onClick={handleDownloadCodebaseZIP}
          disabled={isCompilingLocalZip}
          className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#D4AF37] hover:text-black hover:bg-[#D4AF37] uppercase px-4 py-1.5 rounded-full border border-[#D4AF37]/45 hover:border-transparent transition cursor-pointer disabled:opacity-40 select-none font-bold"
        >
          {isCompilingLocalZip ? (
            <>
              <span className="animate-spin">⚙️</span>
              <span>Compiling ZIP...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Download Portfolio Code (.ZIP)</span>
            </>
          )}
        </button>
      </div>

      {/* Internal Landing Header */}
      <nav className="fixed w-full z-45 bg-[#080808]/90 border-b border-zinc-900 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="cn-font-heading font-extrabold text-lg tracking-[0.2em] text-[#D4AF37] flex items-center gap-2">
            CREATIVENODE<span className="text-white">.</span>
            <span className="text-[7px] font-mono border border-[#D4AF37]/35 text-[#D4AF37] uppercase px-1.5 py-0.5 rounded tracking-widest">Template Preview</span>
          </div>

          <div className="hidden md:flex items-center gap-6 font-mono text-[10.5px] uppercase tracking-wider text-zinc-400">
            <a href="#about" className="hover:text-[#D4AF37] transition">About Us</a>
            <a href="#services" className="hover:text-[#D4AF37] transition">Services</a>
            <a href="#portfolio-gallery" className="hover:text-[#D4AF37] transition text-[#D4AF37] font-semibold">★ Specs Showcase</a>
            <a href="#packages" className="hover:text-[#D4AF37] transition">Packages</a>
            <a href="#workflow" className="hover:text-[#D4AF37] transition">Process</a>
            <a href="#contact" className="hover:text-[#D4AF37] transition">Contact</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('crm')}
              className="text-[9px] text-zinc-500 hover:text-[#D4AF37] font-mono uppercase border border-zinc-850 hover:border-[#D4AF37]/30 px-3 py-1.5 rounded-md transition"
            >
              Leads CRM
            </button>
            <a 
              href="#contact" 
              className="border border-[#D4AF37] text-[#D4AF37] px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-[#D4AF37] hover:text-black transition"
            >
              Order Template
            </a>
          </div>
        </div>
      </nav>

      {/* SECTION 1 - HERO COVER */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden bg-black border-b border-zinc-900">
        <div className="cn-floating-particles">
          {particles.map(p => (
            <div 
              key={p.id} 
              className="cn-particle" 
              style={{ 
                left: p.left, 
                top: p.top, 
                width: p.size, 
                height: p.size, 
                animationDuration: p.duration, 
                animationDelay: p.delay 
              }} 
            />
          ))}
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <FadeIn direction="down">
            <h2 className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-zinc-500 mb-6 font-mono font-bold">
              Premium Digital Branding & Creative Agency
            </h2>
          </FadeIn>
          
          <FadeIn delay={200}>
            <h1 className="cn-font-heading text-5xl md:text-8xl lg:text-9xl font-bold mb-6 tracking-tighter leading-none">
              <span className="cn-gold-gradient-text drop-shadow-2xl">CREATIVENODE</span>
            </h1>
          </FadeIn>

          <FadeIn delay={400}>
            <p className="cn-font-heading text-lg md:text-2xl text-zinc-300 mb-8 tracking-[0.25em] uppercase">
              Design. Build. Innovate.
            </p>
          </FadeIn>

          <FadeIn delay={600}>
            <p className="max-w-2xl mx-auto text-zinc-400 text-sm md:text-base font-light mb-12 leading-relaxed">
              Creating powerful visual identities, engaging digital experiences, and strategic branding solutions for forward-thinking modern businesses.
            </p>
          </FadeIn>

          <FadeIn delay={800} className="flex flex-wrap justify-center gap-4 md:gap-8 text-[9.5px] font-bold font-mono text-[#D4AF37] uppercase tracking-widest">
            <span className="flex items-center gap-2"><PenTool size={13}/> Social Media</span>
            <span className="text-zinc-800">•</span>
            <span className="flex items-center gap-2"><Award size={13}/> Branding</span>
            <span className="text-zinc-800">•</span>
            <span className="flex items-center gap-2"><Globe size={13}/> Web Space</span>
            <span className="text-zinc-800">•</span>
            <span className="flex items-center gap-2"><Zap size={13}/> Marketing</span>
          </FadeIn>

          <FadeIn delay={1200} className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="text-zinc-700" size={24} />
          </FadeIn>
        </div>
      </section>

      {/* SECTION 2 - ABOUT ARCHITECTURE */}
      <section id="about" className="py-24 md:py-32 relative bg-[#040404] border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <FadeIn>
                <span className="text-[#D4AF37] font-bold font-mono tracking-widest text-[9.5px] mb-4 uppercase block">About Us</span>
                <h2 className="cn-font-heading text-3xl md:text-5xl font-bold mb-8 leading-tight text-white">
                  Transforming Ideas into <span className="cn-gold-gradient-text font-serif">Extraordinary</span> Digital Realties
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-light">
                  CREATIVENODE is a dynamic creative digital studio focused on helping brands discover their absolute visual identity through modern, premium graphic design, responsive layouts, and meticulous typography.
                </p>
                <p className="text-zinc-350 text-sm font-medium leading-relaxed mb-8 border-l border-[#D4AF37] pl-4 py-2 bg-zinc-900/20 rounded-r-lg">
                  We don't just craft graphics — we engineer end-to-end user experiences that connect with clients.
                </p>
              </FadeIn>

              <FadeIn delay={200}>
                <h3 className="cn-font-heading text-lg font-bold mb-3 text-white uppercase tracking-wider">Our Creative Mission</h3>
                <p className="text-zinc-400 text-xs font-light leading-relaxed">
                  To provide elegant, strategic solutions that empower modern business owners, generate lasting attention, and set an elite standard of design fidelity.
                </p>
              </FadeIn>
            </div>

            <FadeIn delay={400} direction="left">
              <div className="cn-glass-card p-8 md:p-10 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] opacity-[0.04] blur-3xl rounded-full"></div>
                <h3 className="cn-font-heading text-xl font-bold mb-8 text-gold-400 uppercase tracking-widest">Our Edge</h3>
                <ul className="space-y-6">
                  {[
                    "Unrivaled Modern Design Aesthetics",
                    "Aesthetic Color Theory Customization",
                    "From Essential to Elite Tier Packages",
                    "Ultra-Fast Production Response SLA",
                    "Strategic, Conversion-Driven Layouts"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-zinc-300">
                      <div className="bg-[#D4AF37]/15 p-1.5 rounded-full text-[#D4AF37] shrink-0">
                        <CheckCircle size={15} />
                      </div>
                      <span className="text-xs font-semibold">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SECTION 3 - SERVICES */}
      <section id="services" className="py-24 bg-black border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[#D4AF37] font-bold font-mono tracking-widest text-[9.5px] mb-4 uppercase block">Capabilities</span>
            <h2 className="cn-font-heading text-3xl md:text-5xl font-bold mb-6 text-white uppercase">Creative Service Model</h2>
            <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto rounded-full"></div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Social Media Posters", icon: <Share2 size={18} />, desc: "Engaging, high-contrast layouts structured to stop the scroll, cement style, and expand reach.", items: ["Instagram Aesthetics", "Facebook Ad Creatives", "Seasonal Campaigns"] },
              { num: "02", title: "Business Promotions", icon: <Zap size={18} />, desc: "Ultra-clean professional pitch prints, flyers, and digital specs aligned with brand rules.", items: ["Product Launch Displays", "Corporate Flyers", "Event Invitation Sheets"] },
              { num: "03", title: "Festival Wishes", icon: <Star size={18} />, desc: "Stunning seasonal layouts merging traditional artwork motifs with sleek vector details.", items: ["Ramadan & Diwali Wishers", "Ugadi Greetings", "New Year Sales Promotions"] },
              { num: "04", title: "Brand Identity", icon: <Award size={18} />, desc: "Bespoke color palettes, typography specs, and layouts that elevate corporate value.", items: ["Minimalist Vectors", "Editorial Layout Systems", "Custom Symbol Packaging"] },
              { num: "05", title: "Web Architecture", icon: <Layout size={18} />, desc: "Fast-loading, completely responsive landing pages designed directly for active conversions.", items: ["SPA Portfolio Layouts", "Inquiry Forms Setup", "Aesthetic Backdrops"] }
            ].map((cap, i) => (
              <FadeIn key={i} delay={i * 100} className="cn-glass-card p-8 rounded-2xl flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <span className="cn-font-heading text-3xl font-extrabold text-zinc-800">{cap.num}</span>
                  <div className="text-[#D4AF37] bg-[#D4AF37]/10 p-3.5 rounded-xl">{cap.icon}</div>
                </div>
                <h3 className="cn-font-heading text-lg font-bold mb-3 text-white uppercase tracking-wider">{cap.title}</h3>
                <p className="text-zinc-500 text-xs font-light mb-8 flex-grow leading-relaxed">{cap.desc}</p>
                <ul className="space-y-2.5 border-t border-zinc-900 pt-5">
                  {cap.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <ChevronRight size={12} className="text-[#D4AF37]"/> {item}
                    </li>
                  ))}
                </ul>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3.5 - INTERACTIVE SPECIFICATION PORTFOLIO GALLERY */}
      {/* SECTION 3.5 - INTERACTIVE SPECIFICATION PORTFOLIO GALLERY */}
      <section id="portfolio-gallery" className="py-24 bg-[#0a0a0d] border-b border-zinc-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#D4AF37] font-bold font-mono tracking-widest text-[9.5px] mb-4 uppercase block">Atelier Showcase Blueprint Specs</span>
            <h2 className="cn-font-heading text-3xl md:text-5xl font-bold mb-6 text-white uppercase">Brand Assets & Spec Showcase</h2>
            <p className="text-zinc-500 text-xs md:text-sm font-light leading-relaxed max-w-xl mx-auto mb-6">
              Access the exclusive design ledger of CreativeNode. Download authorized print-ready vector blueprint sheets individually or compile multiple in batch mode.
            </p>
            <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto rounded-full"></div>
          </FadeIn>

          {/* COMBINED CONTROL CONSOLE: SEARCH, SORT, GLOBAL PREVIEW TOGGLE & BULK DOWNLOAD */}
          <FadeIn className="mb-10">
            <div className="bg-[#0f0f13] border border-zinc-900/80 rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Row 1: Search & Sort Controllers */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                
                {/* Brand Search Bar */}
                <div className="relative flex-1 group">
                  <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-[#D4AF37] transition-colors">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search master specifications (e.g., 'Nalam', 'Sugi', 'Hotel', 'Wedding')..."
                    value={specSearchQuery}
                    onChange={(e) => setSpecSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-black text-white placeholder-zinc-650 text-xs font-mono rounded-lg border border-zinc-850 focus:border-[#D4AF37]/50 focus:outline-none transition-all duration-300 shadow-inner"
                  />
                  {specSearchQuery && (
                    <button
                      onClick={() => setSpecSearchQuery('')}
                      className="absolute inset-y-0 right-3.5 flex items-center text-zinc-500 hover:text-[#D4AF37] transition font-mono text-[10px] uppercase font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Sort dropdown and Global Mode Toggles */}
                <div className="flex flex-wrap items-center gap-4">
                  
                  {/* Sort Select */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Sort By</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 bg-black border border-zinc-850 rounded-lg text-xs font-mono text-zinc-200 focus:border-[#D4AF37]/40 outline-none cursor-pointer"
                    >
                      <option value="latest">Latest Addition</option>
                      <option value="category">Design Category</option>
                      <option value="popularity">Popularity Score</option>
                    </select>
                  </div>

                  {/* Global Mode Toggle Switch */}
                  <div className="flex items-center gap-1.5 bg-black/60 border border-zinc-850/80 p-1.5 rounded-xl">
                    <button
                      onClick={() => {
                        setGlobalPreviewMode('digital');
                        if (triggerToast) triggerToast("Global preview mode configured to Digital/RGB", "info");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition ${
                        globalPreviewMode === 'digital'
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20 font-bold'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Digital RGB
                    </button>
                    <button
                      onClick={() => {
                        setGlobalPreviewMode('print');
                        if (triggerToast) triggerToast("Global preview mode configured to Print/CMYK (Vector)", "info");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition ${
                        globalPreviewMode === 'print'
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20 font-bold'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Print CMYK (PDF)
                    </button>
                    <button
                      onClick={() => {
                        setGlobalPreviewMode('mockup');
                        if (triggerToast) triggerToast("Global preview mode configured to Room Mockups", "info");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition ${
                        globalPreviewMode === 'mockup'
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20 font-bold'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Room Mockup
                    </button>
                  </div>

                  {/* Room mock-up sub switcher */}
                  {globalPreviewMode === 'mockup' && (
                    <div className="flex items-center gap-1.5 bg-black/60 border border-zinc-850/80 p-1.5 rounded-xl text-[10px] font-mono">
                      <span className="text-zinc-500 font-bold uppercase mr-1 scale-90">Room:</span>
                      <button
                        onClick={() => {
                          setGlobalMockupEnv('office');
                          if (triggerToast) triggerToast("Overlaid environment set to Office Space Vibe", "info");
                        }}
                        className={`px-2 py-1 rounded transition ${globalMockupEnv === 'office' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-zinc-400 hover:text-zinc-200'}`}
                      >
                        Office
                      </button>
                      <button
                        onClick={() => {
                          setGlobalMockupEnv('museum');
                          if (triggerToast) triggerToast("Overlaid environment set to Museum Wall Exhibition Vibe", "info");
                        }}
                        className={`px-2 py-1 rounded transition ${globalMockupEnv === 'museum' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'text-zinc-400 hover:text-zinc-200'}`}
                      >
                        Museum
                      </button>
                    </div>
                  )}

                  {/* Bulk Download Ultimate Button */}
                  <button
                    onClick={handleDownloadAllZIP}
                    disabled={isCompilingAllZip}
                    className="px-4 py-2 bg-gradient-to-r from-zinc-900 to-zinc-950 hover:from-[#D4AF37] hover:to-[#dfb76c] hover:text-black border border-zinc-800 hover:border-transparent text-[#D4AF37] rounded-lg text-[10px] font-sans font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-40"
                    title="Initiate consolidated batch packaging of all 19 spec sheets"
                  >
                    {isCompilingAllZip ? (
                      <>
                        <span className="animate-spin text-amber-500">⚙️</span>
                        <span>Compiling ZIP...</span>
                      </>
                    ) : (
                      <>
                        <Layers size={13} />
                        <span>Bulk Download All (19 ZIP)</span>
                      </>
                    )}
                  </button>

                </div>
              </div>

              {/* Row 2: Batch Mode selection overlay activator */}
              <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10.5px] font-mono text-zinc-400 font-bold">
                    {specSearchQuery ? `Filtered: ${
                      PORTFOLIO_ITEMS.filter(item => {
                        const term = specSearchQuery.toLowerCase();
                        return (
                          item.title.toLowerCase().includes(term) ||
                          item.client.toLowerCase().includes(term) ||
                          item.category.toLowerCase().includes(term) ||
                          item.desc.toLowerCase().includes(term)
                        );
                      }).length
                    } of ${PORTFOLIO_ITEMS.length} designs showing` : `Atelier Inventory: ${PORTFOLIO_ITEMS.length} registered specs active`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setBatchModeActive(!batchModeActive);
                      if (batchModeActive) setSelectedPortfolioIds([]);
                    }}
                    className={`px-4 py-1.5 rounded-md border text-[10px] font-mono uppercase tracking-wider transition cursor-pointer select-none flex items-center gap-1.5 ${
                      batchModeActive 
                        ? "bg-red-950/20 text-red-400 border-red-500/30 hover:bg-red-950/40" 
                        : "bg-zinc-900 text-[#D4AF37] border-zinc-800 hover:border-[#D4AF37]/30"
                    }`}
                  >
                    {batchModeActive ? (
                      <>
                        <X size={11} />
                        <span>Disable Batch ({selectedPortfolioIds.length})</span>
                      </>
                    ) : (
                      <>
                        <Grid size={11} />
                        <span>Batch Selection Mode</span>
                      </>
                    )}
                  </button>

                  {batchModeActive && (
                    <>
                      <button
                        onClick={handleSelectAll}
                        className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 rounded-md text-[10px] font-mono uppercase tracking-wider transition cursor-pointer"
                      >
                        {selectedPortfolioIds.length === PORTFOLIO_ITEMS.length ? "Clear Selection" : "Select All"}
                      </button>

                      <button
                        onClick={handleDownloadBatchZIP}
                        disabled={selectedPortfolioIds.length === 0 || isCompilingBatchZip || isCompilingBatchPDF}
                        className="px-4 py-1.5 bg-[#D4AF37] text-black hover:bg-white rounded-md text-[10px] font-mono font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        {isCompilingBatchZip ? (
                          <>
                            <span className="animate-spin">⚙️</span>
                            <span>Compiling ZIP...</span>
                          </>
                        ) : (
                          <>
                            <Download size={11} />
                            <span>Download ZIP ({selectedPortfolioIds.length})</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleDownloadBatchPDF}
                        disabled={selectedPortfolioIds.length === 0 || isCompilingBatchZip || isCompilingBatchPDF}
                        className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        {isCompilingBatchPDF ? (
                          <>
                            <span className="animate-spin">⚙️</span>
                            <span>Compiling PDF...</span>
                          </>
                        ) : (
                          <>
                            <Printer size={11} className="text-[#D4AF37]" />
                            <span>Batch Print PDF ({selectedPortfolioIds.length})</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          </FadeIn>

          {/* PORTFOLIO GRID GALLERY */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PORTFOLIO_ITEMS.filter(item => {
              if (!specSearchQuery.trim()) return true;
              const term = specSearchQuery.toLowerCase();
              return (
                item.title.toLowerCase().includes(term) ||
                item.client.toLowerCase().includes(term) ||
                item.category.toLowerCase().includes(term) ||
                item.desc.toLowerCase().includes(term)
              );
            })
            .sort((a, b) => {
              if (sortBy === 'category') {
                return a.category.localeCompare(b.category);
              }
              if (sortBy === 'popularity') {
                return b.popularity - a.popularity;
              }
              return b.createdDate.localeCompare(a.createdDate); // latest
            })
            .map((item, idx) => {
              const isSelected = selectedPortfolioIds.includes(item.id);
              const cardMode = cardPreviewModes[item.id] || globalPreviewMode;

              return (
                <FadeIn key={item.id} delay={idx * 50} className="h-full">
                  <div 
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('.stop-propagation-click')) {
                        return;
                      }
                      if (batchModeActive) {
                        toggleSelectPortfolio(item.id);
                      } else {
                        handleDownloadSingle(item, cardMode);
                      }
                    }}
                    className={`relative group overflow-hidden rounded-2xl border bg-black p-6 flex flex-col justify-between hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 shadow-xl cursor-pointer select-none h-full min-h-[440px] ${
                      isSelected 
                        ? 'border-[#D4AF37] bg-zinc-950/80 shadow-lg shadow-[#D4AF37]/5' 
                        : 'border-zinc-900 bg-[#08080c] hover:border-zinc-800'
                    }`}
                  >
                    
                    {/* BATCH SELECTOR CHECKBOX */}
                    {batchModeActive && (
                      <div className="absolute top-4 left-4 z-20 stop-propagation-click">
                        <button
                          onClick={() => toggleSelectPortfolio(item.id)}
                          className="text-[#D4AF37] hover:opacity-80 transition cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare size={19} className="text-[#D4AF37] fill-[#D4AF37]/10" />
                          ) : (
                            <Square size={19} className="text-zinc-600" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* TOP DECORATIVE ROW */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-mono tracking-widest uppercase text-zinc-500 font-semibold">{item.category}</span>
                        <span className="text-[10px] font-mono text-[#D4AF37] font-bold">{item.client} • {item.year}</span>
                      </div>
                      <div className="font-mono text-[9px] text-zinc-600 bg-zinc-900 px-2 py-1 rounded">
                        #SPEC-CN{idx+1}
                      </div>
                    </div>

                    {/* MAIN SPEC COMPONENT CONTAINER */}
                    <div className="space-y-4 my-2 flex-grow">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="cn-font-heading text-base font-bold text-zinc-100 group-hover:text-[#D4AF37] transition duration-300">
                            {item.title}
                          </h3>
                          <span className="shrink-0 text-[9px] font-mono text-zinc-500 bg-zinc-900/60 px-1.5 py-0.5 rounded" title="Popularity score based on gallery inquiries">
                            Popularity: {item.popularity}%
                          </span>
                        </div>
                        <p className="text-zinc-500 text-[11px] leading-relaxed font-light mt-1.5 font-mono line-clamp-3">
                          {item.desc}
                        </p>
                      </div>

                      {/* Technical specifications miniature summary or custom Mounted Room Mockup */}
                      {cardMode === 'mockup' ? (
                        <div className="stop-propagation-click">
                          {renderEnvironmentalMockup(item, globalMockupEnv)}
                        </div>
                      ) : (
                        <div className="bg-[#050507] border border-zinc-900/60 w-full rounded-xl p-3.5 space-y-2 font-mono text-[9.5px]">
                          <div className="flex justify-between text-zinc-500">
                            <span>Typoface Pair:</span>
                            <span className="text-zinc-300 text-right truncate max-w-[140px]">{item.specs.typeface}</span>
                          </div>
                          <div className="flex justify-between text-zinc-500">
                            <span>Substrate Spec:</span>
                            <span className="text-zinc-300 text-right truncate max-w-[140px]">{item.specs.substrate}</span>
                          </div>
                          <div className="flex justify-between text-zinc-500 pb-1.5 border-b border-zinc-900">
                            <span>Proportions Ratio:</span>
                            <span className="text-[#D4AF37]">{item.specs.proportion}</span>
                          </div>

                          {/* Colors Preview Row */}
                          <div className="pt-1.5 flex items-center justify-between">
                            <span className="text-[8.5px] text-zinc-500 uppercase tracking-wider">Calibration Swatches:</span>
                            <div className="flex items-center gap-1.5">
                              {item.colors.map((c, i) => (
                                <div
                                  key={i}
                                  className="w-3.5 h-3.5 rounded-full border border-zinc-950 shadow-sm"
                                  style={{ backgroundColor: c }}
                                  title={`${item.colorNames[i]} (${c})`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CARD LEVEL TOGGLE AND ACTION LAYER */}
                    <div className="mt-5 pt-4 border-t border-zinc-900/80 space-y-3 stop-propagation-click animate-fade-in">
                      
                      {/* Individual Preview Selector Toggle supporting RGB, PDF and Mockup formats */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span className="flex items-center gap-1.5 text-zinc-500">
                          <Layers size={11} /> Format Mode
                        </span>
                        
                        <div className="flex items-center gap-1 bg-black p-0.5 rounded-lg border border-zinc-850">
                          <button
                            onClick={() => {
                              setCardPreviewModes(prev => ({ ...prev, [item.id]: 'digital' }));
                              if (triggerToast) triggerToast(`Preview mode for "${item.title}" set to Digital RGB`, "info");
                            }}
                            className={`px-2 py-1 rounded text-[9px] uppercase tracking-wider transition ${
                              cardMode === 'digital'
                                ? 'bg-[#D4AF37] text-black font-semibold'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            RGB
                          </button>
                          <button
                            onClick={() => {
                              setCardPreviewModes(prev => ({ ...prev, [item.id]: 'print' }));
                              if (triggerToast) triggerToast(`Preview mode for "${item.title}" set to Print CMYK`, "info");
                            }}
                            className={`px-2 py-1 rounded text-[9px] uppercase tracking-wider transition ${
                              cardMode === 'print'
                                ? 'bg-[#D4AF37] text-black font-semibold'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => {
                              setCardPreviewModes(prev => ({ ...prev, [item.id]: 'mockup' }));
                              if (triggerToast) triggerToast(`Preview mode for "${item.title}" configured to Mounted Room Mockup`, "info");
                            }}
                            className={`px-2 py-1 rounded text-[9px] uppercase tracking-wider transition ${
                              cardMode === 'mockup'
                                ? 'bg-[#D4AF37] text-black font-semibold'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            Mockup
                          </button>
                        </div>
                      </div>

                      {/* Action trigger button */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] font-mono text-zinc-650 uppercase tracking-widest flex items-center gap-1">
                          {cardMode === 'digital' ? '★ RGB Digital' : cardMode === 'print' ? '⚙ CMYK Print' : '⚜ Wall Mockup'}
                        </span>
                        
                        <button
                          onClick={() => handleDownloadSingle(item, cardMode === 'mockup' ? 'digital' : cardMode)}
                          className="py-1.5 px-3.5 bg-zinc-900 text-zinc-300 group-hover:bg-[#D4AF37] group-hover:text-black rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-colors duration-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>{cardMode === 'print' ? 'Save PDF' : 'Save PNG'}</span>
                        </button>
                      </div>

                    </div>

                    {/* HOVER REVEAL INTERACTIVE CONSOLE FOR COMPREHENSIVE ACTIONS */}
                    {!batchModeActive && (
                      <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3.5 z-10 p-6 stop-propagation-click">
                        <div className="text-center">
                          <span className="text-[8px] font-mono text-[#D4AF37] uppercase tracking-widest block mb-1">SPECIFICATION WORKSPACE</span>
                          <h4 className="text-white text-xs font-bold uppercase truncate max-w-[210px] mb-3">{item.title}</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2.5 w-full max-w-[230px]">
                          <button
                            onClick={() => handleDownloadSingle(item, cardMode === 'mockup' ? 'digital' : cardMode)}
                            className="bg-[#D4AF37] text-black hover:bg-white text-[9px] font-mono font-extrabold uppercase py-2 px-1 rounded-lg transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
                          >
                            <Download className="w-4 h-4 text-black shrink-0" />
                            <span>Save {cardMode === 'print' ? 'PDF' : 'PNG'}</span>
                          </button>
                          
                          <button
                            onClick={() => handleDownloadPresetJSON(item)}
                            className="bg-zinc-900 border border-zinc-800 hover:border-[#D4AF37] text-zinc-300 hover:text-white text-[9px] font-mono font-bold uppercase py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                            title="Export raw JSON configuration spec file"
                          >
                            <FileText className="w-4 h-4 text-[#D4AF37] shrink-0" />
                            <span>Export JSON</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const artist = getArtistForItem(item);
                              setSelectedArtist(artist);
                            }}
                            className="bg-zinc-900 border border-zinc-800 hover:border-[#D4AF37] text-zinc-300 hover:text-white text-[9px] font-mono font-bold uppercase py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                          >
                            <Award className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>View Artist</span>
                          </button>

                          <button
                            onClick={(e) => handleToggleCompare(item.id, e)}
                            className={`border text-[9px] font-mono font-bold py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer uppercase ${
                              compareIds.includes(item.id)
                                ? 'bg-amber-950/20 text-[#D4AF37] border-[#D4AF37]'
                                : 'bg-zinc-900 border-zinc-800 hover:border-[#D4AF37] text-zinc-300 hover:text-white'
                            }`}
                          >
                            <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                            <span>{compareIds.includes(item.id) ? 'Selected' : 'Compare'}</span>
                          </button>
                        </div>

                        {/* Format selector inline on hover */}
                        <div className="flex items-center gap-2 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-900 mt-2">
                          <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Format:</span>
                          <div className="flex items-center gap-1">
                            {['digital', 'print', 'mockup'].map((fmt) => (
                              <button
                                key={fmt}
                                onClick={() => setCardPreviewModes(prev => ({ ...prev, [item.id]: fmt as any }))}
                                className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-tighter ${
                                  cardMode === fmt 
                                    ? 'bg-[#D4AF37] text-black font-extrabold' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                {fmt === 'digital' ? 'RGB' : fmt === 'print' ? 'PDF' : 'Room'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </FadeIn>
              );
            })}
          </div>

          {PORTFOLIO_ITEMS.filter(item => {
            const term = specSearchQuery.toLowerCase();
            return (
              item.title.toLowerCase().includes(term) ||
              item.client.toLowerCase().includes(term) ||
              item.category.toLowerCase().includes(term) ||
              item.desc.toLowerCase().includes(term)
            );
          }).length === 0 && (
            <div className="bg-[#08080c] border border-zinc-900 rounded-2xl p-16 text-center">
              <p className="text-zinc-500 font-mono text-xs italic mb-4">
                No specifications conform to search parameter "{specSearchQuery}"
              </p>
              <button
                onClick={() => setSpecSearchQuery('')}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-[#D4AF37] font-mono text-[10px] uppercase font-bold rounded-lg hover:border-[#D4AF37]"
              >
                Clear Search Filter
              </button>
            </div>
          )}

        </div>
      </section>

      {/* SECTION 4 - PRICING PACKAGES */}
      <section id="packages" className="py-24 relative bg-[#040404] border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <FadeIn>
              <h2 className="cn-font-heading text-3xl md:text-5xl font-bold mb-4 text-white uppercase">Client Package Tiers</h2>
              <p className="text-zinc-500 text-xs md:text-sm max-w-xl mx-auto font-light leading-relaxed">Scale your campaign frequency and visual dominance with tailored design subscriptions to match your startup or agency.</p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Frame Plan */}
            <FadeIn delay={100} className="cn-glass-card p-8 rounded-2xl relative flex flex-col justify-between">
              <div>
                <h3 className="cn-font-heading text-lg font-bold mb-2 text-white uppercase tracking-widest">Frame Plan</h3>
                <p className="text-zinc-500 text-[11.5px] font-light mb-6">Simple, informative, beautiful flyer graphics.</p>
                <div className="text-3xl font-bold text-white mb-8 border-b border-zinc-900 pb-4 font-mono">₹149<span className="text-xs text-zinc-500 font-normal"> /design</span></div>
                
                <div className="space-y-4 mb-8 font-mono text-[11px]">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                    <span className="text-zinc-400">Weekly (5 Posters)</span>
                    <span className="font-bold text-[#D4AF37]">₹749</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-400">Monthly (25 Posters)</span>
                    <span className="font-bold text-[#D4AF37]">₹2,999</span>
                  </div>
                </div>
              </div>
              <a href="#contact" className="w-full py-3 rounded-lg border border-zinc-800 text-center text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white hover:text-black transition">Select Frame Edition</a>
            </FadeIn>

            {/* Basic Plan */}
            <FadeIn delay={200} className="cn-glass-card p-8 rounded-2xl relative border-[#D4AF37]/50 shadow-xl shadow-[#D4AF37]/5 flex flex-col justify-between">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-[7.5px] font-extrabold px-3 py-1 rounded-b-md uppercase tracking-widest font-mono">Best Value</div>
              <div>
                <h3 className="cn-font-heading text-lg font-bold mb-2 text-[#D4AF37] uppercase tracking-widest">Basic Plan</h3>
                <p className="text-[#D4AF37]/70 text-[11.5px] font-light mb-6">High-resolution, ultra-clean professional visual sheets.</p>
                <div className="text-3xl font-bold text-white mb-8 border-b border-zinc-900 pb-4 font-mono">₹199<span className="text-xs text-zinc-500 font-normal"> /design</span></div>
                
                <div className="space-y-4 mb-8 font-mono text-[11px]">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                    <span className="text-zinc-400">Weekly (5 Posters)</span>
                    <span className="font-bold text-[#D4AF37]">₹1,999</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-400">Monthly (25 Posters)</span>
                    <span className="font-bold text-[#D4AF37]">₹3,999</span>
                  </div>
                </div>
              </div>
              <a href="#contact" className="w-full py-3 rounded-lg bg-[#D4AF37] text-black text-center text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition">Select Basic Edition</a>
            </FadeIn>

            {/* Standard Plan */}
            <FadeIn delay={300} className="cn-glass-card p-8 rounded-2xl relative flex flex-col justify-between">
              <div>
                <h3 className="cn-font-heading text-lg font-bold mb-2 text-white uppercase tracking-widest">Standard Plan</h3>
                <p className="text-zinc-500 text-[11.5px] font-light mb-6">Luxury elements, premium typography, fully bespoke layout.</p>
                <div className="text-3xl font-bold text-white mb-8 border-b border-zinc-900 pb-4 font-mono">₹499<span className="text-xs text-zinc-500 font-normal"> /design</span></div>
                
                <div className="space-y-4 mb-8 font-mono text-[11px]">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                    <span className="text-zinc-400">Weekly (5 Posters)</span>
                    <span className="font-bold text-[#D4AF37]">₹2,499</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-400">Monthly (25 Posters)</span>
                    <span className="font-bold text-[#D4AF37]">₹9,999</span>
                  </div>
                </div>
              </div>
              <a href="#contact" className="w-full py-3 rounded-lg border border-zinc-800 text-center text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white hover:text-black transition">Select Standard Edition</a>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* SECTION 5 - WORKFLOW PROCESS */}
      <section id="workflow" className="py-24 bg-black border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-20 animate-pulse">
            <span className="text-[#D4AF37] font-bold font-mono tracking-widest text-[9.5px] mb-4 uppercase block">Our Method</span>
            <h2 className="cn-font-heading text-3xl md:text-5xl font-bold text-white">Interactive Assembly Pipeline</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {[
              { step: "01", title: "Briefing", desc: "Consult structural assets, target audience copy, and visual styles." },
              { step: "02", title: "Layout Map", desc: "Design draft canvas geometry grids based on Swiss proportions." },
              { step: "03", title: "Colorway", desc: "Introduce gold accents, black backplates, and depth textures." },
              { step: "04", title: "Fine Polish", desc: "Refine relative contrast and adjust typographic hierarchies." },
              { step: "05", title: "Asset SLA", desc: "Deliver high-fidelity vector specs ready for immediate web print." }
            ].map((process, i) => (
              <FadeIn key={i} delay={i * 100} className="cn-glass-card p-6 text-center rounded-xl">
                <div className="w-12 h-12 mx-auto bg-black border border-[#D4AF37] rounded-full flex items-center justify-center cn-font-heading text-lg font-bold text-[#D4AF37] mb-4">
                  {process.step}
                </div>
                <h3 className="cn-font-heading text-sm font-bold mb-2 text-white uppercase tracking-wider">{process.title}</h3>
                <p className="text-zinc-500 text-[10.5px] leading-relaxed font-light">{process.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 - CONTACT FORM */}
      <section id="contact" className="py-24 relative bg-[#040404]">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <FadeIn>
              <h2 className="cn-font-heading text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
                Empower Your <br/><span className="text-[#D4AF37] font-serif">Brand Vision</span> Instantly
              </h2>
              <p className="text-zinc-500 text-sm mb-10 max-w-md font-light leading-relaxed">
                Connect directly with the CreativeNode Atelier to secure exclusive vector source templates, responsive layouts, or commission special artwork campaigns.
              </p>
              
              <div className="space-y-4 font-mono text-xs">
                <a href="tel:+916369278905" className="flex items-center gap-4 text-zinc-300 hover:text-[#D4AF37] transition group">
                  <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-[#D4AF37] transition">
                    <Phone size={14} className="text-[#D4AF37]" />
                  </div>
                  <span>+91 6369278905</span>
                </a>
                <a href="mailto:creativenode.in@gmail.com" className="flex items-center gap-4 text-zinc-300 hover:text-[#D4AF37] transition group">
                  <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-[#D4AF37] transition">
                    <Mail size={14} className="text-[#D4AF37]" />
                  </div>
                  <span>creativenode.in@gmail.com</span>
                </a>
                <a href="https://creativenode.in" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-zinc-300 hover:text-[#D4AF37] transition group">
                  <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-[#D4AF37] transition">
                    <Globe size={14} className="text-[#D4AF37]" />
                  </div>
                  <span>creativenode.in</span>
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={200} className="cn-glass-card p-8 md:p-10 rounded-2xl">
              <h3 className="cn-font-heading text-lg font-bold mb-6 text-white uppercase tracking-widest border-b border-zinc-900 pb-3">Initiate Project Inquiry</h3>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-colors font-mono" 
                    placeholder="e.g. Johnathan Doe" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-black border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-colors font-mono" 
                    placeholder="e.g. contact@business.com" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">Design Program</label>
                  <select 
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                    className="w-full bg-black border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none font-mono"
                  >
                    <option value="Social Media Posters">Social Media Posters</option>
                    <option value="Business Branding">Business Branding</option>
                    <option value="Website Design">Website Design</option>
                    <option value="Other Requirements">Other Requirements</option>
                  </select>
                </div>
                
                {submitStatus === 'success' && (
                  <div className="p-3 bg-green-950/20 border border-green-500/20 rounded-lg text-green-400 text-xs font-mono">
                    ✓ Request logged in CRM dashboard! We will follow up.
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono">
                    ⚠ Failed to submit request. Please try again.
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#D4AF37] text-black font-extrabold rounded-xl hover:bg-white transition-colors mt-4 text-xs font-mono uppercase tracking-widest disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Transmitting Details...' : 'Transmit Project Setup'}
                </button>
              </form>
            </FadeIn>

          </div>

          <div className="mt-24 pt-10 border-t border-zinc-900 text-center">
            <h1 className="cn-font-heading text-4xl md:text-7xl font-bold text-zinc-900 tracking-tighter mb-4 select-none">
              CREATIVENODE
            </h1>
            <p className="cn-font-heading text-xs text-[#D4AF37] tracking-[0.3em] uppercase mb-16">
              Design. Build. Innovate.
            </p>
            <div className="text-zinc-500 text-[10px] font-mono flex flex-col md:flex-row items-center justify-center gap-4">
              <span>&copy; {new Date().getFullYear()} CREATIVENODE. Template System Authorized.</span>
              <span className="hidden md:inline">|</span>
              <button 
                onClick={() => setViewMode('crm')} 
                className="hover:text-[#D4AF37] transition-colors flex items-center gap-2 border border-zinc-850 px-3 py-1 rounded-full text-[9px] uppercase tracking-wide cursor-pointer"
              >
                 <ShieldAlert size={12} /> Lead ledger panel
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING SYSTEM DOWNLOAD PROGRESS BOARD */}
      {downloadProgress && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-[#0d0d11]/95 border border-[#D4AF37]/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2">
            <div className="flex items-center gap-2 font-mono">
              <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Atelier Core System</span>
            </div>
            <span className="text-[9px] font-mono text-[#D4AF37] font-extrabold bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-md">
              {downloadProgress.percentage}%
            </span>
          </div>
          
          <p className="text-[11px] font-mono text-zinc-100 font-bold mb-1 truncate">
            Processing: {downloadProgress.itemName}
          </p>
          <p className="text-[10px] font-mono text-zinc-400 italic mb-3">
            {downloadProgress.stage}
          </p>

          {/* Progress Bar Container */}
          <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
            <div 
              className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-[#D4AF37] transition-all duration-300 rounded-full"
              style={{ width: `${downloadProgress.percentage}%` }}
            />
          </div>
          <div className="mt-2 text-center">
            <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
              Standard Edition Blueprinting SLA v2.4
            </span>
          </div>
        </div>
      )}

      {/* FLOATING COMPARISON BAR DRAWER */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0a0a0d]/95 border border-[#D4AF37]/40 rounded-2xl px-5 py-3 shadow-[0_25px_55px_-10px_rgba(0,0,0,0.9)] backdrop-blur-md flex flex-col sm:flex-row items-center gap-4 max-w-2xl w-[92%] animate-fade-in">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-extrabold">Compare index:</span>
            <div className="flex items-center gap-2">
              {compareIds.map(currId => {
                const specItem = PORTFOLIO_ITEMS.find(p => p.id === currId);
                return (
                  <div key={currId} className="bg-zinc-900 border border-zinc-850 pl-2.5 pr-1.5 py-1 rounded-lg flex items-center gap-2 text-[10px] font-mono font-bold text-white shadow-sm">
                    <span className="truncate max-w-[110px]">{specItem?.title}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompareIds(prev => prev.filter(x => x !== currId));
                      }}
                      className="text-zinc-500 hover:text-red-400 text-xs font-bold w-4 h-4 rounded-full hover:bg-zinc-800 flex items-center justify-center transition cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
              {compareIds.length < 2 && (
                <span className="text-[9px] font-mono text-zinc-600 italic">Select 1 more item to unlock direct side-by-side ledger...</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto justify-end border-t sm:border-t-0 border-zinc-900 pt-2 sm:pt-0">
            {compareIds.length === 2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (triggerToast) triggerToast("Opening side-by-side spec sheet comparison ledger...", "success");
                }}
                className="px-3.5 py-1.5 bg-[#D4AF37] text-black font-mono font-extrabold rounded-lg text-[9px] uppercase tracking-wider hover:bg-white transition duration-300 cursor-pointer text-center flex-1 sm:flex-none"
              >
                Compare Now
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCompareIds([]);
              }}
              className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-850 text-zinc-400 hover:text-zinc-100 rounded-lg text-[9px] font-mono uppercase tracking-wider transition duration-300 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

       {/* SPECIFICATION SIDE-BY-SIDE COMPARE MODAL */}
      {compareIds.length === 2 && (() => {
        const itemA = PORTFOLIO_ITEMS.find(p => p.id === compareIds[0]);
        const itemB = PORTFOLIO_ITEMS.find(p => p.id === compareIds[1]);

        const diffs = {
          typeface: itemA?.specs.typeface !== itemB?.specs.typeface,
          substrate: itemA?.specs.substrate !== itemB?.specs.substrate,
          proportion: itemA?.specs.proportion !== itemB?.specs.proportion,
          inkType: itemA?.specs.inkType !== itemB?.specs.inkType,
          contrastRatio: itemA?.specs.contrastRatio !== itemB?.specs.contrastRatio,
          popularity: itemA?.popularity !== itemB?.popularity,
          colors: JSON.stringify(itemA?.colors) !== JSON.stringify(itemB?.colors)
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-[#0a0a0d] border border-zinc-850 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col justify-between shadow-2xl relative my-auto"
            >
              {/* Close Button Trigger */}
              <button 
                onClick={() => setCompareIds([])}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition p-2 bg-zinc-950 border border-zinc-900 rounded-full cursor-pointer z-50"
                title="Close specification comparison matrix"
              >
                <X size={16} />
              </button>

              {/* Header section info */}
              <div className="border-b border-zinc-900 p-6 md:p-8 bg-zinc-950/20 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-[9px] text-[#D4AF37] uppercase tracking-widest block mb-1 font-extrabold text-gold-400">TECHNICAL COMPRESSION MATRIX</span>
                  <h3 className="font-display text-lg md:text-2xl font-bold text-white tracking-widest uppercase">Side-By-Side Atelier Comparison</h3>
                  <p className="text-zinc-500 text-[10px] font-mono mt-1">Measuring geometric formulas, color space swatches, contrast offsets, and type matrices.</p>
                </div>
                <div className="flex items-center gap-2.5 font-mono text-[10px]">
                  <span className="text-zinc-500 uppercase tracking-widest text-[9px]">Highlight differences</span>
                  <button
                    type="button"
                    onClick={() => setCompareHighlightDiffs(!compareHighlightDiffs)}
                    className={`px-3 py-1.5 rounded-lg border font-bold transition-all duration-300 uppercase tracking-widest text-[8.5px] cursor-pointer ${
                      compareHighlightDiffs
                        ? "bg-[#D4AF37] hover:bg-[#D4AF37]/90 border-amber-400 text-black font-extrabold"
                        : "bg-zinc-950 border-zinc-850 text-zinc-450 hover:text-zinc-200"
                    }`}
                  >
                    {compareHighlightDiffs ? "Active" : "Disabled"}
                  </button>
                </div>
              </div>

              {/* Two Column details specification comparison */}
              <div className="p-6 md:p-8 flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-zinc-900 text-left overflow-y-auto">
                {[itemA, itemB].map((mappedSpecItem, index) => {
                  if (!mappedSpecItem) return null;
                  const slideDirection = index === 0 ? -40 : 40;
                  return (
                    <motion.div 
                      key={mappedSpecItem.id} 
                      initial={{ opacity: 0, x: slideDirection }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 25, delay: 0.1 * index }}
                      className={`space-y-6 ${index === 1 ? 'md:pl-8 pt-6 md:pt-0' : ''}`}
                    >
                      {/* Compact Interactive Mockup Grid */}
                      <div className="relative h-40 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-center overflow-hidden shadow-inner p-3">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/5 via-transparent to-transparent pointer-events-none" />
                        
                        {/* Interactive Spec Poster Block representation */}
                        <div className="relative w-24 h-32 bg-zinc-950 border-[2px] border-zinc-800 rounded shadow-2xl p-2 flex flex-col justify-between"
                             style={{ backgroundColor: mappedSpecItem.colors[0] }}>
                          {/* Circle overlay watermark */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                            <div className="w-12 h-12 rounded-full border border-white" />
                          </div>
                          <span className="text-[3.5px] font-mono tracking-widest block opacity-70 text-white" id={`comp-lbl-cat-${mappedSpecItem.id}`}>{mappedSpecItem.category.toUpperCase()}</span>
                          <span className="text-[6.5px] font-bold font-display uppercase tracking-wider block text-center leading-normal my-auto line-clamp-2 text-white" id={`comp-lbl-ttl-${mappedSpecItem.id}`}>{mappedSpecItem.title}</span>
                          <div className="flex justify-between text-[4px] font-mono border-t border-white/10 pt-1 text-white">
                            <span className="truncate max-w-[35px]">{mappedSpecItem.client}</span>
                            <span className="text-[#D4AF37]">●</span>
                          </div>
                        </div>
                      </div>

                      {/* Spec Header Titles */}
                      <div className="space-y-1.5 font-mono">
                        <span className="text-zinc-[600] text-[8px] uppercase tracking-wider text-zinc-500">Design specifications</span>
                        <h4 className="text-white text-xs font-extrabold tracking-wide uppercase">{mappedSpecItem.title}</h4>
                        <p className="text-[#D4AF37] text-[10px] font-bold">{mappedSpecItem.client} • {mappedSpecItem.year}</p>
                      </div>

                      {/* Specifications table metadata */}
                      <div className="bg-zinc-950/65 border border-zinc-900/80 rounded-xl p-4 space-y-2.5 font-mono text-[9.5px]">
                        <div className={`flex justify-between border-b border-zinc-900 pb-1.5 transition-colors duration-300 p-1 rounded ${
                          compareHighlightDiffs && diffs.typeface ? 'bg-[#D4AF37]/5 border-amber-500/20' : ''
                        }`}>
                          <span className={`${compareHighlightDiffs && diffs.typeface ? 'text-gold-400 font-extrabold' : 'text-zinc-500'}`}>
                            Typeface Matrix: {compareHighlightDiffs && diffs.typeface && <span className="text-[7.5px] bg-[#D4AF37]/20 px-1 py-0.5 rounded text-gold-300 ml-1 font-bold">Diff</span>}
                          </span>
                          <span className="text-zinc-200 font-bold text-right truncate max-w-[160px]">{mappedSpecItem.specs.typeface}</span>
                        </div>

                        <div className={`flex justify-between border-b border-zinc-900 pb-1.5 transition-colors duration-300 p-1 rounded ${
                          compareHighlightDiffs && diffs.substrate ? 'bg-[#D4AF37]/5' : ''
                        }`}>
                          <span className={`${compareHighlightDiffs && diffs.substrate ? 'text-gold-400 font-extrabold' : 'text-zinc-500'}`}>
                            Poster Substrate: {compareHighlightDiffs && diffs.substrate && <span className="text-[7.5px] bg-[#D4AF37]/20 px-1 py-0.5 rounded text-gold-300 ml-1 font-bold">Diff</span>}
                          </span>
                          <span className="text-zinc-200 text-right">{mappedSpecItem.specs.substrate}</span>
                        </div>

                        <div className={`flex justify-between border-b border-zinc-900 pb-1.5 transition-colors duration-300 p-1 rounded ${
                          compareHighlightDiffs && diffs.proportion ? 'bg-[#D4AF37]/5' : ''
                        }`}>
                          <span className={`${compareHighlightDiffs && diffs.proportion ? 'text-gold-400 font-extrabold' : 'text-zinc-500'}`}>
                            Aspect Proportion: {compareHighlightDiffs && diffs.proportion && <span className="text-[7.5px] bg-[#D4AF37]/20 px-1 py-0.5 rounded text-gold-300 ml-1 font-bold">Diff</span>}
                          </span>
                          <span className="text-[#D4AF37] text-right font-bold">{mappedSpecItem.specs.proportion}</span>
                        </div>

                        <div className={`flex justify-between border-b border-zinc-900 pb-1.5 transition-colors duration-300 p-1 rounded ${
                          compareHighlightDiffs && diffs.inkType ? 'bg-[#D4AF37]/5' : ''
                        }`}>
                          <span className={`${compareHighlightDiffs && diffs.inkType ? 'text-gold-400 font-extrabold' : 'text-zinc-500'}`}>
                            Ink/Spectral Tech: {compareHighlightDiffs && diffs.inkType && <span className="text-[7.5px] bg-[#D4AF37]/20 px-1 py-0.5 rounded text-gold-300 ml-1 font-bold">Diff</span>}
                          </span>
                          <span className="text-zinc-300 text-right">{mappedSpecItem.specs.inkType}</span>
                        </div>

                        <div className={`flex justify-between border-b border-zinc-900 pb-1.5 transition-colors duration-300 p-1 rounded ${
                          compareHighlightDiffs && diffs.contrastRatio ? 'bg-[#D4AF37]/5' : ''
                        }`}>
                          <span className={`${compareHighlightDiffs && diffs.contrastRatio ? 'text-gold-400 font-extrabold' : 'text-zinc-500'}`}>
                            Contrast Color SLA: {compareHighlightDiffs && diffs.contrastRatio && <span className="text-[7.5px] bg-[#D4AF37]/20 px-1 py-0.5 rounded text-gold-300 ml-1 font-bold">Diff</span>}
                          </span>
                          <span className="text-white text-right">{mappedSpecItem.specs.contrastRatio}</span>
                        </div>

                        <div className={`flex justify-between transition-colors duration-300 p-1 rounded ${
                          compareHighlightDiffs && diffs.popularity ? 'bg-[#D4AF37]/5' : ''
                        }`}>
                          <span className={`${compareHighlightDiffs && diffs.popularity ? 'text-gold-400 font-extrabold' : 'text-zinc-500'}`}>
                            Popularity Weight: {compareHighlightDiffs && diffs.popularity && <span className="text-[7.5px] bg-[#D4AF37]/20 px-1 py-0.5 rounded text-gold-300 ml-1 font-bold">Diff</span>}
                          </span>
                          <span className="text-[#D4AF37] font-bold">{mappedSpecItem.popularity}% inquiries</span>
                        </div>
                      </div>

                      {/* Color Swatch Indicators side list */}
                      <div className={`flex items-center justify-between font-mono text-[9px] bg-zinc-950/40 p-3 rounded-lg border transition-colors duration-300 ${
                        compareHighlightDiffs && diffs.colors ? 'bg-[#D4AF37]/5 border-[#D4AF37]/25' : 'border-zinc-900'
                      }`}>
                        <span className={`${compareHighlightDiffs && diffs.colors ? 'text-[#D4AF37] font-extrabold' : 'text-zinc-500'} uppercase tracking-widest font-extrabold flex items-center gap-1`}>
                          CMYK/RGB Calibration: {compareHighlightDiffs && diffs.colors && <span className="text-[7.5px] bg-[#D4AF37]/25 px-1 py-0.5 rounded text-gold-300 font-normal">Diff</span>}
                        </span>
                        <div className="flex items-center gap-2">
                          {mappedSpecItem.colors.map((hexCode, swatchIndex) => (
                            <div key={swatchIndex} className="flex items-center gap-1">
                              <div className="w-3.5 h-3.5 rounded-full border border-black/50 shadow-sm" style={{ backgroundColor: hexCode }} title={mappedSpecItem.colorNames[swatchIndex]} />
                              <span className="text-zinc-400 text-[8px]">{hexCode}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Direct triggers inside comparison block */}
                      <div className="flex gap-2 font-mono text-[9px] uppercase stop-propagation-click">
                        <button
                          type="button"
                          onClick={() => {
                            handleDownloadPresetJSON(mappedSpecItem);
                          }}
                          className="flex-1 py-2 bg-zinc-900 hover:bg-[#D4AF37]/10 text-[#D4AF37] hover:text-[#D4AF37] border border-zinc-800 rounded-lg tracking-wider transition font-bold"
                        >
                          Preset JSON
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleDownloadSingle(mappedSpecItem, 'digital');
                          }}
                          className="flex-1 py-2 bg-zinc-900 border border-zinc-855 hover:border-[#D4AF37] text-zinc-350 hover:text-white rounded-lg tracking-wider transition"
                        >
                          Save PNG
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer with actions close */}
              <div className="border-t border-zinc-900 p-6 md:p-8 bg-[#050507] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[9px] text-zinc-500 text-left">
                <span>Standard Comparison ledger system calibrated. Verified Digital SLA v2.4</span>
                <button 
                  onClick={() => setCompareIds([])}
                  className="px-4 py-2 bg-[#D4AF37] text-black font-extrabold hover:bg-white transition text-[9px] rounded-lg tracking-wider uppercase cursor-pointer"
                >
                  Close Comparison ledger
                </button>
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* DESIGNER MASTER DETAIL MODAL - Dynamic Artist Profiles and Interactive Looks list */}
      {selectedArtist && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0a0a0d] border border-zinc-850 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedArtist(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition p-2 bg-zinc-950 border border-zinc-900 rounded-full cursor-pointer z-20"
              title="Close designer profile"
            >
              <X size={15} />
            </button>

            {/* Scrollable Container Content */}
            <div className="overflow-y-auto p-6 md:p-8 space-y-6 text-left">
              {/* Header profile card info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-zinc-900">
                <img 
                  src={selectedArtist.avatarUrl} 
                  alt={selectedArtist.name} 
                  className="w-16 h-16 rounded-2xl object-cover border border-zinc-850 shadow-inner"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono tracking-widest font-extrabold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/35 uppercase">
                    Verified Atelier partner
                  </span>
                  <h3 className="font-display text-lg md:text-2xl font-bold text-white tracking-widest mt-1">
                    {selectedArtist.name}
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-400">{selectedArtist.title} • {selectedArtist.location}</p>
                </div>
              </div>

              {/* Biography Section */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-extrabold">Biography & Design Credo</h4>
                <p className="text-zinc-400 text-xs font-light leading-relaxed font-sans">{selectedArtist.bio}</p>
              </div>

              {/* Design focuses and specialties */}
              <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Primary Typographic focus & specialty:</span>
                <p className="text-zinc-200 text-xs font-mono font-bold leading-relaxed">{selectedArtist.focusStyle}</p>
              </div>

              {/* Verified artist contact socials link list */}
              <div className="flex flex-wrap items-center gap-4 text-zinc-500 border-t border-b border-zinc-900/60 py-3.5 text-[9.5px] font-mono">
                {selectedArtist.socials.instagram && (
                  <span className="text-zinc-400">Insta: <span className="text-zinc-100 font-extrabold">{selectedArtist.socials.instagram}</span></span>
                )}
                {selectedArtist.socials.globe && (
                  <a href={selectedArtist.socials.globe} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-gold-400 transition underline decoration-[#D4AF37]/45">
                    Web: <span className="text-[#D4AF37] font-extrabold">{selectedArtist.socials.globe.replace('https://', '')}</span>
                  </a>
                )}
                {selectedArtist.socials.email && (
                  <a href={`mailto:${selectedArtist.socials.email}`} className="text-zinc-400 hover:text-white transition">
                    Inquire: <span className="text-zinc-200 font-bold underline">{selectedArtist.socials.email}</span>
                  </a>
                )}
              </div>

              {/* Interactive list of other works matching this author */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold">Designer Portfolio Inventory ({
                  PORTFOLIO_ITEMS.filter(p => getArtistForItem(p).id === selectedArtist.id).length
                } works catalogued)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PORTFOLIO_ITEMS.filter(p => getArtistForItem(p).id === selectedArtist.id).map(work => (
                    <div 
                      key={work.id} 
                      onClick={() => {
                        setSelectedArtist(null);
                        setSpecSearchQuery(work.title);
                        if (triggerToast) triggerToast(`Locating portfolio item "${work.title}" in grid...`, "success");
                        setTimeout(() => {
                          const element = document.getElementById('portfolio-section');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 400);
                      }}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-[#D4AF37]/50 hover:bg-zinc-900/20 transition duration-300 flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex flex-col text-left truncate">
                        <span className="text-[10px] font-mono text-white font-extrabold group-hover:text-gold-400 transition truncate">{work.title}</span>
                        <span className="text-[8px] font-mono text-zinc-500 uppercase mt-0.5">{work.client} • {work.year}</span>
                      </div>
                      <ChevronRight size={13} className="text-zinc-650 group-hover:text-[#D4AF37] transition duration-300 ml-1.5 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal action buttons */}
            <div className="border-t border-zinc-900 p-5 bg-black/40 text-center">
              <button 
                onClick={() => setSelectedArtist(null)}
                className="px-5 py-2 bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-lg text-[9.5px] font-mono uppercase tracking-widest transition cursor-pointer"
              >
                Close designer profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
