import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Layers, Info, Filter, BarChart3 } from 'lucide-react';
import { useCityStore } from '../store/useCityStore';
import { soundFx } from '../utils/soundEffects';
import { getBuildingColorHex } from '../utils/cityLayout';
import { FileNode } from '../types';

export const HotspotScatterModal: React.FC = () => {
  const { isScatterPlotOpen, toggleScatterPlot, currentRepo, selectedFile, selectFile } = useCityStore();
  const [hoveredNode, setHoveredNode] = useState<FileNode | null>(null);
  const [matrixMode, setMatrixMode] = useState<'complexity_churn' | 'complexity_blast' | 'risk_impact'>('complexity_churn');

  const files = currentRepo?.files || [];

  // Dynamic metric values based on selected matrix mode (unconditionally declared at top)
  const maxX = useMemo(() => {
    if (matrixMode === 'risk_impact') return 1.0;
    return Math.max(12, ...files.map((f) => f.max_complexity || 1));
  }, [files, matrixMode]);

  const maxY = useMemo(() => {
    if (matrixMode === 'risk_impact') return Math.max(2.5, ...files.map((f) => f.impact_score || 0.1));
    if (matrixMode === 'complexity_blast') return Math.max(5, ...files.map((f) => f.blast_radius?.total_count || 1));
    return Math.max(50, ...files.map((f) => f.churn_90d || 1));
  }, [files, matrixMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isScatterPlotOpen) {
        soundFx.playClick();
        toggleScatterPlot(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScatterPlotOpen, toggleScatterPlot]);

  if (!isScatterPlotOpen || !currentRepo) return null;

  // Width and height of SVG canvas
  const svgWidth = 660;
  const svgHeight = 420;
  const padding = 54;
  const plotWidth = svgWidth - padding * 2;
  const plotHeight = svgHeight - padding * 2;

  const xLabel =
    matrixMode === 'risk_impact'
      ? 'Defect Risk Likelihood (0% to 100%)'
      : 'Max Cyclomatic Complexity (Branching Depth)';

  const yLabel =
    matrixMode === 'risk_impact'
      ? 'Cascading Impact Score (Risk × Log Dependents)'
      : matrixMode === 'complexity_blast'
      ? '3-Hop Blast Radius (Reachable Files)'
      : 'Recent Code Churn (90-Day Modified LOC)';

  // Compute quadrant midpoints
  const midX = padding + plotWidth * 0.5;
  const midY = padding + plotHeight * 0.5;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl select-none"
        onClick={() => {
          soundFx.playClick();
          toggleScatterPlot();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative w-full max-w-3xl glass-panel rounded-2xl border border-white/15 p-6 shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl bg-slate-950/95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Mode Toggles */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                  <span>Architecture Hotspot Matrix</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    2D Correlation Space
                  </span>
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-slate-400 font-mono">Axis View:</span>
                  <div className="flex items-center space-x-1 bg-slate-900/80 p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setMatrixMode('complexity_churn');
                      }}
                      className={`px-2 py-0.5 rounded transition-all ${
                        matrixMode === 'complexity_churn'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Complexity vs Churn
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setMatrixMode('complexity_blast');
                      }}
                      className={`px-2 py-0.5 rounded transition-all ${
                        matrixMode === 'complexity_blast'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Complexity vs Blast Radius
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setMatrixMode('risk_impact');
                      }}
                      className={`px-2 py-0.5 rounded transition-all ${
                        matrixMode === 'risk_impact'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Risk vs Impact
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                toggleScatterPlot();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all self-start sm:self-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scatter Plot View */}
          <div className="py-4 flex flex-col items-center justify-center">
            <div className="relative">
              <svg width={svgWidth} height={svgHeight} className="overflow-visible font-mono">
                {/* Plot Background */}
                <rect
                  x={padding}
                  y={padding}
                  width={plotWidth}
                  height={plotHeight}
                  fill="rgba(10,15,30,0.8)"
                  stroke="rgba(255,255,255,0.1)"
                  rx="10"
                />

                {/* Quadrant Divider Crosshairs */}
                <line
                  x1={midX}
                  y1={padding}
                  x2={midX}
                  y2={padding + plotHeight}
                  stroke="rgba(255,255,255,0.15)"
                  strokeDasharray="4,4"
                />
                <line
                  x1={padding}
                  y1={midY}
                  x2={padding + plotWidth}
                  y2={midY}
                  stroke="rgba(255,255,255,0.15)"
                  strokeDasharray="4,4"
                />

                {/* Quadrant Labels */}
                <text
                  x={padding + plotWidth - 12}
                  y={padding + 20}
                  textAnchor="end"
                  fill="#f43f5e"
                  fontSize="11"
                  fontWeight="bold"
                  opacity="0.8"
                >
                  DANGER ZONE (High Risk & High Exposure)
                </text>
                <text
                  x={padding + 14}
                  y={padding + 20}
                  textAnchor="start"
                  fill="#fbbf24"
                  fontSize="11"
                  fontWeight="bold"
                  opacity="0.7"
                >
                  HIGH FLUX (Active Volatility)
                </text>
                <text
                  x={padding + plotWidth - 12}
                  y={padding + plotHeight - 14}
                  textAnchor="end"
                  fill="#a855f7"
                  fontSize="11"
                  fontWeight="bold"
                  opacity="0.7"
                >
                  STABLE COMPLEXITY (Infrequently Modified)
                </text>
                <text
                  x={padding + 14}
                  y={padding + plotHeight - 14}
                  textAnchor="start"
                  fill="#10b981"
                  fontSize="11"
                  fontWeight="bold"
                  opacity="0.7"
                >
                  CLEAN BASELINE (Simple & Low Risk)
                </text>

                {/* Grid ticks */}
                <line x1={padding} y1={padding + plotHeight} x2={padding + plotWidth} y2={padding + plotHeight} stroke="rgba(255,255,255,0.3)" />
                <line x1={padding} y1={padding} x2={padding} y2={padding + plotHeight} stroke="rgba(255,255,255,0.3)" />

                {/* Bubbles */}
                {files.map((file) => {
                  const valX = matrixMode === 'risk_impact' ? file.risk_probability : file.max_complexity;
                  const valY =
                    matrixMode === 'risk_impact'
                      ? file.impact_score
                      : matrixMode === 'complexity_blast'
                      ? file.blast_radius?.total_count || 1
                      : file.churn_90d;

                  const cx = padding + (Math.min(maxX, valX) / maxX) * plotWidth;
                  const cy = padding + plotHeight - (Math.min(maxY, valY) / maxY) * plotHeight;
                  const radius = Math.max(6, Math.min(20, Math.sqrt(file.loc || 50) * 0.52));
                  const color = getBuildingColorHex(file, 'risk');
                  const isSelected = selectedFile?.path === file.path;
                  const isHovered = hoveredNode?.path === file.path;

                  return (
                    <g
                      key={file.path}
                      className="cursor-pointer transition-transform"
                      onMouseEnter={() => {
                        soundFx.playHoverTick();
                        setHoveredNode(file);
                      }}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={() => {
                        soundFx.playClick();
                        selectFile(file);
                        toggleScatterPlot();
                      }}
                    >
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill={color}
                        fillOpacity={isSelected ? 1.0 : 0.8}
                        stroke={isSelected ? '#ffffff' : color}
                        strokeWidth={isSelected ? 3 : 1.5}
                        style={{
                          filter: file.risk_probability >= 0.5 ? 'drop-shadow(0 0 8px rgba(244,63,94,0.7))' : 'none',
                        }}
                      />
                      {/* Label for significant files or hovered */}
                      {(isHovered || isSelected || file.is_hotspot || file.risk_probability >= 0.7) && (
                        <text
                          x={cx}
                          y={cy - radius - 5}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                          className="pointer-events-none drop-shadow-md"
                        >
                          {file.filename}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Axis Labels */}
                <text
                  x={padding + plotWidth / 2}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {xLabel} &rarr;
                </text>
                <text
                  x={14}
                  y={padding + plotHeight / 2}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="bold"
                  transform={`rotate(-90, 14, ${padding + plotHeight / 2})`}
                >
                  &larr; {yLabel}
                </text>
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredNode && (
                <div className="absolute top-4 left-16 p-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-xs font-mono shadow-xl space-y-1 pointer-events-none">
                  <div className="text-white font-bold">{hoveredNode.filename}</div>
                  <div className="text-[11px] text-slate-400">{hoveredNode.path}</div>
                  <div className="flex items-center space-x-3 text-[10px] pt-1 border-t border-white/10">
                    <span className="text-rose-400 font-bold">
                      Risk: {(hoveredNode.risk_probability * 100).toFixed(0)}%
                    </span>
                    <span className="text-cyan-400">CC: {hoveredNode.max_complexity.toFixed(1)}</span>
                    <span className="text-amber-400">Churn: {hoveredNode.churn_90d}</span>
                    <span className="text-violet-400">Blast: {hoveredNode.blast_radius?.total_count || 1}</span>
                    <span className="text-slate-300">{hoveredNode.loc} LOC</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Click any bubble to focus module in 3D city and open line diagnostics.</span>
            <span className="text-cyan-400 font-semibold">{files.length} modules plotted</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
