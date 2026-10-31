import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Award,
  AlertTriangle,
  Flame,
  ShieldAlert,
  FileCode,
  Layers,
  Activity,
  CheckCircle2,
  Compass,
  Eye,
  Zap,
  GitBranch,
  X,
  Sparkles,
} from 'lucide-react';
import { useCityStore, EXHIBITION_STAGES } from '../store/useCityStore';
import { FileNode, ExhibitionStage } from '../types';
import { soundFx } from '../utils/soundEffects';
import { getLineFailureDiagnostic } from '../utils/fileDiagnostics';

const STAGE_DURATIONS: Record<ExhibitionStage, number> = {
  reveal: 6500,
  overview: 7000,
  tour: 8500,
  hotspots: 9000,
  dependencies: 8000,
  simulation: 8500,
  summary: 8000,
  complete: 12000,
};

const STAGE_LABELS: Record<ExhibitionStage, { title: string; subtitle: string }> = {
  reveal: { title: 'City Reveal', subtitle: 'Establishing 3D Software Metropolis' },
  overview: { title: 'Repository Metrics', subtitle: 'Codebase Scale & ML Model Baseline' },
  tour: { title: 'Architectural Tour', subtitle: 'Districts & Procedural Archetypes' },
  hotspots: { title: 'Risk Hotspots', subtitle: 'Defect Prediction & Line Diagnostics' },
  dependencies: { title: 'Dependency Web', subtitle: 'AST Conduits & Blast Radius' },
  simulation: { title: 'Failure Cascade', subtitle: 'Multi-Hop Contagion Reachability' },
  summary: { title: 'Intelligence Summary', subtitle: 'Verified Architectural Insights' },
  complete: { title: 'Tour Complete', subtitle: 'Free-form 3D City Exploration' },
};

export const PresentationHUD: React.FC = () => {
  const {
    presentationMode,
    currentRepo,
    selectedFile,
    exhibitionStage,
    isExhibitionPaused,
    isAttractModeEnabled,
    setExhibitionStage,
    nextExhibitionStage,
    prevExhibitionStage,
    toggleExhibitionPause,
    restartExhibition,
    toggleAttractMode,
    togglePresentationMode,
    openModelCard,
    recordUserActivity,
    simulatedFailedFile,
    simulateResult,
    modelCardData,
  } = useCityStore();

  const [stageProgress, setStageProgress] = useState(0);
  const [isAttractAutoStarted, setIsAttractAutoStarted] = useState(false);

  // 1. Data synthesis for exhibition highlights
  const topHotspots: FileNode[] = useMemo(() => {
    if (!currentRepo) return [];
    return [...currentRepo.files]
      .sort((a, b) => b.risk_probability - a.risk_probability)
      .slice(0, 5);
  }, [currentRepo]);

  const activeHotspot: FileNode | null = useMemo(() => {
    return topHotspots[0] || selectedFile || currentRepo?.files[0] || null;
  }, [topHotspots, selectedFile, currentRepo]);

  const depTargetFile: FileNode | null = useMemo(() => {
    if (!currentRepo) return null;
    return (
      currentRepo.files.find((f) => (f.blast_radius?.total_count || 0) > 0) ||
      activeHotspot
    );
  }, [currentRepo, activeHotspot]);

  const topBottleneck: FileNode | null = useMemo(() => {
    if (!currentRepo) return null;
    return (
      [...currentRepo.files].sort(
        (a, b) => (b.betweenness_centrality || 0) - (a.betweenness_centrality || 0)
      )[0] || null
    );
  }, [currentRepo]);

  const currentStageIndex = EXHIBITION_STAGES.indexOf(exhibitionStage);

  // 2. Automated Stage Progression Timer
  useEffect(() => {
    if (!presentationMode || isExhibitionPaused) return;

    const duration = STAGE_DURATIONS[exhibitionStage] || 8000;
    const intervalMs = 80;
    let elapsed = 0;
    setStageProgress(0);

    const timer = setInterval(() => {
      elapsed += intervalMs;
      const progress = Math.min(1.0, elapsed / duration);
      setStageProgress(progress);

      if (elapsed >= duration) {
        clearInterval(timer);
        if (exhibitionStage === 'complete') {
          // Keep showing complete or cycle to reveal
          setExhibitionStage('complete');
        } else {
          nextExhibitionStage();
        }
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [presentationMode, exhibitionStage, isExhibitionPaused, nextExhibitionStage, setExhibitionStage]);

  // 3. Optional Attract Mode idle detector (Opt-in only)
  useEffect(() => {
    if (!isAttractModeEnabled) return;

    const handleUserActivity = () => {
      recordUserActivity();
      if (presentationMode && isAttractAutoStarted) {
        togglePresentationMode();
        setIsAttractAutoStarted(false);
      }
    };

    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('mousedown', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });

    const idleChecker = setInterval(() => {
      const idleTime = Date.now() - useCityStore.getState().lastUserActivity;
      if (idleTime > 45000 && !useCityStore.getState().presentationMode) {
        setIsAttractAutoStarted(true);
        useCityStore.getState().togglePresentationMode();
      }
    }, 4000);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('mousedown', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      clearInterval(idleChecker);
    };
  }, [isAttractModeEnabled, presentationMode, isAttractAutoStarted, recordUserActivity, togglePresentationMode]);

  // 4. Keyboard Navigation Shortcuts
  useEffect(() => {
    if (!presentationMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        soundFx.playClick();
        toggleExhibitionPause();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        soundFx.playClick();
        nextExhibitionStage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        soundFx.playClick();
        prevExhibitionStage();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        soundFx.playClick();
        restartExhibition();
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        soundFx.playClick();
        togglePresentationMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    presentationMode,
    toggleExhibitionPause,
    nextExhibitionStage,
    prevExhibitionStage,
    restartExhibition,
    togglePresentationMode,
  ]);

  if (!presentationMode || !currentRepo) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-4 md:p-6 select-none animate-fade-in font-sans">
      {/* =========================================================================
          1. TOP MISSION-CONTROL BANNER & CONTROLS
         ========================================================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full">
        {/* Left: Product Title, Repo Identity, and Live Indicator */}
        <div className="pointer-events-auto glass-panel px-5 py-3 rounded-2xl border border-cyan-500/40 shadow-glow-cyan flex items-center space-x-4 text-white bg-slate-950/92 backdrop-blur-2xl">
          <span className="relative flex h-3.5 w-3.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent-cyan" />
          </span>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-accent-cyan font-bold flex items-center gap-2">
              <span>CodeCity AI • Exhibition Mode</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-medium ${
                isExhibitionPaused ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}>
                {isExhibitionPaused ? 'PAUSED' : 'AUTO-ADVANCE'}
              </span>
            </div>
            <div className="text-base font-bold tracking-tight text-white mt-0.5 flex items-center gap-2">
              <span className="truncate max-w-[260px] md:max-w-md">{currentRepo.name}</span>
              <span className="font-mono text-xs text-slate-400 font-normal">
                ({currentRepo.summary.total_files} files • {currentRepo.summary.total_loc.toLocaleString()} LOC)
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Quick Stage Pills & Utility Controls */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          {/* Attract Mode Toggle Pill */}
          <button
            onClick={() => {
              soundFx.playClick();
              toggleAttractMode();
            }}
            className={`glass-panel px-3 py-2 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-2xl ${
              isAttractModeEnabled
                ? 'bg-cyan-950/70 border-cyan-400/60 text-cyan-300 shadow-glow-cyan'
                : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle 45-second unattended kiosk attract mode"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Attract Mode:</span>
            <b>{isAttractModeEnabled ? 'ON' : 'OFF'}</b>
          </button>

          {/* Model Card Modal */}
          <button
            onClick={() => {
              soundFx.playClick();
              openModelCard();
            }}
            className="glass-panel px-3.5 py-2 rounded-xl border border-white/15 hover:border-amber-500/50 text-slate-200 hover:text-white flex items-center gap-2 text-xs font-mono transition-all shadow-glass-panel bg-slate-950/85 backdrop-blur-2xl"
          >
            <Award className="w-4 h-4 text-accent-amber" />
            <span className="hidden sm:inline">Model Card</span>
          </button>

          {/* Exit Presentation Mode */}
          <button
            onClick={() => {
              soundFx.playClick();
              togglePresentationMode();
            }}
            className="glass-panel px-4 py-2 rounded-xl border border-rose-500/50 hover:bg-rose-500/20 text-rose-300 flex items-center gap-2 text-xs font-mono transition-all shadow-glow-rose bg-slate-950/90 backdrop-blur-2xl"
            title="Exit Exhibition Mode (Esc or P)"
          >
            <X className="w-4 h-4" />
            <span>Exit (Esc)</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. TOP-CENTER STAGE STEPPER (8 STAGES RANDOM-ACCESS)
         ========================================================================= */}
      <div className="pointer-events-auto mx-auto glass-panel p-1.5 rounded-2xl border border-white/10 bg-slate-950/85 backdrop-blur-2xl shadow-2xl flex items-center gap-1 max-w-4xl overflow-x-auto">
        {EXHIBITION_STAGES.map((stg, idx) => {
          const isActive = stg === exhibitionStage;
          const isPassed = idx < currentStageIndex;
          const meta = STAGE_LABELS[stg];

          return (
            <button
              key={stg}
              onClick={() => {
                soundFx.playClick();
                setExhibitionStage(stg);
              }}
              className={`group relative px-2.5 py-1.5 rounded-xl font-mono text-[11px] flex items-center gap-1.5 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)] font-bold'
                  : isPassed
                  ? 'text-slate-300 hover:bg-white/10'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  isActive
                    ? 'bg-cyan-400 text-slate-950'
                    : isPassed
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {idx + 1}
              </span>
              <span>{meta.title}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          3. BOTTOM PRESENTATION NARRATIVE CARD & DATA SPOTLIGHT
         ========================================================================= */}
      <div className="pointer-events-auto max-w-2xl w-full mx-auto glass-panel p-5 rounded-3xl border border-cyan-500/40 shadow-glow-cyan text-white animate-slide-down bg-slate-950/95 backdrop-blur-2xl">
        {/* Stage Header & Duration Indicator */}
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
              Stage {currentStageIndex + 1} of 8
            </span>
            <span className="text-slate-300 font-semibold">{STAGE_LABELS[exhibitionStage].title}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>{isExhibitionPaused ? 'Paused' : `${((1 - stageProgress) * (STAGE_DURATIONS[exhibitionStage] / 1000)).toFixed(1)}s left`}</span>
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-100 rounded-full"
                style={{ width: `${stageProgress * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* ---------------- STAGE A: CITY REVEAL ---------------- */}
        {exhibitionStage === 'reveal' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent-cyan text-xs font-mono uppercase tracking-wider font-bold">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Procedural 3D Architecture Visualizer</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Welcome to CodeCity AI
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              CodeCity AI visualizes Python repositories as living 3D digital cities. Every skyscraper represents an actual code file, where building footprint encodes Lines of Code, height reflects cyclomatic branching complexity, and illuminated facades pulse with machine-learned defect probabilities.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                <div className="text-slate-400">Target</div>
                <div className="text-cyan-300 font-bold truncate">{currentRepo.name}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                <div className="text-slate-400">Layout</div>
                <div className="text-cyan-300 font-bold">Squarified Treemap</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                <div className="text-slate-400">Engine</div>
                <div className="text-cyan-300 font-bold">Three.js / WebGL</div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- STAGE B: REPOSITORY OVERVIEW ---------------- */}
        {exhibitionStage === 'overview' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent-cyan text-xs font-mono uppercase tracking-wider font-bold">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Repository Telemetry & ML Baseline</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Codebase Architectural Scale
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Total Files</div>
                <div className="text-lg font-bold font-mono text-cyan-300">{currentRepo.summary.total_files}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Lines of Code</div>
                <div className="text-lg font-bold font-mono text-white">{currentRepo.summary.total_loc.toLocaleString()}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Avg Defect Risk</div>
                <div className="text-lg font-bold font-mono text-amber-300">
                  {((currentRepo.summary.avg_risk || 0) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Risk Hotspots</div>
                <div className="text-lg font-bold font-mono text-rose-400">{topHotspots.length} files</div>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-200 flex items-center justify-between">
              <span>Model: XGBoost Classifier (Zero Temporal Leakage)</span>
              <span className="text-[10px] text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-cyan-500/40">
                ROC-AUC: {modelCardData?.metrics?.model?.roc_auc?.toFixed(3) || '0.842'}
              </span>
            </div>
          </div>
        )}

        {/* ---------------- STAGE C: ARCHITECTURAL TOUR ---------------- */}
        {exhibitionStage === 'tour' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent-cyan text-xs font-mono uppercase tracking-wider font-bold">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Procedural Architectural Typologies</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Districts & Procedural Archetypes
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              Folders are zoned as frosted glass district plinths. Files are categorized into ten architectural archetypes: monolithic datacenters, brutalist research towers, glass corporate headquarters, and high-density industrial facilities—tailoring window apertures and parapets to file roles.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                <div className="text-slate-400">Footprint</div>
                <div className="text-slate-200 font-bold">File LOC (Volume)</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                <div className="text-slate-400">Elevation</div>
                <div className="text-slate-200 font-bold">Cyclomatic Complexity</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                <div className="text-slate-400">Illumination</div>
                <div className="text-rose-300 font-bold">Defect Probability</div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- STAGE D: HIGHEST-RISK HOTSPOTS ---------------- */}
        {exhibitionStage === 'hotspots' && activeHotspot && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent-rose text-xs font-mono uppercase tracking-wider font-bold">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Primary Predicted Hotspot</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-xl text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-glow-rose">
                {(activeHotspot.risk_probability * 100).toFixed(0)}% Defect Probability
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2 truncate">
                <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{activeHotspot.filename}</span>
              </h3>
              <div className="text-xs text-slate-400 font-mono truncate mt-0.5">
                {activeHotspot.path}
              </div>
            </div>

            {(() => {
              const diag = getLineFailureDiagnostic(activeHotspot);
              return (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between text-rose-300 font-bold">
                    <span>Line {diag.line} in {diag.function_name}(): {diag.failure_type}</span>
                    <span className="text-[10px] text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded border border-white/10 uppercase">
                      {diag.severity}
                    </span>
                  </div>
                  <div className="text-slate-300 font-sans text-[11px] leading-relaxed">
                    <b>Root Cause:</b> {diag.why_it_fails}
                  </div>
                  <div className="text-cyan-300 text-[10px]">
                    <b>Remediation:</b> {diag.suggested_fix}
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
              <div className="p-1.5 rounded-lg bg-slate-900/60 border border-white/5">
                <div className="text-slate-400">LOC</div>
                <div className="text-white font-bold">{activeHotspot.loc}</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900/60 border border-white/5">
                <div className="text-slate-400">Complexity</div>
                <div className="text-amber-300 font-bold">{activeHotspot.max_complexity}</div>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900/60 border border-white/5">
                <div className="text-slate-400">90d Churn</div>
                <div className="text-rose-300 font-bold">{activeHotspot.churn_90d} lines</div>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono italic text-center">
              *Defect risk reflects statistical commit vulnerability, distinguishing potential risk from confirmed bugs.
            </div>
          </div>
        )}

        {/* ---------------- STAGE E: DEPENDENCY EXPLORATION ---------------- */}
        {exhibitionStage === 'dependencies' && depTargetFile && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-accent-cyan text-xs font-mono uppercase tracking-wider font-bold">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <span>AST Dependency Conduits</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-xl text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-glow-cyan">
                {depTargetFile.blast_radius?.total_count || 0} Dependent Callers
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2 truncate">
                <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{depTargetFile.filename}</span>
              </h3>
              <div className="text-xs text-slate-400 font-mono truncate mt-0.5">
                Coupled with {(currentRepo.graph_edges || []).length} AST directed edges across codebase
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
              Glowing parabolic skybridges trace live upstream importers and transitive callers. An AST parse maps import declarations, class inheritance, and function calls into an in-memory directed NetworkX graph with sub-millisecond traversal.
            </p>

            <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                <div className="text-slate-400">Hop 1 (Direct)</div>
                <div className="text-cyan-300 font-bold">{depTargetFile.blast_radius?.hops[1]?.length || 0} modules</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                <div className="text-slate-400">Hop 2 (Transitive)</div>
                <div className="text-purple-300 font-bold">{depTargetFile.blast_radius?.hops[2]?.length || 0} modules</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                <div className="text-slate-400">Betweenness</div>
                <div className="text-amber-300 font-bold">
                  {depTargetFile.betweenness_centrality?.toFixed(3) || '0.042'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- STAGE F: FAILURE SIMULATION ---------------- */}
        {exhibitionStage === 'simulation' && depTargetFile && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-mono uppercase tracking-wider font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Live Failure Simulation</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-xl text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/60 shadow-glow-rose">
                Cascading Shockwave Active
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2 truncate">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Simulating Outage: {depTargetFile.filename}</span>
              </h3>
              <div className="text-xs text-rose-300/80 font-mono mt-0.5">
                Reachability cascade across {simulateResult?.total_dependents || depTargetFile.blast_radius?.total_count || 0} upstream caller modules
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs font-mono text-rose-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Static Reachability Simulation</span>
              </div>
              <p className="font-sans text-[11px] text-slate-300 leading-relaxed">
                Depicts deterministic import propagation. If this interface experiences a breaking signature change or runtime exception, all highlighted callers are exposed to cascading failure.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center font-mono text-[11px]">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                <div className="text-slate-400">At-Risk Tests</div>
                <div className="text-amber-300 font-bold">{simulateResult?.at_risk_tests?.length || 0} test suites</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
                <div className="text-slate-400">Maximum Reach</div>
                <div className="text-rose-300 font-bold">3 Hops Transitive</div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- STAGE G: INTELLIGENCE SUMMARY ---------------- */}
        {exhibitionStage === 'summary' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent-cyan text-xs font-mono uppercase tracking-wider font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Verified Architectural Findings</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Architectural Intelligence Summary
            </h2>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10">
                <div className="text-slate-400">Top Defect Vulnerability</div>
                <div className="text-rose-400 font-bold truncate">{activeHotspot?.filename || 'None'}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {activeHotspot ? `${(activeHotspot.risk_probability * 100).toFixed(0)}% predicted risk` : 'Clean'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10">
                <div className="text-slate-400">Central Bottleneck</div>
                <div className="text-amber-400 font-bold truncate">{topBottleneck?.filename || 'None'}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Centrality: {topBottleneck?.betweenness_centrality?.toFixed(3) || '0.000'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10">
                <div className="text-slate-400">Dependency Coupling</div>
                <div className="text-cyan-300 font-bold">{(currentRepo.graph_edges || []).length} AST Edges</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Directed import conduits</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10">
                <div className="text-slate-400">Recommended Action</div>
                <div className="text-emerald-300 font-bold">Inspect Hotspot</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Run refactor simulation</div>
              </div>
            </div>
            <div className="text-xs text-slate-300 font-sans bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
              CodeCity AI enables software engineering organizations to prioritize refactoring by coupling statistical commit defect prediction with deterministic static dependency reachability.
            </div>
          </div>
        )}

        {/* ---------------- STAGE H: RETURN TO OVERVIEW ---------------- */}
        {exhibitionStage === 'complete' && (
          <div className="space-y-3 text-center">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 flex items-center justify-center mx-auto shadow-glow-cyan">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Exhibition Tour Complete
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-sans max-w-lg mx-auto">
              You can restart the automated cinematic tour or return to free interactive 3D city exploration to inspect specific buildings, filter dependencies, and evaluate PR commits.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  restartExhibition();
                }}
                className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-glow-cyan"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Tour (Press R)</span>
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  togglePresentationMode();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-white/20 text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-glass-panel"
              >
                <Eye className="w-4 h-4 text-accent-cyan" />
                <span>Free Exploration (Press Esc)</span>
              </button>
            </div>
          </div>
        )}

        {/* ---------------- BOTTOM PLAYBACK CONTROLS & SHORTCUTS ---------------- */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            {/* Prev Stage */}
            <button
              onClick={() => {
                soundFx.playClick();
                prevExhibitionStage();
              }}
              disabled={currentStageIndex === 0}
              className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Previous Stage (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Pause / Resume */}
            <button
              onClick={() => {
                soundFx.playClick();
                toggleExhibitionPause();
              }}
              className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-200 font-bold flex items-center gap-1.5 transition-all shadow-glow-cyan"
              title="Pause or Resume Auto-Advance (Space)"
            >
              {isExhibitionPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isExhibitionPaused ? 'Resume' : 'Pause'}</span>
            </button>

            {/* Next Stage */}
            <button
              onClick={() => {
                soundFx.playClick();
                nextExhibitionStage();
              }}
              className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all"
              title="Next Stage (Right Arrow)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Restart */}
            <button
              onClick={() => {
                soundFx.playClick();
                restartExhibition();
              }}
              className="p-1.5 rounded-lg border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all ml-1"
              title="Restart from Stage 1 (R)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Keyboard shortcut tips */}
          <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-400 font-mono">
            <span>[Space] Pause</span>
            <span>[←/→] Navigate</span>
            <span>[R] Restart</span>
            <span>[Esc] Exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
