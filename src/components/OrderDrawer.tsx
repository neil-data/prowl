import { useState, useMemo, FormEvent, useEffect, useRef } from 'react';
import { X, Trash2, Send, Info, ShoppingCart, CheckCircle, FileSpreadsheet, ShieldCheck, Printer, FileText, Share2, Check } from 'lucide-react';
import { OrderItem } from '../types';
import { gsap } from 'gsap';

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
  
  // Custom specification states (Bench custom design defaults)
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [isDownloadingSpec, setIsDownloadingSpec] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('LINK COPIED TO COMMS');
  const [copiedLink, setCopiedLink] = useState<string>('');
  const [isCheckoutCompleted, setIsCheckoutCompleted] = useState<boolean>(false);

  // Configurator options states
  const [selectedFinish, setSelectedFinish] = useState<string>('raw-steel');
  const [selectedUpholstery, setSelectedUpholstery] = useState<string>('standard-black');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['safety-spotter']);

  // Base configurations and prices
  const FINISH_DETAILS: Record<string, { name: string; price: number }> = {
    'raw-steel': { name: 'Raw Steel', price: 0 },
    'matte-black': { name: 'Matte Black', price: 200 },
    'brushed-chrome': { name: 'Brushed Chrome', price: 450 },
    'cerakote-gold': { name: 'Cerakote Gold', price: 800 },
  };

  const UPHOLSTERY_DETAILS: Record<string, { name: string; price: number }> = {
    'standard-black': { name: 'Standard Black', price: 0 },
    'italian-leather': { name: 'Italian Leather', price: 350 },
    'alcantara': { name: 'Alcantara', price: 600 },
    'custom-color': { name: 'Custom Color', price: 250 },
  };

  const ADDON_DETAILS: Record<string, { name: string; price: number }> = {
    'safety-spotter': { name: 'Safety Spotter Arms', price: 180 },
    'band-pegs': { name: 'Band Pegs (set of 4)', price: 90 },
    'landmine': { name: 'Landmine Attachment', price: 220 },
    'storage-horns': { name: 'Storage Horns', price: 140 },
  };

  // Base calculated subtotal from the Active Compiler cart
  const summary = useMemo(() => {
    let subtotal = 0;
    orderList.forEach(item => {
      const unitPrice = item.customPrice ?? item.product.price;
      subtotal += unitPrice * item.qty;
    });

    const assemblyCost = whiteGloveService && orderList.length > 0 ? 4950 : 0; // scaled nicely for premium layout in USD
    const estimatedTax = subtotal * 0.0825;
    const finalTotal = subtotal + assemblyCost + estimatedTax;

    return { subtotal, assemblyCost, estimatedTax, finalTotal };
  }, [orderList, whiteGloveService]);

  // Combined price calculations including configurator extras
  const calculatedTotal = useMemo(() => {
    let subtotal = summary.subtotal;

    // Configurator extras
    subtotal += FINISH_DETAILS[selectedFinish]?.price || 0;
    subtotal += UPHOLSTERY_DETAILS[selectedUpholstery]?.price || 0;
    selectedAddons.forEach(id => {
      subtotal += ADDON_DETAILS[id]?.price || 0;
    });

    const assemblyCost = whiteGloveService && orderList.length > 0 ? 4950 : 0;
    const estimatedTax = subtotal * 0.0825;
    const finalTotal = subtotal + assemblyCost + estimatedTax;

    return { subtotal, assemblyCost, estimatedTax, finalTotal };
  }, [summary.subtotal, selectedFinish, selectedUpholstery, selectedAddons, whiteGloveService, orderList.length]);

  // GSAP real-time price count animations
  const [animatedSubtotal, setAnimatedSubtotal] = useState<number>(calculatedTotal.subtotal);
  const [animatedTotal, setAnimatedTotal] = useState<number>(calculatedTotal.finalTotal);

  const prevSubtotalRef = useRef<number>(calculatedTotal.subtotal);
  const prevTotalRef = useRef<number>(calculatedTotal.finalTotal);

  useEffect(() => {
    const subtotalAnimObj = { val: prevSubtotalRef.current };
    const totalAnimObj = { val: prevTotalRef.current };

    const subtotalTween = gsap.to(subtotalAnimObj, {
      val: calculatedTotal.subtotal,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => setAnimatedSubtotal(Math.ceil(subtotalAnimObj.val)),
    });

    const totalTween = gsap.to(totalAnimObj, {
      val: calculatedTotal.finalTotal,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => setAnimatedTotal(Math.ceil(totalAnimObj.val)),
    });

    prevSubtotalRef.current = calculatedTotal.subtotal;
    prevTotalRef.current = calculatedTotal.finalTotal;

    return () => {
      subtotalTween.kill();
      totalTween.kill();
    };
  }, [calculatedTotal.subtotal, calculatedTotal.finalTotal]);

  const handleFinishChange = (key: string) => {
    // GSAP click pop effect on option button
    const target = document.getElementById(`finish-opt-${key}`);
    if (target) {
      gsap.fromTo(target, { scale: 0.95 }, { scale: 1, duration: 0.25, ease: 'back.out(2)' });
    }
    setSelectedFinish(key);
  };

  const handleUpholsteryChange = (key: string) => {
    const target = document.getElementById(`upholstery-opt-${key}`);
    if (target) {
      gsap.fromTo(target, { scale: 0.95 }, { scale: 1, duration: 0.25, ease: 'back.out(2)' });
    }
    setSelectedUpholstery(key);
  };

  const handleAddonToggle = (key: string) => {
    const target = document.getElementById(`addon-opt-${key}`);
    if (target) {
      gsap.fromTo(target, { scale: 0.96 }, { scale: 1, duration: 0.2, ease: 'power2.out' });
    }
    setSelectedAddons(prev => {
      if (prev.includes(key)) {
        return prev.filter(item => item !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const handleResetToDefault = () => {
    setSelectedFinish('raw-steel');
    setSelectedUpholstery('standard-black');
    setSelectedAddons(['safety-spotter']);
    gsap.fromTo('.prowl-config-card', { opacity: 0.8, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.05 });
  };

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

  const triggerNativePrint = () => {
    try {
      const printEl = document.getElementById('printable-blueprint');
      if (!printEl) {
        window.print();
        return;
      }
      
      // Create an isolated dynamic print iframe to guarantee single-page rendering and completely prevent empty page spillovers
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Prowl Order Specification Blueprint</title>
              <style>
                @page {
                  size: portrait;
                  margin: 12mm 15mm;
                }
                html, body {
                  margin: 0;
                  padding: 0;
                  background: #ffffff !important;
                  color: #000000 !important;
                  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                body {
                  padding: 10px;
                }
              </style>
            </head>
            <body>
              ${printEl.innerHTML}
            </body>
          </html>
        `);
        iframeDoc.close();
        
        // Wait minor delay, focus, and trigger print dialog
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          // Cleanup iframe immediately after the print spool starts
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1500);
        }, 500);
      } else {
        window.print();
      }
    } catch (e) {
      console.error('Print trigger failed, fallback to native window.print()', e);
      window.print();
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setToastMessage('SPECIFICATION COPIED TO CLIPBOARD');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2800);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const handleShareConfig = () => {
    const url = window.location.href;
    setCopiedLink(url);
    setToastMessage('LINK COPIED TO COMMS');
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
          .then(() => {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2800);
          })
          .catch(() => {
            fallbackCopy(url);
          });
      } else {
        fallbackCopy(url);
      }
    } catch (e) {
      fallbackCopy(url);
    }
  };

  const simulateBlueprintDownload = () => {
    setIsDownloadingSpec(true);
    setTimeout(() => {
      setIsDownloadingSpec(false);
      const textConfig = `
========================================================================
             PHANTOM INDUSTRIAL RIG SPECIFICATION BLUEPRINT
  PROWL BIOMECHANICAL STRENGTH LABS (REV: 2.05-B) // SYSTEM CALIBRATION
========================================================================

SYSTEM IDENTIFIER: ${quoteNumber || "PRW-DRAFT-SPEC-" + Math.round(Math.random() * 1000)}
COMMS CHANNEL CLIENT: ${clientEmail || "DRAFT CLIENT CONTEXT"}
DATE COMPILED: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
FRAME SPECIFICATION:
  - Base Structure: Carbon-rolled heavy industrial steel framing
  - Selected Finish Color: ${FINISH_DETAILS[selectedFinish]?.name}
  - Upholstery Material Compound: ${UPHOLSTERY_DETAILS[selectedUpholstery]?.name}
  
RIG COMPILER DETAILS & MODULAR ADDONS:
  - Active Optional Accessories: ${selectedAddons.length > 0 ? selectedAddons.map(id => ADDON_DETAILS[id]?.name).join(', ') : 'None'}

ACTIVE DEPLOYED EQUIPMENT STACKS:
${orderList.map((item, i) => `${i + 1}. [${item.product.category.toUpperCase()}] ${item.product.name} (Qty: ${item.qty}) - ₹${((item.customPrice ?? item.product.price) * item.qty).toLocaleString('en-IN')}`).join('\n')}

LOGISTICAL FINANCIAL OUTLINE:
  - Dynamic Config Equipment Subtotal: ₹${animatedSubtotal.toLocaleString('en-IN')}
  - Specialized Certified Assembly Logistics: ₹${calculatedTotal.assemblyCost.toLocaleString('en-IN')}
  - Calibrated Local Tax (8.25%): ₹${Math.round(calculatedTotal.estimatedTax).toLocaleString('en-IN')}
  - TOTAL CONTRACTUAL VALUATION (INR): ₹${animatedTotal.toLocaleString('en-IN')}

========================================================================
STATUS: APPROVED FOR DIRECT PROCUREMENT -- VALID UNDER SIGN-OFF SEAL
========================================================================
`;

      let downloaded = false;

      // 1. Core Blob Trigger for laptop downloads
      try {
        const blob = new Blob([textConfig.trim()], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Prowl_SpecBlueprint_${quoteNumber || 'Draft'}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        downloaded = true;
      } catch (err) {
        console.error('Blob download failed, fallback to data URI text', err);
      }

      // 2. Fallback Data URI Trigger for mobile browser systems (iOS Safari etc) that block sandboxed block blobs
      if (!downloaded) {
        try {
          const encodedText = encodeURIComponent(textConfig.trim());
          const link = document.createElement('a');
          link.href = 'data:text/plain;charset=utf-8,' + encodedText;
          link.setAttribute('download', `Prowl_SpecBlueprint_${quoteNumber || 'Draft'}.txt`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          downloaded = true;
        } catch (e) {
          console.error('Data-URI backup failed', e);
        }
      }

      // 3. Absolute Clipboard copy safety net so mobile users can always paste instantly!
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textConfig.trim())
            .then(() => {
              setToastMessage('DOWNLOADED & SPECS COPIED!');
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3200);
            })
            .catch(() => {
              const textArea = document.createElement("textarea");
              textArea.value = textConfig.trim();
              textArea.style.position = "fixed";
              textArea.style.left = "-9999px";
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              setToastMessage('DOWNLOADED & SPECS COPIED!');
              setShowToast(true);
              setTimeout(() => setShowToast(false), 3200);
            });
        } else {
          setToastMessage('SPEC SHEET COMPILED OK');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3200);
        }
      } catch (clipErr) {
        console.error('Clipboard injection error', clipErr);
        setToastMessage('SPEC SHEET COMPILED OK');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3200);
      }

    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div id="active-order-drawer" className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#111111] border-l border-gold/20 shadow-2xl z-50 flex flex-col justify-between">
      
      {/* Dynamic Print-Only Style Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          /* Hide all main app content blocks from print entirely to prevent scrolling spillover */
          #navbar, nav, main, footer, #cursor-dot-prowl, #cursor-ring-prowl, .cursor-dot, .cursor-ring {
            display: none !important;
          }
          /* Hide other internal children of the active order drawer except the printable blueprint */
          #active-order-drawer > *:not(#printable-blueprint) {
            display: none !important;
          }
          /* Refit the active order drawer outer class for layout flow */
          #active-order-drawer {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Ensure printable blueprint renders perfectly on a single page */
          #printable-blueprint {
            display: block !important;
            visibility: visible !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10px !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
            border: 2px solid #000000 !important;
          }
          #printable-blueprint * {
            visibility: visible !important;
            color: #000000 !important;
            background: transparent !important;
          }
        }
      `}} />

      {/* Copy notification popup toast */}
      {showToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-[#121212] border border-gold px-6 py-3 shadow-[0_0_24px_rgba(201,168,76,0.3)] z-[2000] flex items-center gap-3 transition-opacity duration-300">
          <div className="w-2 h-2 bg-gold animate-ping rounded-full" />
          <span className="font-mono text-xs text-gold uppercase tracking-[0.15em] font-medium">{toastMessage}</span>
        </div>
      )}

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
            <div className="w-full bg-[#141513] border border-[#222] p-4 font-mono text-[10px] text-left gap-2 flex flex-col">
              <span className="text-muted uppercase border-b border-[#222] pb-1 block mb-1">SECURED LOGISTICS SPEC SUMMARY</span>
              <div className="space-y-1">
                <div>• Frame Anchor Code: PRO-CAD99</div>
                <div>• Anchoring Required: {whiteGloveService ? 'YES (Prowl Certified Team)' : 'NO (Owner Assembly)'}</div>
                <div>• Total Calibration Mass: Hardened Grade Carbon base</div>
                <div>• Setup Mode: ACTIVE DISPATCH COUPLING</div>
              </div>
            </div>

            {/* Print trigger on success screen */}
            <button
              onClick={() => setShowConfigModal(true)}
              className="w-full h-11 border border-gold/45 hover:border-gold hover:shadow-[0_0_12px_rgba(201,168,76,0.18)] text-gold bg-transparent font-label-caps text-xs tracking-widest font-bold hover:bg-gold/[0.12] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer rounded-xs"
            >
              <Printer className="w-4 h-4 text-gold" style={{ strokeWidth: 2 }} />
              VIEW CAD BLUEPRINT & PRINT PDF
            </button>

            <button
              onClick={handleResetForm}
              className="mt-2 px-6 h-10 border border-gold/45 hover:border-gold hover:shadow-[0_0_12px_rgba(201,168,76,0.18)] text-gold font-label-caps text-xs tracking-widest hover:bg-gold/[0.12] transition-all duration-300 ease-out cursor-pointer"
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
                  Professional structural wall & floor concrete anchors installed by credentialed Prowl engineers. Insured layout blueprint integration (+ ₹4,950).
                </span>
              </div>
              <div className="text-right flex flex-col items-end shrink-0">
                <span className="font-mono text-xs font-bold text-gold">+₹4,950</span>
                <div className={`mt-1 w-4 h-4 border flex items-center justify-center ${
                  whiteGloveService ? 'bg-gold border-gold text-background' : 'border-outline'
                }`}>
                  {whiteGloveService && <span className="text-[10px] font-bold text-[#0a0a0a]">✓</span>}
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
                <span className="text-[#ffe08f]">+₹4,950</span>
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

          {/* Blueprint pdf trigger integration */}
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="w-full h-11 border border-gold/40 hover:border-gold hover:shadow-[0_0_12px_rgba(201,168,76,0.18)] text-gold bg-transparent font-label-caps text-xs tracking-widest font-bold hover:bg-gold/[0.12] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer rounded-xs"
          >
            <FileText className="w-4 h-4 text-gold" style={{ strokeWidth: 2 }} />
            GENERATE CAD SPEC & PRINT PDF
          </button>

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

      {/* ====================================================
          PROWL PREMIUM ORDER BUILD CONFIGURATOR & SPEC SHEET
         ==================================================== */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-[#0a0a0a] z-[1000] overflow-y-auto flex flex-col p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-6xl mx-auto bg-[#0a0a0a] border border-[#c9a84c]/20 flex flex-col shadow-2xl relative">
            
            {/* Top Navigation Bar with GO BACK Button */}
            <div className="bg-[#111111] border-b border-[#c9a84c]/15 p-4 px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md bg-opacity-95">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex items-center gap-2.5 text-gold hover:text-[#ffe08f] font-mono text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer group font-bold"
                id="modal-goback-header-btn"
              >
                <span className="transform group-hover:-translate-x-1 transition-transform text-sm">&larr;</span> GO BACK TO ORDER SPECIFICATION
              </button>
              <span className="font-mono text-[9px] text-[#acacac]/80 tracking-widest uppercase hidden sm:inline">
                TRANSMISSION ID: {quoteNumber || "PRW-2026-DRAFT"}
              </span>
            </div>

            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1C1C1E] border-b border-[#c9a84c]/15 p-6 md:p-8 md:px-10 gap-6">
              <div className="space-y-2">
                <span className="font-sans text-[9px] font-bold text-gold tracking-[0.25em] uppercase block">YOUR BUILD SUMMARY</span>
                <h2 className="font-display text-4xl md:text-5xl text-white tracking-[0.05em] uppercase leading-none">
                  PROWL ORDER SPECIFICATION
                </h2>
                <p className="font-sans text-[13px] text-silver leading-relaxed font-light">
                  Custom configuration compiled for your elite home gym setup.
                </p>
              </div>

              {/* Meta information panel */}
              <div className="bg-[#0A0A0A] border border-[#c9a84c]/20 p-5 min-w-[240px] flex flex-col gap-2 shadow-inner">
                <div className="flex justify-between items-center text-[11px] font-mono border-b border-[#222] pb-1.5 gap-4">
                  <span className="text-[#6B6B70] uppercase">SPEC REF:</span>
                  <span className="text-white font-medium">{quoteNumber || "PRW-2026-DRAFT"}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono border-b border-[#222] pb-1.5">
                  <span className="text-[#6B6B70] uppercase">CREATED:</span>
                  <span className="text-white font-medium">
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono border-b border-[#222] pb-1.5">
                  <span className="text-[#6B6B70] uppercase">STATUS:</span>
                  <span className="text-gold font-bold uppercase tracking-wider">CONFIRMED</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-[#6B6B70] uppercase">CURRENCY:</span>
                  <span className="text-white font-medium uppercase font-sans">INR (₹)</span>
                </div>
              </div>
            </div>

            {/* Split row setup */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 md:p-8 md:px-10 items-stretch">
              
              {/* Left panel - Product Visual Card */}
              <div className="lg:col-span-5 bg-[#111111] border border-[#c9a84c]/15 flex flex-col justify-between overflow-hidden">
                <div className="relative h-[280px] bg-black">
                  <img
                    alt="Prism Bench Steel Cover"
                    className="w-full h-full object-cover opacity-90 transition-all duration-700"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuq-GldsO8L4kvh7cq3aBXVCWf6exJhPi9VmTY4BjOVL0ypH2xoFxFv1TPgg59OPRS5jaT9XOua4iHSyztcMcYMihN4Ssslvvh6uc4KPgJV21PbenDF3FFoP7gzDaHIVkmsAvur0-9Dc-DQgermTqsW5qCxBn9JY4X7J7oo3eIRtl8pb3xeBn5yBZAfZSXCZ-T_jAcXsvWzC3W4fH4_VK7W9PM0s6rQpynAFk_fZU-S6k5N-Ehyf0uHBG2Jf_QOUzhbZiBB9VHe_nH"
                    style={{ filter: 'brightness(0.9) contrast(1.05)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-4 left-4 bg-black/85 border border-[#c9a84c]/20 p-2.5 px-4">
                    <span className="font-sans text-[9px] text-gold font-bold tracking-[0.2em] uppercase block">
                      PRISM BENCH — {FINISH_DETAILS[selectedFinish]?.name.toUpperCase()} FINISH
                    </span>
                  </div>
                </div>

                {/* Bottom specs metadata bar */}
                <div className="p-5 md:p-6 bg-[#0F0F0F] border-t border-[#c9a84c]/10 flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-2 text-center select-none">
                    <div className="space-y-0.5">
                      <span className="font-sans text-[8px] text-[#6B6B70] tracking-wider uppercase block">LOAD RATING</span>
                      <span className="font-sans text-xs text-white font-medium">350 KG</span>
                    </div>
                    <div className="border-l border-r border-[#c9a84c]/15 space-y-0.5">
                      <span className="font-sans text-[8px] text-[#6B6B70] tracking-wider uppercase block">ADJUSTMENTS</span>
                      <span className="font-sans text-xs text-white font-medium">7 POSITIONS</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-sans text-[8px] text-[#6B6B70] tracking-wider uppercase block">MATERIAL</span>
                      <span className="font-sans text-xs text-white font-medium">AIRCRAFT AL</span>
                    </div>
                  </div>
                  
                  <div className="border-[#c9a84c]/10 border-t pt-3.5 text-center">
                    <span className="font-sans text-[11px] text-[#A8A8B3] tracking-wide block">
                      Finish: {FINISH_DETAILS[selectedFinish]?.name} &bull; Ships in 14 days &bull; Lifetime structural warranty
                    </span>
                  </div>
                </div>
              </div>

              {/* Right panel - Pricing Breakdown and compiler logs */}
              <div className="lg:col-span-7 bg-[#111111] border border-[#c9a84c]/15 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-[#222] pb-2.5 mb-2.5">
                    <span className="font-sans text-[9px] text-gold/60 font-bold tracking-[0.25em] uppercase">ORDER ITEMS</span>
                    <button 
                      onClick={() => setShowConfigModal(false)}
                      className="font-sans text-[9px] text-gold font-bold tracking-widest hover:text-[#ffe08f] uppercase cursor-pointer"
                    >
                      EDIT CONFIG &larr;
                    </button>
                  </div>

                  <div className="space-y-0 max-h-[200px] overflow-y-auto pr-1">
                    {orderList.map((item, idx) => {
                      const basePrice = item.customPrice ?? item.product.price;
                      return (
                        <div key={idx} className="py-3 border-b border-white/[0.05] flex justify-between items-start gap-4 text-xs font-sans">
                          <div className="space-y-0.5 text-left">
                            <h5 className="font-sans text-white uppercase font-semibold">
                              0{idx + 1} &nbsp; {item.product.name}
                            </h5>
                            <p className="text-[10px] text-[#A8A8B3] uppercase leading-relaxed">
                              TYPE: {item.product.category} &nbsp;&bull;&nbsp; QTY: {item.qty}
                              {item.product.id === 'prism-bench' && (
                                <>
                                  &nbsp;&bull;&nbsp; FINISH: {FINISH_DETAILS[selectedFinish]?.name}
                                  &nbsp;&bull;&nbsp; COVER: {UPHOLSTERY_DETAILS[selectedUpholstery]?.name}
                                </>
                              )}
                            </p>
                          </div>
                          
                          <span className="font-mono text-white text-[13px] font-semibold tabular-nums">
                            ₹{(basePrice * item.qty).toLocaleString('en-IN')}
                          </span>
                        </div>
                      );
                    })}

                    {/* Show Configurator Extras breakout rows as supplementary line descriptors */}
                    {(selectedFinish !== 'raw-steel' || selectedUpholstery !== 'standard-black' || selectedAddons.length > 0) && (
                      <div className="py-3.5 border-b border-white/[0.05] space-y-1.5 text-left text-[11px] font-sans">
                        <span className="text-[#a8a8b3] font-bold block uppercase tracking-wider text-[9px]">Custom Configuration Adders:</span>
                        {selectedFinish !== 'raw-steel' && (
                          <div className="flex justify-between text-gold">
                            <span>&bull; Finish Coating Upgrade ({FINISH_DETAILS[selectedFinish]?.name})</span>
                            <span>+₹{FINISH_DETAILS[selectedFinish]?.price}</span>
                          </div>
                        )}
                        {selectedUpholstery !== 'standard-black' && (
                          <div className="flex justify-between text-gold">
                            <span>&bull; Elite Upholstery Leather ({UPHOLSTERY_DETAILS[selectedUpholstery]?.name})</span>
                            <span>+₹{UPHOLSTERY_DETAILS[selectedUpholstery]?.price}</span>
                          </div>
                        )}
                        {selectedAddons.map(id => (
                          <div key={id} className="flex justify-between text-gold">
                            <span>&bull; Premium Accessory Unit ({ADDON_DETAILS[id]?.name})</span>
                            <span>+₹{ADDON_DETAILS[id]?.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub value logs */}
                <div className="border-t border-[#c9a84c]/20 pt-5 mt-6 space-y-2 text-[12px] font-mono">
                  <div className="flex justify-between text-[#A8A8B3]">
                    <span className="uppercase">Equipment Subtotal</span>
                    <span className="text-white">₹{animatedSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {whiteGloveService && (
                    <div className="flex justify-between text-[#A8A8B3]">
                      <span className="uppercase">Assembly Logistics Service</span>
                      <span className="text-[#ffe08f]">+₹4,950</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#A8A8B3]">
                    <span className="uppercase">Tax Compilation (8.25%)</span>
                    <span className="text-white">₹{Math.round(calculatedTotal.estimatedTax).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-end border-t border-dashed border-[#c9a84c]/20 pt-4 mt-2">
                    <span className="font-display text-2xl text-white tracking-[0.1em] leading-none uppercase">TOTAL</span>
                    <span className="font-serif text-3xl text-gold font-bold leading-none select-all">
                      ₹{animatedTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Action buttons inside pricing block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={simulateBlueprintDownload}
                    className="h-12 border border-[#c9a84c]/30 hover:border-gold bg-transparent text-gold font-mono tracking-widest text-[11px] font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    {isDownloadingSpec ? "TRANSCRIBING..." : "DOWNLOAD RAW DRAWING"}
                  </button>
                  <button
                    onClick={triggerNativePrint}
                    className="h-12 bg-transparent border border-[#c9a84c]/65 hover:bg-[#c9a84c]/10 text-white font-mono font-semibold tracking-widest text-[11px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    DOWNLOAD PRINT PDF
                  </button>

                  <button
                    onClick={handleShareConfig}
                    className="h-12 border border-[#c9a84c]/30 hover:border-gold bg-transparent text-gold font-mono tracking-widest text-[11px] font-medium sm:col-span-1 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    SHARE CONFIGURATION
                  </button>

                  <button
                    onClick={() => {
                      setIsCheckoutCompleted(true);
                    }}
                    className="h-12 bg-gold hover:bg-[#ffe08f] text-black font-display text-xl tracking-[0.05em] font-medium transition-all duration-300 flex items-center justify-center cursor-pointer shadow-[0_0_24px_rgba(201,168,76,0.15)] transform active:scale-98 sm:col-span-1"
                  >
                    CONFIRM & CHECKOUT
                  </button>

                  {copiedLink && (
                    <div className="sm:col-span-2 p-2 bg-black border border-[#c9a84c]/15 rounded flex items-center justify-between gap-2 mt-1">
                      <span className="font-mono text-[9px] text-[#acacac] truncate flex-1 select-all">{copiedLink}</span>
                      <button 
                        onClick={() => {
                          fallbackCopy(copiedLink);
                        }}
                        type="button"
                        className="text-[9px] font-mono text-gold hover:underline cursor-pointer tracking-wider font-bold shrink-0"
                      >
                        [COPY LINK]
                      </button>
                    </div>
                  )}

                  <div className="sm:col-span-2 text-center mt-1">
                    <span className="font-sans text-[10px] text-[#A8A8B3] block">
                      💡 Pro-Tip: If Download/Print PDF doesn't trigger, please click <strong>"Open in New Tab"</strong> at the top right of your app builder window to trigger prints cleanly!
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PRODUCT SCHEMATIC — INTERACTIVE CONFIGURATOR PANEL */}
            <div className="w-full bg-[#1C1C1E] border-t border-b border-[#c9a84c]/15 p-6 md:p-10 text-left">
              <div className="flex justify-between items-center border-b border-[#c9a84c]/15 pb-4 mb-6">
                <h3 className="font-display text-2xl md:text-3xl text-white uppercase tracking-wide">
                  CONFIGURE YOUR BUILD
                </h3>
                <button
                  onClick={handleResetToDefault}
                  className="font-sans text-[10px] text-gold/80 hover:text-gold tracking-[0.2em] uppercase underline underline-offset-4 cursor-pointer"
                >
                  RESET TO DEFAULT
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Column 1 - Surface Finishes */}
                <div className="space-y-3.5">
                  <span className="font-sans text-[9px] text-[#c9a84c] font-bold tracking-[0.3em] block uppercase">
                    SURFACE FINISH
                  </span>
                  
                  <div className="flex flex-col gap-2.5">
                    {Object.entries(FINISH_DETAILS).map(([key, f]) => {
                      const isSelected = selectedFinish === key;
                      return (
                        <div
                          key={key}
                          id={`finish-opt-${key}`}
                          onClick={() => handleFinishChange(key)}
                          className={`p-3 px-4 border text-left cursor-pointer transition-all flex justify-between items-center prowl-config-card ${
                            isSelected
                              ? 'border-gold bg-[#c9a84c]/[0.06] text-white'
                              : 'border-white/[0.06] bg-[#111111] text-[#A8A8B3] hover:border-gold/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3.5 h-3.5 rounded-full border border-gold/40 flex items-center justify-center ${
                              isSelected ? 'bg-gold' : 'bg-transparent'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                            </div>
                            <span className="font-sans text-[13px] tracking-wide font-light">{f.name}</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-gold">
                            {f.price === 0 ? 'DEFAULT' : `+₹${f.price}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 2 - Upholstery options */}
                <div className="space-y-3.5">
                  <span className="font-sans text-[9px] text-[#c9a84c] font-bold tracking-[0.3em] block uppercase">
                    UPHOLSTERY MATERIAL
                  </span>
                  
                  <div className="flex flex-col gap-2.5">
                    {Object.entries(UPHOLSTERY_DETAILS).map(([key, u]) => {
                      const isSelected = selectedUpholstery === key;
                      return (
                        <div
                          key={key}
                          id={`upholstery-opt-${key}`}
                          onClick={() => handleUpholsteryChange(key)}
                          className={`p-3 px-4 border text-left cursor-pointer transition-all flex justify-between items-center prowl-config-card ${
                            isSelected
                              ? 'border-gold bg-[#c9a84c]/[0.06] text-white'
                              : 'border-white/[0.06] bg-[#111111] text-[#A8A8B3] hover:border-gold/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3.5 h-3.5 rounded-full border border-gold/40 flex items-center justify-center ${
                              isSelected ? 'bg-gold' : 'bg-transparent'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                            </div>
                            <span className="font-sans text-[13px] tracking-wide font-light">{u.name}</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-gold">
                            {u.price === 0 ? 'DEFAULT' : `+₹${u.price}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 3 - Option Addons */}
                <div className="space-y-3.5">
                  <span className="font-sans text-[9px] text-[#c9a84c] font-bold tracking-[0.3em] block uppercase">
                    ADD-ONS & PEGS
                  </span>
                  
                  <div className="flex flex-col gap-2.5">
                    {Object.entries(ADDON_DETAILS).map(([key, a]) => {
                      const isChecked = selectedAddons.includes(key);
                      return (
                        <div
                          key={key}
                          id={`addon-opt-${key}`}
                          onClick={() => handleAddonToggle(key)}
                          className={`p-3 px-4 border text-left cursor-pointer transition-all flex justify-between items-center prowl-config-card ${
                            isChecked
                              ? 'border-gold bg-[#c9a84c]/[0.06] text-white'
                              : 'border-white/[0.06] bg-[#111111] text-[#A8A8B3] hover:border-gold/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 border border-gold/40 flex items-center justify-center ${
                              isChecked ? 'bg-gold text-black' : 'bg-transparent'
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3.5] text-black" />}
                            </div>
                            <span className="font-sans text-[13px] tracking-wide font-light">{a.name}</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-gold">
                            +₹{a.price}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Certification / Seal block at the bottom */}
            <div className="p-6 md:p-8 md:px-10 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0a0a0a] text-xs leading-relaxed gap-6 text-left">
              <div className="space-y-2 max-w-2xl">
                <span className="font-sans text-[10px] text-gold font-bold uppercase tracking-[0.2em] block">
                  PROWL SITE PROTOCOL &amp; DEFLECTION WARRANTY
                </span>
                <p className="font-sans text-[11px] text-[#6B6B70] leading-relaxed">
                  All equipment designed under the custom order stack undergoes double electrostatic oven-curing schedules. Deflection parameters are certified down to 0.02% error margin under standard tensile loads. Approved for direct physical floorplan deployment inside credentialed concrete wall couplings.
                </p>
                <div className="pt-2 text-[10px] font-mono text-[#A8A8B3]">
                  SIGN-OFF COMPILATION DATE: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
                </div>
              </div>

              {/* Decorative signature seal */}
              <div className="flex items-center gap-4 shrink-0 border-l border-white/10 pl-6 h-12">
                <div className="text-right">
                  <span className="font-sans text-[8px] text-[#6B6B70] uppercase tracking-wider block">CHIEF MECHANICAL ENG</span>
                  <span className="font-display text-lg text-white font-medium uppercase tracking-widest leading-none">A. VANCE SEAL</span>
                </div>
                <div className="w-9 h-9 bg-gold/10 border border-gold flex items-center justify-center rounded-full">
                  <span className="font-display text-gold text-xs font-bold uppercase">PRW</span>
                </div>
              </div>
            </div>

            {/* Page Back button */}
            <div className="bg-[#1C1C1E] border-t border-[#c9a84c]/15 p-4 flex justify-end gap-3 px-6 md:px-10">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-6 h-10 border border-[#c9a84c]/20 bg-gold/10 hover:border-gold text-gold font-sans text-xs tracking-widest uppercase hover:bg-gold/[0.15] transition-all duration-300 cursor-pointer font-bold shadow-[0_0_15px_rgba(201,168,76,0.1)] flex items-center gap-2"
                id="modal-goback-footer-btn"
              >
                &larr; GO BACK TO SPECIFICATION DRAWER
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =======================================================
          RAW ARCHITECTURAL PRINT LAYOUT (visible @media print only)
         ======================================================= */}
      <div id="printable-blueprint" className="hidden">
        <div style={{ border: '1px double #000000', padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          {/* Header */}
          <div style={{ borderBottom: '2px solid #000000', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '24px', margin: '0', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  PROWL BIOMECHANICAL STRENGTH RIGS
                </h1>
                <p style={{ fontSize: '11px', margin: '4px 0 0 0', textTransform: 'uppercase', color: '#333333' }}>
                  TECHNICAL SPECIFICATION &amp; SITE-ANCHOR BLUEPRINT // COMPILING SPEC SHEET
                </p>
              </div>
              <div style={{ border: '1px solid #000000', padding: '6px 12px', fontSize: '10px', textTransform: 'uppercase' }}>
                <strong>SPEC STATE: LOCKED APPROVED</strong>
              </div>
            </div>
          </div>

          {/* Metadata Block */}
          <table style={{ width: '100%', marginBottom: '24px', fontSize: '11px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '6px', borderBottom: '1px solid #cccccc', width: '25%' }}><strong>SPEC PROTOCOL CODE:</strong></td>
                <td style={{ padding: '6px', borderBottom: '1px solid #cccccc', width: '25%' }}>{quoteNumber || "PRW-DRAFT-BLUEPRINT"}</td>
                <td style={{ padding: '6px', borderBottom: '1px solid #cccccc', width: '25%' }}><strong>DOCUMENT VERSION:</strong></td>
                <td style={{ padding: '6px', borderBottom: '1px solid #cccccc', width: '25%' }}>REV 02.05-B [MAY 2026]</td>
              </tr>
              <tr>
                <td style={{ padding: '6px', borderBottom: '1px solid #cccccc' }}><strong>CLIENT COMM LINK:</strong></td>
                <td style={{ padding: '6px', borderBottom: '1px solid #cccccc' }}>{clientEmail || "RESERVED CLIENT CONFIG"}</td>
                <td style={{ padding: '6px', borderBottom: '1px solid #cccccc' }}><strong>STRUCTURAL RATING:</strong></td>
                <td style={{ padding: '6px', borderBottom: '1px solid #cccccc' }}>PHANTOM STRESS-RESERVE 3.2x</td>
              </tr>
              <tr>
                <td style={{ padding: '6px', borderBottom: '1px solid #cccccc' }}><strong>BASE EQUIPMENT FINISH:</strong></td>
                <td style={{ padding: '6px', borderBottom: '1px solid #cccccc' }}>{FINISH_DETAILS[selectedFinish]?.name.toUpperCase()}</td>
                <td style={{ padding: '6px', borderBottom: '1px solid #cccccc' }}><strong>UPHOLSTERY MATERIAL:</strong></td>
                <td style={{ padding: '6px', borderBottom: '1px solid #cccccc' }}>{UPHOLSTERY_DETAILS[selectedUpholstery]?.name.toUpperCase()}</td>
              </tr>
            </tbody>
          </table>

          {/* Dynamic CAD Details Section */}
          <div style={{ margin: '15px 0', border: '1px dashed #000000', padding: '12px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '3px' }}>
              I. CUSTOM RIG CONFIGURATION PARTICULARS
            </h3>
            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0', width: '40%' }}>• Frame Custom finish class</td>
                  <td style={{ padding: '4px 0' }}>: {FINISH_DETAILS[selectedFinish]?.name} (Type: Roasted Electrostatic Dust Cover)</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0' }}>• Calibrated custom cushion padding style</td>
                  <td style={{ padding: '4px 0' }}>: {UPHOLSTERY_DETAILS[selectedUpholstery]?.name} Leather Blend</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0' }}>• Active Modular Elite Attachments (Qty)</td>
                  <td style={{ padding: '4px 0' }}>: {selectedAddons.length > 0 ? selectedAddons.map(id => ADDON_DETAILS[id]?.name).join(", ") : "No Attachments Mounted"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Compiler Log Table */}
          <div style={{ flex: 1, margin: '20px 0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '3px' }}>
              II. CALIBRATED RIG &amp; EQUIPMENT COMPILER LOG
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #000000', textAlign: 'left', fontWeight: 'bold' }}>
                  <th style={{ padding: '6px 4px' }}>CODE REF</th>
                  <th style={{ padding: '6px 4px' }}>CATEGORICAL DEP</th>
                  <th style={{ padding: '6px 4px' }}>MATERIAL PIECE SPECIFICATION</th>
                  <th style={{ padding: '6px 4px', textAlign: 'right' }}>QTY</th>
                  <th style={{ padding: '6px 4px', textAlign: 'right' }}>VALUATION (INR)</th>
                </tr>
              </thead>
              <tbody>
                {orderList.map((item, index) => {
                  const itemPrice = item.customPrice ?? item.product.price;
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #dddddd' }}>
                      <td style={{ padding: '6px 4px' }}>PRW-PC-{index + 1}</td>
                      <td style={{ padding: '6px 4px', textTransform: 'uppercase' }}>{item.product.category}</td>
                      <td style={{ padding: '6px 4px', fontWeight: 'bold' }}>{item.product.name.toUpperCase()}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right' }}>{item.qty}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right' }}>₹{(itemPrice * item.qty).toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pricing Outline Block */}
          <div style={{ marginLeft: 'auto', width: '320px', borderTop: '2px solid #000000', paddingTop: '10px', fontSize: '11px', marginTop: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>EQUIPMENT INVENTORY SUB-TOTAL:</span>
              <span>₹{animatedSubtotal.toLocaleString('en-IN')}</span>
            </div>
            {whiteGloveService && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>CERTIFIED PROFESSIONAL ASSEMBLY:</span>
                <span>+₹4,950</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>CALIBRATED TAX COMPILATION (8.25%):</span>
              <span>₹{Math.round(calculatedTotal.estimatedTax).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #000000', paddingTop: '6px', fontWeight: 'bold', borderBottom: '3px double #000000', paddingBottom: '4px', marginTop: '6px' }}>
              <span>TOTAL CONTRACTUAL VALUE (INR):</span>
              <span>₹{animatedTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Footer certification & Sign-offs */}
          <div style={{ marginTop: '40px', borderTop: '1px dashed #000000', paddingTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '9.5px', lineHeight: '1.4' }}>
              <div style={{ width: '60%', color: '#444444' }}>
                <strong>PROWL BIOMECHANICAL RIG STAMP:</strong><br />
                Draft specifications compiled under 11-gauge aerospace tolerances. Wall structural warranties valid only under professional Anchor coupling. Physical ratings represent absolute elastic deflection indexes calculated at stress maximums.
                <br /><br />
                <strong>SIGN-OFF DATE:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div style={{ width: '35%', textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid #000000', height: '40px', marginBottom: '4px' }}></div>
                <strong>ELITE CAD ENGINEER AUTHORIZED SEAL [PROWL]</strong>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Checkout Success Confirmation Modal Overlay */}
      {isCheckoutCompleted && (
        <div className="fixed inset-0 bg-[#0a0a0a]/95 z-[2000] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121212] border border-gold p-8 flex flex-col items-center text-center gap-6 shadow-[0_0_50px_rgba(201,168,76,0.25)] rounded-xs">
            <div className="w-16 h-16 bg-gold/10 border border-gold flex items-center justify-center rounded-full">
              <Check className="w-8 h-8 text-gold stroke-[3]" />
            </div>
            <div>
              <h3 className="font-display text-3xl text-white uppercase tracking-wide mb-2">Checkout Confirmed</h3>
              <p className="font-sans text-xs text-silver leading-relaxed">
                Your Prowl Elite checkout session has been secure locked. Our structural engineering team will contact you shortly via <strong className="text-gold">{clientEmail || "your email"}</strong> to review CAD layouts, dimensions, and arrange concrete floor anchoring.
              </p>
            </div>
            <div className="w-full bg-[#1c1c1e] p-3 font-mono text-[10px] text-left border border-white/[0.05] rounded">
              <div className="text-gold font-bold uppercase mb-1 border-b border-white/[0.05] pb-1">ORDER DISPATCH MEMO</div>
              <div>• Setup Code ID: {quoteNumber || "PRW-AUTO-LOCK"}</div>
              <div>• Total Val: ₹{animatedTotal.toLocaleString('en-IN')}</div>
              <div>• Assembly: {whiteGloveService ? 'Prowl White Glove' : 'Standard Self Setup'}</div>
            </div>
            <button
              onClick={() => {
                setIsCheckoutCompleted(false);
                setShowConfigModal(false);
                onClose();
                onClearOrder();
              }}
              className="w-full h-11 bg-gold hover:bg-[#ffe08f] text-black font-sans text-xs tracking-widest font-semibold uppercase flex items-center justify-center cursor-pointer transition-all duration-300"
            >
              FINISH SESSION
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
