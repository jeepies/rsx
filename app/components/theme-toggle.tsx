import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '~/components/ui/button';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return (savedTheme ?? window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark'
        : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const className = 'dark';
    const bodyClass = window.document.body.classList;
    theme === 'dark' ? bodyClass.add(className) : bodyClass.remove(className);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme: string) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="transition-smooth"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
