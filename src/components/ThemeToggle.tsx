import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Sun, Moon } from 'lucide-react';

/**
 * ThemeToggle – a small floating button that toggles between dark and light mode.
 * It uses GSAP to animate the icon colour and the background transition.
 * The component adds/removes the `dark` class on the <html> element, allowing Tailwind
 * to automatically apply dark utilities throughout the site.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>(
    // Initialise from the document class list to respect user preference on load
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  // Apply the class to <html> whenever theme changes
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // GSAP background colour animation (smooth transition)
    const bg = theme === 'dark' ? '#111827' : '#ffffff'; // Tailwind gray‑900 / white
    gsap.to('html', { backgroundColor: bg, duration: 0.6, ease: 'power2.out' });
  }, [theme]);

  // Animate icon rotation on toggle
  const handleToggle = () => {
    const icon = document.getElementById('theme-icon');
    if (icon) {
      gsap.fromTo(
        icon,
        { rotation: 0 },
        { rotation: 360, duration: 0.6, ease: 'power2.out' }
      );
    }
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      id="theme-toggle"
      onClick={handleToggle}
      className="fixed bottom-4 right-4 z-50 flex items-center justify-center w-12 h-12 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg hover:scale-105 transition-transform"
      aria-label="Toggle dark/light theme"
    >
      {theme === 'dark' ? (
        <Sun id="theme-icon" className="w-6 h-6 text-yellow-400" />
      ) : (
        <Moon id="theme-icon" className="w-6 h-6 text-gray-600" />
      )}
    </button>
  );
}
