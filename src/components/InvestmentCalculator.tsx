import React, { useState } from 'react';
import { 
  Check, Info, HelpCircle, Sliders, ChevronRight, Activity, Zap, Shield, Sparkles
} from 'lucide-react';
import { PRICING_TIERS } from '../data';

interface InvestmentCalculatorProps {
  onSelectTier: (tierId: string) => void;
}

export default function InvestmentCalculator({ onSelectTier }: InvestmentCalculatorProps) {
  const [isRetainerMode, setIsRetainerMode] = useState(false);
  
  // Custom project calculator state
  const [quantity, setQuantity] = useState(1);
  const [speed, setSpeed] = useState<'standard' | 'priority' | 'rush'>('standard');
  const [formats, setFormats] = useState<'single' | 'multi' | 'unlimited'>('single');
  const [sourceFiles, setSourceFiles] = useState(false);

  // Calculate pricing estimates live
  const calculateEstimate = () => {
    let base = 150; // starts at Basic
    
    // speed multiplier
    const speedCostMap = { standard: 0, priority: 50, rush: 120 };
    
    // formats cost
    const formatCostMap = { single: 0, multi: 40, unlimited: 100 };

    const sourceFilesCost = sourceFiles ? 50 : 0;

    const singlePosterCost = base + speedCostMap[speed] + formatCostMap[formats] + sourceFilesCost;
    return singlePosterCost * quantity;
  };

  const getRecommendedTierId = () => {
    const total = calculateEstimate();
    if (total >= 400) return 'professional';
    if (total >= 200) return 'standard';
    return 'basic';
  };

  return (
    <div className="w-full relative">
      {/* Retainer Toggle */}
      <div className="flex justify-center mb-10">
        <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-900 inline-flex">
          <button
            onClick={() => setIsRetainerMode(false)}
            className={`py-2 px-5 text-xs font-mono uppercase tracking-wider rounded-lg transition ${
              !isRetainerMode ? 'bg-gold-500 text-black font-semibold' : 'text-zinc-500 hover:text-white'
            }`}
          >
            Single Project
          </button>
          <button
            onClick={() => setIsRetainerMode(true)}
            className={`py-2 px-5 text-xs font-mono uppercase tracking-wider rounded-lg transition ${
              isRetainerMode ? 'bg-gold-500 text-black font-semibold' : 'text-zinc-500 hover:text-white'
            }`}
          >
            Retainer Bundles
          </button>
        </div>
      </div>

      {!isRetainerMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          {/* Detailed Pricing Cards (8 Columns) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRICING_TIERS.map((tier) => (
              <div 
                key={tier.id}
                className={`bg-zinc-950 border rounded-2xl p-6 flex flex-col justify-between relative transition hover:border-zinc-800 ${
                  tier.isPopular ? 'border-gold-500/80 shadow-lg shadow-gold-500/5' : 'border-zinc-900'
                }`}
              >
                {tier.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-400 text-black font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow">
                    Most Popular
                  </span>
                )}

                <div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">
                    {tier.name.split(' ')[1] || 'Tier'}
                  </span>
                  <h4 className="font-display text-lg font-bold text-white mb-2">{tier.name}</h4>
                  
                  <div className="flex items-baseline gap-1 my-4">
                    <span className="text-2xl font-outfit text-gold-400 font-extrabold">₹{tier.price}</span>
                    <span className="text-zinc-500 text-xs font-mono">/ poster flat</span>
                  </div>

                  <div className="space-y-1.5 font-mono text-[10.5px] text-zinc-500 pb-4 mb-4 border-b border-zinc-900">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-gold-500 shrink-0" />
                      <span>{tier.deliveryDays}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-gold-500 shrink-0" />
                      <span>{tier.revisionLimit}</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-6 text-xs text-zinc-400">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-tight">
                        <Check className="w-3.5 h-3.5 text-gold-400 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onSelectTier(tier.id)}
                  className={`w-full py-2.5 rounded-xl font-display text-xs font-semibold transition active:scale-95 flex items-center justify-center gap-1.5 ${
                    tier.isPopular 
                      ? 'bg-gold-500 hover:bg-gold-400 text-black' 
                      : 'border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-white hover:bg-zinc-900'
                  }`}
                >
                  Configure Spec <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Dynamic Budget Calculator Matrix (4 Columns) */}
          <div className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-zinc-900 text-[8px] font-mono text-zinc-500 border-l border-b border-zinc-800 px-3 py-1 uppercase rounded-tr-2xl rounded-bl-md">
              AI Budget Estimator
            </div>

            <div>
              <h4 className="font-display text-base font-bold text-white flex items-center gap-2 mb-1.5">
                <Sliders className="w-4 h-4 text-gold-400" /> Live Project Quote
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans mb-6">
                Calculate approximate investment instantly based on volume, licensing, speed buffers, and assets.
              </p>

              <div className="space-y-4">
                {/* Quantity slider */}
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase text-zinc-400 mb-1">
                    <span>Quantity Needed</span>
                    <span className="text-gold-400 font-bold">{quantity} {quantity === 1 ? 'Design' : 'Designs'}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full accent-gold-500 h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Turnaround speed toggles */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Turnaround Urgency</span>
                  <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800/60">
                    {(['standard', 'priority', 'rush'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpeed(s)}
                        className={`text-[9.5px] font-mono capitalize py-1.5 rounded transition ${
                          speed === s ? 'bg-gold-500 text-black font-semibold' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {s === 'rush' ? 'VIP Rush' : s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multi-Format aspects */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Cropping Bounds</span>
                  <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800/60">
                    {(['single', 'multi', 'unlimited'] as const).map((form) => (
                      <button
                        key={form}
                        onClick={() => setFormats(form)}
                        className={`text-[9.5px] font-mono capitalize py-1.5 rounded transition ${
                          formats === form ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {form === 'single' ? 'Single (1:1)' : form === 'multi' ? '2 Ratios' : 'All Ratios'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Source File request toggle */}
                <div className="flex items-center justify-between bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-900">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">Layered Source (.PSD/.AI)</span>
                  <button
                    onClick={() => setSourceFiles(!sourceFiles)}
                    className={`h-5 w-10 p-0.5 rounded-full transition-colors flex items-center ${
                      sourceFiles ? 'bg-gold-500' : 'bg-zinc-800'
                    }`}
                  >
                    <div className={`h-4 w-4 bg-black rounded-full transition-transform ${
                      sourceFiles ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Total Display */}
            <div className="border-t border-zinc-900 pt-5 mt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-zinc-500">ESTIMATED INVESTMENT</span>
                <span className="text-2xl font-outfit text-white font-extrabold">₹{calculateEstimate()}</span>
              </div>
              
              <div className="bg-gold-950/20 border border-gold-900/30 rounded-xl p-3 flex gap-2 items-start mb-4">
                <Activity className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                <p className="text-[9.5px] text-gold-200/90 leading-relaxed font-sans">
                  Recommendation: Based on parameters, we advise selecting <strong>{PRICING_TIERS.find(t=>t.id===getRecommendedTierId())?.name}</strong>.
                </p>
              </div>

              <button
                onClick={() => onSelectTier(getRecommendedTierId())}
                className="w-full bg-gold-400 hover:bg-gold-300 text-black py-2 rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-gold-500/10 transition flex items-center justify-center gap-1"
              >
                Set Spec To This Tier <Sparkles className="w-3 h-3 text-black" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Symmetrical Retainer / Monthly Packages */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Base Retainer */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-800 transition">
            <div>
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Retainer Option 01</span>
              <h4 className="font-display text-lg font-bold text-white mb-2">Startup Content Stream</h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Ideal for scaling brands requiring consistent high-prestige social layouts, notifications, or promo covers monthly.
              </p>
              
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-3xl font-outfit text-gold-400 font-extrabold">₹1,999</span>
                <span className="text-zinc-500 text-xs font-mono">/ month</span>
              </div>

              <ul className="space-y-3 pb-6 mb-6 border-b border-zinc-900 text-xs text-zinc-400">
                <li className="flex items-start gap-2 leading-tight">
                  <Check className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Up to 12 Creative Social Poster Designs monthly</span>
                </li>
                <li className="flex items-start gap-2 leading-tight">
                  <Check className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Dual aspect ratios included on every design (Feed + Story)</span>
                </li>
                <li className="flex items-start gap-2 leading-tight">
                  <Check className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>24 Hour Priority SLA delivery queue</span>
                </li>
                <li className="flex items-start gap-2 leading-tight">
                  <Check className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Layered source deliverables library (.PSD)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectTier('standard')}
              className="w-full py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-900/40 text-white font-semibold text-xs transition flex items-center justify-center gap-1"
            >
              Configure Standard Brief <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Premium Retainer */}
          <div className="bg-zinc-950 border border-gold-500/60 rounded-2xl p-6 flex flex-col justify-between hover:border-gold-500 transition relative">
            <span className="absolute -top-3 right-6 bg-gold-400 text-black font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow">
              Premium Agency Cap
            </span>

            <div>
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Retainer Option 02</span>
              <h4 className="font-display text-lg font-bold text-white mb-2">Corporate Dominance Elite</h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Unlimited creative access, total brand visual control, dedicated high art rendering, with custom branding assets.
              </p>
              
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-3xl font-outfit text-gold-400 font-extrabold">₹2,999</span>
                <span className="text-zinc-500 text-xs font-mono">/ month</span>
              </div>

              <ul className="space-y-3 pb-6 mb-6 border-b border-zinc-900 text-xs text-zinc-400">
                <li className="flex items-start gap-2 leading-tight">
                  <Check className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Unlimited visual creations, banner grids, and promos</span>
                </li>
                <li className="flex items-start gap-2 leading-tight">
                  <Check className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Dedicated Creative Director whatsapp liaison</span>
                </li>
                <li className="flex items-start gap-2 leading-tight">
                  <Check className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>12 Hour Super Urgent emergency rush option</span>
                </li>
                <li className="flex items-start gap-2 leading-tight">
                  <Check className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Vector logo development and print-ready banner layout packs</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectTier('professional')}
              className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-semibold text-xs transition flex items-center justify-center gap-1 hover:shadow-lg hover:shadow-gold-500/10"
            >
              Secure Premium VIP brief <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
