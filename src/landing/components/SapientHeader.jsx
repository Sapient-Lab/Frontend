import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, FlaskConical, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SapientHeader = () => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved !== null) return saved === "dark";
    return true;
  });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [dark]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "Capabilities", href: "#capabilities" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-cyan-500/20" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <motion.div 
          className="flex items-center gap-3 cursor-pointer group"
          whileHover={{ scale: 1.05 }}
        >
          <div className="relative">
            <FlaskConical className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <motion.div
              className="absolute inset-0 bg-cyan-400 rounded-full blur-md opacity-50 dark:opacity-100"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="font-display text-lg font-bold tracking-wider text-cyan-700 dark:text-cyan-400">
            SAPIENT LAB AI
          </span>
          <span className="hidden md:inline-block text-xs text-gray-500 dark:text-gray-500 font-mono border-l border-gray-300 dark:border-gray-700 pl-3">
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-mono text-gray-700 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-300 relative group"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-cyan-600 dark:bg-cyan-400 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden md:inline-flex font-mono text-xs font-semibold tracking-wider px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-600 text-white"
          >
            SIGN IN
          </Link>

          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg border border-gray-300 dark:border-cyan-500/30 hover:bg-gray-100 dark:hover:bg-cyan-500/10 transition-all duration-300"
            aria-label="Toggle theme"
          >
            {dark ? (
              <Sun size={18} className="text-yellow-500" />
            ) : (
              <Moon size={18} className="text-gray-700" />
            )}
          </button>
        

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-gray-300 dark:border-cyan-500/30"
          >
            {mobileMenuOpen ? <X size={20} className="text-gray-700 dark:text-gray-300" /> : <Menu size={20} className="text-gray-700 dark:text-gray-300" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-t border-gray-200 dark:border-cyan-500/20"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-mono text-gray-700 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 py-2 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="font-mono text-sm font-semibold tracking-wider px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-600 text-white mt-2 text-center"
              >
                SIGN IN
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default SapientHeader;