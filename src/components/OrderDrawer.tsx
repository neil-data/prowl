import { useState, useMemo, FormEvent } from 'react';
import { X, Trash2, Send, Info, ShoppingCart, CheckCircle, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { OrderItem } from '../types';

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderList: OrderItem[];
  onRemoveItem: (index: number) => void;
  onClearOrder: () => void;
}

export default function OrderDrawer({ isOpen, onClose, orderList, onRemoveItem, onClearOrder }: OrderDrawerProps) {
  const [whiteGloveService, setWhiteGloveService] = useState<boolean>(true);
  const [clientEmail, setClientEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [quoteNumber, setQuoteNumber] = useState<string | null>(null);

  // Subtotal calculations
  const summary = useMemo(() => {
    let subtotal = 0;
    orderList.forEach(item => {
      const unitPrice = item.customPrice ?? item.product.price;
      subtotal += unitPrice * item.qty;
    });

    const assemblyCost = whiteGloveService && orderList.length > 0 ? 48015 : 0; // 495 * 97
    const estimatedTax = subtotal * 0.0825;
    const finalTotal = subtotal + assemblyCost + estimatedTax;

    return { subtotal, assemblyCost, estimatedTax, finalTotal };
  }, [orderList, whiteGloveService]);

  const handleQuoteRequestSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clientEmail) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedCode = `PRW-${Math.round(2026 + Math.random() * 4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setQuoteNumber(generatedCode);
      setIsSubmitting(false);
    }, 2000);
  };

  const handleResetForm = () => {
    setQuoteNumber(null);
    setClientEmail('');
    onClearOrder();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#111111] border-l border-gold/20 shadow-2xl z-50 flex flex-col justify-between">
      {/* Drawer Title Block */}
      <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-[#1c1c1e]">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gold" />
          <h3 className="font-display text-2xl uppercase text-on-surface tracking-wide">
            ACTIVE EQUIPMENT COMPILER
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 border border-outline-variant hover:border-gold text-muted hover:text-gold transition-all duration-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Dynamic compiler body */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        {quoteNumber ? (
          /* Quote Request Success screen */
          <div className="flex flex-col gap-6 text-center justify-center items-center py-10 h-full">
            <div className="w-14 h-14 bg-gold/10 border border-gold flex items-center justify-center rounded-full">
              <CheckCircle className="w-7 h-7 text-gold stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-display text-3xl text-on-surface uppercase mb-2">PROWL BLUEPRINT COMPILED</h4>
              <p className="font-sans text-xs text-[#d0c5b2] max-w-sm mx-auto">
                Specifications matched. A dynamic CAD file layout, logistics timeline, and premium contract offer has been locked for:
              </p>
              <div className="my-4 p-3 bg-obsidian border border-outline-variant rounded">
                <span className="font-mono text-[10px] text-muted uppercase block">Exclusive Security ID</span>
                <span className="font-mono text-xl text-gold font-bold tracking-widest">{quoteNumber}</span>
              </div>
              <p className="font-sans text-[11px] text-[#acacac]">{clientEmail}</p>
            </div>
            
            {/* Quick check diagnostics summary */}
            <div className="w-full bg-[#141513] border border-outline-variant p-4 font-mono text-[10px] text-left">
              <span className="text-muted uppercase border-b border-[#222] pb-1 block mb-2">SECURED LOGISTICS SPEC SUMMARY</span>
              <div className="space-y-1">
                <div>• Frame Anchor Code: PRO-CAD99</div>
                <div>• Anchoring Required: {whiteGloveService ? 'YES (Prowl Certified Team)' : 'NO (Owner Assembly)'}</div>
                <div>• Total Calibrated Weight: ~{Math.round(orderList.length * 420)} lbs shipped</div>
                <div>• Status: AWAITS DISPATCH LOGISTICAL COUPLING</div>
              </div>
            </div>

            <button
              onClick={handleResetForm}
              className="mt-4 px-6 h-10 border border-gold text-gold font-label-caps text-xs tracking-widest hover:bg-gold hover:text-background transition-colors cursor-pointer"
            >
              BUILD A NEW SPECIFICATION
            </button>
          </div>
        ) : orderList.length === 0 ? (
          /* Cart Empty trigger */
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 h-full">
            <ShoppingCart className="w-12 h-12 text-[#4d4637] stroke-[1]" />
            <div>
              <h4 className="font-display text-2xl text-on-surface uppercase">COMPILER STREAM SILENT</h4>
              <p className="font-sans text-xs text-muted max-w-xs mt-1">
                Explore our signature strength pieces or customize your Phantom Power Rack to append items here.
              </p>
            </div>
          </div>
        ) : (
          /* Active item list */
          <div className="flex flex-col gap-4">
            <span className="font-mono text-[9px] text-muted uppercase tracking-widest block border-b border-[#222] pb-1">
              Calibrated Gear Log ({orderList.length} Items)
            </span>

            <div className="flex flex-col gap-3.5 max-h-[350px] overflow-y-auto pr-1">
              {orderList.map((item, idx) => {
                const configPrice = item.customPrice ?? item.product.price;
                return (
                  <div key={idx} className="p-4 bg-obsidian border border-outline-variant flex justify-between gap-4 relative">
                    <img
                      alt={item.product.name}
                      className="w-14 h-14 object-cover border border-[#222] bg-[#0c0d0c]"
                      src={item.product.image}
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="text-left">
                        <span className="font-mono text-[9px] text-gold uppercase tracking-wider block">
                          {item.product.category}
                        </span>
                        <h5 className="font-display text-lg text-on-surface uppercase leading-tight">
                          {item.product.name}
                        </h5>
                        
                        {/* Custom tags */}
                        {item.customizations && (
                          <div className="text-[10px] font-sans text-[#acacac] mt-1 space-y-0.5 leading-snug">
                            {item.customizations.finish && <div className="text-gold">Finish: {item.customizations.finish}</div>}
                            {item.customizations.pullUp && <div>Cap: {item.customizations.pullUp}</div>}
                            {item.customizations.attachments && item.customizations.attachments.length > 0 && (
                              <div>Addons: {item.customizations.attachments.join(', ')}</div>
                            )}
                          </div>
                        )}
                        {item.customPrice && (
                          <div className="mt-1 font-mono text-[9px] text-muted uppercase">✓ Multi-layered custom quote</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-mono text-[10px] text-muted">QTY: {item.qty}</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end">
                      <span className="font-mono text-xs text-gold font-bold">
                        ₹{(configPrice * item.qty).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => onRemoveItem(idx)}
                        className="p-1.5 text-muted hover:text-red-400 transition-colors cursor-pointer"
                        title="Dismount entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* White-Glove Anchor Services Toggle */}
            <div
              onClick={() => setWhiteGloveService(!whiteGloveService)}
              className={`p-4 border cursor-pointer mt-2 transition-all flex justify-between items-center ${
                whiteGloveService ? 'border-gold bg-gold/5' : 'border-outline-variant bg-transparent'
              }`}
            >
              <div className="flex-1 flex flex-col items-start gap-1 pr-4">
                <span className="font-sans text-xs font-semibold text-on-surface flex items-center gap-1.5 uppercase">
                  <ShieldCheck className="w-4 h-4 text-gold" style={{ strokeWidth: '2.5' }} /> CERTIFIED WHITE-GLOVE DEPLOYMENT
                </span>
                <span className="font-sans text-[10px] text-[#acacac] leading-normal text-left">
                  Professional structural wall & floor concrete anchors installed by credentialed Prowl engineers. Insured layout blueprint integration.
                </span>
              </div>
              <div className="text-right flex flex-col items-end shrink-0">
                <span className="font-mono text-xs font-bold text-gold">+₹{(48015).toLocaleString('en-IN')}</span>
                <div className={`mt-1 w-4 h-4 border flex items-center justify-center ${
                  whiteGloveService ? 'bg-gold border-gold text-background' : 'border-outline'
                }`}>
                  {whiteGloveService && <span className="text-[10px] font-bold">✓</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quote request form panel (remains constant if not checked out) */}
      {!quoteNumber && orderList.length > 0 && (
        <div className="p-6 bg-[#161715] border-t border-outline-variant flex flex-col gap-4">
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-muted uppercase">Equipment Subtotal</span>
              <span className="text-on-surface">₹{summary.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {whiteGloveService && (
              <div className="flex justify-between">
                <span className="text-muted uppercase">Assembly Logistics</span>
                <span className="text-[#ffe08f]">+₹{summary.assemblyCost.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted uppercase">Calibrated Tax</span>
              <span className="text-on-surface">₹{Math.round(summary.estimatedTax).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-t border-outline-variant pt-2 text-sm font-bold">
              <span className="text-gold uppercase font-mono">SPECIFICATION VALUATION</span>
              <span className="text-gold font-mono">₹{Math.round(summary.finalTotal).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <form onSubmit={handleQuoteRequestSubmit} className="mt-2 flex gap-2 w-full">
            <input
              type="email"
              required
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="ENTER COMM LINK EMAIL"
              className="flex-1 bg-obsidian border border-outline-variant text-[11px] font-mono px-4 h-11 text-on-surface focus:outline-none focus:border-gold placeholder:text-muted/60"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 h-11 bg-gold text-[#0a0a0a] font-label-caps text-xs tracking-widest font-bold hover:bg-[#ffe08f] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Send className="w-3.5 h-3.5 fill-current" />
              {isSubmitting ? 'TRANSMITTING...' : 'INITIATE CONTRACT'}
            </button>
          </form>

          <p className="font-sans text-[10px] text-muted text-center flex items-center justify-center gap-1">
            <Info className="w-3 h-3 text-[#c9a84c]" /> Lock pricing now. Custom floorplan drawings included.
          </p>
        </div>
      )}
    </div>
  );
}
