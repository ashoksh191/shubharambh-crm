import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  MapPin,
  CheckCircle,
  PhoneCall,
  Download,
  Calendar,
  Compass,
  Building,
  ChevronDown,
  Star,
  Award,
  Trees,
  Car,
  FileCheck,
  Send,
  LogIn,
  MoreHorizontal,
  X
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
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const [siteVisitForm, setSiteVisitForm] = useState({
    name: '',
    phone: '',
    plotSize: "25' x 50' (1250 sq.ft)",
    visitDate: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Close 3-dots menu on touch/click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setShowThreeDotsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

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

  const scrollToSection = (id: string) => {
    setShowThreeDotsMenu(false);
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
      {/* Top Header Navbar with Left-Aligned 3-Dots Menu System */}
      <header className="sehat-navbar">
        <div className="sehat-navbar-inner">
          {/* Left Brand + 3-Dots Group */}
          <div className="sehat-brand-left-group" ref={menuContainerRef}>
            <div className="sehat-brand">
              <div className="sehat-logo-icon">
                <img src="./assets/logo_and_entrance.jpg" alt="Shubharambh Logo" />
              </div>
              <span className="sehat-brand-title">Shubharambh Green City</span>
            </div>

            {/* Left 3-Dots Button */}
            <button
              className={`landing-three-dots-btn left-aligned ${showThreeDotsMenu ? 'active' : ''}`}
              onClick={() => setShowThreeDotsMenu((prev) => !prev)}
              title="Tap to open full space menu"
            >
              <MoreHorizontal size={22} className="three-dots-svg" />
              <span>Menu</span>
              <ChevronDown size={14} className={`chevron-svg ${showThreeDotsMenu ? 'open' : ''}`} />
            </button>
          </div>

          {/* Right Action Buttons */}
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
                Sign in
              </button>
            )}

            <button className="sehat-get-started-btn" onClick={onNavigateToMap}>
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Full Space Cover Menu Overlay when 3-Dots Button is Tapped */}
      {showThreeDotsMenu && (
        <div className="full-space-menu-overlay" ref={menuContainerRef}>
          <div className="full-space-menu-header">
            <div className="full-space-brand">
              <div className="sehat-logo-icon">
                <img src="./assets/logo_and_entrance.jpg" alt="Shubharambh Logo" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff', fontWeight: 800 }}>
                  SHUBHARAMBH GREEN CITY
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>
                  Full Space Navigation Menu
                </span>
              </div>
            </div>
            <button
              className="full-space-close-btn"
              onClick={() => setShowThreeDotsMenu(false)}
              title="Close Menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="full-space-menu-body">
            <div className="full-space-grid">
              <button
                className="full-space-card highlight"
                onClick={() => {
                  setShowThreeDotsMenu(false);
                  onNavigateToMap();
                }}
              >
                <div className="card-icon">📐</div>
                <div className="card-info">
                  <h4>Interactive 2D Layout Map</h4>
                  <p>Explore all 980 plot availability grid (Block A, B, C)</p>
                </div>
              </button>

              <button
                className="full-space-card"
                onClick={() => scrollToSection('features')}
              >
                <div className="card-icon">✨</div>
                <div className="card-info">
                  <h4>Key Features & Amenities</h4>
                  <p>50 Ft Grand Gate, 40 Ft Roads, Central Parks, Mandir Zone</p>
                </div>
              </button>

              <button
                className="full-space-card"
                onClick={() => scrollToSection('how-it-works')}
              >
                <div className="card-icon">🗺️</div>
                <div className="card-info">
                  <h4>How It Works</h4>
                  <p>3 Simple steps from booking token to registry</p>
                </div>
              </button>

              <button
                className="full-space-card"
                onClick={() => scrollToSection('government')}
              >
                <div className="card-icon">📜</div>
                <div className="card-info">
                  <h4>Legal & Registry Proof</h4>
                  <p>100% Clear Title Land & Direct Daakhil-Kharij Guarantee</p>
                </div>
              </button>

              <button
                className="full-space-card"
                onClick={() => scrollToSection('stories')}
              >
                <div className="card-icon">⭐</div>
                <div className="card-info">
                  <h4>Customer Stories</h4>
                  <p>Verified buyer testimonials & site experience</p>
                </div>
              </button>

              <button
                className="full-space-card"
                onClick={() => scrollToSection('faq')}
              >
                <div className="card-icon">❓</div>
                <div className="card-info">
                  <h4>Frequently Asked Questions</h4>
                  <p>Plot pricing, Bank loan approval, and Free cab info</p>
                </div>
              </button>

              <button
                className="full-space-card visit"
                onClick={() => scrollToSection('book-visit')}
              >
                <div className="card-icon">🚗</div>
                <div className="card-info">
                  <h4>Book Free Site Visit</h4>
                  <p>Free Pick & Drop transport available today</p>
                </div>
              </button>

              <button
                className="full-space-card helpline"
                onClick={() => {
                  setShowThreeDotsMenu(false);
                  alert('24x7 Support Helpline: +91 98765 43210');
                }}
              >
                <div className="card-icon">📞</div>
                <div className="card-info">
                  <h4>24x7 Helpline Support</h4>
                  <p>Call +91 9876543210 / support@shubharambh.com</p>
                </div>
              </button>
            </div>

            {/* Bottom Actions inside Full Space Menu */}
            <div className="full-space-menu-footer">
              <button className="sehat-get-started-btn" onClick={() => { setShowThreeDotsMenu(false); onNavigateToMap(); }}>
                Explore 980 Plots Grid →
              </button>
              {!authUser && (
                <button className="sehat-signin-btn" onClick={() => { setShowThreeDotsMenu(false); if (onOpenLogin) onOpenLogin(); }}>
                  Sign in to Portal
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Floating Announcement */}
      <div className="announcement-banner">
        <span>🎉 <strong>SPECIAL LAUNCH OFFER:</strong> Get 40 Ft Main Boulevard Plots at ₹1,200/sq.ft • Free Site Visit Available Today!</span>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-left">
          <div className="trust-pill-badge">
            <Shield size={14} className="icon" /> RERA Approved & Gram Panchayat Clear Title
          </div>

          <h1 className="hero-headline">
            Shubharambh Green City <br />
            <span className="hero-gradient-text">Apna Ghar, Apni Zameen, Behtar Bhavishya</span>
          </h1>

          <p className="hero-subheadline">
            Village Hasnapur, Amethi (Lucknow Road) me 60-Bigha ki VVIP Gated Township.
            40 Ft Main Boulevard Road, Mandir, Commercial Zone, Central Parks, aur 100% Instant Daakhil-Kharij Registry.
          </p>

          <div className="hero-cta-buttons">
            <button className="btn-primary-gradient" onClick={onNavigateToMap}>
              <Compass size={18} /> Explore Interactive 2D Layout Map
            </button>
            <a
              href="./assets/layout_plan_master.pdf"
              download="Shubharambh_Green_City_Layout.pdf"
              className="btn-secondary-outline"
            >
              <Download size={18} /> Download Blueprint PDF
            </a>
          </div>

          <div className="hero-trust-metrics">
            <div className="trust-metric-item">
              <span className="count">{availableCount}+</span>
              <span className="label">Plots Available</span>
            </div>
            <div className="divider-line" />
            <div className="trust-metric-item">
              <span className="count">40 Ft</span>
              <span className="label">Main Boulevard Road</span>
            </div>
            <div className="divider-line" />
            <div className="trust-metric-item">
              <span className="count">90 Days</span>
              <span className="label">Fast-Track Registry</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Card Preview (Right Side) */}
        <div className="hero-right">
          <div className="hero-preview-card">
            <div className="hero-card-badge">
              <Star size={12} fill="#f59e0b" color="#f59e0b" /> Grand Entrance Gate Render
            </div>
            <img
              src="./assets/logo_and_entrance.jpg"
              alt="Shubharambh Green City Grand Entrance Gate"
              className="hero-card-img"
            />
            <div className="hero-card-footer">
              <div className="hero-card-title">
                <h4>स्वागतं आपका हार्दिक अभिनंदन</h4>
                <p><MapPin size={14} color="#f59e0b" /> Village Hasnapur, Amethi, Lucknow Road</p>
              </div>
              <button className="hero-card-btn" onClick={onNavigateToMap}>
                View 980 Plots →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid (6 Features) */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-badge">TOWNSHIP HIGHLIGHTS</span>
          <h2>Kyun Khas Hai Shubharambh Green City?</h2>
          <p>Adhunik suvidhaon aur shandar location ke sath premium residential plots</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-box">
              <Car size={24} color="#10b981" />
            </div>
            <h3>40 Ft & 30 Ft Wide Roads</h3>
            <p>Chaudi aur paka RCC roads wide boulevards ke sath har plot tak aasan pahunch sunishchit karti hain.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Shield size={24} color="#f59e0b" />
            </div>
            <h3>24x7 Gated Security Entry</h3>
            <p>50 Ft Grand Gate entry, CCTV surveillance cameras, aur security guards safety ke liye 24/7 tayar.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Trees size={24} color="#3b82f6" />
            </div>
            <h3>Mandir & Central Parks</h3>
            <p>Shant vatavaran ke liye dedicated Shri Ganesha Mandir zone aur bachon ke liye green parks.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Building size={24} color="#ec4899" />
            </div>
            <h3>Commercial Shops Zone</h3>
            <p>Rozmarra ki zarooraton ke liye dedicated 20,440 sq.ft Commercial Market aur Mixed-Use Zone.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <FileCheck size={24} color="#8b5cf6" />
            </div>
            <h3>Instant Registry & Mutation</h3>
            <p>100% Clear Title Land. Booking ke baad 90 dino ke andar complete Legal Registry aur Daakhil-Kharij.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box">
              <Award size={24} color="#eab308" />
            </div>
            <h3>80% Bank Loan Facility</h3>
            <p>Sabhi pramukh sarkari aur private banks se easy EMI installment aur instant plot loan approval.</p>
          </div>
        </div>
      </section>

      {/* 3-Step "How It Works" Section */}
      <section className="steps-section" id="how-it-works">
        <div className="section-header">
          <span className="section-badge">EASY BUYING PROCESS</span>
          <h2>Sirf 3 Aasan Kadam Me Apne Plot Ke Malik Banein</h2>
          <p>Koi mushkil documentation nahi, bilkul clear aur transparent process</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Interactive Map Par Plot Chunein</h3>
            <p>Hamare Interactive 2D Map se Block A, B ya C me apna pasandida plot, dimension aur facing filter karein.</p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Free Site Visit Ya Token Amount Book Karein</h3>
            <p>Free Cab se site visit karein aur sirf 5% Token Amount dekar apna plot instant hold/reserve karein.</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Registry & Possession Hath Me Lein</h3>
            <p>90 dino me baki payment complete karein aur official Sub-Registrar office me apne naam registry praapt karein.</p>
          </div>
        </div>
      </section>

      {/* Government & Legal Assurance Card */}
      <section className="trust-card-section" id="government">
        <div className="trust-card-inner">
          <div className="trust-card-left">
            <span className="trust-badge">100% LEGAL GUARANTEE</span>
            <h2>Zameen Ki Clean Title Aur Legal Transparency</h2>
            <p>
              Shubharambh Green City Gram Panchayat approved aur Daakhil-Kharij verified township hai. Har khareed ke sath
              aapko official Digital Payment Receipt, Legal Agreement Bond, aur QR-code verified allotment letter milta hai.
            </p>
            <div className="trust-list">
              <div className="trust-list-item">
                <CheckCircle size={18} color="#10b981" />
                <span>Clear Title Ownership Deed & Daakhil Kharij Guarantee</span>
              </div>
              <div className="trust-list-item">
                <CheckCircle size={18} color="#10b981" />
                <span>Zero Hidden Fees • Direct Company Allotment</span>
              </div>
              <div className="trust-list-item">
                <CheckCircle size={18} color="#10b981" />
                <span>50+ Bank Loan Partners Pre-Approved</span>
              </div>
            </div>
          </div>
          <div className="trust-card-right">
            <div className="blueprint-thumbnail-box" onClick={onNavigateToMap}>
              <img
                src="./assets/layout_map_fast.jpg"
                alt="Layout Blueprint Map"
                className="blueprint-img"
              />
              <div className="blueprint-overlay">
                <Compass size={24} />
                <span>View Full 980-Plot Layout Map</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials / Happy Buyers */}
      <section className="testimonials-section" id="stories">
        <div className="section-header">
          <span className="section-badge">CUSTOMER STORIES</span>
          <h2>Suno Unki Zubani Jinhone Shubharambh Ko Chuna</h2>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p>“Amethi-Lucknow road par itna shandar aur well-planned township peheli baar dekha. 40Ft road aur Grand Entrance Gate bohot hi premium lagta hai.”</p>
            <div className="user-info">
              <strong>Suresh Chandra Sharma</strong>
              <span>Government Employee, Amethi</span>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p>“Interactive 2D Map se ghar baithe Plot A-102 choose kiya. Site visit cab facility bohot acchi thi aur 15 din me token ke baad saari paperwork ready mili.”</p>
            <div className="user-info">
              <strong>Rameshwar Prasad Patel</strong>
              <span>Business Owner, Lucknow</span>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p>“Investment ke lihaz se ye Jagah sabse best hai. Road connectivity aur bank loan help dono bohot fast the.”</p>
            <div className="user-info">
              <strong>Sunita Verma</strong>
              <span>Teacher, Sultanpur</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="faq-section" id="faq">
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2>Aapke Sawal, Hamare Jawab</h2>
        </div>

        <div className="faq-accordion">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className={`faq-item ${openFaqIndex === idx ? 'open' : ''}`}
              onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
            >
              <div className="faq-question">
                <span>{item.q}</span>
                <ChevronDown size={18} className="faq-arrow" />
              </div>
              {openFaqIndex === idx && <div className="faq-answer">{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Site Visit Lead Capture Form */}
      <section className="lead-form-section">
        <div className="lead-form-container">
          <div className="lead-form-header">
            <h2>Book Your Free Site Visit Today</h2>
            <p>Lucknow ya Amethi se Nishulk Pick & Drop facility ke sath township visit karein</p>
          </div>

          {formSubmitted ? (
            <div className="form-success-alert">
              <CheckCircle size={32} color="#10b981" />
              <h3>Aapki Free Site Visit Booking Confirm Ho Gayi Hai!</h3>
              <p>Hamari sales team aapko agli 15 mins me call karke time aur location schedule karegi.</p>
            </div>
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

              <button type="submit" className="btn-form-submit">
                <Send size={18} /> Confirm Free Site Visit & Cab Pickup
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="lovable-footer">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <img src="./assets/logo_and_entrance.jpg" alt="Logo" className="footer-logo-img" />
              <span>Shubharambh Green City</span>
            </div>
            <p>Village Hasnapur, Amethi, Lucknow Road. 60-Bigha Master Planned Gated Township with 100% Registry Guarantee.</p>
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
              <li>Block A: 40Ft Main Boulevard (1500, 1250, 1000 sqft)</li>
              <li>Block B: Park Facing (1000, 800, 600 sqft)</li>
              <li>Block C: Garden Facing (1000, 800, 600 sqft)</li>
              <li>Commercial Shops: 20,440 sq.ft Zone</li>
            </ul>
          </div>

          <div className="footer-col contact-col">
            <h4>Site & Contact Office</h4>
            <p><MapPin size={16} color="#f59e0b" /> Village Hasnapur, Amethi, Lucknow Highway, UP</p>
            <p><PhoneCall size={16} color="#10b981" /> +91 98765 43210 / +91 98111 22334</p>
            <p><Calendar size={16} color="#3b82f6" /> Open All 7 Days: 9:00 AM - 7:00 PM</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Shubharambh Green City Township. All Rights Reserved. Gram Panchayat & RERA Compliant Project.</p>
        </div>
      </footer>
    </div>
  );
};
