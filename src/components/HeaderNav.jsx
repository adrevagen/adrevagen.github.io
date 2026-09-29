import React, { useState } from "react";

const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

export function HeaderNav({ onNavigateSection }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    onNavigateSection?.(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/80 transition-all">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => handleNavClick("hero")}
          className="flex items-center gap-3 text-left group bg-transparent border-none cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center font-bold text-black text-sm shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform">
            VR
          </div>
          <div>
            <span className="font-bold text-base tracking-wide text-white group-hover:text-green-400 transition-colors">
              Van Rodiansyah
            </span>
            <span className="block text-[10px] font-mono text-gray-400 -mt-0.5">
              Full Stack Developer
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-gray-900/80 p-1.5 rounded-full border border-gray-800">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => handleNavClick(section.id)}
              className="px-4 py-2 rounded-full text-xs font-mono font-medium transition-all text-gray-300 hover:text-white hover:bg-white/5"
            >
              {section.label}
            </button>
          ))}
        </nav>

        {/* Right CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleNavClick("contact")}
            className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-cyan-500/20 hover:from-green-500/30 hover:to-cyan-500/30 border border-green-500/30 text-green-400 rounded-xl text-xs font-mono font-medium transition-all"
          >
            Let's Connect
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-gray-950 border-b border-gray-800">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => handleNavClick(section.id)}
              className="block w-full text-left px-4 py-2.5 rounded-xl font-mono text-sm transition-colors text-gray-300 hover:bg-green-500/20 hover:text-green-400"
            >
              {section.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
