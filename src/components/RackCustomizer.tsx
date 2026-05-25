import { useState, useMemo } from 'react';
import { Settings, ShieldCheck, Check, Info, Box } from 'lucide-react';
import { RackConfiguration, EquipmentSpecs } from '../types';

interface RackCustomizerProps {
  onAddToOrder: (config: {
    product: EquipmentSpecs;
    customizations: {
      finish: string;
      pullUp: string;
      pulley: string;
      attachments: string[];
    };
    customPrice: number;
  }) => void;
}

// Fixed core specification for the base Phantom Rack
const PhantomBaseProduct: EquipmentSpecs = {
  id: 'phantom-power-series',
  name: 'Phantom Power Series Rack',
  category: 'System',
  price: 242403, // 2499 * 97
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbi4JuDI5VFJufihNfEae-jLY682yz5aTobMMG662hekbapmBtBpvqflqKuVwgCZNtOQATQRNDF8o9h91TpcYEd9nJUjORQUpugguDTeDiDtsIL3MAK6MO9wQMCA6Bcbjg6myuBQOdKFWmfQ4e-yQ1z75jJ8B3HkqqZNNMOFAFqKxftOmtUqEiyyEkkTwVaNIUpEH1kyi9p7Y8QCc_FG4HpK7_xLM3py7f3qWl4GC2yw4e-VeqwkeABt5jlj5sl9a22FbqraUNRtz-',
  description: 'Uncompromising strength. Fully customizable design crafted from laser-milled 11-gauge 3x3 steel framing with zero structural compromises.',
  specs: {
    materials: '11-gauge 3"x3" Laser Milled Structural Steel',
    loadRating: '1,500 lbs static capacity',
    dimensions: '90"H x 49"W x 52"D',
    coating: 'Electrostatic industrial grade matte textured powder coat'
  }
};

const FINISHES = [
  { id: 'obsidian', name: 'Obsidian Black Coating', hex: '#111111', price: 0 },
  { id: 'titangold', name: 'Monarch Gold Coat', hex: '#c9a84c', price: 33950 }, // 350 * 97
  { id: 'onyx-ruby', name: 'Crimson Onyx Powder', hex: '#881337', price: 17460 }, // 180 * 97
  { id: 'deepblue', name: 'Cobalt Blue Coat', hex: '#1e3a8a', price: 17460 }, // 180 * 97
];

const PULL_UP_BARS = [
  { id: 'straight', name: '1.25" Knurled Straight Bar', price: 0 },
  { id: 'multigrip', name: 'Apex Multi-Grip Dual Angled', price: 14550 }, // 150 * 97
  { id: 'globe', name: 'Titan Globe Grip Suspension Upper', price: 21340 }, // 220 * 97
];

const PULLEYS = [
  { id: 'none', name: 'None (Standalone Strength)', price: 0 },
  { id: 'dual-pulley', name: 'Simms Dual-Column Selector (250lbs)', price: 121250 }, // 1250 * 97
];

const ATTACHMENTS = [
  { id: 'sandwich-jcups', name: 'Premium Sandwich J-Cups (No-Mar)', price: 14550, desc: 'Ultra-high density molecular polymer guards' }, // 150 * 97
  { id: 'dip-station', name: 'Prowl Leveraged Dip Station', price: 19303, desc: '90-degree steel arm with magnetic locking peg' }, // 199 * 97
  { id: 'safety-straps', name: 'Reinforced Webbing Safety Straps', price: 29003, desc: '10,000lb rated multi-weave security support' }, // 299 * 97
  { id: 'spotter-arms', name: 'Laser-Cut 24" Spotter Arms', price: 24250, desc: 'Heavy duty extension for clean lifting lines' }, // 250 * 97
];

export default function RackCustomizer({ onAddToOrder }: RackCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'finish' | 'bars' | 'attachments'>('finish');
  const [copiedNotification, setCopiedNotification] = useState<'success' | null>(null);

  // Configuration State
  const [config, setConfig] = useState<RackConfiguration>({
    finish: FINISHES[0],
    pullUp: PULL_UP_BARS[0],
    pulley: PULLEYS[0],
    attachments: [ATTACHMENTS[0].id, ATTACHMENTS[2].id] // Default pre-configured sandwich and straps
  });

  // Calculate dynamic pricing
  const totalPricing = useMemo(() => {
    let price = PhantomBaseProduct.price;
    price += config.finish.price;
    price += config.pullUp.price;
    price += config.pulley.price;
    
    // Sum attachments
    config.attachments.forEach(attachmentId => {
      const match = ATTACHMENTS.find(a => a.id === attachmentId);
      if (match) price += match.price;
    });

    return price;
  }, [config]);

  // Dynamic estimated weight calculation for high luxury look
  const totalWeight = useMemo(() => {
    let weight = 385; // Base rack frame weight
    if (config.pullUp.id === 'multigrip') weight += 35;
    if (config.pullUp.id === 'globe') weight += 48;
    if (config.pulley.id === 'dual-pulley') weight += 500; // heavy selector stacks

    config.attachments.forEach(id => {
      if (id === 'sandwich-jcups') weight += 18;
      if (id === 'dip-station') weight += 28;
      if (id === 'safety-straps') weight += 12;
      if (id === 'spotter-arms') weight += 34;
    });
    return weight;
  }, [config]);

  const handleFinishChange = (finishId: string) => {
    const match = FINISHES.find(f => f.id === finishId);
    if (match) setConfig(prev => ({ ...prev, finish: match }));
  };

  const handlePullUpChange = (barId: string) => {
    const match = PULL_UP_BARS.find(b => b.id === barId);
    if (match) setConfig(prev => ({ ...prev, pullUp: match }));
  };

  const handlePulleyChange = (pulleyId: string) => {
    const match = PULLEYS.find(p => p.id === pulleyId);
    if (match) setConfig(prev => ({ ...prev, pulley: match }));
  };

  const toggleAttachment = (attachmentId: string) => {
    setConfig(prev => {
      const exists = prev.attachments.includes(attachmentId);
      const attachments = exists
        ? prev.attachments.filter(id => id !== attachmentId)
        : [...prev.attachments, attachmentId];
      return { ...prev, attachments };
    });
  };

  const handleAddToOrderClick = () => {
    onAddToOrder({
      product: PhantomBaseProduct,
      customizations: {
        finish: config.finish.name,
        pullUp: config.pullUp.name,
        pulley: config.pulley.name,
        attachments: config.attachments.map(id => {
          const m = ATTACHMENTS.find(a => a.id === id);
          return m ? m.name : id;
        })
      },
      customPrice: totalPricing
    });

    setCopiedNotification('success');
    setTimeout(() => {
      setCopiedNotification(null);
    }, 3000);
  };

  return (
    <div className="w-full bg-[#111111] border border-outline-variant flex flex-col group overflow-hidden relative shadow-2xl rounded-sm">
      
      {/* 1. Header Information Block: Apple/Porsche aesthetic */}
      <div className="p-4 sm:p-6 border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center bg-[#151715] gap-4">
        <div className="space-y-1">
          <span className="font-mono text-[9px] text-gold tracking-[0.2em] uppercase font-bold block">FLIGHT 01 // CUSTOM DESIGNER</span>
          <h3 className="font-display text-2xl sm:text-3xl md:text-4xl leading-none text-on-surface uppercase tracking-wide">
            PHANTOM ELITE RACK
          </h3>
          <p className="font-sans text-[11px] text-muted leading-relaxed max-w-sm sm:max-w-md">
            Laser-milled 11-gauge 3x3 structural steel. Fully calibrated configuration built to Swiss aerospace standards.
          </p>
        </div>
        <div className="text-left md:text-right w-full md:w-auto pt-2 md:pt-0 border-t border-outline-variant/30 md:border-t-0 flex md:flex-col justify-between md:justify-center items-center md:items-end gap-1">
          <div>
            <span className="font-mono text-[9px] text-muted uppercase block leading-none md:mb-1">Estimated Base+Config Build</span>
            <span className="font-display text-2xl sm:text-3xl md:text-4xl text-gold font-bold block transition-all duration-300">
              ₹{totalPricing.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Responsive Columns container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
        
        {/* Left column: Visual display block (5 cols) */}
        <div className="relative aspect-square sm:aspect-video lg:aspect-auto min-h-[310px] sm:min-h-[380px] lg:min-h-[460px] bg-[#0c0d0c] flex flex-col items-center justify-center p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-outline-variant overflow-hidden lg:col-span-5 select-none">
          
          {/* Scientific blueprint background grid & crosshairs */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/[0.04] via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          {/* Subtle finish color ambient feedback glow */}
          <div 
            className="absolute inset-0 opacity-[0.08] blur-[100px] transition-all duration-1000 rounded-full"
            style={{ backgroundColor: config.finish.hex }}
          />

          {/* Precision floating micro specs badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 font-mono text-[9px] uppercase border border-outline-variant/40 p-2.5 bg-[#0e100e]/90 select-none backdrop-blur-sm shadow-xl">
            <span className="text-muted flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gold" />
              Frame: 11G 3"x3"
            </span>
            <span className="text-muted">
              Weight Class: <span className="text-gold font-bold">{totalWeight} lbs</span>
            </span>
            <span className="text-muted">
              Finish: <span className="text-gold font-bold">{config.finish.name.split(' ')[0]}</span>
            </span>
            <span className="text-muted">
              Status: <span className="text-green-400 font-bold">READY TO MIL</span>
            </span>
          </div>

          <div className="absolute top-4 right-4 z-10">
            <div className="border border-outline-variant/40 px-2 py-1 bg-[#0e100e]/90 backdrop-blur-sm text-[9px] font-mono text-muted uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live CAD Rig
            </div>
          </div>

          {/* Model image with elegant hover scaling */}
          <img 
            alt="Prowl Modular Steel Power Rack configure" 
            className="relative z-1 max-h-[220px] sm:max-h-[300px] lg:max-h-[330px] object-contain object-center opacity-90 group-hover:scale-102 transition-transform duration-700 select-none pointer-events-none"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbi4JuDI5VFJufihNfEae-jLY682yz5aTobMMG662hekbapmBtBpvqflqKuVwgCZNtOQATQRNDF8o9h91TpcYEd9nJUjORQUpugguDTeDiDtsIL3MAK6MO9wQMCA6Bcbjg6myuBQOdKFWmfQ4e-yQ1z75jJ8B3HkqqZNNMOFAFqKxftOmtUqEiyyEkkTwVaNIUpEH1kyi9p7Y8QCc_FG4HpK7_xLM3py7f3qWl4GC2yw4e-VeqwkeABt5jlj5sl9a22FbqraUNRtz-"
          />

          {/* Tech CAD bottom badge details */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
            <span className="font-mono text-[8px] text-muted/60 uppercase">PROWLSYS-PTM.V2.6</span>
            <div className="flex items-center gap-1.5 bg-[#0e100e]/80 border border-outline-variant/30 px-2.5 py-1">
              <Settings className="w-3 h-3 text-gold animate-spin" style={{ animationDuration: '8s' }} />
              <span className="font-mono text-[9px] text-muted tracking-wide">3D ENG MATRIX ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Right column: Configurator selectors (7 cols) */}
        <div className="flex flex-col p-4 sm:p-6 lg:p-8 justify-between bg-[#111311] lg:col-span-7">
          
          {/* Tabs header container - Dynamic Horizontal Scroll architecture with Edge Fade masks */}
          <div className="mb-6 relative">
            <style dangerouslySetInnerHTML={{__html: `
              .no-scrollbar::-webkit-scrollbar {
                display: none !important;
              }
              .no-scrollbar {
                -ms-overflow-style: none !important;  /* IE and Edge */
                scrollbar-width: none !important;  /* Firefox */
              }
            `}} />
            
            {/* Edge fade gradient overlays for luxury mobile swipe indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#111311] via-[#111311]/60 to-transparent pointer-events-none z-10 md:hidden" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#111311] via-[#111311]/60 to-transparent pointer-events-none z-10 md:hidden" />
            
            {/* Scroll row wraps non-breaking inline buttons */}
            <div className="w-full overflow-x-auto overflow-y-hidden no-scrollbar -mx-4 sm:-mx-6 lg:mx-0 px-4 sm:px-6 lg:px-0 border-b border-outline-variant -webkit-overflow-scrolling-touch">
              <div className="flex flex-nowrap w-max min-w-full gap-1 sm:gap-4 pb-0.5 pr-10 sm:pr-16 md:pr-0">
                {(['finish', 'bars', 'attachments'] as const).map(tab => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-shrink-0 min-w-max md:flex-1 pb-3 text-center font-label-caps text-[10px] xs:text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-300 relative snap-center cursor-pointer min-h-[44px] px-2.5 xs:px-4 font-semibold select-none z-20 ${
                        isActive 
                          ? 'text-gold' 
                          : 'text-muted hover:text-on-surface'
                      }`}
                    >
                      {tab === 'finish' ? (
                        <>
                          <span className="xs:hidden">01 / Finish</span>
                          <span className="hidden xs:inline">01 // Frame Finish</span>
                        </>
                      ) : tab === 'bars' ? (
                        <>
                          <span className="xs:hidden">02 / Pulley</span>
                          <span className="hidden xs:inline">02 // Pulley & bar</span>
                        </>
                      ) : (
                        <>
                          <span className="xs:hidden">03 / Elite</span>
                          <span className="hidden xs:inline">03 // Elite Attachments</span>
                        </>
                      )}
                      
                      {/* Premium active bar anchored precisely under typography bounds */}
                      {isActive && (
                        <div className="absolute bottom-0 left-2.5 right-2.5 xs:left-4 xs:right-4 h-[1.5px] bg-gold" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab contents window with high performance scroll bars and spacing scale */}
          <div className="flex-grow min-h-[220px]">
            
            {/* TAB CONTENT: COLOR & METRIC STEEL POWDER FINISH */}
            {activeTab === 'finish' && (
              <div className="flex flex-col gap-4 animate-fade-in text-left">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-muted uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-gold shrink-0" /> Select structural frame coatings
                  </span>
                  <span className="font-mono text-[9px] text-gold/80 bg-gold/5 px-2 py-0.5 border border-gold/15">DOUBLE ELECTROSTATIC</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {FINISHES.map(f => {
                    const isSelected = config.finish.id === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => handleFinishChange(f.id)}
                        className={`p-4 flex flex-col items-start gap-1.5 border text-left cursor-pointer transition-all relative min-h-[72px] rounded-sm group/btn ${
                          isSelected
                            ? 'border-gold bg-gold/[0.04] shadow-[0_0_15px_rgba(201,168,76,0.06)]'
                            : 'border-outline-variant hover:border-gold/30 hover:bg-gold/[0.01]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span 
                            className="w-4 h-4 border border-outline-variant shadow-inner transition-transform duration-300 group-hover/btn:scale-110" 
                            style={{ backgroundColor: f.hex }} 
                          />
                          <span className="font-sans text-xs font-semibold text-on-surface leading-none tracking-wide">{f.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-gold pl-[28px] font-bold">
                          {f.price === 0 ? 'Included with frame' : `+₹${f.price.toLocaleString('en-IN')}`}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 bg-gold flex items-center justify-center absolute top-2.5 right-2.5">
                            <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 bg-[#171917] p-3.5 border border-outline-variant/30 text-[11px] font-sans text-muted flex items-start gap-3">
                  <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span>All powder formulas undergo double-bake electrostatic cure schedules, offering supreme chemical resistance against sweat, acidity, in-gym humidity and raw iron friction.</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CHROME PULL UP BARS & HYDRAULIC PULLEYS */}
            {activeTab === 'bars' && (
              <div className="flex flex-col gap-5 animate-fade-in text-left">
                
                {/* Pull-up layout block */}
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">1. Choose Upper crossmember architecture</span>
                  <div className="flex flex-col gap-2">
                    {PULL_UP_BARS.map(bar => {
                      const isSelected = config.pullUp.id === bar.id;
                      return (
                        <button
                          key={bar.id}
                          onClick={() => handlePullUpChange(bar.id)}
                          className={`p-4 flex flex-row items-center justify-between border text-left cursor-pointer transition-all gap-3 min-h-[52px] rounded-sm ${
                            isSelected
                              ? 'border-gold bg-gold/[0.04]'
                              : 'border-outline-variant hover:border-gold/30'
                          }`}
                        >
                          <span className="font-sans text-xs font-semibold text-on-surface tracking-wide">{bar.name}</span>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono text-xs text-gold font-bold">
                              {bar.price === 0 ? 'Standard setup' : `+₹${bar.price.toLocaleString('en-IN')}`}
                            </span>
                            <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                              isSelected ? 'border-gold bg-gold text-black' : 'border-outline-variant'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pulley system details */}
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">2. Biomechanical pulley cable systems</span>
                  <div className="flex flex-col gap-2">
                    {PULLEYS.map(pulley => {
                      const isSelected = config.pulley.id === pulley.id;
                      return (
                        <button
                          key={pulley.id}
                          onClick={() => handlePulleyChange(pulley.id)}
                          className={`p-4 flex flex-row items-center justify-between border text-left cursor-pointer transition-all gap-4 min-h-[52px] rounded-sm ${
                            isSelected
                              ? 'border-gold bg-gold/[0.04]'
                              : 'border-outline-variant hover:border-gold/30'
                          }`}
                        >
                          <span className="font-sans text-xs font-semibold text-on-surface tracking-wide">{pulley.name}</span>
                          <div className="flex items-center gap-3 shrink-0 col-span-3">
                            <span className="font-mono text-xs text-gold font-bold">
                              {pulley.price === 0 ? 'Pure Frame Core' : `+₹${pulley.price.toLocaleString('en-IN')}`}
                            </span>
                            <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                              isSelected ? 'border-gold bg-gold text-black' : 'border-outline-variant'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: HIGHEST MOBILITY ATTACHMENTS */}
            {activeTab === 'attachments' && (
              <div className="flex flex-col gap-3.5 animate-fade-in text-left">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-mono text-[10px] text-muted uppercase">3. Choose calibrated station utilities</span>
                  <span className="font-mono text-[9px] text-[#acacac]">MAGNETIC PIN MOUNTED</span>
                </div>
                
                <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-1 select-none scrollbar-thin">
                  {ATTACHMENTS.map(att => {
                    const isChecked = config.attachments.includes(att.id);
                    return (
                      <div
                        key={att.id}
                        onClick={() => toggleAttachment(att.id)}
                        className={`p-3.5 border flex items-center justify-between cursor-pointer transition-all gap-4 rounded-sm min-h-[56px] ${
                          isChecked 
                            ? 'border-gold bg-gold/[0.04]' 
                            : 'border-outline-variant hover:border-gold/20'
                        }`}
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-sans text-xs font-bold text-on-surface leading-none tracking-wide">{att.name}</span>
                          <span className="font-sans text-[10px] text-muted leading-relaxed sm:max-w-md">{att.desc}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono text-xs text-gold font-extrabold">+₹{att.price.toLocaleString('en-IN')}</span>
                          <div className={`w-5 h-5 border flex items-center justify-center rounded-sm transition-colors ${
                            isChecked ? 'border-gold bg-gold text-black' : 'border-outline-variant'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Base button and notifications */}
          <div className="mt-8 flex flex-col gap-3 border-t border-outline-variant/50 pt-5">
            <button
              onClick={handleAddToOrderClick}
              className="w-full h-12 bg-gold hover:bg-[#ffe08f] text-black font-label-caps text-xs tracking-[0.2em] font-extrabold transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer rounded-sm transform active:scale-[0.98] select-none hover:shadow-[0_0_20px_rgba(201,168,76,0.25)] min-h-[44px]"
            >
              <Box className="w-4 h-4 stroke-[2.5]" /> Build & Commit Active configuration
            </button>

            {copiedNotification === 'success' && (
              <p className="text-center font-mono text-[9px] text-green-400 animate-pulse uppercase tracking-wider font-semibold py-1">
                ✓ Phantom Config successfully saved to your Active Build compile registry
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. EXCLUSIVE HIGH CONTRAST STICKY BOTTOM BAR FOR MOBILE: Apple/Porsche checkout style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[49] bg-[#0c0d0c]/95 backdrop-blur-md border-t border-outline-variant p-4 flex items-center justify-between shadow-2xl transition-all duration-300 pointer-events-auto">
        <div className="flex flex-col text-left">
          <span className="font-mono text-[8px] text-muted uppercase tracking-widest leading-none mb-1">Phantom total configuration</span>
          <span className="font-display text-xl text-gold font-black">₹{totalPricing.toLocaleString('en-IN')}</span>
        </div>
        
        <button
          onClick={handleAddToOrderClick}
          className="bg-gold hover:bg-[#ffe08f] text-black font-label-caps text-[10px] tracking-widest font-extrabold px-5 h-11 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(191,158,56,0.15)] rounded-xs"
        >
          <Box className="w-3.5 h-3.5 shrink-0" /> Commit Build
        </button>
      </div>

    </div>
  );
}
