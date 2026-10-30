import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Award,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Info,
} from 'lucide-react';
import { useCityStore } from '../../store/useCityStore';
import { soundFx } from '../../utils/soundEffects';

export const ReportTab: React.FC = () => {
  const {
    currentRepo,
    healthReportResult,
    fetchHealthReport,
  } = useCityStore();

  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!healthReportResult && currentRepo) {
      fetchHealthReport();
    }
  }, [currentRepo, healthReportResult]);

  if (!healthReportResult) {
    return (
      <div className="py-12 text-center text-slate-500 font-mono text-xs">
        Calculating 0-100 Code Health Score and generating report...
      </div>
    );
  }

  const { health, smells, summary } = healthReportResult;
  const score = health.score;
  const grade = health.grade;

  const handleDownloadMarkdown = async () => {
    if (!currentRepo) return;
    setIsExporting(true);
    soundFx.playClick();
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/report?repo_id=${encodeURIComponent(currentRepo.repo_id)}&format=markdown`);
      const mdText = await res.text();
      const blob = new Blob([mdText], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codecity-health-report-${currentRepo.repo_id}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenPrintHtml = () => {
    if (!currentRepo) return;
    soundFx.playClick();
    window.open(`http://127.0.0.1:8000/api/report?repo_id=${encodeURIComponent(currentRepo.repo_id)}&format=html`, '_blank');
  };

  const gradeColor =
    grade === 'A'
      ? 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10'
      : grade === 'B'
      ? 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10'
      : grade === 'C'
      ? 'text-amber-400 border-amber-500/50 bg-amber-500/10'
      : 'text-rose-400 border-rose-500/50 bg-rose-500/10';

  return (
    <div className="space-y-5 text-xs text-slate-200">
      {/* 1. Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>0-100 Code Health Score & Executive Report</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Transparently computed from defect probability, cyclic imports, god modules, and complexity.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadMarkdown}
            disabled={isExporting}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400/40 text-slate-200 hover:text-white flex items-center space-x-1.5 transition-all text-xs"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Markdown</span>
          </button>

          <button
            onClick={handleOpenPrintHtml}
            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center space-x-1.5 shadow-glow-cyan transition-all text-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Score Banner Card */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Circular Score Badge */}
          <div className="relative w-20 h-20 rounded-2xl bg-slate-950 border border-white/10 flex flex-col items-center justify-center">
            <span className="text-2xl font-black font-mono text-white leading-none">{score}</span>
            <span className="text-[10px] font-mono text-slate-400 mt-0.5">/ 100</span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-lg border font-mono font-bold text-sm ${gradeColor}`}>
                Grade {grade}
              </span>
              <span className="text-xs font-mono text-slate-300">
                {score >= 80 ? 'Robust Health' : score >= 60 ? 'Moderate Technical Debt' : 'Critical Refactoring Needed'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
              Evaluated across {summary?.total_files || currentRepo?.files.length} modules, {summary?.total_loc || 0} LOC, and {summary?.total_dependencies || 0} dependency edges.
            </p>
          </div>
        </div>

        {/* Total Deductions Pill */}
        <div className="text-right">
          <div className="text-[10px] font-mono text-slate-400">Total Deductions</div>
          <div className="text-base font-bold font-mono text-rose-400">
            -{health.breakdown.total_deductions} pts
          </div>
        </div>
      </div>

      {/* 3. Deductions Breakdown */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
        <div className="text-xs font-semibold text-white">Score Deduction Breakdown:</div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
            <div className="text-[10px] text-slate-400">Defect Risk</div>
            <div className="text-sm font-bold font-mono text-rose-400">
              -{health.breakdown.risk_penalty} pts
            </div>
            <div className="text-[10px] text-slate-500">Avg risk: {(summary?.avg_risk ? summary.avg_risk * 100 : 20).toFixed(1)}%</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
            <div className="text-[10px] text-slate-400">Circular Loops</div>
            <div className="text-sm font-bold font-mono text-rose-400">
              -{health.breakdown.cycle_penalty} pts
            </div>
            <div className="text-[10px] text-slate-500">{smells?.summary?.circular_dependencies_count || 0} cycles</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
            <div className="text-[10px] text-slate-400">God Modules</div>
            <div className="text-sm font-bold font-mono text-amber-400">
              -{health.breakdown.god_file_penalty} pts
            </div>
            <div className="text-[10px] text-slate-500">{smells?.summary?.god_files_count || 0} god files</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
            <div className="text-[10px] text-slate-400">High Complexity</div>
            <div className="text-sm font-bold font-mono text-cyan-400">
              -{health.breakdown.complexity_penalty} pts
            </div>
            <div className="text-[10px] text-slate-500">Max CC &gt; 12.0 ratio</div>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/90 border border-white/5 text-[10px] font-mono text-slate-400">
          <span className="text-cyan-400 font-semibold">Formula:</span> {health.formula}
        </div>
      </div>
    </div>
  );
};

