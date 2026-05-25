import React, { useState, useMemo } from 'react';
import { SwatchBook, ShieldCheck, Check, ShoppingBag, Eye, X, ZoomIn, FileText } from 'lucide-react';
import { EquipmentSpecs } from '../types';

interface ProductCatalogProps {
  onAddProduct: (product: EquipmentSpecs, qty: number, options?: { color?: string }) => void;
}

// Complete structural data for all six elite Prowl flagship signature pieces
export const SIGNATURE_PIECES: EquipmentSpecs[] = [
  {
    id: 'pinnacle-barbell',
    name: 'Pinnacle Barbell',
    category: 'Freeweight',
    price: 43650, // 450 * 97
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUhyOrLuTsay91gNEtWaNhLycrfX2EuK8OY3yPQ_3c8jtCKDRmAs-yZ2ipl6Wcr3wsoWhdv29YBvGChbgiPXB9Qe4wzYFhbVLUEn7YKKBp1ag6OUEWGTU50NW1kIlJ1C9AZzDwK7NVOduyRLCbv4p4h_Se-aCf8_9aTwwenSBnMuViSaD7mGmKN5KYN572xslgl6dgpuNTzQs0hlDyRYUbOH3tnFbiJ48Xzp1Ok7MlalHOBi9PGWdLiO26cFbSJDirkkcp5DtQLO9p',
    description: 'Precision machined under extreme hydraulic force. Hand-polished knurling and high-friction hard chrome sleeves offer an exceptional tactical response.',
    specs: {
      materials: '220,000 PSI Tensile Strength Steel Core',
      loadRating: '2,000 lbs continuous flex rating',
      dimensions: '2200mm length, 28mm shaft diameter',
      coating: 'Electroless solid nickel plating with custom raw gold collars'
    }
  },
  {
    id: 'pulse-cable',
    name: 'Pulse Cable System',
    category: 'System',
    price: 174600, // 1800 * 97
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByqlC6CeiHhmoP46qmsZJwsu7Xl8Ksy1-MNq9Y7p_E3PR7uF9_wCDNCFupPGMCiAGdQBgvQ2CQI5-hzFdb5aGHF6GjezGejRJjNvBqt5v2WQa_zINa8Ou0abzUTuF_tZCqZL7yI18eT2hZf7NJNrVUyG-SoXV6ouPk46E-DKPnm2seIyaUYBjuKSKq3eo6nqtMu8NgQ16Dbovs7f_4ZHfAdWQ66FhqYrD33THdg9zgZZXR1zJc1EVKlD8vjZRtlruDyukHp8q8ogaW',
    description: 'A wall-mounted cable system engineered with ultra-fluid high-speed pulleys. Operates on industrial aerospace cables to eliminate speed-lag.',
    specs: {
      materials: 'Dual solid stainless guide rails, structural aluminum pulleys',
      loadRating: '300 lbs weight stack with 2:1 leverage ratio',
      dimensions: '88"H x 18"W x 24"D offset',
      coating: 'Fusing polymer matte finish with raw knurled control tags'
    }
  },
  {
    id: 'prism-bench',
    name: 'Prism Bench',
    category: 'Support',
    price: 63050, // 650 * 97
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuq-GldsO8L4kvh7cq3aBXVCWf6exJhPi9VmTY4BjOVL0ypH2xoFxFv1TPgg59OPRS5jaT9XOua4iHSyztcMcYMihN4Ssslvvh6uc4KPgJV21PbenDF3FFoP7gzDaHIVkmsAvur0-9Dc-DQgermTqsW5qCxBn9JY4X7J7oo3eIRtl8pb3xeBn5yBZAfZSXCZ-T_jAcXsvWzC3W4fH4_VK7W9PM0s6rQpynAFk_fZU-S6k5N-Ehyf0uHBG2Jf_QOUzhbZiBB9VHe_nH',
    description: 'A structural workout bench that shifts angles smoothly in milliseconds. Features high-grip friction fabric to lock the upper back during lifts.',
    specs: {
      materials: 'Laser-cut 12G plates with multi-position chrome indexing arc',
      loadRating: '1,200 lbs combined user & bar load',
      dimensions: 'Flat height: 17.5", Pad width: 12", Length: 52"',
      coating: 'Raw gloss gunmetal protective varnish over dark slate steel'
    }
  },
  {
    id: 'portal-rack',
    name: 'Portal Accessory Rack',
    category: 'Storage',
    price: 106700, // 1100 * 97
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop', // Custom storage placeholder
    description: 'Minimalist industrial equipment station. Keeps elite barbells, bumpers, core pegs, and technical assets perfectly organized.',
    specs: {
      materials: 'Formed structural carbon-rolled steel, rubber dampeners',
      loadRating: '1,800 lbs static tier weight capacity',
      dimensions: '32"H x 74"W x 18"D options',
      coating: 'Anti-friction heavy black oxide powder layer with raw details'
    }
  },
  {
    id: 'pivot-smith',
    name: 'Pivot smith trainer',
    category: 'Guided',
    price: 310400, // 3200 * 97
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop', // Smith placeholder
    description: 'A linear smith track integrated with safety hooks and micro counterbalances to ensure a perfectly smooth and safe bar path.',
    specs: {
      materials: 'Linear precision caged ball bearings with solid shafts',
      loadRating: '800 lbs weight carriage capacity',
      dimensions: '88"H x 81"W x 48"D total foot depth',
      coating: 'Dual powder coat with satin titanium chrome sleeves'
    }
  },
  {
    id: 'peak-dumbbells',
    name: 'Peak Dumbbells Set',
    category: 'Freeweight',
    price: 87203, // 899 * 97
    image: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=600&auto=format&fit=crop', // Dumbbell placeholder
    description: 'Milled solid steel dumbbells with premium knurling. Replaces cluttered racks with highly compact, calibrated single-body dumbbells.',
    specs: {
      materials: 'Electroplated micro-calibrated solid steel heads',
      loadRating: 'Micro tolerance calibration error margin: <0.5%',
      dimensions: '5 lb to 50 lb sets with custom storage cradles',
      coating: 'Urethane textured bumper perimeter with flat steel endplates'
    }
  }
];

export default function ProductCatalog({ onAddProduct }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  
  // Custom specs configuration options inside micro modal
  const [customColor, setCustomColor] = useState<string>('Raw Steel');
  const [customQty, setCustomQty] = useState<number>(1);
  const [cartSuccessId, setCartSuccessId] = useState<string | null>(null);

  const categories = useMemo(() => {
    return ['ALL', 'Freeweight', 'System', 'Support', 'Storage', 'Guided'];
  }, []);

  const filteredPieces = useMemo(() => {
    if (selectedCategory === 'ALL') return SIGNATURE_PIECES;
    return SIGNATURE_PIECES.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [selectedCategory]);

  const activeProduct = useMemo(() => {
    return SIGNATURE_PIECES.find(p => p.id === activeModalId) || null;
  }, [activeModalId]);

  const handleAddToCart = (product: EquipmentSpecs) => {
    onAddProduct(product, customQty, { color: customColor });
    setCartSuccessId(product.id);
    setTimeout(() => {
      setCartSuccessId(null);
    }, 2500);
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -6;
    const rotateY = ((x - cx) / cx) * 6;

    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    
    const shine = card.querySelector('.card-shine-effect') as HTMLDivElement;
    if (shine) {
      shine.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(201, 168, 76, 0.15) 0%, transparent 60%)`;
    }
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    const shine = card.querySelector('.card-shine-effect') as HTMLDivElement;
    if (shine) {
      shine.style.background = 'none';
    }
  };

  const colors = ['Raw Steel', 'Satin Chrome', 'Premium Amber Gold', 'Carbon Charcoal'];

  return (
    <div className="w-full flex flex-col gap-6" id="signature-pieces-view">
      {/* Dynamic Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
        {/* Horizontal filter chips */}
        <div className="flex flex-wrap gap-2.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 font-label-caps text-xs tracking-wider uppercase border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-outline-variant hover:border-gold/30 text-muted'
              }`}
            >
              {cat === 'ALL' ? 'ALL PIECES' : cat}
            </button>
          ))}
        </div>
        <div className="font-mono text-[10px] text-muted uppercase">
          Showing {filteredPieces.length} exclusive models
        </div>
      </div>

      {/* Grid gallery layout */}
      <div className="catalog-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPieces.map((piece, index) => (
          <div
            key={piece.id}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={{ transformStyle: 'preserve-3d', willChange: 'transform', transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)' }}
            className="catalog-card group bg-[#111] border border-outline-variant flex flex-col justify-between hover:border-gold/40 transition-all duration-300 relative overflow-hidden"
          >
            {/* Dynamic Spotlight Shine Layer */}
            <div className="card-shine-effect absolute inset-0 pointer-events-none z-10" />

            {/* Visual Header */}
            <div className="aspect-[4/3] bg-[#0c0d0c] relative overflow-hidden flex items-center justify-center p-6 border-b border-outline-variant/30">
              <img
                alt={piece.name}
                className="max-h-[82%] max-w-[82%] object-contain opacity-70 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-500 grayscale group-hover:grayscale-0 select-none"
                src={piece.image}
              />
              <div className="absolute top-3 right-3 bg-obsidian/75 border border-outline-variant px-2 py-0.5 pointer-events-none">
                <span className="font-mono text-[9px] text-muted">0{index + 1}</span>
              </div>
              
              {/* Eye hovering overlay - hidden on mobile, display on desktop hover */}
              <div className="absolute inset-0 bg-obsidian/45 opacity-0 sm:group-hover:opacity-100 hidden sm:flex items-center justify-center gap-3 transition-opacity duration-300 z-20">
                <button
                  onClick={() => {
                    setCustomColor('Raw Steel');
                    setCustomQty(1);
                    setActiveModalId(piece.id);
                  }}
                  className="bg-gold text-black hover:bg-[#ffe08f] hover:shadow-[0_0_15px_rgba(201,168,76,0.22)] p-2.5 transition-all duration-300 hover:scale-105 cursor-pointer"
                  title="Verify Specifications"
                >
                  <Eye className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  onClick={() => handleAddToCart(piece)}
                  className="bg-[#0f110f]/90 text-gold hover:bg-gold/[0.12] hover:border-gold hover:shadow-[0_0_12px_rgba(201,168,76,0.18)] p-2.5 transition-all duration-300 hover:scale-105 border border-gold/45 cursor-pointer"
                  title="Quick Add to Order"
                >
                  <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Product labels */}
            <div className="p-5 border-t border-outline-variant bg-[#141513] flex flex-col gap-4 relative z-20">
              <div className="flex justify-between items-end">
                <div>
                  <span className="font-label-caps text-[10px] text-muted tracking-widest block mb-1">
                    {piece.category}
                  </span>
                  <h4 className="font-display text-2xl leading-none text-on-surface uppercase tracking-wide">
                    {piece.name}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs text-gold font-bold">
                    ₹{piece.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Mobile-only action buttons */}
              <div className="flex sm:hidden gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomColor('Raw Steel');
                    setCustomQty(1);
                    setActiveModalId(piece.id);
                  }}
                  className="flex-1 h-11 border border-gold/60 text-gold font-label-caps text-[11px] font-bold tracking-wider hover:bg-gold/10 active:bg-gold/20 flex items-center justify-center gap-1.5 cursor-pointer uppercase transition-all"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(piece);
                  }}
                  className="flex-1 h-11 bg-gold text-[#0a0a0a] font-label-caps text-[11px] font-bold tracking-wider hover:bg-[#ffe08f] active:bg-[#e0c06f] flex items-center justify-center gap-1.5 cursor-pointer uppercase transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Buy Now
                </button>
              </div>
            </div>

            {/* Added success indicators */}
            {cartSuccessId === piece.id && (
              <div className="absolute inset-x-0 bottom-0 py-1 bg-green-500 text-background font-mono text-[10px] text-center uppercase tracking-wider z-30">
                ✓ Added to list
              </div>
            )}
          </div>
        ))}
      </div>

      {/* DETAILED ENGINEERING SPECIFICATION MODAL (Lightbox) */}
      {activeProduct && (
        <div className="fixed inset-0 bg-obsidian/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-gold/30 max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden relative max-h-[90vh] overflow-y-auto">
            {/* Close trigger */}
            <button
              onClick={() => setActiveModalId(null)}
              className="absolute top-4 right-4 z-10 p-2 text-muted hover:text-gold transition-colors border border-outline-variant hover:border-gold/50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Picture block (5 cols) */}
            <div className="md:col-span-5 bg-obsidian relative min-h-[250px] md:min-h-full flex items-center justify-center border-b md:border-b-0 md:border-r border-outline-variant p-6">
              <div className="absolute top-4 left-4 flex items-center gap-1.5 font-mono text-[9px] text-[#c9a84c]/60">
                <ZoomIn className="w-3.5 h-3.5 text-gold" /> PHOTOMETRIC VIEW
              </div>
              <img
                alt={activeProduct.name}
                className="max-h-[300px] object-contain opacity-90 hover:scale-105 transition-transform duration-700"
                src={activeProduct.image}
              />
            </div>

            {/* Specification details column (7 cols) */}
            <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <span className="font-label-caps text-xs text-gold tracking-widest block mb-1">
                  CAD PROFILE: {activeProduct.category}
                </span>
                <h3 className="font-display text-4xl text-on-surface uppercase mb-3 text-shadow">
                  {activeProduct.name}
                </h3>
                <p className="font-sans text-xs text-[#d0c5b2] mb-6 leading-relaxed">
                  {activeProduct.description}
                </p>

                {/* Grid Technical Specifications blueprint readout */}
                <div className="border border-outline-variant bg-obsidian/50 p-4 mb-6">
                  <span className="font-mono text-[9px] text-gold uppercase block mb-3 flex items-center gap-1.5 border-b border-[#222] pb-1.5">
                    <FileText className="w-3.5 h-3.5" /> Static Engineering Reports
                  </span>
                  
                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 font-sans text-xs">
                    <div>
                      <span className="text-muted block text-[10px] uppercase font-mono mb-0.5">Primary Materials</span>
                      <span className="text-[#f5f4f0] font-medium">{activeProduct.specs.materials}</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[10px] uppercase font-mono mb-0.5">Tolerance Rating</span>
                      <span className="text-[#f5f4f0] font-medium">{activeProduct.specs.loadRating}</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[10px] uppercase font-mono mb-0.5">Form Dimensions</span>
                      <span className="text-[#f5f4f0] font-medium">{activeProduct.specs.dimensions}</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[10px] uppercase font-mono mb-0.5">Protective Coating</span>
                      <span className="text-[#f5f4f0] font-medium">{activeProduct.specs.coating}</span>
                    </div>
                  </div>
                </div>

                {/* Customizable Color Coatings */}
                <div className="mb-6 flex flex-col gap-2.5">
                  <span className="font-mono text-[10px] text-muted uppercase flex items-center gap-1">
                    <SwatchBook className="w-3.5 h-3.5 text-gold" /> Anodized Color Finish Accent
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(col => (
                      <button
                        key={col}
                        onClick={() => setCustomColor(col)}
                        className={`px-3 py-1 text-[11px] font-sans border transition-all cursor-pointer ${
                          customColor === col
                            ? 'border-gold bg-gold/10 text-gold'
                             : 'border-outline-variant text-[#acacac] hover:border-gold/30'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions toolbar */}
              <div className="border-t border-[#1a1b1a] pt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Qty count control */}
                <div className="flex items-center border border-outline-variant h-11">
                  <button
                    onClick={() => setCustomQty(q => Math.max(1, q - 1))}
                    className="w-10 text-center font-mono text-muted hover:text-gold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-mono text-sm text-gold font-bold">
                    {customQty}
                  </span>
                  <button
                    onClick={() => setCustomQty(q => q + 1)}
                    className="w-10 text-center font-mono text-muted hover:text-gold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    handleAddToCart(activeProduct);
                    setActiveModalId(null);
                  }}
                  className="flex-1 bg-gold text-[#0a0a0a] font-label-caps text-sm tracking-widest font-semibold h-11 hover:bg-[#ffe08f] transition-all flex items-center justify-center gap-2 cursor-pointer duration-300 transform active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Active Build &bull; ₹{(activeProduct.price * customQty).toLocaleString('en-IN')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
