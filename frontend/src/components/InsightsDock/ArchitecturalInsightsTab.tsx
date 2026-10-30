import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Flame,
  GitBranch,
  ShieldAlert,
  Users,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Box,
  FileCode,
  Link2,
  ExternalLink,
  CheckCircle,
  Filter,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { soundFx } from '../../utils/soundEffects';
import type { FileNode } from '../../types';

export type InsightCategory =
  | 'all'
  | 'hotspots'
  | 'bottlenecks'
  | 'instability'
  | 'dependencies'
  | 'smells'
  | 'ownership'
  | 'cascade';

export interface ArchitecturalInsightItem {
  id: string;
  category: 'hotspots' | 'bottlenecks' | 'instability' | 'dependencies' | 'smells' | 'ownership' | 'cascade';
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  evidence: Array<{ label: string; value: string }>;
  affectedFiles: string[];
  explanation: string;
  actionLabel: string;
  actionIcon: React.ElementType;
  onAction: () => void;
}

export const ArchitecturalInsightsTab: React.FC = () => {
  const {
    currentRepo,
    smellsResult,
    couplingResult,
    trajectoriesResult,
    selectFile,
    simulateFailure,
    toggleInsights,
    toggleLayer,
    toggleDependencyGraph,
  } = useCityStore();

  const [activeCategory, setActiveCategory] = useState<InsightCategory>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high'>('all');

  const files = currentRepo?.files || [];

  // Generate deterministic, evidence-backed architectural insights
  const insightsList: ArchitecturalInsightItem[] = useMemo(() => {
    if (!currentRepo || files.length === 0) return [];

    const items: ArchitecturalInsightItem[] = [];

    // Helper to find FileNode by path or filename
    const findFile = (p: string): FileNode | undefined =>
      files.find((f) => f.path === p || f.filename === p || f.path.endsWith(p));

    // 1. CRITICAL DEFECT HOTSPOTS (High ML Risk + High Complexity or Bug Fixes)
    const highRiskFiles = files.filter((f) => f.risk_probability >= 0.48);
    highRiskFiles.slice(0, 3).forEach((f) => {
      const riskPct = Math.round(f.risk_probability * 100);
      items.push({
        id: `hotspot-${f.path}`,
        category: 'hotspots',
        title: `Critical Defect Hotspot (${f.filename})`,
        severity: f.risk_probability >= 0.65 ? 'critical' : 'high',
        evidence: [
          { label: 'Defect Probability', value: `${riskPct}%` },
          { label: 'Max Branching (CC)', value: `${f.max_complexity.toFixed(1)}` },
          { label: 'Recent Churn', value: `${f.churn_90d} LOC` },
          { label: 'Past Bug Fixes', value: `${f.past_bug_fixes}` },
        ],
        affectedFiles: [f.path],
        explanation: `Historical commit patterns and branching complexity indicate a ${riskPct}% likelihood of defect introduction during upcoming modifications. Driven primarily by ${f.shap?.top_drivers?.[0]?.label || 'elevated cyclomatic branching'}.`,
        actionLabel: 'Inspect in 3D City',
        actionIcon: FileCode,
        onAction: () => {
          selectFile(f);
          toggleInsights(false);
        },
      });
    });

    // 2. ARCHITECTURAL BOTTLENECKS (High In-Degree or High Betweenness)
    const bottlenecks = files.filter(
      (f) => (f.fan_in >= 3 || (f.betweenness_centrality && f.betweenness_centrality >= 0.12)) && f.blast_radius?.total_count >= 2
    );
    bottlenecks.slice(0, 2).forEach((f) => {
      const dependentsCount = f.blast_radius?.total_count || f.fan_in;
      items.push({
        id: `bottleneck-${f.path}`,
        category: 'bottlenecks',
        title: `Architectural Centrality Bottleneck (${f.filename})`,
        severity: f.risk_probability >= 0.40 ? 'critical' : 'high',
        evidence: [
          { label: 'Direct Callers (Fan-In)', value: `${f.fan_in} files` },
          { label: 'Reachable Dependents', value: `${dependentsCount} files` },
          { label: 'Betweenness Centrality', value: f.betweenness_centrality ? f.betweenness_centrality.toFixed(3) : 'N/A' },
          { label: 'PageRank', value: f.pagerank ? f.pagerank.toFixed(3) : 'N/A' },
        ],
        affectedFiles: [f.path, ...(f.blast_radius?.hops?.[1] || []).slice(0, 3)],
        explanation: `'${f.filename}' serves as a core architectural hub. Changes or interface deprecations here directly reach ${dependentsCount} downstream modules (${Math.round((dependentsCount / Math.max(1, files.length)) * 100)}% of the repository).`,
        actionLabel: 'View in Graph',
        actionIcon: GitBranch,
        onAction: () => {
          selectFile(f);
          toggleDependencyGraph(true);
        },
      });
    });

    // 3. CHANGE INSTABILITY (Heavy Churn or Rapid Rise)
    const churnThreshold = Math.max(80, ...files.map((f) => f.churn_90d)) * 0.55;
    const unstableFiles = files.filter((f) => {
      const traj = trajectoriesResult?.trajectories?.[f.path];
      return f.churn_90d >= churnThreshold || traj?.is_rapid_rise;
    });
    unstableFiles.slice(0, 2).forEach((f) => {
      const traj = trajectoriesResult?.trajectories?.[f.path];
      items.push({
        id: `instability-${f.path}`,
        category: 'instability',
        title: `High Code Churn Instability (${f.filename})`,
        severity: 'high',
        evidence: [
          { label: '90-Day Churn', value: `${f.churn_90d} lines modified` },
          { label: 'Total Historical Churn', value: `${f.total_churn} LOC` },
          { label: 'Days Since Edit', value: `${Math.round(f.days_since_last_change)}d ago` },
          ...(traj ? [{ label: 'Trajectory Delta', value: `+${(traj.delta_90d * 100).toFixed(0)}%` }] : []),
        ],
        affectedFiles: [f.path],
        explanation: `Extreme churn over the past 90 days indicates active architectural restructuring or volatile business logic. Modules in active flux have historically exhibited twice the defect rate of settled files.`,
        actionLabel: 'Inspect Metrics',
        actionIcon: TrendingUp,
        onAction: () => {
          selectFile(f);
          toggleInsights(false);
        },
      });
    });

    // 4. DEPENDENCY CONCENTRATION (High Fan-Out)
    const highFanOut = files.filter((f) => f.fan_out >= 3);
    highFanOut.slice(0, 2).forEach((f) => {
      items.push({
        id: `dep-conc-${f.path}`,
        category: 'dependencies',
        title: `Broad External Coupling (${f.filename})`,
        severity: 'medium',
        evidence: [
          { label: 'External Imports (Fan-Out)', value: `${f.fan_out} modules` },
          { label: 'Mean Branch Complexity', value: `${f.mean_complexity.toFixed(1)} CC` },
          { label: 'File Footprint', value: `${f.loc} LOC` },
        ],
        affectedFiles: [f.path],
        explanation: `'${f.filename}' depends directly on ${f.fan_out} other modules in the codebase. Highly coupled components are fragile to upstream refactoring and difficult to unit-test in isolation.`,
        actionLabel: 'View Skybridges',
        actionIcon: Layers,
        onAction: () => {
          toggleLayer('skybridges');
          selectFile(f);
          toggleInsights(false);
        },
      });
    });

    // 5. ARCHITECTURE SMELLS (Tarjan Cycles, God Files, Orphans)
    if (smellsResult?.smells && smellsResult.smells.length > 0) {
      smellsResult.smells.forEach((smell) => {
        items.push({
          id: `smell-${smell.id}`,
          category: 'smells',
          title: smell.title,
          severity: smell.severity === 'high' ? 'critical' : smell.severity === 'medium' ? 'high' : 'medium',
          evidence: [
            { label: 'Anti-Pattern Type', value: smell.type.replace('_', ' ').toUpperCase() },
            { label: 'Affected Count', value: `${smell.affected_files.length} modules` },
          ],
          affectedFiles: smell.affected_files,
          explanation: smell.description,
          actionLabel: 'Highlight Smell Arcs',
          actionIcon: ShieldAlert,
          onAction: () => {
            toggleLayer('smells');
            const target = findFile(smell.affected_files[0]);
            if (target) selectFile(target);
            toggleInsights(false);
          },
        });
      });
    }

    // 6. OWNERSHIP CONCENTRATION (Bus Factor Risk)
    const busFactorRisks = files.filter((f) => {
      const share = f.dominant_contributor_share ?? (f.distinct_authors === 1 ? 1.0 : 0.88);
      return share >= 0.80 && f.risk_probability >= 0.40;
    });
    busFactorRisks.slice(0, 2).forEach((f) => {
      const share = Math.round((f.dominant_contributor_share ?? (f.distinct_authors === 1 ? 1.0 : 0.88)) * 100);
      items.push({
        id: `busfactor-${f.path}`,
        category: 'ownership',
        title: `Single-Maintainer Knowledge Concentration (${f.filename})`,
        severity: 'high',
        evidence: [
          { label: 'Dominant Contributor Share', value: `${share}%` },
          { label: 'Distinct Authors', value: `${f.distinct_authors}` },
          { label: 'Total Commits', value: `${f.commit_count}` },
          { label: 'Defect Risk', value: `${Math.round(f.risk_probability * 100)}%` },
        ],
        affectedFiles: [f.path],
        explanation: `One primary contributor authored ${share}% of all historical commits on this high-risk module. Loss of contributor availability or absence of cross-team code reviews presents maintenance continuity risk.`,
        actionLabel: 'Focus Bus Factor Layer',
        actionIcon: Users,
        onAction: () => {
          toggleLayer('busFactor');
          selectFile(f);
          toggleInsights(false);
        },
      });
    });

    // 7. CASCADING IMPACT RISKS (Highest Impact Failure Simulation Candidates)
    const highImpactFiles = [...files]
      .sort((a, b) => b.impact_score - a.impact_score)
      .filter((f) => f.blast_radius?.total_count >= 2);
    highImpactFiles.slice(0, 2).forEach((f) => {
      const dependentsCount = f.blast_radius?.total_count || 0;
      items.push({
        id: `cascade-${f.path}`,
        category: 'cascade',
        title: `High Cascading Blast Radius (${f.filename})`,
        severity: f.impact_score >= 1.5 ? 'critical' : 'high',
        evidence: [
          { label: 'Impact Score', value: `${f.impact_score.toFixed(2)}` },
          { label: 'Hop 1 Dependents', value: `${f.blast_radius?.hops?.[1]?.length || 0} direct` },
          { label: 'Transitive Dependents', value: `${dependentsCount} total` },
          { label: 'Defect Risk', value: `${Math.round(f.risk_probability * 100)}%` },
        ],
        affectedFiles: [f.path, ...(f.blast_radius?.hops?.[1] || [])],
        explanation: `A runtime failure or unhandled exception in '${f.filename}' has a deterministic reachability blast radius across ${dependentsCount} downstream modules across 3 hops.`,
        actionLabel: 'Simulate Failure',
        actionIcon: Flame,
        onAction: () => {
          simulateFailure(f);
          toggleInsights(false);
        },
      });
    });

    return items;
  }, [currentRepo, files, smellsResult, couplingResult, trajectoriesResult]);

  // Filter items
  const filteredInsights = useMemo(() => {
    return insightsList.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSeverity =
        severityFilter === 'all' ||
        (severityFilter === 'critical' && item.severity === 'critical') ||
        (severityFilter === 'high' && (item.severity === 'critical' || item.severity === 'high'));
      return matchesCategory && matchesSeverity;
    });
  }, [insightsList, activeCategory, severityFilter]);

  const categories: Array<{ id: InsightCategory; label: string; count: number }> = [
    { id: 'all', label: 'All Findings', count: insightsList.length },
    { id: 'hotspots', label: 'Defect Hotspots', count: insightsList.filter((i) => i.category === 'hotspots').length },
    { id: 'bottlenecks', label: 'Bottlenecks', count: insightsList.filter((i) => i.category === 'bottlenecks').length },
    { id: 'instability', label: 'Churn Instability', count: insightsList.filter((i) => i.category === 'instability').length },
    { id: 'dependencies', label: 'Coupling', count: insightsList.filter((i) => i.category === 'dependencies').length },
    { id: 'smells', label: 'Smell Loops', count: insightsList.filter((i) => i.category === 'smells').length },
    { id: 'ownership', label: 'Bus Factor', count: insightsList.filter((i) => i.category === 'ownership').length },
    { id: 'cascade', label: 'Blast Radius', count: insightsList.filter((i) => i.category === 'cascade').length },
  ];

  return (
    <div className="space-y-4 text-xs font-mono text-slate-200">
      {/* 1. Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/10">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm font-sans flex items-center gap-2">
              <span>Architectural Intelligence Findings</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                {filteredInsights.length} Ranked Insights
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Prioritized architectural risks synthesized from ML predictions, dependency reachability, and AST static analysis.
            </p>
          </div>
        </div>

        {/* Severity Filter Toggle */}
        <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-white/10 text-[11px] shrink-0">
          <button
            onClick={() => {
              soundFx.playClick();
              setSeverityFilter('all');
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              severityFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Severities
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setSeverityFilter('critical');
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              severityFilter === 'critical'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Critical Only
          </button>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundFx.playClick();
                setActiveCategory(cat.id);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono transition-all shrink-0 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-glow-cyan'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              <span>{cat.label}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-950/80 text-slate-300 border border-white/10">
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredInsights.length === 0 ? (
          <div className="col-span-2 p-8 text-center rounded-2xl bg-slate-900/40 border border-white/5 space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white font-sans">No Critical Issues in this Category</h4>
            <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
              All scanned files meet stability and architecture thresholds for {activeCategory}.
            </p>
          </div>
        ) : (
          filteredInsights.map((item) => {
            const isCritical = item.severity === 'critical';
            const isHigh = item.severity === 'high';
            const ActionIcon = item.actionIcon;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                  isCritical
                    ? 'bg-rose-950/30 border-rose-500/40 shadow-[0_0_18px_rgba(244,63,94,0.15)]'
                    : isHigh
                    ? 'bg-amber-950/25 border-amber-500/35'
                    : 'bg-slate-900/70 border-white/10'
                }`}
              >
                <div className="space-y-2">
                  {/* Card Header with Severity */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                      <span className="truncate">{item.title}</span>
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 border ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                          : isHigh
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>

                  {/* Supporting Evidence Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.evidence.map((ev, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-slate-950/80 border border-white/10 text-[10px] text-slate-300 font-mono"
                      >
                        <span className="text-slate-500 mr-1">{ev.label}:</span>
                        <strong className="text-white font-semibold">{ev.value}</strong>
                      </span>
                    ))}
                  </div>

                  {/* Plain English Explanation */}
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {item.explanation}
                  </p>
                </div>

                {/* Card Footer: Affected Files & Action Button */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                    <span className="text-slate-500">Target:</span>
                    <span className="text-cyan-300 truncate font-mono">
                      {item.affectedFiles[0]?.split('/').pop()}
                    </span>
                    {item.affectedFiles.length > 1 && (
                      <span className="text-slate-500">+{item.affectedFiles.length - 1} more</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      item.onAction();
                    }}
                    onMouseEnter={soundFx.playHoverTick}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-[11px] font-mono transition-all shadow-glow-cyan shrink-0"
                  >
                    <ActionIcon className="w-3.5 h-3.5" />
                    <span>{item.actionLabel}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
