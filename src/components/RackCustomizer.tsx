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
  { id: 'obsidian', name: 'Obsidian Black', hex: '#111111', price: 0 },
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
    // Fire callback
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
    <div className="w-full bg-surface-container border border-outline-variant flex flex-col group overflow-hidden">
      {/* Upper info panel */}
      <div className="p-6 border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1c1c1e] gap-4">
        <div>
          <h3 className="font-display text-4xl leading-tight text-on-surface uppercase tracking-wide">
            PHANTOM POWER SERIES
          </h3>
          <p className="font-label-caps text-xs text-gold/80 mt-1 uppercase tracking-widest flex items-center gap-1.5">
            Elite Modular Power Rack System
          </p>
        </div>
        <div className="text-right">
          <span className="font-mono text-xs text-muted uppercase block">Estimated Configuration Total</span>
          <span className="font-display text-4xl text-gold">₹{totalPricing.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Visual illustration + config columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        
        {/* Left column: Visual display block */}
        <div className="relative aspect-square lg:aspect-auto min-h-[380px] bg-obsidian flex flex-col items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-outline-variant overflow-hidden">
          {/* Subtle color highlight ring mimicking customized finish */}
          <div 
            className="absolute inset-0 opacity-[0.06] blur-[150px] transition-all duration-700 rounded-full"
            style={{ backgroundColor: config.finish.hex }}
          />

          {/* Dynamic Specs details floating overlay */}
          <div className="absolute top-4 left-4 flex flex-col gap-1 z-1 font-mono text-[9px] uppercase border border-outline-variant p-2.5 bg-obsidian/75">
            <span className="text-muted">Frame Profile: 3" x 3" 11G</span>
            <span className="text-muted">Finish: <span className="text-gold font-bold">{config.finish.name}</span></span>
            <span className="text-muted">PullUp: <span className="text-gold font-bold">{config.pullUp.name}</span></span>
            <span className="text-muted">System load rating: 1500 lbs</span>
          </div>

          <img 
            alt="Phantom Elite Rack" 
            className="relative z-1 max-h-[320px] object-contain object-center opacity-85 hover:opacity-100 transition-opacity duration-500 scale-100 hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbi4JuDI5VFJufihNfEae-jLY682yz5aTobMMG662hekbapmBtBpvqflqKuVwgCZNtOQATQRNDF8o9h91TpcYEd9nJUjORQUpugguDTeDiDtsIL3MAK6MO9wQMCA6Bcbjg6myuBQOdKFWmfQ4e-yQ1z75jJ8B3HkqqZNNMOFAFqKxftOmtUqEiyyEkkTwVaNIUpEH1kyi9p7Y8QCc_FG4HpK7_xLM3py7f3qWl4GC2yw4e-VeqwkeABt5jlj5sl9a22FbqraUNRtz-"
          />

          {/* Customize label watermark */}
          <div className="absolute bottom-4 right-4 bg-surface border border-outline-variant px-3 py-1.5 flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-gold animate-spin" style={{ animationDuration: '6s' }} />
            <span className="font-label-caps text-[10px] text-muted tracking-widest uppercase">CAD Model Live</span>
          </div>
        </div>

        {/* Right column: Configurator switches and knobs */}
        <div className="flex flex-col p-6 justify-between bg-[#121412]/50">
          <div>
            {/* Header tab controller */}
            <div className="flex border-b border-outline-variant mb-5">
              {(['finish', 'bars', 'attachments'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 pb-3 text-center font-label-caps text-xs tracking-wider uppercase transition-colors relative ${
                    activeTab === tab ? 'text-gold font-bold' : 'text-muted hover:text-on-surface'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gold" />
                  )}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: FINISH SELECTION */}
            {activeTab === 'finish' && (
              <div className="flex flex-col gap-4">
                <span className="font-mono text-[10px] text-muted uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold" /> Select Structural Steel Finish
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {FINISHES.map(f => (
                    <button
                      key={f.id}
                      onClick={() => handleFinishChange(f.id)}
                      className={`p-3.5 flex flex-col items-start gap-1 border text-left transition-all relative ${
                        config.finish.id === f.id
                          ? 'border-gold bg-gold/5'
                          : 'border-outline-variant hover:border-gold/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-3 h-3 border border-outline" 
                          style={{ backgroundColor: f.hex }} 
                        />
                        <span className="font-sans text-xs font-semibold text-on-surface">{f.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-gold pl-[22px]">
                        {f.price === 0 ? 'Included' : `+₹${f.price.toLocaleString('en-IN')}`}
                      </span>
                      {config.finish.id === f.id && (
                        <Check className="w-3.5 h-3.5 text-gold absolute top-2 right-2" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-2 bg-[#1c1c1e] p-3 text-[11px] font-sans text-muted flex items-start gap-2">
                  <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span>All powder formulations are double-baked electrostatically for maximum surface abrasion and rust protection in any climate.</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PULL UP & PULLEYS */}
            {activeTab === 'bars' && (
              <div className="flex flex-col gap-5">
                {/* Pull-up section */}
                <div className="flex flex-col gap-2.5">
                  <span className="font-mono text-[10px] text-muted uppercase">1. Upper Crossmember Pull-up Station</span>
                  <div className="flex flex-col gap-1.5">
                    {PULL_UP_BARS.map(bar => (
                      <button
                        key={bar.id}
                        onClick={() => handlePullUpChange(bar.id)}
                        className={`p-3 flex justify-between items-center border text-left transition-all ${
                          config.pullUp.id === bar.id
                            ? 'border-gold bg-gold/5'
                            : 'border-outline-variant hover:border-gold/30'
                        }`}
                      >
                        <span className="font-sans text-xs text-on-surface">{bar.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-gold font-bold">
                            {bar.price === 0 ? 'Standard' : `+₹${bar.price.toLocaleString('en-IN')}`}
                          </span>
                          {config.pullUp.id === bar.id && <Check className="w-3.5 h-3.5 text-gold" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vertical Cable system */}
                <div className="flex flex-col gap-2.5">
                  <span className="font-mono text-[10px] text-muted uppercase">2. Biomechanical Cable Pulleys</span>
                  <div className="flex flex-col gap-1.5">
                    {PULLEYS.map(pulley => (
                      <button
                        key={pulley.id}
                        onClick={() => handlePulleyChange(pulley.id)}
                        className={`p-3 flex justify-between items-center border text-left transition-all ${
                          config.pulley.id === pulley.id
                            ? 'border-gold bg-gold/5'
                            : 'border-outline-variant hover:border-gold/30'
                        }`}
                      >
                        <span className="font-sans text-xs text-on-surface">{pulley.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-gold font-bold">
                            {pulley.price === 0 ? 'Standard Frame Only' : `+₹${pulley.price.toLocaleString('en-IN')}`}
                          </span>
                          {config.pulley.id === pulley.id && <Check className="w-3.5 h-3.5 text-gold" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: MODULAR ATTACHMENTS */}
            {activeTab === 'attachments' && (
              <div className="flex flex-col gap-2.5">
                <span className="font-mono text-[10px] text-muted uppercase mb-1">Add Elite System Attachments</span>
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {ATTACHMENTS.map(att => {
                    const isChecked = config.attachments.includes(att.id);
                    return (
                      <div
                        key={att.id}
                        onClick={() => toggleAttachment(att.id)}
                        className={`p-3 border flex justify-between items-center cursor-pointer transition-all ${
                          isChecked ? 'border-gold bg-gold/5' : 'border-outline-variant hover:border-gold/20'
                        }`}
                      >
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="font-sans text-xs font-semibold text-on-surface">{att.name}</span>
                          <span className="font-sans text-[10px] text-muted">{att.desc}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-gold font-bold">+₹{att.price.toLocaleString('en-IN')}</span>
                          <div className={`w-4 h-4 border flex items-center justify-center ${
                            isChecked ? 'border-gold bg-gold text-background' : 'border-outline'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Configuration sub actions */}
          <div className="mt-6 flex flex-col gap-2.5 border-t border-outline-variant pt-4">
            <button
              onClick={handleAddToOrderClick}
              className="w-full h-11 bg-gold text-[#0a0a0a] font-label-caps text-sm tracking-widest font-bold hover:bg-[#ffe08f] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer transform active:scale-98"
            >
              <Box className="w-4 h-4" /> Add Customized Rig to Order
            </button>

            {copiedNotification === 'success' && (
              <p className="text-center font-mono text-[10px] text-green-400 animate-pulse uppercase">
                ✓ Rack configuration successfully saved to active build list
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
