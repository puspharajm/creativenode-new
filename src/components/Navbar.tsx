// Premium Navbar component with glass morphism and refined styling
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LocalUser, auth } from '../auth';
import { LogOut, User as UserIcon, Menu, X, Crown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  user: LocalUser | null;
  setUser: (u: LocalUser | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for glass morphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    localStorage.removeItem('creativenode_profile_name');
    localStorage.removeItem('creativenode_profile_avatar');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/portfolio', label: 'Portfolio' },
    { path: '/atelier', label: 'Atelier' },
    { path: '/services', label: 'Services' },
    { path: '/investment', label: 'Investment' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 transition-all duration-300 ${
        scrolled
          ? 'bg-zinc-950/85 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-zinc-800/50'
          : 'bg-zinc-950/50 backdrop-blur border-b border-zinc-800/30'
      }`}
    >
      {/* Logo Section */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Link to="/" className="text-gold-400 font-mono text-lg uppercase tracking-wider flex items-center gap-2">
            CreativeNode
            <Crown className="w-4 h-4 text-gold-400/70" />
          </Link>
          <div className="absolute -inset-1 rounded-full bg-gold-400/5 blur-md" />
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-1">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`relative px-3.5 py-1.5 font-mono text-sm transition-all duration-250 rounded-lg ${
              isActive(link.path)
                ? 'text-white bg-zinc-800/50'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
            }`}
          >
            {link.label}
            {isActive(link.path) && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute inset-0 bg-gold-400/10 rounded-lg border border-gold-400/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              />
            )}
          </Link>
        ))}
      </div>

      {/* User Section */}
      <div className="flex items-center space-x-3">
        {user ? (
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-black" />
              </div>
              <span className="text-zinc-200 font-mono text-sm hidden lg:inline">
                {user.displayName || user.email?.split('@')[0]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-all duration-250"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center space-x-2">
            <Link
              to="/login"
              className="px-3 py-1.5 font-mono text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/30 rounded-lg transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-3 py-1.5 font-mono text-sm bg-gold-400/10 hover:bg-gold-400/20 text-gold-400 rounded-lg transition-all border border-gold-400/20"
            >
              Get Started
            </Link>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-zinc-800/30 hover:bg-zinc-700/30 transition-all"
        >
          {mobileMenuOpen ? (
            <X className="w-4 h-4 text-zinc-300" />
          ) : (
            <Menu className="w-4 h-4 text-zinc-300" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="absolute top-full left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50 shadow-2xl shadow-black/10 md:hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 font-mono text-sm rounded-lg transition-all ${
                    isActive(link.path)
                      ? 'text-white bg-zinc-800/50'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="pt-2 border-t border-zinc-800/50 mt-2 space-y-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 font-mono text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/30 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 font-mono text-sm text-gold-400 hover:bg-gold-400/10 rounded-lg"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};