import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ThemeToggle from '../components/ThemeToggle';

gsap.registerPlugin(ScrollTrigger);

const clientPosters = [
  {
    clientName: "Nalam Wellness",
    campaign: "Diabetes Care & Coaching",
    description: "Science meets care, results last. Don't wait for complications—start controlling your diabetes today with personalized guidance, diet support, and lifestyle coaching.",
    avatar: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=150&q=80",
    poster: "/posters/nalam-wellness-1.jpg",
    tags: ["Diabetes Care", "Coaching", "Health"]
  },
  {
    clientName: "Nalam Wellness",
    campaign: "Real Energy, Real Results",
    description: "\"I feel more energetic now!\" A lifestyle coaching program designed to help happy clients achieve stable blood sugar, more energy, and a healthy weight.",
    avatar: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=150&q=80",
    poster: "/posters/nalam-wellness-2.jpg",
    tags: ["Success Story", "Fitness", "Wellness"]
  },
  {
    clientName: "Nalam Wellness",
    campaign: "Balanced Nutrition Guide",
    description: "Your plate decides your health. Stable blood sugar, more energy everyday, stronger immunity, and healthy weight management through whole, real foods.",
    avatar: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=150&q=80",
    poster: "/posters/nalam-wellness-3.jpg",
    tags: ["Nutrition Guide", "Diet", "Healthy Fats"]
  },
  {
    clientName: "SMR Groups",
    campaign: "Professional Control Panels",
    description: "Get professional, high-grade control panel labels, push-buttons, and status signboards. Fully customized for industrial automation and machinery.",
    avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=150&q=80",
    poster: "/posters/smr-groups-1.jpg",
    tags: ["Control Panels", "Industrial", "Signage"]
  },
  {
    clientName: "SMR Groups",
    campaign: "Foam Board Printing",
    description: "All sizes of professional foam board printing. High-quality safety slogans, quality control signages, and workspace alerts to keep teams safe and aligned.",
    avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=150&q=80",
    poster: "/posters/smr-groups-2.jpg",
    tags: ["Foam Board", "Safety signs", "ISO 9001"]
  }
];

export default function ClientPoster() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const cards = document.querySelectorAll(".profile-card");
      cards.forEach((c, i) => {
        gsap.fromTo(
          c,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            delay: i * 0.1,
          }
        );
      });

      ScrollTrigger.create({
        trigger: ".profile-grid",
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans relative transition-colors duration-300"
    >
      <header className="bg-zinc-900 dark:bg-black py-6 px-4 shadow-2xl border-b border-zinc-800">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-white tracking-widest uppercase">
            Creative Node <span className="text-zinc-500">Studio</span>
          </h1>
          <nav className="space-x-6 flex items-center">
            <a href="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Home
            </a>
            <a href="/poster" className="text-sm font-medium text-white transition-colors border-b-2 border-white pb-1">
              Poster
            </a>
            <a href="/website" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Website
            </a>
            <div className="pl-4 border-l border-zinc-800">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-20 px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight dark:text-white text-zinc-900">
            Client Poster Showcase
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Discover the custom high-impact branding and industrial marketing campaigns we've designed and delivered for our partners.
          </p>
        </div>

        <div className="profile-grid grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {clientPosters.map((p, i) => (
            <article
              key={i}
              className="profile-card bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 flex flex-col group hover:shadow-2xl transition-all duration-500"
            >
              {/* Image Container with high height to fit full posters */}
              <div className="relative h-[420px] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={p.poster}
                  alt={`${p.clientName} - ${p.campaign}`}
                  className="w-full h-full object-contain p-2 bg-zinc-100 dark:bg-zinc-850 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              <div className="px-6 pb-8 pt-0 relative flex-1 flex flex-col">
                 <div className="relative -mt-10 mb-4 flex justify-between items-end">
                   <img 
                     src={p.avatar} 
                     alt={p.clientName} 
                     className="w-20 h-20 rounded-2xl shadow-lg border-4 border-white dark:border-zinc-900 object-cover bg-zinc-200 dark:bg-zinc-700" 
                   />
                 </div>
                 <div className="mt-2 flex-1">
                   <h3 className="text-xl font-bold dark:text-white text-zinc-900 tracking-tight">{p.clientName}</h3>
                   <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase mt-0.5 mb-3">{p.campaign}</p>
                   <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                     {p.description}
                   </p>
                 </div>
                 <div className="mt-6">
                   <div className="flex flex-wrap gap-1.5 mb-4">
                     {p.tags.map((tag, tIdx) => (
                       <span key={tIdx} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-md">
                         {tag}
                       </span>
                     ))}
                   </div>
                   <button 
                     onClick={() => window.open(p.poster, '_blank')}
                     className="w-full py-3 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                   >
                     Open Full Image
                   </button>
                 </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 mt-12 bg-white dark:bg-black">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-500 font-medium">
            &copy; {new Date().getFullYear()} Creative Node Studio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
