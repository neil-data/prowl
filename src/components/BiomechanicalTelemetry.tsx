import { useState, useMemo } from 'react';
import { Activity, AlertTriangle, CheckCircle2, RefreshCw, BarChart4 } from 'lucide-react';

export default function BiomechanicalTelemetry() {
  const [exercise, setExercise] = useState<'squat' | 'deadlift' | 'bench-press'>('squat');
  const [spineFlexion, setSpineFlexion] = useState<number>(5); // 0 (straight) to 35 (extreme bend)
  const [depthAngle, setDepthAngle] = useState<number>(100); // knee/hip angle
  const [loadWeight, setLoadWeight] = useState<number>(315); // lbs
  const [spinalLoadPct, setSpinalLoadPct] = useState<number>(65);

  // Compute form diagnostics
  const diagnostics = useMemo(() => {
    let score = 100;
    let status: 'perfect' | 'warning' | 'critical' = 'perfect';
    let alertText = 'OPTIMAL ANGLE PATH DETECTED';
    let recommendations: string[] = [];

    // Spine feedback
    if (spineFlexion > 20) {
      score -= 40;
      status = 'critical';
      alertText = 'CRITICAL: SPINAL FLEXION EXCEEDS SAFETY GAP';
      recommendations.push('Engage core and pull shoulders down to pack the lats.');
      recommendations.push('Reduce weight by 15% until thoracic stability is restored.');
    } else if (spineFlexion > 10) {
      score -= 20;
      status = 'warning';
      alertText = 'WARNING: SLIGHT LOWER BACK ROUNDING';
      recommendations.push('Maintain neutral neck positioning throughout the eccentric phase.');
    }

    // Depth angle feedback
    if (exercise === 'squat') {
      if (depthAngle > 115) {
        score -= 15;
        if (status === 'perfect') status = 'warning';
        recommendations.push('Increase eccentric depth to reach parallel (<= 90° knee angle).');
      } else if (depthAngle < 75) {
        score -= 10; // excessive depth
        recommendations.push('Extreme depth detected. Guard patella tendon loading.');
      }
    }

    // Deadlift specifics
    if (exercise === 'deadlift') {
      if (depthAngle > 130) {
        score -= 15;
        if (status === 'perfect') status = 'warning';
        recommendations.push('Hips are starting too high. Drop pelvis slightly prior to pull.');
      }
    }

    score = Math.max(0, score);
    return { score, status, alertText, recommendations };
  }, [exercise, spineFlexion, depthAngle]);

  // Calculate coordinates for SVG stick figure vector
  // Normal standing length of femur is 70, tibia is 70, torso is 80, bar weight at shoulders/hands.
  const joints = useMemo(() => {
    const startX = 130;
    const footY = 240;
    const footX = startX + 50;

    // Ankle joint is fixed
    const ankleX = footX;
    const ankleY = footY - 10;

    let kneeX = ankleX - 30;
    let kneeY = ankleY - 50;

    let hipX = kneeX + 40;
    let hipY = kneeY - 50;

    let shoulderX = hipX - 25;
    let shoulderY = hipY - 70;

    let headX = shoulderX + 5;
    let headY = shoulderY - 20;

    if (exercise === 'squat') {
      // Adjust knees and hips based on depthAngle
      // depthAngle from 140 (high) to 70 (deep)
      const r = (depthAngle * Math.PI) / 180;
      // Simulating knee projection forward
      const kneeOffset = Math.max(0, (140 - depthAngle) * 0.4);
      kneeX = ankleX - 20 - kneeOffset;
      kneeY = ankleY - 45 + (140 - depthAngle) * 0.35;

      hipX = kneeX + 50 + (140 - depthAngle) * 0.1;
      hipY = kneeY - 35 - (140 - depthAngle) * 0.2;

      // Shoulder position with chest uprightness
      shoulderX = hipX - 20 - spineFlexion * 0.5;
      shoulderY = hipY - 60 + spineFlexion * 0.3;

      headX = shoulderX + 10;
      headY = shoulderY - 18;
    } else if (exercise === 'deadlift') {
      // Deadlift positioning: hip hinge
      const r = (depthAngle * Math.PI) / 180;
      kneeX = ankleX - 15;
      kneeY = ankleY - 40;

      // Hip goes back
      hipX = kneeX + 60;
      hipY = kneeY - 15;

      // Shoulder is low and forward
      shoulderX = hipX - 55 + spineFlexion * 0.2;
      shoulderY = hipY - 45 + spineFlexion * 0.5;

      headX = shoulderX + 12;
      headY = shoulderY - 12;
    } else {
      // Bench press (lying down horizontally)
      // Represent torso flat on bench, arm pushing bar up/down.
      // Fixed flat setup:
      const benchY = 170;
      headY = benchY - 10;
      headX = startX + 20;
      shoulderY = benchY;
      shoulderX = startX + 50;
      hipY = benchY;
      hipX = startX + 120;
      kneeY = benchY + 40;
      kneeX = startX + 140;

      // Bar and hands
      // depthAngle represents bar lock-out here (150 = locked, 70 = chest touch)
      const armExtension = (depthAngle - 70) * 0.6;
      shoulderX = startX + 50;
      shoulderY = benchY;
    }

    return { ankleX, ankleY, kneeX, kneeY, hipX, hipY, shoulderX, shoulderY, headX, headY };
  }, [exercise, depthAngle, spineFlexion]);

  const drawSpinePath = () => {
    const { hipX, hipY, shoulderX, shoulderY } = joints;
    if (exercise === 'bench-press') {
      return `M ${hipX} ${hipY} L ${shoulderX} ${shoulderY}`;
    }
    // Quad curve to simulate spine flexion
    const ctrlX = (hipX + shoulderX) / 2 + spineFlexion * 1.5;
    const ctrlY = (hipY + shoulderY) / 2 - spineFlexion * 0.5;
    return `M ${hipX} ${hipY} Q ${ctrlX} ${ctrlY} ${shoulderX} ${shoulderY}`;
  };

  const getFormColor = () => {
    if (diagnostics.status === 'critical') return 'text-red-500 stroke-red-500';
    if (diagnostics.status === 'warning') return 'text-amber-500 stroke-amber-500';
    return 'text-gold fill-gold stroke-gold';
  };

  return (
    <div className="w-full bg-[#111111] border border-outline-variant p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative overflow-hidden">
      {/* Prometheus telemetry HUD display */}
      <div className="absolute top-3 right-4 flex items-center gap-1.5 font-mono text-[10px] text-muted">
        <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
        PROMETHEUS V4.8 LIVE FEED
      </div>

      {/* Control sliders & selector (4 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
        <div>
          <span className="font-label-caps text-xs text-gold flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4" /> BIOMECHANICAL ANALYTICS
          </span>
          <h4 className="font-display text-4xl text-on-surface uppercase mb-3 leading-tight">
            Form Simulator
          </h4>
          <p className="font-sans text-xs text-muted mb-4">
            Simulate joint strain, bar-path deviations, and load profiles on the lumbar-thoracic junction in real-time.
          </p>

          {/* Exercise select button strip */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(['squat', 'deadlift', 'bench-press'] as const).map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setExercise(ex);
                  if (ex === 'deadlift') {
                    setDepthAngle(120);
                  } else if (ex === 'bench-press') {
                    setDepthAngle(110);
                  } else {
                    setDepthAngle(100);
                  }
                }}
                className={`py-1.5 text-center font-label-caps text-xs uppercase border transition-all ${
                  exercise === ex
                    ? 'border-gold bg-gold/10 text-gold font-semibold'
                    : 'border-outline-variant hover:border-gold/50 text-muted'
                }`}
              >
                {ex.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 bg-obsidian p-4 border border-outline-variant">
            {/* Slider: Spine curve */}
            {exercise !== 'bench-press' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-muted uppercase">Lumbar Flexion</span>
                  <span className={`${spineFlexion > 15 ? 'text-red-400 font-bold' : spineFlexion > 8 ? 'text-amber-400' : 'text-gold'}`}>
                    {spineFlexion}° {spineFlexion > 15 ? '(CRITICAL)' : spineFlexion > 8 ? '(WARN)' : '(NEUTRAL)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={spineFlexion}
                  onChange={(e) => setSpineFlexion(parseInt(e.target.value))}
                  className="w-full h-1 accent-gold bg-[#222] rounded cursor-pointer"
                />
              </div>
            )}

            {/* Slider: Joint angle */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-muted uppercase">
                  {exercise === 'bench-press' ? 'Arm Lock-Out' : exercise === 'deadlift' ? 'Pelvic Hinge' : 'Knee Flexion'}
                </span>
                <span className="text-gold font-bold">{depthAngle}°</span>
              </div>
              <input
                type="range"
                min={exercise === 'squat' ? '65' : exercise === 'deadlift' ? '80' : '70'}
                max={exercise === 'squat' ? '150' : exercise === 'deadlift' ? '160' : '160'}
                value={depthAngle}
                onChange={(e) => setDepthAngle(parseInt(e.target.value))}
                className="w-full h-1 accent-gold bg-[#222] rounded cursor-pointer"
              />
            </div>

            {/* Slider: Load Weight */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-muted uppercase">System Load</span>
                <span className="text-gold font-bold">{loadWeight} LBS</span>
              </div>
              <input
                type="range"
                min="45"
                max="915"
                step="10"
                value={loadWeight}
                onChange={(e) => {
                  setLoadWeight(parseInt(e.target.value));
                  setSpinalLoadPct(Math.min(99, Math.round(35 + (parseInt(e.target.value) / 950) * 55 + spineFlexion * 0.8)));
                }}
                className="w-full h-1 accent-gold bg-[#222] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Diagnostic readout report */}
        <div className={`p-4 border text-left flex flex-col gap-2 ${
          diagnostics.status === 'critical'
            ? 'border-red-900 bg-red-950/10'
            : diagnostics.status === 'warning'
              ? 'border-amber-900 bg-amber-950/10'
              : 'border-outline-variant bg-gold/5'
        }`}>
          <div className="flex items-center gap-2">
            {diagnostics.status === 'critical' ? (
              <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
            ) : diagnostics.status === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-gold" />
            )}
            <span className={`font-mono text-xs font-bold uppercase ${getFormColor().split(' ')[0]}`}>
              {diagnostics.alertText}
            </span>
          </div>
          <div className="font-sans text-xs text-[#d0c5b2] space-y-1">
            {diagnostics.recommendations.length > 0 ? (
              diagnostics.recommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-1.5 items-start">
                  <span className="text-gold mt-0.5">•</span>
                  <span>{rec}</span>
                </div>
              ))
            ) : (
              <p className="text-muted italic">Spinal stack and load vectors are pristine. Execute repetitions cleanly.</p>
            )}
          </div>
        </div>
      </div>

      {/* Visual Live CAD feed skeleton rendering (7 cols) */}
      <div className="lg:col-span-7 bg-[#0d0f0d] border border-outline-variant p-4 flex flex-col relative min-h-[300px] justify-center items-center">
        {/* Metric gauge overlays */}
        <div className="absolute top-4 left-4 flex flex-col gap-1 border-l-2 border-gold/30 pl-2">
          <span className="font-mono text-[9px] text-muted uppercase">Thoracic Shear</span>
          <span className="font-display text-xl text-on-surface">
            {Math.round(loadWeight * (spineFlexion * 0.08 + 1.2))} <span className="text-[10px] font-sans text-muted">N</span>
          </span>
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-1 border-r-2 border-gold/30 pr-2 text-right">
          <span className="font-mono text-[9px] text-muted uppercase">Lumbar Compression</span>
          <span className={`font-display text-xl ${spineFlexion > 15 ? 'text-red-400' : 'text-on-surface'}`}>
            {spinalLoadPct + (spineFlexion > 15 ? 12 : 0)}%
          </span>
        </div>

        {/* Biomechanical model SVG scene */}
        <div className="w-full flex justify-center items-center h-[260px]">
          <svg className="w-72 h-64" viewBox="0 0 300 260">
            {/* Floor indicator line */}
            <line x1="20" y1="240" x2="280" y2="240" stroke="#c9a84c" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

            {/* Joint angle display circles or paths */}
            {exercise !== 'bench-press' && (
              <circle cx={joints.hipX} cy={joints.hipY} r="18" fill="none" stroke="#ffe08f" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
            )}

            {/* Grid background representation */}
            <path d="M 0,20 L 300,20 M 0,60 L 300,60 M 0,100 L 300,100 M 0,140 L 300,140 M 0,180 L 300,180 M 0,220 L 300,220" stroke="rgba(201,168,76,0.05)" strokeWidth="0.5" />
            <path d="M 50,0 L 50,260 M 100,0 L 100,260 M 150,0 L 150,260 M 200,0 L 200,260 M 250,0 L 250,260" stroke="rgba(201,168,76,0.05)" strokeWidth="0.5" />

            {/* Bone segments path */}
            {/* 1. Foot */}
            <line x1={joints.ankleX} y1={joints.ankleY} x2={joints.ankleX + 25} y2={joints.ankleY + 10} stroke="#6b6b70" strokeWidth="4" strokeLinecap="round" />
            {/* 2. Shin bone */}
            <line x1={joints.ankleX} y1={joints.ankleY} x2={joints.kneeX} y2={joints.kneeY} stroke="#f5f4f0" strokeWidth="4" strokeLinecap="round" />
            {/* 3. Thigh bone */}
            <line x1={joints.kneeX} y1={joints.kneeY} x2={joints.hipX} y2={joints.hipY} stroke="#f5f4f0" strokeWidth="4" strokeLinecap="round" />
            {/* 4. Spine (curved or straight depending on flexion) */}
            <path d={drawSpinePath()} fill="none" stroke={diagnostics.status === 'critical' ? '#ef4444' : diagnostics.status === 'warning' ? '#f59e0b' : '#c9a84c'} strokeWidth="5" strokeLinecap="round" />

            {/* 5. Head bone */}
            <line x1={joints.shoulderX} y1={joints.shoulderY} x2={joints.headX} y2={joints.headY} stroke="#f5f4f0" strokeWidth="3" strokeLinecap="round" />
            <circle cx={joints.headX} cy={joints.headY - 6} r="7" fill="#121412" stroke="#f5f4f0" strokeWidth="2.5" />

            {/* Load center & Barbell Representation */}
            {exercise === 'squat' && (
              <>
                {/* Simulated barbell resting on high-bar shoulders */}
                <circle cx={joints.shoulderX - 4} cy={joints.shoulderY} r="10" fill="#222" stroke="#ffe08f" strokeWidth="2.5" />
                <line x1={joints.shoulderX - 4} y1={joints.shoulderY - 20} x2={joints.shoulderX - 4} y2={joints.shoulderY + 20} stroke="#ffe08f" strokeWidth="3" />
                {/* Gravity vector arrow downward */}
                <line x1={joints.shoulderX - 4} y1={joints.shoulderY} x2={joints.shoulderX - 4} y2={joints.shoulderY + 70} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
                <polygon points={`${joints.shoulderX - 4},${joints.shoulderY + 70} ${joints.shoulderX - 7},${joints.shoulderY + 63} ${joints.shoulderX - 1},${joints.shoulderY + 63}`} fill="#ef4444" />
                <text x={joints.shoulderX - 35} y={joints.shoulderY + 45} fill="#ef4444" className="font-mono text-[9px] font-bold">GRAVITY LOAD</text>
              </>
            )}

            {/* Deadlift: barbell in hands */}
            {exercise === 'deadlift' && (
              <>
                {/* Arms extending from shoulder to deadlift bar */}
                <line x1={joints.shoulderX} y1={joints.shoulderY} x2={joints.shoulderX} y2={joints.shoulderY + 50} stroke="#f5f4f0" strokeWidth="3" strokeLinecap="round" />
                {/* Barbell plates */}
                <circle cx={joints.shoulderX} cy={joints.shoulderY + 50} r="11" fill="#222" stroke="#ffe08f" strokeWidth="2.5" />
                <line x1={joints.shoulderX} y1={joints.shoulderY + 30} x2={joints.shoulderX} y2={joints.shoulderY + 70} stroke="#ffe08f" strokeWidth="3" />
                {/* Spine load vector indicators */}
                <path d={`M ${joints.hipX} ${joints.hipY} Q ${joints.hipX + 15} ${(joints.hipY + joints.shoulderY)/2} ${joints.shoulderX} ${joints.shoulderY}`} fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              </>
            )}

            {/* Bench press bar */}
            {exercise === 'bench-press' && (
              <>
                {/* Arms bending up from shoulder to hand */}
                <line x1={joints.shoulderX} y1={joints.shoulderY} x2={joints.shoulderX} y2={joints.shoulderY - 30} stroke="#f5f4f0" strokeWidth="3" strokeLinecap="round" />
                {/* Heavy plate holding bar path */}
                <circle cx={joints.shoulderX} cy={joints.shoulderY - 30} r="10" fill="#222" stroke="#ffe08f" strokeWidth="2" />
                <line x1={joints.shoulderX - 25} y1={joints.shoulderY - 30} x2={joints.shoulderX + 25} y2={joints.shoulderY - 30} stroke="#ffe08f" strokeWidth="2.5" />
              </>
            )}

            {/* Form feedback indicators */}
            <circle cx={joints.ankleX} cy={joints.ankleY} r="3" fill="#ffe08f" />
            <circle cx={joints.kneeX} cy={joints.kneeY} r="3.5" fill="#ffe08f" />
            <circle cx={joints.hipX} cy={joints.hipY} r="3.5" fill={diagnostics.status === 'critical' ? '#ef4444' : '#ffe08f'} />
            <circle cx={joints.shoulderX} cy={joints.shoulderY} r="3.5" fill="#ffe08f" />
          </svg>
        </div>

        {/* Real-time statistics telemetry dashboard sublayer */}
        <div className="w-full grid grid-cols-3 gap-2 mt-2 bg-obsidian/60 p-3 border-t border-outline-variant font-mono text-[10px]">
          <div className="text-center flex flex-col justify-center border-r border-outline-variant py-1">
            <span className="text-muted uppercase">Lumbar Shear</span>
            <span className="text-gold font-bold mt-0.5">840 N/cm²</span>
          </div>
          <div className="text-center flex flex-col justify-center border-r border-[#1f201e] py-1">
            <span className="text-muted uppercase">Prowl Metric Index</span>
            <span className={`font-bold mt-0.5 ${diagnostics.score < 70 ? 'text-red-400' : 'text-green-400'}`}>{diagnostics.score}/100</span>
          </div>
          <div className="text-center flex flex-col justify-center py-1">
            <span className="text-muted uppercase">Telemetry Sync</span>
            <span className="text-green-400 font-bold mt-0.5">99.2% LOCK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
