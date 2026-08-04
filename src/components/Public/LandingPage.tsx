import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  MapPin,
  CheckCircle,
  PhoneCall,
  Download,
  Compass,
  Building,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Award,
  Trees,
  Car,
  FileCheck,
  Send,
  LogIn,
  Home,
  Tag,
  Calendar,
  Sparkles,
  Check,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/LandingPage.css';

interface LandingPageProps {
  onNavigateToMap: () => void;
  onOpenLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToMap, onOpenLogin }) => {
  const { plots } = useApp();
  const { user: authUser, logout } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeNavSection, setActiveNavSection] = useState<string>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeatureIdx, setActiveFeatureIdx] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [siteVisitForm, setSiteVisitForm] = useState({
    name: '',
    phone: '',
    plotSize: "25' x 50' (1250 sq.ft)",
    visitDate: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const availableCount = plots.filter((p) => p.status === 'available').length;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteVisitForm.name || !siteVisitForm.phone) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setSiteVisitForm({ name: '', phone: '', plotSize: "25' x 50' (1250 sq.ft)", visitDate: '' });
    }, 4000);
  };

  const scrollToSection = (id: string, sectionKey: string) => {
    setActiveNavSection(sectionKey);
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'Subharambh Green City plot rates kya hain?',
      a: 'Plot rates starting at ₹1,200 / sq.ft on 40 Ft Main Boulevard Road, ₹1,000 / sq.ft in Block B (Park Facing), aur ₹900 / sq.ft in Block C (Garden Facing).',
    },
    {
      q: 'Kya Registry aur Daakhil Kharij (Mutation) ki guarantee hai?',
      a: 'Ji haan, 100% Clear Title Land hai. Booking ke 90 dino ke andar official Sub-Registrar Office me Aapke naam Registry aur Daakhil Kharij complete kara kar di jaati hai.',
    },
    {
      q: 'Site Visit ke liye cab / transport facility available hai?',
      a: 'Haan! Hum Lucknow aur Amethi se FREE Pick & Drop facility provide karte hain. Aap screen par दिए gaye form se ya phone call karke Free Site Visit book kar sakte hain.',
    },
    {
      q: 'Kya Plots par Bank Loan ki suvidha hai?',
      a: 'Ji haan, sabhi leading banks (SBI, HDFC, ICICI, Bank of Baroda) aur NBFCs se upto 80% tak easy home/land loan approval facility milti hai.',
    },
    {
      q: 'Township me kya-kya amenities di ja rahi hain?',
      a: '50 Ft Grand Entrance Gate, 40 Ft & 30 Ft RCC Wide Roads, Underground Water Pipeline, Solar Street Lights, Gated Security Guard Entry, Mandir Zone, Commercial Shops, aur Lush Green Central Parks.',
    },
  ];

  // Nav link definitions for DRY rendering
  const navLinks = [
    { key: 'home',    label: 'Home',       icon: <Home size={15} />,     scrollId: 'top' },
    { key: 'project', label: 'Project',    icon: <Building size={15} />, scrollId: 'features' },
    { key: 'map',     label: 'Layout Map', icon: <MapPin size={15} />,   scrollId: 'map-action' },
    { key: 'pricing', label: 'Pricing',    icon: <Tag size={15} />,      scrollId: 'how-it-works' },
    { key: 'gallery', label: 'Gallery',    icon: <Trees size={15} />,    scrollId: 'government' },
    { key: 'contact', label: 'Contact',    icon: <PhoneCall size={15} />,scrollId: 'book-visit' },
  ];

  const handleNavClick = (key: string, scrollId: string) => {
    setIsMobileMenuOpen(false);
    if (key === 'map') {
      setActiveNavSection('map');
      onNavigateToMap();
      return;
    }
    scrollToSection(scrollId, key);
  };

  return (
    <div className="lovable-landing-container">

      {/* ═══════════════════════════════════════════════════════════════
          PREMIUM ENTERPRISE FLOATING GLASS NAVBAR
          Mercury-inspired: cinematic dark, 72px height, backdrop blur,
          subtle glass border, animated active indicator
      ═══════════════════════════════════════════════════════════════ */}
      <div className={`sgc-navbar-wrapper${isScrolled ? ' scrolled' : ''}`}>
        <motion.header
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="sgc-navbar"
        >
          <div className="sgc-navbar-inner">

            {/* ── BRAND LOGO + TEXT ── */}
            <motion.div
              className="sgc-brand"
              role="button"
              tabIndex={0}
              onClick={() => scrollToSection('top', 'home')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  scrollToSection('top', 'home');
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <div className="sgc-logo-ring">
                <img
                  src="./assets/logo_and_entrance.jpg"
                  alt="Shubharambh Green City Logo"
                  className="sgc-logo-img"
                  width={38}
                  height={38}
                  decoding="async"
                />
                <div className="sgc-logo-glow" />
              </div>
              <div className="sgc-brand-text">
                <span className="sgc-brand-name">SHUBHARAMBH</span>
                <span className="sgc-brand-tag">Green City Township</span>
              </div>
            </motion.div>

            {/* ── DESKTOP CENTRE NAV ── */}
            <nav className="sgc-desktop-nav" aria-label="Main navigation">
              <ul className="sgc-nav-list">
                {navLinks.map((link) => {
                  const isActive = activeNavSection === link.key;
                  return (
                    <li key={link.key} className="sgc-nav-item">
                      <motion.button
                        className={`sgc-nav-btn${isActive ? ' active' : ''}`}
                        onClick={() => handleNavClick(link.key, link.scrollId)}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      >
                        <span className="sgc-nav-icon">{link.icon}</span>
                        <span className="sgc-nav-label">{link.label}</span>
                        {isActive && (
                          <motion.span
                            className="sgc-nav-active-dot"
                            layoutId="sgc-nav-active-dot"
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                      </motion.button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* ── RIGHT ACTIONS ── */}
            <div className="sgc-nav-actions">
              {/* Login / Sign-out ghost button */}
              {authUser ? (
                <motion.button
                  className="sgc-ghost-btn"
                  onClick={logout}
                  title="Sign Out"
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  <LogIn size={15} />
                  <span>Sign out</span>
                  <span className="sgc-role-chip">{authUser.role}</span>
                </motion.button>
              ) : (
                <motion.button
                  className="sgc-ghost-btn"
                  onClick={() => { if (onOpenLogin) onOpenLogin(); else window.location.href = '#login'; }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  <LogIn size={15} />
                  <span>Login</span>
                </motion.button>
              )}

              {/* Primary CTA */}
              <motion.button
                className="sgc-cta-btn"
                onClick={onNavigateToMap}
                whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(14,165,233,0.55)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Compass size={15} />
                <span>View Plots</span>
              </motion.button>

              {/* Mobile hamburger */}
              <motion.button
                className="sgc-hamburger"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                whileTap={{ scale: 0.92 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMobileMenuOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <X size={22} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Menu size={22} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* ── MOBILE DRAWER MENU ── */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="sgc-mobile-drawer"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <nav aria-label="Mobile navigation">
                <ul className="sgc-mobile-nav-list">
                  {navLinks.map((link, i) => (
                    <motion.li
                      key={link.key}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <button
                        className={`sgc-mobile-nav-btn${activeNavSection === link.key ? ' active' : ''}`}
                        onClick={() => handleNavClick(link.key, link.scrollId)}
                      >
                        <span className="sgc-mobile-nav-icon">{link.icon}</span>
                        <span>{link.label}</span>
                        {activeNavSection === link.key && (
                          <span className="sgc-mobile-active-bar" />
                        )}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Mobile drawer footer actions */}
              <div className="sgc-mobile-drawer-actions">
                {authUser ? (
                  <button className="sgc-mobile-ghost-btn" onClick={() => { setIsMobileMenuOpen(false); logout(); }}>
                    <LogIn size={16} /> Sign out ({authUser.role})
                  </button>
                ) : (
                  <button className="sgc-mobile-ghost-btn" onClick={() => { setIsMobileMenuOpen(false); if (onOpenLogin) onOpenLogin(); }}>
                    <LogIn size={16} /> Login to Dashboard
                  </button>
                )}
                <button className="sgc-mobile-cta-btn" onClick={() => { setIsMobileMenuOpen(false); onNavigateToMap(); }}>
                  <Compass size={16} /> Explore 980 Plots
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MOBILE DRAWER BACKDROP ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="sgc-mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Announcement Banner */}
      <div className="announcement-banner">
        <span>🎉 <strong>SPECIAL LAUNCH OFFER:</strong> Get 40 Ft Main Boulevard Plots at ₹1,200/sq.ft • Free Site Visit Available Today!</span>
      </div>

      {/* ═══════════════════════════════════════════════════════
          HERO — Premium 2-Column Layout
          Project-specific branding · Shubharambh Green City
          ═══════════════════════════════════════════════════════ */}
      <div className="mercury-hero-wrapper" id="home">
        {/* Ambient radial background glows */}
        <div className="hero-ambient-glow-circle-1" />
        <div className="hero-ambient-glow-circle-2" />
        <div className="hero-ambient-glow-circle-3" />

        <section className="hero-section">

          {/* ── LEFT COLUMN: Typography + CTAs + Stats ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="hero-left"
          >
            {/* Pill badge */}
            <div className="mercury-pill-badge">
              <Sparkles size={13} color="#34d399" />
              60-BIGHA MASTER PLANNED TOWNSHIP · AMETHI, U.P.
            </div>

            {/* Three-line headline lockup */}
            <h1 className="hero-headline">
              <span className="hero-brand-line">Shubharambh Green City</span>
              <span className="hero-tagline-primary">Apna Ghar,{' '}
                <span className="hero-gradient-text">Apni Zameen</span>
              </span>
              <span className="hero-tagline-secondary">Better Future Starts Here</span>
            </h1>

            {/* Subheading */}
            <p className="hero-subheading">
              Lucknow–Varanasi Highway connected township with 40 Ft Main Boulevard Road, Gated Security, Underground Drainage, and 100% Instant Sub-Registrar Registry guarantee.
            </p>

            {/* CTA buttons */}
            <div className="hero-cta-buttons">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 14px 32px rgba(14,165,233,0.55)' }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary-gradient"
                onClick={onNavigateToMap}
              >
                <Compass size={17} />
                <span>Explore Layout Map</span>
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.02, borderColor: 'rgba(52,211,153,0.5)', color: '#34d399' }}
                whileTap={{ scale: 0.98 }}
                href="./assets/layout_plan_master.pdf"
                download="Shubharambh_Green_City_Layout.pdf"
                className="btn-secondary-outline"
              >
                <Download size={17} />
                <span>Download Brochure</span>
              </motion.a>
            </div>

            {/* 4 township stats in 2×2 glass grid */}
            <div className="mercury-stats-grid">
              <div className="mercury-stat-card">
                <span className="stat-num">{availableCount}+</span>
                <span className="stat-desc">Plots Available</span>
              </div>
              <div className="mercury-stat-card">
                <span className="stat-num">40 Ft</span>
                <span className="stat-desc">Main Boulevard Road</span>
              </div>
              <div className="mercury-stat-card">
                <span className="stat-num">90 Days</span>
                <span className="stat-desc">Fast-Track Registry</span>
              </div>
              <div className="mercury-stat-card">
                <span className="stat-num">100%</span>
                <span className="stat-desc">Clear Title Guarantee</span>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT COLUMN: Floating Glass Image Card + Badges ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="hero-right"
          >
            {/* Floating animated trust badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="floating-badge badge-1"
            >
              <Check size={13} /> 980 Plots
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
              className="floating-badge badge-2"
            >
              <Check size={13} /> Live Availability
            </motion.div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut' }}
              className="floating-badge badge-3"
            >
              <Check size={13} /> RERA Approved
            </motion.div>

            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="floating-badge badge-4"
            >
              <Check size={13} /> 40 Ft Road
            </motion.div>

            {/* Main image card */}
            <div className="mercury-image-card-wrapper">
              <img
                src="./assets/logo_and_entrance.jpg"
                alt="Shubharambh Green City Grand Entrance Gate"
                className="hero-preview-img"
              />
              <div className="hero-card-bottom-bar">
                <div className="hero-card-title-text">
                  <h4>स्वागतं — आपका हार्दिक अभिनंदन</h4>
                  <p>
                    <MapPin size={13} color="#34d399" />
                    Village Hasnapur, Amethi, Lucknow Road
                  </p>
                </div>
                <button
                  className="sehat-get-started-btn"
                  onClick={onNavigateToMap}
                  style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                >
                  View 980 Plots →
                </button>
              </div>
            </div>
          </motion.div>

        </section>
      </div>

      {/* STACKED FEATURE CARD DECK (6 FEATURES) */}
      <section className="features-section" id="features">
        {(() => {
          const featureDeck = [
            {
              id: 'road',
              icon: <Car size={26} color="#38bdf8" />,
              title: '40 Ft & 30 Ft Wide Roads',
              desc: 'Chaudi aur paka RCC roads wide boulevards ke sath har plot tak aasan pahunch sunishchit karti hain.',
              color: '#38bdf8',
            },
            {
              id: 'security',
              icon: <Shield size={26} color="#34d399" />,
              title: '24x7 Gated Security Entry',
              desc: '50 Ft Grand Gate entry, CCTV surveillance cameras, aur security guards safety ke liye 24/7 tayar.',
              color: '#34d399',
            },
            {
              id: 'parks',
              icon: <Trees size={26} color="#fbbf24" />,
              title: 'Mandir & Central Parks',
              desc: 'Shant vatavaran ke liye dedicated Shri Ganesha Mandir zone aur bachon ke liye green parks.',
              color: '#fbbf24',
            },
            {
              id: 'commercial',
              icon: <Building size={26} color="#f472b6" />,
              title: 'Commercial Shops Zone',
              desc: 'Rozmarra ki zarooraton ke liye dedicated 20,440 sq.ft Commercial Market aur Mixed-Use Zone.',
              color: '#f472b6',
            },
            {
              id: 'registry',
              icon: <FileCheck size={26} color="#a78bfa" />,
              title: 'Instant Registry & Mutation',
              desc: '100% Clear Title Land. Booking ke baad 90 dino ke andar complete Legal Registry aur Daakhil-Kharij.',
              color: '#a78bfa',
            },
            {
              id: 'loan',
              icon: <Award size={26} color="#f87171" />,
              title: '80% Bank Loan Facility',
              desc: 'Sabhi pramukh sarkari aur private banks se easy EMI installment aur instant plot loan approval.',
              color: '#f87171',
            },
          ];

          const handleNext = () => {
            setActiveFeatureIdx((prev) => (prev + 1) % featureDeck.length);
          };

          const handlePrev = () => {
            setActiveFeatureIdx((prev) => (prev - 1 + featureDeck.length) % featureDeck.length);
          };

          const visibleIndices = [
            activeFeatureIdx,
            (activeFeatureIdx + 1) % featureDeck.length,
            (activeFeatureIdx + 2) % featureDeck.length,
          ];

          return (
            <div className="features-deck-wrapper">
              {/* Left Column (40%) */}
              <div className="features-deck-left">
                <span className="section-badge">TOWNSHIP HIGHLIGHTS</span>
                <h2>Kyun Khas Hai Shubharambh Green City?</h2>
                <p>Adhunik suvidhaon aur shandar location ke sath premium residential plots</p>

                <div className="features-controls">
                  <div className="features-counter">
                    <span className="counter-current">{String(activeFeatureIdx + 1).padStart(2, '0')}</span>
                    <span className="counter-divider">/</span>
                    <span className="counter-total">{String(featureDeck.length).padStart(2, '0')}</span>
                  </div>

                  <div className="features-nav-btns">
                    <button
                      className="feature-nav-btn"
                      onClick={handlePrev}
                      aria-label="Previous Feature"
                      type="button"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      className="feature-nav-btn"
                      onClick={handleNext}
                      aria-label="Next Feature"
                      type="button"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="features-dots">
                  {featureDeck.map((_, i) => (
                    <button
                      key={i}
                      className={`feature-dot ${i === activeFeatureIdx ? 'active' : ''}`}
                      onClick={() => setActiveFeatureIdx(i)}
                      aria-label={`Go to feature ${i + 1}`}
                      type="button"
                    />
                  ))}
                </div>
              </div>

              {/* Right Column (60% Stacked Cards) */}
              <div className="features-deck-right">
                <div className="card-stack-container">
                  {visibleIndices.map((featureIdx, stackOffset) => {
                    const item = featureDeck[featureIdx];
                    const isTop = stackOffset === 0;
                    const scales = [1, 0.94, 0.88];
                    const yOffsets = [0, 20, 40];
                    const zIndices = [30, 20, 10];
                    const rotations = [0, 2, -2];
                    const opacities = [1, 0.75, 0.5];

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={false}
                        animate={{
                          scale: scales[stackOffset],
                          y: yOffsets[stackOffset],
                          rotate: rotations[stackOffset],
                          opacity: opacities[stackOffset],
                          zIndex: zIndices[stackOffset],
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 320,
                          damping: 28,
                        }}
                        className={`stacked-feature-card ${isTop ? 'active-card' : ''}`}
                        onClick={() => {
                          if (!isTop) handleNext();
                        }}
                        style={{
                          cursor: isTop ? 'default' : 'pointer',
                        }}
                      >
                        <div className="card-accent-bar" style={{ background: item.color }} />
                        <div
                          className="feature-icon-box"
                          style={{
                            background: `${item.color}15`,
                            borderColor: `${item.color}30`,
                          }}
                        >
                          {item.icon}
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* 3-STEP BUYING PROCESS */}
      <section className="steps-section" id="how-it-works">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="section-header"
        >
          <span className="section-badge">EASY BUYING PROCESS</span>
          <h2>Sirf 3 Aasan Kadam Me Apne Plot Ke Malik Banein</h2>
          <p>Koi mushkil documentation nahi, bilkul clear aur transparent process</p>
        </motion.div>

        <div className="steps-grid">
          {[
            {
              step: '1',
              title: 'Interactive Map Par Plot Chunein',
              desc: 'Hamare Interactive 2D Map se Block A, B ya C me apna pasandida plot, dimension aur facing filter karein.',
              icon: <Compass size={22} color="#0ea5e9" />,
            },
            {
              step: '2',
              title: 'Free Site Visit Ya Token Amount Book Karein',
              desc: 'Free Cab se site visit karein aur sirf 5% Token Amount dekar apna plot instant hold/reserve karein.',
              icon: <Calendar size={22} color="#34d399" />,
            },
            {
              step: '3',
              title: 'Registry & Possession Hath Me Lein',
              desc: '90 dino me baki payment complete karein aur official Sub-Registrar office me apne naam registry praapt karein.',
              icon: <FileCheck size={22} color="#fbbf24" />,
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.12 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="step-card"
            >
              <div className="step-card-header">
                <div className="step-number">{item.step}</div>
                <div className="step-icon-glow">{item.icon}</div>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* GOVERNMENT & LEGAL ASSURANCE CARD */}
      <section className="trust-card-section" id="government">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="trust-card-inner"
        >
          <div className="trust-card-left">
            <span className="trust-badge">100% LEGAL GUARANTEE</span>
            <h2>Zameen Ki Clean Title Aur Legal Transparency</h2>
            <p>
              Shubharambh Green City Gram Panchayat approved aur Daakhil-Kharij verified township hai. Har khareed ke sath
              aapko official Digital Payment Receipt, Legal Agreement Bond, aur QR-code verified allotment letter milta hai.
            </p>
            <div className="trust-list">
              <div className="trust-list-item">
                <CheckCircle size={18} color="#34d399" />
                <span>Clear Title Ownership Deed & Daakhil Kharij Guarantee</span>
              </div>
              <div className="trust-list-item">
                <CheckCircle size={18} color="#34d399" />
                <span>Zero Hidden Fees • Direct Company Allotment</span>
              </div>
              <div className="trust-list-item">
                <CheckCircle size={18} color="#34d399" />
                <span>50+ Bank Loan Partners Pre-Approved</span>
              </div>
            </div>
          </div>
          <div className="trust-card-right">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="blueprint-thumbnail-box"
              role="button"
              tabIndex={0}
              aria-label="View Full 980-Plot Layout Map"
              onClick={onNavigateToMap}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigateToMap();
                }
              }}
            >
              <img
                src="./assets/logo_and_entrance.jpg"
                alt="Layout Blueprint Map"
                className="blueprint-img"
                loading="lazy"
                decoding="async"
              />
              <div className="blueprint-overlay">
                <Compass size={24} color="#38bdf8" />
                <span>View Full 980-Plot Layout Map</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CUSTOMER TESTIMONIALS */}
      <section className="testimonials-section" id="stories">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="section-header"
        >
          <span className="section-badge">CUSTOMER STORIES</span>
          <h2>Suno Unki Zubani Jinhone Shubharambh Ko Chuna</h2>
        </motion.div>

        <div className="testimonials-grid">
          {[
            {
              stars: '⭐⭐⭐⭐⭐',
              text: '“Amethi-Lucknow road par itna shandar aur well-planned township peheli baar dekha. 40Ft road aur Grand Entrance Gate bohot hi premium lagta hai.”',
              name: 'Suresh Chandra Sharma',
              role: 'Government Employee, Amethi',
              initials: 'SS',
              color: '#0ea5e9',
            },
            {
              stars: '⭐⭐⭐⭐⭐',
              text: '“Interactive 2D Map se ghar baithe Plot A-102 choose kiya. Site visit cab facility bohot acchi thi aur 15 din me token ke baad saari paperwork ready mili.”',
              name: 'Rameshwar Prasad Patel',
              role: 'Business Owner, Lucknow',
              initials: 'RP',
              color: '#34d399',
            },
            {
              stars: '⭐⭐⭐⭐⭐',
              text: '“Investment ke lihaz se ye Jagah sabse best hai. Road connectivity aur bank loan help dono bohot fast the.”',
              name: 'Sunita Verma',
              role: 'Teacher, Sultanpur',
              initials: 'SV',
              color: '#fbbf24',
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="testimonial-card"
            >
              <div className="stars">{item.stars}</div>
              <p>{item.text}</p>
              <div className="user-info">
                <div className="user-avatar" style={{ background: `${item.color}20`, color: item.color, borderColor: `${item.color}40` }}>
                  {item.initials}
                </div>
                <div className="user-details">
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section className="faq-section" id="faq">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="section-header"
        >
          <span className="section-badge">FAQ</span>
          <h2>Aapke Sawal, Hamare Jawab</h2>
        </motion.div>

        <div className="faq-accordion">
          {faqs.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className={`faq-item ${isOpen ? 'open' : ''}`}
                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
              >
                <div className="faq-question">
                  <span>{item.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="faq-arrow-wrapper"
                  >
                    <ChevronDown size={18} className="faq-arrow" />
                  </motion.div>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 14 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="faq-answer">{item.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* SITE VISIT LEAD CAPTURE FORM */}
      <section className="lead-form-section" id="book-visit">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lead-form-container"
        >
          <div className="lead-form-header">
            <h2>Book Your Free Site Visit Today</h2>
            <p>Lucknow ya Amethi se Nishulk Pick & Drop facility ke sath township visit karein</p>
          </div>

          {formSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="form-success-alert"
            >
              <CheckCircle size={40} color="#34d399" />
              <h3>Aapki Free Site Visit Booking Confirm Ho Gayi Hai!</h3>
              <p>Hamari sales team aapko agli 15 mins me call karke time aur location schedule karegi.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleFormSubmit} className="site-visit-form">
              <div className="form-row">
                <div className="form-field">
                  <label>Aapka Naam / Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={siteVisitForm.name}
                    onChange={(e) => setSiteVisitForm({ ...siteVisitForm, name: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Mobile Number (For OTP / Confirmation) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={siteVisitForm.phone}
                    onChange={(e) => setSiteVisitForm({ ...siteVisitForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Preferred Plot Size</label>
                  <select
                    value={siteVisitForm.plotSize}
                    onChange={(e) => setSiteVisitForm({ ...siteVisitForm, plotSize: e.target.value })}
                  >
                    <option value="30' x 50' (1500 sq.ft)">30' x 50' (1500 sq.ft) — Block A Main Road</option>
                    <option value="25' x 50' (1250 sq.ft)">25' x 50' (1250 sq.ft) — Block A Sector</option>
                    <option value="20' x 50' (1000 sq.ft)">20' x 50' (1000 sq.ft) — Block A Standard</option>
                    <option value="25' x 40' (1000 sq.ft)">25' x 40' (1000 sq.ft) — Block B Park Facing</option>
                    <option value="20' x 40' (800 sq.ft)">20' x 40' (800 sq.ft) — Block B / C</option>
                    <option value="15' x 40' (600 sq.ft)">15' x 40' (600 sq.ft) — Budget Plot</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Preferred Visit Date</label>
                  <input
                    type="date"
                    value={siteVisitForm.visitDate}
                    onChange={(e) => setSiteVisitForm({ ...siteVisitForm, visitDate: e.target.value })}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-form-submit"
              >
                <Send size={18} /> Confirm Free Site Visit & Cab Pickup
              </motion.button>
            </form>
          )}
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="lovable-footer">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <div className="sgc-logo-ring" style={{ width: '38px', height: '38px' }}>
                <img src="./assets/logo_and_entrance.jpg" alt="Logo" className="sgc-logo-img" />
              </div>
              <span className="footer-brand-name">SHUBHARAMBH</span>
            </div>
            <p>Village Hasnapur, Amethi, Lucknow Road. 60-Bigha Master Planned Gated Township with 100% Instant Sub-Registrar Registry Guarantee.</p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#features">Township Features</a></li>
              <li><a href="#how-it-works">3-Step Buying Guide</a></li>
              <li><a href="#government">Legal & Registry Info</a></li>
              <li><a href="#faq">Frequently Asked Questions</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Plot Categories</h4>
            <ul>
              <li>Block A: 40Ft Main Boulevard</li>
              <li>Block B: Park Facing Plots</li>
              <li>Block C: Garden Facing Plots</li>
              <li>Commercial: 20,440 sq.ft Market</li>
            </ul>
          </div>

          <div className="footer-col contact-col">
            <h4>Site & Contact Office</h4>
            <p><MapPin size={16} color="#34d399" /> Village Hasnapur, Amethi, Lucknow Highway, UP</p>
            <p><PhoneCall size={16} color="#0ea5e9" /> +91 98765 43210 / +91 98111 22334</p>
            <p><Calendar size={16} color="#fbbf24" /> Open All 7 Days: 9:00 AM - 7:00 PM</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Shubharambh Green City Township. All Rights Reserved. Gram Panchayat & RERA Compliant Project.</p>
        </div>
      </footer>
    </div>
  );
};
