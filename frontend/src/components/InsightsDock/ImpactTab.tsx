import React, { useState } from 'react';
import {
  AlertTriangle,
  Play,
  RotateCcw,
  Route,
  Flame,
  CheckCircle2,
  TestTube2,
  FileCode,
  ExternalLink,
  Code2,
  GitPullRequest,
  Zap,
  Radio,
  FileDiff,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { soundFx } from '../../utils/soundEffects';

const SAMPLE_TRACEBACKS: Record<string, string> = {
  flask: `Traceback (most recent call last):
  File "src/flask/app.py", line 192, in dispatch_request
    handler = self.url_map.get(req.path)
  File "src/flask/helpers.py", line 81, in url_for
    return f'/{endpoint}'
KeyError: 'endpoint_not_found'`,
  agenta: `Traceback (most recent call last):
  File "seed_db.py", line 42, in init_db
    models.init_schema()
  File "models.py", line 18, in init_schema
    schemas.validate_all()
ZeroDivisionError: division by zero`,
};

export const ImpactTab: React.FC = () => {
  const {
    currentRepo,
    selectedFile,
    tracebackInput,
    tracebackResult,
    simulateResult,
    shortestPathResult,
    pathSourceFile,
    pathTargetFile,
    setTracebackInput,
    analyzeTraceback,
    clearTraceback,
    simulateFileFailure,
    clearSimulation,
    findShortestPathBetween,
    clearShortestPath,
    setPathSourceFile,
    setPathTargetFile,
    selectFile,
    breakingChangeResult,
    simulateBreakingChange,
    clearBreakingChange,
    commitRiskResult,
    analyzeCommitDiff,
    clearCommitRisk,
  } = useCityStore();

  // Breaking change states
  const [bcTargetFile, setBcTargetFile] = useState<string>('');
  const [bcOldSig, setBcOldSig] = useState<string>('def route(rule, **options):');
  const [bcNewSig, setBcNewSig] = useState<string>('def route(rule, *, endpoint, **options):');
  const [isSimulatingBC, setIsSimulatingBC] = useState<boolean>(false);

  // Commit risk states
  const [diffInput, setDiffInput] = useState<string>('');
  const [isAnalyzingDiff, setIsAnalyzingDiff] = useState<boolean>(false);

  const [isAnalyzingTrace, setIsAnalyzingTrace] = useState(false);
  const [traceError, setTraceError] = useState<string | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [isFindingPath, setIsFindingPath] = useState(false);
  const [pathError, setPathError] = useState<string | null>(null);

  const handleAnalyzeTraceback = async () => {
    if (!tracebackInput.trim()) return;
    setIsAnalyzingTrace(true);
    setTraceError(null);
    soundFx.playClick();
    try {
      await analyzeTraceback();
      soundFx.playWarningPulse();
    } catch (e: any) {
      setTraceError(e.message || 'Failed to parse traceback.');
    } finally {
      setIsAnalyzingTrace(false);
    }
  };

  const handleSimulateFailure = async (path: string) => {
    setIsSimulating(true);
    soundFx.playClick();
    try {
      await simulateFileFailure(path);
      soundFx.playWarningPulse();
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleFindPath = async () => {
    if (!pathSourceFile || !pathTargetFile) return;
    setIsFindingPath(true);
    setPathError(null);
    soundFx.playClick();
    try {
      await findShortestPathBetween(pathSourceFile, pathTargetFile);
      soundFx.playWhoosh();
    } catch (e: any) {
      setPathError(e.message || 'Failed to compute shortest path.');
    } finally {
      setIsFindingPath(false);
    }
  };

  const SAMPLE_DIFF = `diff --git a/src/flask/app.py b/src/flask/app.py
--- a/src/flask/app.py
+++ b/src/flask/app.py
@@ -192,3 +192,8 @@ def dispatch_request(self):
-    return self.view_functions[rule.endpoint](**req.view_args)
+    if not self.config.get("STRICT_ROUTING"):
+        return self.view_functions[rule.endpoint](**req.view_args)
+    return self.strict_dispatch(rule, req)
diff --git a/src/flask/helpers.py b/src/flask/helpers.py
--- a/src/flask/helpers.py
+++ b/src/flask/helpers.py
@@ -81,2 +81,4 @@ def url_for(endpoint, **values):
+    if endpoint.startswith("api."):
+        values["_external"] = True
     return f'/{endpoint}'`;

  const handleSimulateBC = async () => {
    const target = bcTargetFile || (currentRepo?.files[0]?.path || '');
    if (!target) return;
    setIsSimulatingBC(true);
    soundFx.playClick();
    try {
      await simulateBreakingChange(target, bcOldSig, bcNewSig);
      soundFx.playWarningPulse();
    } finally {
      setIsSimulatingBC(false);
    }
  };

  const handleAnalyzeDiff = async () => {
    if (!diffInput.trim()) return;
    setIsAnalyzingDiff(true);
    soundFx.playClick();
    try {
      await analyzeCommitDiff(diffInput);
      soundFx.playWhoosh();
    } finally {
      setIsAnalyzingDiff(false);
    }
  };

  const loadSampleTraceback = () => {
    const isFlask = currentRepo?.repo_id.includes('flask');
    const sample = isFlask ? SAMPLE_TRACEBACKS.flask : SAMPLE_TRACEBACKS.agenta;
    setTracebackInput(sample);
    soundFx.playClick();
  };

  return (
    <div className="space-y-6 text-xs text-slate-200">
      {/* 1. Traceback Crash Resolver */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Traceback-to-Blast-Radius</h3>
              <p className="text-[11px] text-slate-400">
                Paste a Python stack trace to locate the crashed frame and simulate cascade failure.
              </p>
            </div>
          </div>
          <button
            onClick={loadSampleTraceback}
            className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-400/20 transition-all"
          >
            Insert Sample
          </button>
        </div>

        <textarea
          value={tracebackInput}
          onChange={(e) => setTracebackInput(e.target.value)}
          placeholder={`Traceback (most recent call last):\n  File "src/flask/app.py", line 192, in dispatch_request\n...`}
          rows={4}
          className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/50 resize-none"
        />

        {traceError && (
          <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{traceError}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAnalyzeTraceback}
              disabled={isAnalyzingTrace || !tracebackInput.trim()}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium flex items-center space-x-1.5 shadow-glow-rose transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isAnalyzingTrace ? 'Analyzing...' : 'Analyze Traceback'}</span>
            </button>
            {tracebackResult && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  clearTraceback();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Traceback Result Display */}
        {tracebackResult && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-950/90 border border-rose-500/40 space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                  CRASH RESOLVED
                </span>
                <h4 className="text-sm font-bold text-white mt-1 font-mono">
                  {tracebackResult.crashed_filename} : line {tracebackResult.crashed_line}
                </h4>
                <div className="text-[11px] text-slate-400 font-mono">
                  function: <span className="text-cyan-300">{tracebackResult.crashed_function}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-rose-400 font-bold">
                  {tracebackResult.cascade.total_dependents} Dependents at Risk
                </div>
                <div className="text-[10px] text-amber-400 font-mono">
                  {tracebackResult.cascade.at_risk_tests_count} Tests Affected
                </div>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/20 text-[11px] font-mono text-rose-300">
              {tracebackResult.error_message}
            </div>

            {/* Cascade Hops Breakdown */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-medium text-slate-300">Cascading Ripple Propagation:</div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((hop) => {
                  const items = (tracebackResult.cascade.hops as any)[hop] || [];
                  return (
                    <div key={hop} className="p-2 rounded-lg bg-slate-900/80 border border-white/5">
                      <div className="text-[10px] font-mono text-slate-400 font-bold mb-1">
                        Hop {hop} ({items.length})
                      </div>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {items.length === 0 ? (
                          <div className="text-[10px] text-slate-600 italic">None</div>
                        ) : (
                          items.map((it: any) => (
                            <div
                              key={it.path}
                              onClick={() => {
                                const match = currentRepo?.files.find((f) => f.path === it.path);
                                if (match) selectFile(match);
                              }}
                              className="text-[10px] font-mono text-slate-300 truncate hover:text-cyan-400 cursor-pointer"
                              title={it.path}
                            >
                              {it.filename}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Failure Simulation Trigger */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Simulate Failure Cascade</h3>
              <p className="text-[11px] text-slate-400">
                Instantly simulate a failure on any selected building to inspect downstream callers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedFile?.path || ''}
            onChange={(e) => {
              const f = currentRepo?.files.find((item) => item.path === e.target.value);
              if (f) selectFile(f);
            }}
            className="flex-1 p-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-200 font-mono focus:outline-none"
          >
            <option value="">-- Choose Module to Simulate --</option>
            {currentRepo?.files.map((f) => (
              <option key={f.path} value={f.path}>
                {f.filename} ({f.loc} LOC, {Math.round(f.risk_probability * 100)}% risk)
              </option>
            ))}
          </select>

          <button
            onClick={() => selectedFile && handleSimulateFailure(selectedFile.path)}
            disabled={!selectedFile || isSimulating}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium flex items-center space-x-1.5 shadow-glow-cyan transition-all"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate</span>
          </button>
        </div>

        {simulateResult && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-cyan-300">
                {simulateResult.summary}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Target: {simulateResult.crashed_file.split('/').pop()} | Impact Score: {simulateResult.impact_score}
              </div>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                clearSimulation();
              }}
              className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-white/5 hover:bg-white/10 text-slate-400"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* 3. Shortest Path Explorer */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Dependency Path Explorer</h3>
            <p className="text-[11px] text-slate-400">
              Compute the shortest directional route connecting any two files in the codebase.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 font-mono mb-1 block">SOURCE FILE</label>
            <select
              value={pathSourceFile || ''}
              onChange={(e) => setPathSourceFile(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-200 font-mono focus:outline-none"
            >
              <option value="">Select Source...</option>
              {currentRepo?.files.map((f) => (
                <option key={f.path} value={f.path}>
                  {f.filename}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-mono mb-1 block">TARGET FILE</label>
            <select
              value={pathTargetFile || ''}
              onChange={(e) => setPathTargetFile(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-200 font-mono focus:outline-none"
            >
              <option value="">Select Target...</option>
              {currentRepo?.files.map((f) => (
                <option key={f.path} value={f.path}>
                  {f.filename}
                </option>
              ))}
            </select>
          </div>
        </div>

        {pathError && (
          <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
            {pathError}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleFindPath}
            disabled={!pathSourceFile || !pathTargetFile || isFindingPath}
            className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium flex items-center space-x-1.5 shadow-[0_0_12px_rgba(139,92,246,0.4)] transition-all"
          >
            <Route className="w-3.5 h-3.5" />
            <span>{isFindingPath ? 'Calculating...' : 'Find Route'}</span>
          </button>
          {shortestPathResult && (
            <button
              onClick={() => {
                soundFx.playClick();
                clearShortestPath();
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {shortestPathResult && (
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-violet-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40 font-semibold">
                {shortestPathResult.exists ? `${shortestPathResult.length} HOPS CONNECTED` : 'DISCONNECTED'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {shortestPathResult.is_directed ? 'Direct Import Flow' : 'Indirect Chain'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono">{shortestPathResult.description}</p>
            {shortestPathResult.path.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {shortestPathResult.path.map((node, i) => (
                  <React.Fragment key={node}>
                    <span
                      onClick={() => {
                        const m = currentRepo?.files.find((f) => f.path === node);
                        if (m) selectFile(m);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 border border-white/10 font-mono text-[11px] text-cyan-300 cursor-pointer hover:border-cyan-400"
                    >
                      {node.split('/').pop()}
                    </span>
                    {i < shortestPathResult.path.length - 1 && (
                      <span className="text-slate-500 font-bold">&rarr;</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* 4. Breaking-Change Signature Tester (A3) */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Breaking-Change Signature Tester</h3>
              <p className="text-[11px] text-slate-400">
                Deterministic AST diffing: re-parses call sites and identifies broken callers across the repo.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setBcOldSig('def execute_query(query, timeout=30):');
                setBcNewSig('def execute_query(query, *, timeout=30, strict_mode=True):');
                soundFx.playClick();
              }}
              className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 font-mono"
            >
              Preset: Add Required Arg
            </button>
            <button
              onClick={() => {
                setBcOldSig('def process_data(data, validate=True, context=None):');
                setBcNewSig('def process_data(data, context=None):');
                soundFx.playClick();
              }}
              className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 font-mono"
            >
              Preset: Remove Param
            </button>
          </div>
        </div>

        {/* Target File Selector */}
        <div className="space-y-1">
          <label className="text-[11px] text-slate-400">Target Module with Signature Change:</label>
          <select
            value={bcTargetFile || (currentRepo?.files[0]?.path || '')}
            onChange={(e) => setBcTargetFile(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
          >
            {currentRepo?.files.map((f) => (
              <option key={f.path} value={f.path}>
                {f.filename} ({f.path})
              </option>
            ))}
          </select>
        </div>

        {/* Old & New Signatures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-mono">Original Function Signature:</span>
            <input
              type="text"
              value={bcOldSig}
              onChange={(e) => setBcOldSig(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-amber-300 font-mono">Modified Signature (Simulated):</span>
            <input
              type="text"
              value={bcNewSig}
              onChange={(e) => setBcNewSig(e.target.value)}
              className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleSimulateBC}
            disabled={isSimulatingBC}
            className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium flex items-center space-x-1.5 shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all font-mono"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isSimulatingBC ? 'Evaluating AST Diff...' : 'Simulate Signature Change'}</span>
          </button>

          {breakingChangeResult && (
            <button
              onClick={() => {
                soundFx.playClick();
                clearBreakingChange();
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 flex items-center space-x-1 font-mono text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Breaking Change Analysis Results */}
        {breakingChangeResult && (
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                {breakingChangeResult.total_broken_callers} BROKEN CALLERS DETECTED
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Target: {breakingChangeResult.target_file.split('/').pop()}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-mono">{breakingChangeResult.summary}</p>

            {breakingChangeResult.broken_callers.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                {(breakingChangeResult.broken_callers || []).map((caller, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-900 border border-rose-500/30 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="text-white font-semibold flex items-center space-x-2">
                        <span>{caller.caller_name}</span>
                        <span className="text-[10px] text-slate-500">line {caller.line}</span>
                      </div>
                      <div className="text-[10px] text-rose-300 mt-0.5">{caller.reason}</div>
                      <div className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded mt-1 max-w-md truncate">
                        {caller.call_text}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const m = currentRepo?.files.find((f) => f.path === caller.caller_file);
                        if (m) selectFile(m);
                      }}
                      className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] border border-rose-500/40"
                    >
                      Focus 3D
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs">
                Zero call-site breakages detected across active repository callers.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Commit & PR Diff Risk Checker (C2) */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Commit / PR Diff Risk Checker</h3>
              <p className="text-[11px] text-slate-400">
                Paste unified git diff: calculates aggregate PR defect probability and union blast radius.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setDiffInput(SAMPLE_DIFF);
              soundFx.playClick();
            }}
            className="text-[10px] px-2 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-mono transition-all"
          >
            Insert Sample Diff
          </button>
        </div>

        <textarea
          rows={3}
          value={diffInput}
          onChange={(e) => setDiffInput(e.target.value)}
          placeholder="Paste unified git diff here (e.g. diff --git a/... b/...)..."
          className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-purple-200 font-mono focus:outline-none focus:border-purple-400 resize-none"
        />

        <div className="flex items-center justify-between">
          <button
            onClick={handleAnalyzeDiff}
            disabled={!diffInput.trim() || isAnalyzingDiff}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium flex items-center space-x-1.5 shadow-[0_0_12px_rgba(168,85,247,0.4)] transition-all font-mono"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isAnalyzingDiff ? 'Computing PR Risk...' : 'Evaluate PR Risk'}</span>
          </button>

          {commitRiskResult && (
            <button
              onClick={() => {
                soundFx.playClick();
                clearCommitRisk();
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 flex items-center space-x-1 font-mono text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* PR Diff Evaluation Result */}
        {commitRiskResult && (
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-purple-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                  commitRiskResult.risk_tier === 'CRITICAL' || commitRiskResult.risk_tier === 'HIGH'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                PR RISK: {commitRiskResult.risk_tier} ({(commitRiskResult.combined_pr_risk * 100).toFixed(1)}%)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {commitRiskResult.touched_files.length} Files Modified
              </span>
            </div>

            {/* Union Blast Radius */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">Union Blast Radius:</span>
                <span className="font-mono text-purple-300 font-bold">
                  {commitRiskResult.total_blast_radius} downstream modules at risk
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Pulsing halos activated in 3D scene on modified files.
              </p>
            </div>

            {/* File breakdown */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-mono">Modified Files Breakdown:</span>
              <div className="space-y-1 font-mono text-xs">
                {(commitRiskResult.file_breakdown || []).map((item) => (
                  <div
                    key={item.path}
                    className="p-1.5 rounded bg-slate-900 border border-white/5 flex items-center justify-between"
                  >
                    <span className="text-white truncate max-w-xs">{item.path.split('/').pop()}</span>
                    <div className="flex items-center space-x-2 text-[10px]">
                      <span className="text-emerald-400">+{item.loc_added}</span>
                      <span className="text-rose-400">-{item.loc_deleted}</span>
                      <span className="text-purple-300 font-bold">
                        {(item.single_risk * 100).toFixed(0)}% risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
