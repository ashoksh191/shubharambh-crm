import React, { useState } from 'react';
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
  Award,
  Trees,
  Car,
  FileCheck,
  Send,
  LogIn,
  Home,
  Tag,
} from 'lucide-react';
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

  return (
    <div className="lovable-landing-container">
      {/* FULL HORIZONTAL ENTERPRISE NAVBAR (72px Sticky Glassmorphism) */}
      <header className="sehat-navbar">
        <div className="sehat-navbar-inner">
          {/* LEFT: LOGO + BRAND NAME (WHITE) + SUBTITLE */}
          <div className="sehat-brand" onClick={() => scrollToSection('top', 'home')}>
            <div className="sehat-logo-icon">
              <img src="./assets/logo_and_entrance.jpg" alt="Shubharambh Logo" />
            </div>
            <div className="sehat-brand-text-wrapper">
              <span className="sehat-brand-title">SHUBHARAMBH</span>
              <span className="sehat-brand-subtitle">Green City Township</span>
            </div>
          </div>

          {/* CENTER: FULL HORIZONTAL ENTERPRISE NAVIGATION */}
          <nav>
            <ul className="enterprise-center-nav-list">
              <li>
                <button
                  className={`enterprise-nav-item-btn ${activeNavSection === 'home' ? 'active' : ''}`}
                  onClick={() => scrollToSection('top', 'home')}
                >
                  <Home size={16} /> Home
                </button>
              </li>

              <li>
                <button
                  className={`enterprise-nav-item-btn ${activeNavSection === 'project' ? 'active' : ''}`}
                  onClick={() => scrollToSection('features', 'project')}
                >
                  <Building size={16} /> Project
                </button>
              </li>

              <li>
                <button
                  className={`enterprise-nav-item-btn ${activeNavSection === 'map' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveNavSection('map');
                    onNavigateToMap();
                  }}
                >
                  <MapPin size={16} /> Layout Map
                </button>
              </li>

              <li>
                <button
                  className={`enterprise-nav-item-btn ${activeNavSection === 'pricing' ? 'active' : ''}`}
                  onClick={() => scrollToSection('inventory', 'pricing')}
                >
                  <Tag size={16} /> Pricing
                </button>
              </li>

              <li>
                <button
                  className={`enterprise-nav-item-btn ${activeNavSection === 'gallery' ? 'active' : ''}`}
                  onClick={() => scrollToSection('amenities', 'gallery')}
                >
                  <Trees size={16} /> Gallery
                </button>
              </li>

              <li>
                <button
                  className={`enterprise-nav-item-btn ${activeNavSection === 'contact' ? 'active' : ''}`}
                  onClick={() => scrollToSection('site-visit', 'contact')}
                >
                  <PhoneCall size={16} /> Contact
                </button>
              </li>
            </ul>
          </nav>

          {/* RIGHT: GHOST LOGIN + PRIMARY GRADIENT GET STARTED BUTTON */}
          <div className="sehat-nav-actions">
            {authUser ? (
              <button className="sehat-signin-btn" onClick={logout} title="Sign Out">
                <LogIn size={16} /> Sign out ({authUser.role})
              </button>
            ) : (
              <button
                className="sehat-signin-btn"
                onClick={() => {
                  if (onOpenLogin) onOpenLogin();
                  else window.location.href = '#login';
                }}
              >
                <LogIn size={16} /> Login
              </button>
            )}

            <button className="sehat-get-started-btn" onClick={onNavigateToMap}>
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="sehat-hero">
        <div className="sehat-hero-inner">
          <div className="hero-badge">
            <span className="pulse-dot"></span>
            Govt RERA & Gram Panchayat Approved Plotting
          </div>

          <h1 className="sehat-hero-title">
            Prime Residential Land in <span className="gradient-text">Shubharambh Green City</span>
          </h1>

          <p className="sehat-hero-subtitle">
            Lucknow-Varanasi Highway connect township with 40 Ft RCC Roads, Gated Security, Underground Drainage, 24/7 Water & Solar Lights. Instant Possession with Sub-Registrar Registry guarantee.
          </p>

          <div className="sehat-hero-ctas">
            <button className="cta-primary-large" onClick={onNavigateToMap}>
              <Compass size={20} /> View Live 2D Layout Map Grid ({availableCount} Available)
            </button>

            <a href="./assets/layout_plan_master.pdf" download="Shubharambh_Layout_Blueprint.pdf" className="cta-secondary-large">
              <Download size={20} /> Download Master Blueprint (PDF)
            </a>
          </div>

          <div className="sehat-hero-stats">
            <div className="hero-stat-card">
              <div className="stat-value">60 Bigha</div>
              <div className="stat-label">Township Expansion</div>
            </div>

            <div className="hero-stat-card">
              <div className="stat-value">40 & 30 FT</div>
              <div className="stat-label">Wide Main Roads</div>
            </div>

            <div className="hero-stat-card">
              <div className="stat-value">₹900 / sq.ft</div>
              <div className="stat-label">Starting Price</div>
            </div>

            <div className="hero-stat-card">
              <div className="stat-value">100%</div>
              <div className="stat-label">Clear Title Land</div>
            </div>
          </div>
        </div>
      </section>

      {/* INVENTORY HIGHLIGHTS SECTION */}
      <section className="sehat-features" id="inventory">
        <div className="sehat-features-inner">
          <div className="section-header text-center">
            <span className="sub-badge">Plot Sizes & Options</span>
            <h2 className="section-title">Designed for Modern Villas & Investment Growth</h2>
            <p className="section-subtitle">Choose from ready-to-construct plots with immediate bank loan support</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <Building size={24} color="#0ea5e9" />
              </div>
              <h3>Standard Villa Plot</h3>
              <p className="plot-dim">20' x 50' • 1,000 Sq.Ft</p>
              <p>Ideal for 3BHK duplex villa construction. Frontage 20 Ft on 30 Ft RCC road.</p>
              <div className="card-footer-price">Starting ₹10.0 Lakhs</div>
            </div>

            <div className="feature-card highlight">
              <div className="recommended-badge">MOST POPULAR</div>
              <div className="feature-icon-box">
                <Trees size={24} color="#10b981" />
              </div>
              <h3>Premium Park Facing</h3>
              <p className="plot-dim">25' x 50' • 1,250 Sq.Ft</p>
              <p>Direct view of 1-acre central lush green park with Mandir zone proximity.</p>
              <div className="card-footer-price">Starting ₹12.5 Lakhs</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Award size={24} color="#f59e0b" />
              </div>
              <h3>Executive Commercial Plot</h3>
              <p className="plot-dim">30' x 60' • 1,800 Sq.Ft</p>
              <p>Corner plot location on 50 Ft Grand Entrance Boulevard for shop & showroom.</p>
              <div className="card-footer-price">Starting ₹21.6 Lakhs</div>
            </div>
          </div>
        </div>
      </section>

      {/* TOWNSHIP FEATURES & AMENITIES SECTION */}
      <section className="sehat-highlights" id="features">
        <div className="sehat-highlights-inner">
          <div className="section-header text-center">
            <span className="sub-badge">World Class Infrastructure</span>
            <h2 className="section-title">Everything You Need for Peaceful Living</h2>
          </div>

          <div className="highlights-grid">
            <div className="highlight-item">
              <div className="item-icon"><Car size={22} color="#0ea5e9" /></div>
              <div>
                <h4>50 & 40 FT RCC Roads</h4>
                <p>Heavy-duty interlocking RCC concrete main boulevard roads with street lighting</p>
              </div>
            </div>

            <div className="highlight-item">
              <div className="item-icon"><Shield size={22} color="#10b981" /></div>
              <div>
                <h4>24/7 Gated Security</h4>
                <p>CCTV surveillance cameras, boom barriers, and round-the-clock security guards</p>
              </div>
            </div>

            <div className="highlight-item">
              <div className="item-icon"><Trees size={22} color="#10b981" /></div>
              <div>
                <h4>Lush Central Parks</h4>
                <p>Tree-lined avenues, kids play area, walking track & landscaped botanical gardens</p>
              </div>
            </div>

            <div className="highlight-item">
              <div className="item-icon"><FileCheck size={22} color="#a855f7" /></div>
              <div>
                <h4>Immediate Registry & Mutation</h4>
                <p>100% legal registry at Govt Sub-Registrar Office with immediate Daakhil Kharij</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AMENITIES GALLERY SECTION */}
      <section className="sehat-features" id="amenities">
        <div className="sehat-features-inner">
          <div className="section-header text-center">
            <span className="sub-badge">Project Gallery</span>
            <h2 className="section-title">Actual On-Site Development Progress</h2>
          </div>

          <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div className="feature-card" style={{ padding: '0', overflow: 'hidden' }}>
              <img src="./assets/logo_and_entrance.jpg" alt="Grand Entrance Gate" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <h4>50 Ft Grand Entrance Arch</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>Security Guard Cabin & Boom Barrier Gate</p>
              </div>
            </div>

            <div className="feature-card" style={{ padding: '0', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80" alt="Central Park" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <h4>Central Park & Jogging Track</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>Greenery plantation & childrens play zone</p>
              </div>
            </div>

            <div className="feature-card" style={{ padding: '0', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80" alt="RCC Roads" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <h4>40 Ft RCC Main Road</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>Completed solar light poles & underground drainage</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREE SITE VISIT FORM SECTION */}
      <section className="sehat-site-visit" id="site-visit">
        <div className="sehat-site-visit-inner">
          <div className="site-visit-content">
            <span className="sub-badge yellow">Free Transport Facility</span>
            <h2>Book Your VIP Site Visit Today</h2>
            <p>We provide FREE AC Cab Pick & Drop service from Lucknow & Amethi. Inspect the layout map in person with our expert consultants.</p>

            <div className="visit-perks">
              <div className="perk-item">
                <CheckCircle size={18} color="#10b981" />
                <span>Zero Inspection Fees</span>
              </div>
              <div className="perk-item">
                <CheckCircle size={18} color="#10b981" />
                <span>Free Legal Document Verification</span>
              </div>
              <div className="perk-item">
                <CheckCircle size={18} color="#10b981" />
                <span>Instant Token Hold Option</span>
              </div>
            </div>
          </div>

          <div className="site-visit-card-form">
            <h3>Schedule Free Pick & Drop</h3>

            {formSubmitted ? (
              <div className="form-success-alert">
                <CheckCircle size={36} color="#10b981" />
                <h4>Site Visit Request Sent!</h4>
                <p>Our sales desk representative will call you within 15 minutes to confirm cab timing.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={siteVisitForm.name}
                    onChange={(e) => setSiteVisitForm({ ...siteVisitForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={siteVisitForm.phone}
                    onChange={(e) => setSiteVisitForm({ ...siteVisitForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Preferred Plot Size</label>
                  <select
                    value={siteVisitForm.plotSize}
                    onChange={(e) => setSiteVisitForm({ ...siteVisitForm, plotSize: e.target.value })}
                  >
                    <option value="20' x 50' (1000 sq.ft)">20' x 50' (1000 sq.ft)</option>
                    <option value="25' x 50' (1250 sq.ft)">25' x 50' (1250 sq.ft)</option>
                    <option value="30' x 60' (1800 sq.ft)">30' x 60' (1800 sq.ft)</option>
                  </select>
                </div>

                <button type="submit" className="submit-visit-btn">
                  <Send size={18} /> Confirm Free Site Visit
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="sehat-faq" id="faq">
        <div className="sehat-faq-inner">
          <div className="section-header text-center">
            <span className="sub-badge">Frequently Asked Questions</span>
            <h2 className="section-title">Everything You Need to Know</h2>
          </div>

          <div className="faq-accordion-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className={`faq-accordion-item ${isOpen ? 'active' : ''}`}>
                  <button
                    className="faq-question-btn"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={18} className={`faq-chevron ${isOpen ? 'open' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="faq-answer-content">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="sehat-footer">
        <div className="sehat-footer-inner">
          <div className="footer-brand-col">
            <div className="sehat-brand">
              <div className="sehat-logo-icon">
                <img src="./assets/logo_and_entrance.jpg" alt="Shubharambh Logo" />
              </div>
              <span className="sehat-brand-title">Shubharambh Green City</span>
            </div>
            <p>Government Approved 60-Bigha Master Planned Township with Immediate Registry & Bank Loan Approval.</p>
          </div>

          <div className="footer-contact-col">
            <h4>Sales & Enquiry Office</h4>
            <p><MapPin size={16} /> Lucknow-Varanasi National Highway, Near Amethi Junction</p>
            <p><PhoneCall size={16} /> Hotline: +91 98765 43210 / +91 91234 56789</p>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© 2026 Shubharambh Green City. All rights reserved. Registered Real Estate Township System.</p>
        </div>
      </footer>
    </div>
  );
};
