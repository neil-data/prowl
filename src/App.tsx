import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Menu, X, ShoppingCart, ShieldCheck, Mail, ArrowRight, 
  RotateCcw, Info, Compass, Trophy, Users, HeartHandshake, ChevronDown 
} from 'lucide-react';

import { EquipmentSpecs, OrderItem } from './types';
import RackCustomizer from './components/RackCustomizer';
import ProductCatalog, { SIGNATURE_PIECES } from './components/ProductCatalog';
import BiomechanicalTelemetry from './components/BiomechanicalTelemetry';
import ProwlAudioDemo from './components/ProwlAudioDemo';
import OrderDrawer from './components/OrderDrawer';

const TESTIMONIALS = [
  {
    quote: "The Phantom rack is less a piece of equipment and more a structural commitment to excellence. Flawless execution.",
    author: "M. Vance",
    role: "Olympic Powerlifter"
  },
  {
    quote: "I've outfitted three facilities with PROWL. The telemetry integration is years ahead of the industry.",
    author: "S. Reed",
    role: "High Performance Director"
  },
  {
    quote: "Aesthetic brutality matched only by its biomechanical perfection. Worth every penny.",
    author: "D. Cho",
    role: "Elite Strength Coach"
  }
];

export default function App() {
  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  // Inline Simulation displays
  const [showTelemetrySim, setShowTelemetrySim] = useState(false);
  const [showAudioSim, setShowAudioSim] = useState(false);

  // Email Registry form states
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [registryCode, setRegistryCode] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Header Dropdown Menu toggles
  const [showEquipmentMenu, setShowEquipmentMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Custom Cursor variables
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);

  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register scroll trigger
    gsap.registerPlugin(ScrollTrigger);

    // Context for clean GSAP setup in React
    const ctx = gsap.context(() => {
      // 1. Hero title masking text reveal
      gsap.fromTo(".hero-title-line", 
        { y: "115%", opacity: 0 },
        { 
          y: "0%", 
          opacity: 1, 
          duration: 1.4, 
          ease: "power4.out", 
          stagger: 0.15,
          delay: 0.1 
        }
      );

      gsap.fromTo(".hero-fade",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: 0.1, delay: 0.55 }
      );

      gsap.fromTo(".hero-right-panel",
        { opacity: 0, scale: 0.96, y: 35 },
        { opacity: 1, scale: 1, y: 0, duration: 1.4, ease: "power4.out", delay: 0.3 }
      );

      // 2. Velocity-Linked continuous marquee velocity scaling
      const tickerElement = document.querySelector(".gsap-marquee-inner");
      if (tickerElement) {
        const marqueeTween = gsap.to(tickerElement, {
          xPercent: -50,
          repeat: -1,
          duration: 22,
          ease: "none"
        });

        ScrollTrigger.create({
          onUpdate: (self) => {
            const scrollVelocity = self.getVelocity();
            const absVelocity = Math.abs(scrollVelocity);
            if (absVelocity > 10) {
              const targetScale = 1 + Math.min(absVelocity * 0.003, 8);
              gsap.to(marqueeTween, { timeScale: targetScale, duration: 0.25, overwrite: "auto" });
              gsap.to(marqueeTween, { timeScale: 1, duration: 0.8, delay: 0.1, overwrite: "auto" });
            }
          }
        });
      }

      // 3. Counter metrics animation trigger
      gsap.fromTo(".stat-count-1", 
        { textContent: "0" },
        { 
          textContent: "14", 
          duration: 2, 
          ease: "power2.out", 
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: "#scounter",
            start: "top 85%"
          },
          onUpdate: function() {
            const elem = document.querySelector(".stat-count-1");
            if (elem) elem.innerHTML = Math.round(Number(elem.textContent)).toString();
          }
        }
      );

      gsap.fromTo(".stat-count-2", 
        { textContent: "0" },
        { 
          textContent: "98", 
          duration: 2, 
          ease: "power2.out", 
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: "#scounter",
            start: "top 85%"
          },
          onUpdate: function() {
            const elem = document.querySelector(".stat-count-2");
            if (elem) elem.innerHTML = Math.round(Number(elem.textContent)).toString();
          }
        }
      );

      gsap.fromTo(".stat-count-3", 
        { textContent: "0" },
        { 
          textContent: "100", 
          duration: 2, 
          ease: "power2.out", 
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: "#scounter",
            start: "top 85%"
          },
          onUpdate: function() {
            const elem = document.querySelector(".stat-count-3");
            if (elem) elem.innerHTML = Math.round(Number(elem.textContent)).toString();
          }
        }
      );

      gsap.fromTo(".stat-last",
        { opacity: 0, scale: 0.7, letterSpacing: "0.2em" },
        { 
          opacity: 1, 
          scale: 1, 
          letterSpacing: "normal", 
          duration: 1.6, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#scounter",
            start: "top 85%"
          }
        }
      );

      // 4. Staggered 3D Scroll Entrance for Catalog cards
      gsap.fromTo(".catalog-card", 
        { y: 55, opacity: 0, transform: "perspective(1000px) rotateX(8deg)" },
        {
          y: 0,
          opacity: 1,
          transform: "perspective(1000px) rotateX(0deg)",
          duration: 1.2,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".catalog-grid",
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );

      // 5. Bento cards scroll parallax entrance
      gsap.fromTo("#telemetry-spotlight",
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#telemetry-spotlight",
            start: "top 85%"
          }
        }
      );

      gsap.fromTo("#audio-spotlight",
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#audio-spotlight",
            start: "top 85%"
          }
        }
      );

      // 6. Split divider expansion
      gsap.fromTo(".divider-line",
        { scaleX: 0 },
        { 
          scaleX: 1, 
          duration: 1.4, 
          ease: "power3.inOut",
          stagger: 0.15,
          scrollTrigger: {
            trigger: ".divider-line",
            start: "top 90%"
          }
        }
      );

      // 7. Testimonial header tracking
      gsap.fromTo("#quotes h2",
        { letterSpacing: "0.18em", opacity: 0, y: 15 },
        {
          letterSpacing: "normal",
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#quotes",
            start: "top 85%"
          }
        }
      );

    }, mainRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none)').matches;
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    const cursorDot = cursorDotRef.current;
    const cursorRing = cursorRingRef.current;
    if (!cursorDot || !cursorRing) return;

    // Initially position offscreen and hide
    gsap.set([cursorDot, cursorRing], { xPercent: -50, yPercent: -50, opacity: 0 });

    const xDotTo = gsap.quickTo(cursorDot, "x", { duration: 0.05, ease: "power3.out" });
    const yDotTo = gsap.quickTo(cursorDot, "y", { duration: 0.05, ease: "power3.out" });
    const xRingTo = gsap.quickTo(cursorRing, "x", { duration: 0.14, ease: "power2.out" });
    const yRingTo = gsap.quickTo(cursorRing, "y", { duration: 0.14, ease: "power2.out" });

    let hasMoved = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!hasMoved) {
        gsap.to([cursorDot, cursorRing], { opacity: 1, duration: 0.25 });
        hasMoved = true;
      }
      xDotTo(e.clientX);
      yDotTo(e.clientY);
      xRingTo(e.clientX);
      yRingTo(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('a') || 
        target.closest('button') || 
        target.closest('.group') || 
        target.classList.contains('cursor-pointer') ||
        target.closest('.cursor-pointer')
      ) {
        gsap.to(cursorRing, {
          width: '54px',
          height: '54px',
          borderColor: 'rgba(212, 175, 55, 0.9)',
          backgroundColor: 'rgba(212, 175, 55, 0.12)',
          duration: 0.25,
          overwrite: "auto"
        });
        gsap.to(cursorDot, {
          scale: 1.5,
          backgroundColor: '#ffe08f',
          duration: 0.25,
          overwrite: "auto"
        });
      } else {
        gsap.to(cursorRing, {
          width: '26px',
          height: '26px',
          borderColor: 'rgba(212, 175, 55, 0.45)',
          backgroundColor: 'transparent',
          duration: 0.3,
          overwrite: "auto"
        });
        gsap.to(cursorDot, {
          scale: 1,
          backgroundColor: '#d4af37',
          duration: 0.3,
          overwrite: "auto"
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to([cursorDot, cursorRing], { opacity: 0, duration: 0.2 });
    };

    const handleMouseEnter = () => {
      if (hasMoved) {
        gsap.to([cursorDot, cursorRing], { opacity: 1, duration: 0.2 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setShowEquipmentMenu(false);
  };

  // Auto scroll transition for testimonies
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Dispatch adder
  const handleAddCustomConfig = (config: {
    product: EquipmentSpecs;
    customizations: {
      finish: string;
      pullUp: string;
      pulley: string;
      attachments: string[];
    };
    customPrice: number;
  }) => {
    const newItem: OrderItem = {
      product: config.product,
      qty: 1,
      customizations: config.customizations,
      customPrice: config.customPrice
    };
    setOrderList((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleAddStandardProduct = (product: EquipmentSpecs, qty: number, options?: { color?: string }) => {
    const newItem: OrderItem = {
      product,
      qty,
      customizations: options?.color ? { finish: options.color } : undefined
    };
    setOrderList((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleRemoveOrderItem = (index: number) => {
    setOrderList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearOrder = () => {
    setOrderList([]);
  };

  // Registry validation handler
  const handleRegistryRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsRegistering(true);
    setTimeout(() => {
      const generatedPIN = `PRW-REG-${Math.floor(100000 + Math.random() * 900000)}`;
      setRegistryCode(generatedPIN);
      setIsRegistering(false);
    }, 1500);
  };

  const scrollToCatalog = () => {
    const dom = document.getElementById('signature-pieces-view');
    if (dom) dom.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-obsidian text-on-surface min-h-screen font-sans flex flex-col relative w-full overflow-x-hidden">
      
      {/* 1. Sticky Navigation Bar */}
      <nav 
        className="bg-[#121412]/95 backdrop-blur-md fixed top-0 left-0 w-full z-40 border-b border-outline-variant flex justify-between items-center px-4 sm:px-6 md:px-12 h-[64px] transition-all select-none"
        id="navbar"
      >
        <div className="flex items-center gap-2">
          {/* Mobile Menu Toggle Burger Button (Visible on phone/tablet, at least 44px touch space) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-11 h-11 text-muted hover:text-gold transition-colors cursor-pointer mr-1 z-50 rounded"
            aria-label="Toggle Navigation Control Panel"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 text-gold" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand visual LOGO - Prowl */}
          <div className="font-display text-2xl sm:text-3xl text-gold tracking-[0.2em] uppercase cursor-pointer select-none" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMobileMenuOpen(false); }}>
            PROWL
          </div>
        </div>

        {/* Center navigation links (Desktop only) */}
        <ul className="hidden md:flex items-center gap-6 h-full text-xs font-semibold tracking-widest uppercase">
          
          {/* Equipment Hover dropdown simulation */}
          <li className="h-full flex items-center relative">
            <button 
              onMouseEnter={() => setShowEquipmentMenu(true)}
              onClick={() => setShowEquipmentMenu(!showEquipmentMenu)}
              className="hover:text-gold transition-colors flex items-center gap-1.5 cursor-pointer h-[64px] px-2"
            >
              Equipment <ChevronDown className="w-3.5 h-3.5 mt-0.5 text-gold" />
            </button>
            
            {showEquipmentMenu && (
              <div 
                onMouseLeave={() => setShowEquipmentMenu(false)}
                className="absolute top-[64px] left-1/2 -translate-x-1/2 w-[580px] bg-[#111] border border-outline-variant p-6 grid grid-cols-3 gap-6 shadow-2xl z-50 text-left"
              >
                <div>
                  <span className="text-gold font-display text-sm tracking-wide block mb-3 pb-1 border-b border-[#222]">STRENGTH FLIGHTS</span>
                  <ul className="space-y-2 text-[11px] text-[#acacac] normal-case font-normal font-sans">
                    <li><a href="#signature-pieces-view" onClick={(e) => handleAnchorClick(e, 'signature-pieces-view')} className="hover:text-gold transition-colors">Barbells & Plates</a></li>
                    <li><a href="#customizer" onClick={(e) => handleAnchorClick(e, 'customizer')} className="hover:text-gold transition-colors">Phantom Power Racks</a></li>
                    <li><a href="#signature-pieces-view" onClick={(e) => handleAnchorClick(e, 'signature-pieces-view')} className="hover:text-gold transition-colors">Supports & benches</a></li>
                  </ul>
                </div>
                <div>
                  <span className="text-gold font-display text-sm tracking-wide block mb-3 pb-1 border-b border-[#222]">CABLE SYSTEMS</span>
                  <ul className="space-y-2 text-[11px] text-[#acacac] normal-case font-normal font-sans">
                    <li><a href="#signature-pieces-view" onClick={(e) => handleAnchorClick(e, 'signature-pieces-view')} className="hover:text-gold transition-colors">Pulse Dual Cables</a></li>
                    <li><a href="#signature-pieces-view" onClick={(e) => handleAnchorClick(e, 'signature-pieces-view')} className="hover:text-gold transition-colors">Smith linear hubs</a></li>
                  </ul>
                </div>
                <div>
                  <span className="text-gold font-display text-sm tracking-wide block mb-3 pb-1 border-b border-[#222]">TECHNOLOGY LABS</span>
                  <ul className="space-y-2 text-[11px] text-[#acacac] normal-case font-normal font-sans">
                    <li><a href="#telemetry-spotlight" onClick={(e) => handleAnchorClick(e, 'telemetry-spotlight')} className="hover:text-gold transition-colors text-xs font-semibold text-gold">Prometheus Telemetry</a></li>
                    <li><a href="#audio-spotlight" onClick={(e) => handleAnchorClick(e, 'audio-spotlight')} className="hover:text-gold transition-colors text-xs font-semibold text-gold font-mono block mt-1">Prowl Audio Labs</a></li>
                  </ul>
                </div>
              </div>
            )}
          </li>

          <li className="h-full flex items-center">
            <a href="#scounter" onClick={(e) => handleAnchorClick(e, 'scounter')} className="hover:text-gold transition-colors px-2">Performance</a>
          </li>
          <li className="h-full flex items-center">
            <a href="#quotes" onClick={(e) => handleAnchorClick(e, 'quotes')} className="hover:text-gold transition-colors px-2">Members Code</a>
          </li>
          <li className="h-full flex items-center">
            <a href="#technical-registry" onClick={(e) => handleAnchorClick(e, 'technical-registry')} className="hover:text-gold transition-colors px-2">Technical Brief</a>
          </li>
        </ul>

        {/* Dynamic Cart count action buttons (at least 44px height targets) */}
        <div className="flex items-center gap-2 sm:gap-4 h-full">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative w-11 h-11 flex items-center justify-center text-muted hover:text-gold transition-colors cursor-pointer rounded"
            aria-label="Active Hardware compiler"
          >
            <ShoppingCart className="w-5 h-5" />
            {orderList.length > 0 && (
              <span className="absolute top-1 right-1 bg-gold text-[#0a0a0a] text-[9px] font-mono font-bold w-4 h-4 flex items-center justify-center border border-obsidian rounded-full">
                {orderList.reduce((sum, item) => sum + item.qty, 0)}
              </span>
            )}
          </button>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-gold text-[#0a0a0a] font-label-caps text-[11px] tracking-widest px-4 sm:px-6 h-11 hover:bg-[#ffe08f] transition-all font-bold uppercase cursor-pointer rounded-xs"
          >
            Shop Now
          </button>
        </div>
      </nav>

      {/* Slide down Dropdown Drawer for Mobile Navigation only */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[64px] left-0 w-full h-[calc(100vh-64px)] bg-[#0d0f0d] border-b border-outline-variant z-40 transition-transform duration-300 overflow-y-auto flex flex-col p-6 gap-6 select-none animate-fade-in">
          <div>
            <span className="text-gold font-display text-xs tracking-widest block mb-4 pb-1 border-b border-[#222]">STRENGTH CONFIGURATOR</span>
            <div className="flex flex-col gap-3 font-mono text-[11px] uppercase text-[#acacac]">
              <a href="#customizer" onClick={(e) => { handleAnchorClick(e, 'customizer'); setIsMobileMenuOpen(false); }} className="py-2 hover:text-gold flex justify-between items-center bg-[#141614] px-3.5 border border-outline-variant/30">
                <span>Phantom custom-rig designer</span>
                <span className="text-gold">→</span>
              </a>
              <a href="#signature-pieces-view" onClick={(e) => { handleAnchorClick(e, 'signature-pieces-view'); setIsMobileMenuOpen(false); }} className="py-2 hover:text-gold flex justify-between items-center bg-[#141614] px-3.5 border border-outline-variant/30">
                <span>Signature Pieces</span>
                <span>→</span>
              </a>
            </div>
          </div>

          <div>
            <span className="text-gold font-display text-xs tracking-widest block mb-4 pb-1 border-b border-[#222]">BIOMECHANICAL LABS</span>
            <div className="flex flex-col gap-3 font-mono text-[11px] uppercase text-[#acacac]">
              <a href="#telemetry-spotlight" onClick={(e) => { handleAnchorClick(e, 'telemetry-spotlight'); setIsMobileMenuOpen(false); }} className="py-2 hover:text-gold flex justify-between items-center bg-[#141614] px-3.5 border border-outline-variant/30">
                <span>Prometheus Telemetry Feed</span>
                <span className="text-gold animate-pulse">● LIVE</span>
              </a>
              <a href="#audio-spotlight" onClick={(e) => { handleAnchorClick(e, 'audio-spotlight'); setIsMobileMenuOpen(false); }} className="py-2 hover:text-gold flex justify-between items-center bg-[#141614] px-3.5 border border-outline-variant/30">
                <span>Prowl Audio Phase Calibrator</span>
                <span className="text-gold font-mono">ANC</span>
              </a>
            </div>
          </div>

          <div>
            <span className="text-gold font-display text-xs tracking-widest block mb-4 pb-1 border-b border-[#222]">ELITE ARCHITECTURE</span>
            <div className="flex flex-col gap-3 font-mono text-[11px] uppercase text-[#acacac]">
              <a href="#scounter" onClick={(e) => { handleAnchorClick(e, 'scounter'); setIsMobileMenuOpen(false); }} className="py-2 hover:text-gold">Calibrated Metrics</a>
              <a href="#quotes" onClick={(e) => { handleAnchorClick(e, 'quotes'); setIsMobileMenuOpen(false); }} className="py-2 hover:text-gold">Elite Directives</a>
              <a href="#technical-registry" onClick={(e) => { handleAnchorClick(e, 'technical-registry'); setIsMobileMenuOpen(false); }} className="py-2 hover:text-gold">Technical Secured Registry SMS</a>
            </div>
          </div>

          <div className="mt-auto border-t border-outline-variant/30 pt-6">
            <span className="font-mono text-[8px] text-muted uppercase block mb-1">PROWL COMMAND CORE</span>
            <span className="font-mono text-[9px] text-[#ffe08f] uppercase block">Encrypted Connection Status: Operational</span>
          </div>
        </div>
      )}

      {/* Main Container spacing (top fixed offset) - Expanded margins on mobile for 92-95vw, spacing system */}
      <main ref={mainRef} className="flex-grow w-[min(100%,100vw)] max-w-[94vw] sm:max-w-6xl md:max-w-7xl mx-auto overflow-x-hidden pt-[64px] px-1 sm:px-6 lg:px-12 flex flex-col gap-12 md:gap-16 pb-28">
        
        {/* 2. Hero Section Grid */}
        <section className="min-h-[550px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6 md:py-12" id="customizer">
          {/* Hero Left Column: Brand Statement & CTA (5 cols) */}
          <div className="lg:col-span-12 xl:col-span-5 flex flex-col items-start text-left gap-5 sm:gap-6 lg:pr-4">
            <span className="hero-fade font-label-caps text-[10px] sm:text-xs text-gold border border-gold px-3.5 py-1.5 tracking-widest inline-block select-none rounded-none">
              PREMIUM COLLECTION 2026
            </span>
            
            <h1 className="flex flex-col leading-[0.95] mt-2 select-none">
              <div className="overflow-hidden py-0.5">
                <span className="hero-title-line font-display text-4xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[90px] text-on-surface uppercase tracking-normal block leading-none">
                  BUILT FOR THE
                </span>
              </div>
              <div className="overflow-hidden py-1">
                <span className="hero-title-line font-serif text-3xl sm:text-5xl md:text-6xl lg:text-[54px] xl:text-[62px] text-gold italic font-light pl-1 animate-pulse block leading-none">
                  Perfect
                </span>
              </div>
              <div className="overflow-hidden py-0.5">
                <span className="hero-title-line font-display text-4xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[90px] text-on-surface uppercase tracking-normal block leading-none">
                  FORM
                </span>
              </div>
            </h1>

            <p className="hero-fade font-sans text-[#b8ae9c] text-xs sm:text-sm md:text-base leading-relaxed max-w-lg mt-1">
              Engineered with aerospace precision. The 2026 PROWL collection merges biomechanical mastery with uncompromising industrial design for high-performance elite athletes.
            </p>

            <div className="hero-fade flex flex-wrap gap-4 mt-2 w-full sm:w-auto">
              <button 
                onClick={scrollToCatalog}
                className="px-8 h-12 bg-gold hover:bg-[#ffe08f] text-[#0a0a0a] font-label-caps text-xs tracking-widest font-bold transition-all hover:scale-101 border border-gold cursor-pointer uppercase w-full sm:w-auto text-center rounded-sm"
              >
                EXPLORE COLLECTION
              </button>
            </div>
          </div>

          {/* Hero Right Column: Full-scale Power Rack Customizer (7 cols) */}
          <div className="hero-right-panel lg:col-span-12 xl:col-span-7 w-full shadow-2xl">
            <RackCustomizer onAddToOrder={handleAddCustomConfig} />
          </div>
        </section>

        {/* 3. Infinite Marquee Ticker */}
        <section className="bg-gold text-[#0a0a0a] py-2.5 border-y border-outline-variant -mx-6 lg:-mx-12 overflow-hidden select-none">
          <div className="marquee-container w-full overflow-hidden flex">
            <div className="gsap-marquee-inner flex select-none font-display text-3xl md:text-4xl uppercase whitespace-nowrap leading-none">
              <div className="flex items-center gap-16 shrink-0 pr-16 animate-none">
                <span>Precision Engineered</span>
                <span className="w-2.5 h-2.5 bg-background rotate-45" />
                <span>Aerospace Grade steel</span>
                <span className="w-2.5 h-2.5 bg-background rotate-45" />
                <span>Elite Performance parameters</span>
                <span className="w-2.5 h-2.5 bg-background rotate-45" />
                <span>Uncompromising biomechanical Form</span>
                <span className="w-2.5 h-2.5 bg-background rotate-45" />
              </div>
              <div className="flex items-center gap-16 shrink-0 pr-16 animate-none">
                <span>Precision Engineered</span>
                <span className="w-2.5 h-2.5 bg-background rotate-45" />
                <span>Aerospace Grade steel</span>
                <span className="w-2.5 h-2.5 bg-background rotate-45" />
                <span>Elite Performance parameters</span>
                <span className="w-2.5 h-2.5 bg-background rotate-45" />
                <span>Uncompromising biomechanical Form</span>
                <span className="w-2.5 h-2.5 bg-background rotate-45" />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Stats Counters Bar */}
        <section className="border-b border-outline-variant bg-[#111111] grid grid-cols-2 md:grid-cols-4 gap-px" id="scounter">
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center border-r border-[#222]">
            <span className="font-display text-4xl text-gold mb-1.5 tracking-wider font-bold">
              <span className="stat-count-1">0</span>+
            </span>
            <span className="font-label-caps text-[10px] text-muted tracking-widest uppercase">Patented Technologies</span>
          </div>
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center border-r md:border-r-0 lg:border-r border-[#222]">
            <span className="font-display text-4xl text-gold mb-1.5 tracking-wider font-bold">
              <span className="stat-count-2">0</span>K
            </span>
            <span className="font-label-caps text-[10px] text-muted tracking-widest uppercase">Pounds Calibrated Tested</span>
          </div>
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center border-r border-[#222]">
            <span className="font-display text-4xl text-gold mb-1.5 tracking-wider font-bold">
              <span className="stat-count-3">0</span>%
            </span>
            <span className="font-label-caps text-[10px] text-muted tracking-widest uppercase">Milled 11G Structural Steel</span>
          </div>
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
            <span className="stat-last font-display text-4xl text-gold mb-1.5 tracking-wider font-bold block">P∞</span>
            <span className="font-label-caps text-[10px] text-muted tracking-widest uppercase">Lifetime Structural Warranty</span>
          </div>
        </section>

        {/* 5. Minimal Section Divider Banner */}
        <div className="flex items-center py-6 w-full select-none">
          <div className="divider-line flex-grow border-t border-gold/20 h-px origin-right scale-x-0" />
          <span className="px-6 font-label-caps text-[11px] text-gold tracking-[0.25em] uppercase font-semibold text-center select-none">
            THE PROWL FLAGSHIP GALLERY
          </span>
          <div className="divider-line flex-grow border-t border-gold/20 h-px origin-left scale-x-0" />
        </div>

        {/* 6. Signature Hardware catalog pieces */}
        <section className="flex flex-col gap-8">
          <div className="flex justify-between items-end border-b border-outline-variant pb-2">
            <div>
              <h2 className="font-display text-4xl md:text-5xl text-on-surface uppercase tracking-wide">
                Signature Pieces
              </h2>
              <p className="font-sans text-xs text-muted mt-1">Calibrated tools engineered for structural biomechanical dominance.</p>
            </div>
            <button 
              onClick={scrollToCatalog}
              className="font-label-caps text-xs text-gold hover:text-[#ffe08f] transition-all flex items-center gap-1.5 pb-1 select-none cursor-pointer uppercase font-semibold text-right"
            >
              View Grid <ArrowRight className="w-4 h-4 text-gold" />
            </button>
          </div>

          <ProductCatalog onAddProduct={handleAddStandardProduct} />
        </section>

        {/* 7. Premium Editorial Full-Width Quote Display banner */}
        <section className="bg-gradient-to-tr from-obsidian via-[#141513] to-[#1a1b1a] border border-outline-variant p-10 md:p-14 text-center relative overflow-hidden -mx-6 lg:-mx-12 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-4">
            <h2 className="font-serif text-[40px] md:text-[54px] text-gold leading-tight italic">
              "We engineer obsession."
            </h2>
            <div className="w-12 h-[1px] bg-gold/50 mx-auto my-1" />
            <p className="font-sans text-[#b0b0ad] text-[10px] md:text-xs uppercase tracking-[0.3em] max-w-xl mx-auto">
              The pursuit of physical perfection requires tools of equal caliber.
            </p>
          </div>
        </section>

        {/* 8. Bento Feature Spotlights with interactive CAD deep dives */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="spots">
          
          {/* Feature Card 1: Prometheus tracker */}
          <div 
            className="bg-[#111] border border-outline-variant flex flex-col justify-between group overflow-hidden transition-all duration-300"
            id="telemetry-spotlight"
          >
            <div className="aspect-[16/9] bg-obsidian relative overflow-hidden flex items-center justify-center">
              <img 
                alt="Prometheus UI" 
                className="w-full h-full object-cover opacity-50 group-hover:opacity-20 transition-all duration-500 rounded transform group-hover:scale-[1.02]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSTZhENYaJTSD-25LZ3KWY8FUNkSiEU0GENl2Q9Mgf7NrHi5Fphz6OPflxOy8x1YGUKTGsawpAlxw6EEwVghyP9HjxayZR3sNyvs7zxOxD0LkuSsysXTH8a9l9Q_HxWodVEsOHF7fpDhVr1GlzGX4sDfRm2T23qsNGv2c7N33ux8o7xz9TzkKFyojCZGYkSPyW40h1b3QhISE0g3JHWoQSJ86MEweLDc2H3G9rH-jjvVOWNYjC57ad7Ru9mUbulx_6O-PtFVq7dAEk"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/40 to-black/70 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute bottom-4 left-4 flex flex-col gap-1 text-left">
                <span className="font-mono text-[9px] text-gold uppercase tracking-widest font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" /> TECHNOLOGY SPECIFICATION 
                </span>
                <h3 className="font-display text-4xl text-on-surface uppercase tracking-wide">PROMETHEUS ENGINE</h3>
              </div>
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between text-left">
              <p className="font-sans text-xs md:text-sm text-[#d0c5b2] leading-relaxed mb-6">
                Integrated biomechanical telemetry. Real-time spinal load ratios, bar travel deflection sensors, and joint angle alerts milled directly into the structural steel ecosystems.
              </p>
              
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setShowTelemetrySim(!showTelemetrySim)}
                  className="w-full h-11 bg-[#151715]/40 hover:bg-gold/[0.08] hover:border-gold hover:shadow-[0_0_15px_rgba(201,168,76,0.15)] border border-gold/45 font-label-caps text-xs tracking-widest font-bold text-gold transition-all duration-300 ease-out flex items-center justify-center gap-2 cursor-pointer uppercase min-h-[44px]"
                >
                  <RotateCcw className="w-4 h-4 mt-0.5" />
                  {showTelemetrySim ? 'Collapse Telemetry Grid Feed' : 'DISCOVER TECH (Simulate Live Feeds)'}
                </button>

                {showTelemetrySim && (
                  <div className="mt-2 text-on-surface w-full">
                    <BiomechanicalTelemetry />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feature Card 2: Prowl Audio */}
          <div 
            className="bg-[#111] border border-outline-variant flex flex-col justify-between group overflow-hidden transition-all duration-300"
            id="audio-spotlight"
          >
            <div className="aspect-[16/9] bg-obsidian relative overflow-hidden flex items-center justify-center">
              <img 
                alt="Prowl Audio" 
                className="w-full h-full object-cover opacity-50 group-hover:opacity-20 transition-all duration-500 rounded transform group-hover:scale-[1.02]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDLAjqyZkaqTPr8QQVOshZBovOyE3H7bXG7pIREAPrCbRcrCAl0mY4zIs6sgYjdeLLW0McH74ewBpSJ4OGpoFPL6Phw1uVuJtU2jYC2Wf9crnBkQS8oVqZ7J5tOpTaskvEhQIkPY00-0JYLT5vQV9aegblDXZ3v5dIqYnkPzGuagRsRt7ElIOPa6UBUzp-mJW-C1YKyHt8Hc20V1GXHqTW4c-G7gHvmlttA6hdhHfnLOHjQctQLupnXlPa6RFeXW8g48SgMy3tAopQ"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/40 to-black/70 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute bottom-4 left-4 flex flex-col gap-1 text-left">
                <span className="font-mono text-[9px] text-gold uppercase tracking-widest font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" /> AUDIOPHILE DISCIPLINE
                </span>
                <h3 className="font-display text-4xl text-on-surface uppercase tracking-wide">PROWL ACOUSTICS</h3>
              </div>
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between text-left">
              <p className="font-sans text-xs md:text-sm text-[#d0c5b2] leading-relaxed mb-6">
                Acoustic isolation engineered for absolute physical focus. Block distracting low-register barbell clang and maximize internal adrenaline flow throughout heavy loading regimes.
              </p>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setShowAudioSim(!showAudioSim)}
                  className="w-full h-11 bg-[#151715]/40 hover:bg-gold/[0.08] hover:border-gold hover:shadow-[0_0_15px_rgba(201,168,76,0.15)] border border-gold/45 font-label-caps text-xs tracking-widest font-bold text-gold transition-all duration-300 ease-out flex items-center justify-center gap-2 cursor-pointer uppercase min-h-[44px]"
                >
                  <RotateCcw className="w-4 h-4 mt-0.5" />
                  {showAudioSim ? 'Inhibit Phase Suppress Simulation' : 'PRE-ORDER (Verify Phase Cancellation)'}
                </button>

                {showAudioSim && (
                  <div className="mt-2 text-on-surface w-full">
                    <ProwlAudioDemo />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 9. Elite Directives - Interactive Quote testimonials */}
        <section className="px-6 py-12 border-y border-outline-variant bg-[#111111]/80 flex flex-col items-center text-center select-none" id="quotes">
          <h2 className="font-display text-4xl text-on-surface leading-none mb-10 uppercase tracking-wide">
            Elite Directives
          </h2>
          
          <div className="relative w-full max-w-3xl h-[170px] flex flex-col justify-center items-center">
            {TESTIMONIALS.map((t, index) => {
              const isActive = index === activeTestimonial;
              return (
                <div 
                  key={index}
                  className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
                >
                  <blockquote className="font-serif text-lg md:text-2xl text-[#f5f4f0] max-w-2xl px-4 leading-normal leading-relaxed italic">
                    "{t.quote}"
                  </blockquote>
                  <cite className="font-label-caps text-xs text-gold tracking-[0.2em] font-semibold mt-4 block not-italic uppercase">
                    {t.author} &bull; {t.role}
                  </cite>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2.5 mt-8 max-w-xs justify-center items-center">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTestimonial(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${
                  idx === activeTestimonial ? 'bg-gold' : 'bg-outline-variant hover:bg-gold/40'
                }`}
                aria-label={`Slide target ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* 10. Technical Registry Signup (Command Link form) */}
        <section className="py-12 flex flex-col items-center justify-center text-center bg-[#111] border border-outline-variant p-8 md:p-12 relative" id="technical-registry">
          <div className="absolute top-4 left-4 font-mono text-[9px] text-muted select-none">STATION KEY // SECURE AUTH</div>
          
          <h2 className="font-display text-5xl md:text-7xl text-on-surface leading-none mb-2 uppercase tracking-wide">
            Train Like You Mean It
          </h2>
          <p className="font-sans text-xs md:text-sm text-[#d0c5b2] mb-8 max-w-md">
            Join the elite registry for advanced notifications, early access to limited material batch runs, and custom structural drawings.
          </p>

          {registryCode ? (
            <div className="w-full max-w-md p-6 bg-obsidian border border-green-500/30 text-center animate-fade-in flex flex-col gap-2">
              <span className="font-mono text-[10px] text-green-400 uppercase tracking-widest block font-bold">✓ SECURITY COMMLINK LOGGED</span>
              <p className="font-sans text-[11px] text-[#acacac] mb-3">Your private credential passcode has been compiled and bound to your encrypted address:</p>
              <div className="p-3.5 bg-background border border-outline-variant font-mono text-xl text-gold font-bold tracking-widest select-all">
                {registryCode}
              </div>
              <p className="font-mono text-[9px] text-muted mt-2">COMMUNICATIVE SEQUENCE ESTABLISHED &bull; STAND BY FOR RADIAL BATCH INTEL</p>
            </div>
          ) : (
            <form onSubmit={handleRegistryRegister} className="flex flex-col sm:flex-row w-full max-w-lg border border-outline-variant bg-obsidian relative">
              <input 
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="ENTER SECURED EMAIL CHANNEL"
                className="w-full bg-transparent border-0 text-on-surface font-mono text-xs px-5 py-4 focus:ring-0 focus:outline-none placeholder:text-muted/50"
              />
              <button 
                type="submit"
                disabled={isRegistering}
                className="bg-gold text-[#0a0a0a] font-label-caps text-xs tracking-widest font-bold px-8 py-3.5 hover:bg-[#ffe08f] transition-all hover:scale-101 border-t sm:border-t-0 sm:border-l border-outline-variant cursor-pointer shrink-0 uppercase text-center"
              >
                {isRegistering ? 'PROCESSING...' : 'INITIATE REGISTER'}
              </button>
            </form>
          )}
        </section>

      </main>

      {/* 11. Custom Full Footer Layout */}
      <footer className="bg-[#111111] w-full border-t border-outline-variant mt-20 select-none">
        <div className="max-w-7xl mx-auto py-16 px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
          
          {/* Column 1: Brand & vision statement */}
          <div className="flex flex-col gap-4">
            <div className="font-display text-4xl text-gold tracking-widest uppercase">PROWL</div>
            <p className="font-sans text-xs text-[#acacac] leading-relaxed max-w-sm">
              Engineered precision for the elite athlete. Uncompromising industrial design and tactical structural steel components designed with zero failure parameters.
            </p>
          </div>

          {/* Column 2: Equipment range */}
          <div className="flex flex-col gap-3">
            <h4 className="font-label-caps text-xs text-on-surface tracking-widest uppercase font-semibold mb-1">EQUIPMENT FLIGHTS</h4>
            <a href="#customizer" onClick={(e) => handleAnchorClick(e, 'customizer')} className="font-sans text-xs text-muted hover:text-gold transition-colors block">Phantom Racks</a>
            <a href="#signature-pieces-view" onClick={(e) => handleAnchorClick(e, 'signature-pieces-view')} className="font-sans text-xs text-muted hover:text-gold transition-colors block">Calibrated Barbells</a>
            <a href="#signature-pieces-view" onClick={(e) => handleAnchorClick(e, 'signature-pieces-view')} className="font-sans text-xs text-muted hover:text-gold transition-colors block">Precision Bench Supports</a>
            <a href="#spots" onClick={(e) => handleAnchorClick(e, 'spots')} className="font-sans text-xs text-muted hover:text-gold transition-colors block text-gold">Prometheus Telemetry</a>
          </div>

          {/* Column 3: Engineering resources */}
          <div className="flex flex-col gap-3">
            <h4 className="font-label-caps text-xs text-on-surface tracking-widest uppercase font-semibold mb-1">ENGINEERING LABS</h4>
            <a href="#spots" onClick={(e) => handleAnchorClick(e, 'spots')} className="font-sans text-xs text-muted hover:text-gold transition-colors block">Acoustics Labs</a>
            <a href="#scounter" onClick={(e) => handleAnchorClick(e, 'scounter')} className="font-sans text-xs text-muted hover:text-gold transition-colors block">Calibrated Stress Testing</a>
            <a href="#scounter" onClick={(e) => handleAnchorClick(e, 'scounter')} className="font-sans text-xs text-muted hover:text-gold transition-colors block">Patented Biomechanics</a>
            <a href="#technical-registry" onClick={(e) => handleAnchorClick(e, 'technical-registry')} className="font-sans text-xs text-muted hover:text-gold transition-colors block">Technical briefs</a>
          </div>

          {/* Column 4: Contact & security registry logs */}
          <div className="flex flex-col gap-3">
            <h4 className="font-label-caps text-xs text-on-surface tracking-widest uppercase font-semibold mb-1">SECURED COMM CHANNEL</h4>
            <div className="font-sans text-xs text-[#acacac] flex items-center gap-2">
              <Mail className="w-4 h-4 text-gold shrink-0" />
              <span>neilbanerjee2007@gmail.com</span>
            </div>
            <div className="font-sans text-xs text-[#acacac] mt-1 space-y-1">
              <div className="text-muted block">Direct line // Houston Manufacturing hub</div>
              <div className="text-muted block">Status // Operational core locked</div>
            </div>
          </div>
        </div>

        {/* Outer sub footer lines */}
        <div className="max-w-7xl mx-auto border-t border-[#1e1f1d] py-8 px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center text-xs text-muted gap-4 font-mono">
          <div>
            © 2026 PROWL. ENGINEERED AEROSPACE ATHLETICISM. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <span>ENCRYPTED END-TO-END BLUEPRINT SPEC CHANNELS</span>
          </div>
        </div>
      </footer>

      {/* Persistent Order Slide compiler Sidebar */}
      <OrderDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        orderList={orderList}
        onRemoveItem={handleRemoveOrderItem}
        onClearOrder={handleClearOrder}
      />

      {/* Gold Custom Cursor tracking render */}
      {!isTouchDevice && (
        <>
          <div 
            ref={cursorDotRef}
            className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-gold w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 opacity-0"
          />
          <div 
            ref={cursorRingRef}
            className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border border-gold/45 w-[26px] h-[26px] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-[border-color,background-color] duration-300"
          />
        </>
      )}
    </div>
  );
}
