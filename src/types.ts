export interface PosterTemplate {
  id: string;
  title: string;
  subtitle: string;
  details: string;
  theme: string;
  bgType: 'color' | 'image' | 'gradient';
  bgValue: string;
  accentColor: string;
  textColor: string;
  fontTitle: string;
  fontSubtitle: string;
  badge?: string;
  align: 'left' | 'center' | 'right';
  geometricElement?: 'circle' | 'lines' | 'grid' | 'border' | 'none';
  category: 'fitness' | 'fashion' | 'minimalist' | 'offers' | 'all';
  keywords?: string[];
  archived?: boolean;
  status?: 'Live' | 'Pending Approval' | 'Draft' | 'Archived';
  orderIndex?: number;
  expiryDate?: string; // Auto expiration date in 'YYYY-MM-DD' format
  dateCreated?: string; // Creation date in ISO YYYY-MM-DD or full format
}

export interface PosterComposition {
  title: string;
  subtitle: string;
  details: string;
  theme: string;
  bgType: 'color' | 'image' | 'gradient';
  bgValue: string;
  accentColor: string;
  textColor: string;
  fontTitle: string;
  fontSubtitle: string;
  align: 'left' | 'center' | 'right';
  geometricElement: 'circle' | 'lines' | 'grid' | 'border' | 'none';
  customBackgroundFile?: string; // fallback if they uploaded a background URL
}

export interface DesignBrief {
  id: string;
  createdAt: string;
  clientName: string;
  contactChannel: 'whatsapp' | 'instagram' | 'call' | 'email';
  contactValue: string;
  composition: PosterComposition;
  selectedTier: string; // e.g. "basic", "standard", "professional"
  deliverySpeed: 'express' | 'standard';
  extraNotes?: string;
  status?: 'Draft' | 'In Production' | 'Proof Ready' | 'Finished';
}

export interface ServiceItem {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
  duration: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  deliveryDays: string;
  revisionLimit: string;
  features: string[];
  isPremium: boolean;
  isPopular: boolean;
}
