import React, { useState } from "react";

export function HeaderNav({ activePage, setActivePage, onNavigateSection }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page, sectionId) => {
    if (page === "tools") {
      window.location.hash = "#/tools";
      setActivePage("tools");
    } else {
      window.location.hash = "#/";
      setActivePage("portfolio");
      if (sectionId) {
        setTimeout(() => {
          onNavigateSection?.(sectionId);
        }, 50);
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/80 transition-all">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("portfolio", "hero");
          }}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center font-bold text-black text-sm shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform">
            VR
          </div>
          <div>
            <span className="font-bold text-base tracking-wide text-white group-hover:text-green-400 transition-colors">
              Van Rodiansyah
            </span>
            <span className="block text-[10px] font-mono text-gray-400 -mt-0.5">
              Full Stack & Dev Tools
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-gray-900/80 p-1.5 rounded-full border border-gray-800">
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("portfolio");
            }}
            className={`px-5 py-2 rounded-full text-xs font-mono font-medium transition-all ${
              activePage === "portfolio"
                ? "bg-green-500 text-black font-semibold shadow-md shadow-green-500/20"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            🏠 Portfolio
          </a>

          <a
            href="#/tools"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("tools");
            }}
            className={`px-5 py-2 rounded-full text-xs font-mono font-medium transition-all flex items-center gap-2 ${
              activePage === "tools"
                ? "bg-green-500 text-black font-semibold shadow-md shadow-green-500/20"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>🛠️ Formatters & Viewers</span>
            <span className="bg-cyan-400/20 text-cyan-300 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
              URL: /tools
            </span>
          </a>
        </nav>

        {/* Right CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          {activePage === "portfolio" ? (
            <a
              href="#/tools"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("tools");
              }}
              className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-cyan-500/20 hover:from-green-500/30 hover:to-cyan-500/30 border border-green-500/30 text-green-400 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2"
            >
              <span>⚡ Open Tools (/tools)</span>
            </a>
          ) : (
            <a
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("portfolio");
              }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-xs font-mono font-medium transition-all"
            >
              ← Back to Portfolio
            </a>
          )}
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
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("portfolio");
            }}
            className={`block w-full text-left px-4 py-2.5 rounded-xl font-mono text-sm transition-colors ${
              activePage === "portfolio" ? "bg-green-500/20 text-green-400 font-bold" : "text-gray-300"
            }`}
          >
            🏠 Portfolio (/)
          </a>
          <a
            href="#/tools"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("tools");
            }}
            className={`block w-full text-left px-4 py-2.5 rounded-xl font-mono text-sm transition-colors ${
              activePage === "tools" ? "bg-green-500/20 text-green-400 font-bold" : "text-gray-300"
            }`}
          >
            🛠️ Formatters & Viewers (/tools)
          </a>
        </div>
      )}
    </header>
  );
}
