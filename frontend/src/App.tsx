import React, { useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw, PanelLeftOpen } from 'lucide-react';
import { useCityStore } from './store/useCityStore';
import { Navbar } from './components/Navbar';
import { LeftPanel } from './components/LeftPanel';
import { RightDrawer } from './components/RightDrawer';
import { CityScene } from './components/City3D/CityScene';
import { BottomHUD } from './components/BottomHUD';
import { CommandPalette } from './components/CommandPalette';
import { ModelCardModal } from './components/ModelCardModal';
import { OnboardingModal } from './components/OnboardingModal';
import { PresentationHUD } from './components/PresentationHUD';
import { PinnedDock } from './components/PinnedDock';
import { InsightsDock } from './components/InsightsDock/InsightsDock';
import { HotspotScatterModal } from './components/HotspotScatterModal';
import { TerminalLogDrawer } from './components/TerminalLogDrawer';
import { RepoComparisonModal } from './components/RepoComparisonModal';
import { DependencyGraphModal } from './components/DependencyGraphModal';
import { ColorMode } from './types';

export const App: React.FC = () => {
  const {
    currentRepo,
    selectedFile,
    hoveredFile,
    colorMode,
    riskThreshold,
    maxHopDepth,
    searchQuery,
    selectedDirectory,
    presentationMode,
    lowPowerMode,
    cameraResetTrigger,
    isModelCardOpen,
    isCommandPaletteOpen,
    isOnboardingOpen,
    isLeftPanelCollapsed,
    isLoading,
    error,
    fetchRepos,
    selectFile,
    setHoveredFile,
    setColorMode,
    togglePresentationMode,
    toggleCommandPalette,
    toggleLeftPanel,
    recordUserActivity,
    isScatterPlotOpen,
    isRepoComparisonOpen,
    isDependencyGraphOpen,
  } = useCityStore();

  const isModalOpen =
    isModelCardOpen ||
    isCommandPaletteOpen ||
    isOnboardingOpen ||
    isScatterPlotOpen ||
    isRepoComparisonOpen ||
    isDependencyGraphOpen;

  // Initial load
  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  // Global Keyboard Shortcuts (Ctrl+K, Cmd+K, F, P, 1-5, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      recordUserActivity();

      // Command Palette shortcut: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // Ignore standard keys if user is currently typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        selectFile(null);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        const searchInput = document.getElementById('city-search-input');
        if (searchInput) searchInput.focus();
      } else if (e.key === 'p' || e.key === 'P') {
        togglePresentationMode();
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const modeMap: { [k: string]: ColorMode } = {
          '1': 'risk',
          '2': 'complexity',
          '3': 'churn',
          '4': 'age',
          '5': 'impact',
        };
        setColorMode(modeMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectFile, setColorMode, togglePresentationMode, toggleCommandPalette, recordUserActivity]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#030712] text-slate-100 overflow-hidden select-none">
      {/* 1. Header Navigation Bar */}
      <Navbar />

      {/* 2. Main Content Viewport: Fullscreen 3D Canvas with Floating Chrome */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Left Intelligence Panel (Floating & Collapsible) */}
        {!presentationMode && <LeftPanel />}

        {/* Floating panel trigger when collapsed */}
        {!presentationMode && isLeftPanelCollapsed && (
          <button
            id="floating-panel-toggle"
            onClick={toggleLeftPanel}
            className="absolute left-3 top-3 z-20 glass-panel p-2 rounded-xl border border-white/10 hover:border-cyan-500/50 text-slate-300 hover:text-white shadow-glass-panel transition-all animate-fade-in"
            title="Expand Intelligence Panel"
          >
            <PanelLeftOpen className="w-4 h-4 text-accent-cyan" />
          </button>
        )}

        {/* 3D City Hero Visualization Canvas */}
        <main className="flex-1 relative h-full bg-[#030712] overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-[#030712]/95 z-30 animate-fade-in">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-accent-cyan animate-spin" />
                <div className="absolute inset-0 blur-xl bg-cyan-500/40 rounded-full" />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold font-mono text-slate-200 tracking-wide">
                  Constructing 3D CodeCity Metropolis...
                </div>
                <div className="text-xs text-slate-400 mt-1.5 font-mono">
                  Synthesizing AST blast radius graph & procedural facades
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#030712] z-30 animate-fade-in">
              <div className="max-w-md p-6 glass-panel rounded-2xl border border-rose-500/40 text-center space-y-4 shadow-glow-rose">
                <AlertCircle className="w-12 h-12 text-accent-rose mx-auto" />
                <div>
                  <h3 className="text-base font-bold text-white">Connection or Data Error</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-mono">{error}</p>
                </div>
                <button
                  onClick={() => fetchRepos()}
                  className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 rounded-xl text-xs font-medium inline-flex items-center gap-2 transition-all shadow-glow-rose"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Connection</span>
                </button>
              </div>
            </div>
          ) : currentRepo ? (
            <CityScene
              files={currentRepo.files}
              graphEdges={currentRepo.graph_edges || []}
              selectedFile={selectedFile}
              hoveredFile={hoveredFile}
              colorMode={colorMode}
              riskThreshold={riskThreshold}
              maxHopDepth={maxHopDepth}
              searchQuery={searchQuery}
              selectedDirectory={selectedDirectory}
              presentationMode={presentationMode}
              lowPowerMode={lowPowerMode}
              cameraResetTrigger={cameraResetTrigger}
              hideHtmlLabels={isModalOpen}
              onSelectFile={selectFile}
              onHoverFile={setHoveredFile}
            />
          ) : null}

          {/* Exhibition Mode HUD (Projector overlay) */}
          <PresentationHUD />

          {/* Pinned Files Comparison Dock */}
          <PinnedDock />

          {/* Bottom HUD (Minimap, Color Legend, Mode Switcher) */}
          <BottomHUD />
        </main>

        {/* Right Drawer (Slide-in file details, SHAP, and blast radius) */}
        {!presentationMode && selectedFile && <RightDrawer />}
      </div>

      {/* 3. Global Overlays & Modals */}
      <CommandPalette />
      <ModelCardModal />
      <OnboardingModal />
      <InsightsDock />
      <HotspotScatterModal />
      <TerminalLogDrawer />
      <RepoComparisonModal />
      <DependencyGraphModal />
    </div>
  );
};

export default App;
