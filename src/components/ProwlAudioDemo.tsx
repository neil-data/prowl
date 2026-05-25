import { useState, useMemo } from 'react';
import { Headset, Sliders, VolumeX, Shield, Play } from 'lucide-react';

export default function ProwlAudioDemo() {
  const [ancLevel, setAncLevel] = useState<number>(85); // 0 (Ambient) to 100 (Deep Focus Isolation)
  const [focusFrequency, setFocusFrequency] = useState<number>(440); // 100Hz to 1200Hz
  const [testPlaying, setTestPlaying] = useState<boolean>(false);

  // Generate responsive parametric wave paths based on ancLevel & frequencies
  const wavePaths = useMemo(() => {
    const points_ambient = [];
    const points_cancelled = [];
    const steps = 60;
    const width = 280;
    const midY = 50;

    // As ANC increases, the cancelled wave shrinks to a perfectly straight flatline
    // Ambient sound wave fluctuates randomly representing gym noise
    const cancelledAmplitude = (100 - ancLevel) * 0.35 + 2; 
    const noiseAmplitude = 25;

    for (let i = 0; i < steps; i++) {
      const x = (i / (steps - 1)) * width;
      
      // Ambient noisy sine waves
      const y_amb = midY + Math.sin(i * 0.35) * noiseAmplitude * Math.sin(i * 0.1) + Math.cos(i * 0.1) * 8;
      
      // Cancelled focused waves matching the focus frequency phase invert
      const phase = testPlaying ? Date.now() * 0.01 : 0;
      const y_can = midY + Math.sin(i * 0.2 + phase) * cancelledAmplitude;

      points_ambient.push(`${x},${y_amb}`);
      points_cancelled.push(`${x},${y_can}`);
    }

    return {
      ambient: `M ${points_ambient.join(' L ')}`,
      cancelled: `M ${points_cancelled.join(' L ')}`
    };
  }, [ancLevel, focusFrequency, testPlaying]);

  return (
    <div className="w-full bg-[#111111] border border-outline-variant p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative overflow-hidden">
      {/* Audio telemetry tag */}
      <div className="absolute top-3 right-4 flex items-center gap-1.5 font-mono text-[10px] text-muted">
        <Headset className="w-3.5 h-3.5 text-gold animate-bounce" />
        PROWL AUDIO LABS - FOCUS LOGIC
      </div>

      {/* Control sliders (5 cols) */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-5">
        <div>
          <span className="font-label-caps text-xs text-gold flex items-center gap-2 mb-2">
            <VolumeX className="w-4 h-4" /> ACOUSTIC ISOLATION DEEP DIVE
          </span>
          <h4 className="font-display text-4xl text-on-surface uppercase mb-3 leading-tight">
            Prowl Audio Labs
          </h4>
          <p className="font-sans text-xs text-muted mb-4">
            Calibrate our advanced active-cancellation algorithms. Mask low-frequency iron-clash decibels while maintaining vocal transparency tunnels.
          </p>

          <div className="flex flex-col gap-4 bg-obsidian p-4 border border-outline-variant">
            {/* Active ANC suppression slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-muted uppercase">ANC Dampening</span>
                <span className={`${ancLevel > 80 ? 'text-gold font-bold' : 'text-[#acacac]'}`}>
                  {ancLevel}% {ancLevel > 90 ? '(MAX FOCUS)' : ancLevel > 50 ? '(ISOLATE)' : '(AMBIENT)'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={ancLevel}
                onChange={(e) => setAncLevel(parseInt(e.target.value))}
                className="w-full h-1 accent-gold bg-[#222] rounded cursor-pointer"
              />
            </div>

            {/* Targeted frequency isolation filter slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-muted uppercase">Isolation Target</span>
                <span className="text-gold font-bold">{focusFrequency} Hz</span>
              </div>
              <input
                type="range"
                min="100"
                max="1200"
                step="50"
                value={focusFrequency}
                onChange={(e) => setFocusFrequency(parseInt(e.target.value))}
                className="w-full h-1 accent-gold bg-[#222] rounded cursor-pointer"
              />
            </div>
            
            {/* Sound simulation sound bit */}
            <div className="pt-2">
              <button
                onClick={() => setTestPlaying(!testPlaying)}
                className={`py-2 w-full text-center font-label-caps text-xs uppercase border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  testPlaying 
                    ? 'border-red-900 bg-red-950/20 text-red-400 font-semibold'
                    : 'border-gold bg-gold/10 text-gold font-semibold'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {testPlaying ? 'De-activate Signal Generator' : 'Initiate Audio Test Sequence'}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic status board readout */}
        <div className={`p-4 border text-left flex flex-col gap-2 ${
          ancLevel > 85
            ? 'border-gold/30 bg-gold/5'
            : 'border-outline-variant bg-obsidian/30'
        }`}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gold" />
            <span className="font-mono text-[10px] font-bold text-gold uppercase">
              Current Mode: {ancLevel > 80 ? 'ABSOLUTE LOCKOUT' : 'HYBRID COGNIZANT'}
            </span>
          </div>
          <p className="font-sans text-[11px] text-[#acacac]">
            {ancLevel > 80 
              ? 'Low-register iron clang and background combustion resonance are fully attenuated (92dB reduction threshold exceeded).' 
              : 'Environmental alerts, security signals, and mid-range human speech are dynamic-adjusted to permit essential coaching communication.'}
          </p>
        </div>
      </div>

      {/* Visual audio waveforms CAD simulator (7 cols) */}
      <div className="lg:col-span-7 bg-[#0d0f0d] border border-outline-variant p-4 flex flex-col relative min-h-[300px] justify-center items-center">
        {/* Metric gauge overlays */}
        <div className="absolute top-4 left-4 flex flex-col gap-1 border-l-2 border-red-500/30 pl-2">
          <span className="font-mono text-[9px] text-muted uppercase">Ambient Gym Noise</span>
          <span className="font-display text-xl text-red-400">
            {testPlaying ? '88' : '72'} <span className="text-[10px] font-sans text-muted">dB</span>
          </span>
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-1 border-r-2 border-green-500/30 pr-2 text-right">
          <span className="font-mono text-[9px] text-muted uppercase">Residual Focus Leak</span>
          <span className="font-display text-xl text-green-400">
            {Math.max(2, Math.round(48 - (ancLevel * 0.46)))} <span className="text-[10px] font-sans text-muted">dB</span>
          </span>
        </div>

        {/* Dynamic Waveform Canvas Box */}
        <div className="w-full flex flex-col justify-center items-center gap-4 h-[200px]">
          {/* Ambient Waveform */}
          <div className="w-full flex flex-col items-center">
            <span className="font-mono text-[8px] text-red-400/50 uppercase tracking-widest mb-1">Target Ambient Soundwave</span>
            <svg className="w-72 h-16" viewBox="0 0 280 100">
              <path d={wavePaths.ambient} fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.65" />
              <line x1="0" y1="50" x2="280" y2="50" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.2" />
            </svg>
          </div>

          {/* Anti-wave phase cancellation output */}
          <div className="w-full flex flex-col items-center">
            <span className="font-mono text-[8px] text-green-400/50 uppercase tracking-widest mb-1">PROWL OUTLET FILTER SHIELD WAVE</span>
            <svg className="w-72 h-16" viewBox="0 0 280 100">
              <path d={wavePaths.cancelled} fill="none" stroke="#22c55e" strokeWidth="2" />
              <line x1="0" y1="50" x2="280" y2="50" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.2" />
            </svg>
          </div>
        </div>

        {/* Telemetry diagnostics stats bar */}
        <div className="w-full grid grid-cols-3 gap-2 mt-2 bg-obsidian/60 p-3 border-t border-outline-variant font-mono text-[10px]">
          <div className="text-center flex flex-col justify-center border-r border-[#1f201e] py-1">
            <span className="text-muted uppercase">Coil Driver Temp</span>
            <span className="text-gold font-bold mt-0.5">34.5° C</span>
          </div>
          <div className="text-center flex flex-col justify-center border-r border-[#1f201e] py-1">
            <span className="text-muted uppercase">Acoustic Seal Pct</span>
            <span className="text-green-400 font-bold mt-0.5">99.8% SEAL</span>
          </div>
          <div className="text-center flex flex-col justify-center py-1">
            <span className="text-muted uppercase">THD Distortion</span>
            <span className="text-gold font-bold mt-0.5">&lt; 0.01%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
