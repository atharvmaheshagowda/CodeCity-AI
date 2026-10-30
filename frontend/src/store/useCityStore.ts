import { create } from 'zustand';
import { CityPayload, FileNode, ColorMode, RepoListItem, ModelCardData } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

interface CityState {
  repos: RepoListItem[];
  currentRepo: CityPayload | null;
  selectedFile: FileNode | null;
  hoveredFile: FileNode | null;
  colorMode: ColorMode;
  riskThreshold: number;
  maxHopDepth: number; // 1, 2, or 3
  searchQuery: string;
  selectedDirectory: string | null;
  presentationMode: boolean;
  isLoading: boolean;
  error: string | null;

  // Cinematic Redesign Feature Flags & States
  lowPowerMode: boolean;
  isLeftPanelCollapsed: boolean;
  isCommandPaletteOpen: boolean;
  cameraResetTrigger: number;
  lastUserActivity: number;
  pinnedFiles: FileNode[];
  showDecorativeSkyline: boolean;
  simulatedFailedFile: FileNode | null;

  // Analysis state
  isAnalyzing: boolean;
  analysisJobId: string | null;
  analysisProgress: number;
  analysisMessage: string;
  analysisError: string | null;

  // Modals
  isModelCardOpen: boolean;
  isOnboardingOpen: boolean;
  modelCardData: ModelCardData | null;

  // Actions
  fetchRepos: () => Promise<void>;
  loadRepo: (repoId: string) => Promise<void>;
  selectFile: (file: FileNode | null) => void;
  setHoveredFile: (file: FileNode | null) => void;
  setColorMode: (mode: ColorMode) => void;
  setRiskThreshold: (val: number) => void;
  setMaxHopDepth: (depth: number) => void;
  setSearchQuery: (query: string) => void;
  setSelectedDirectory: (dir: string | null) => void;
  togglePresentationMode: () => void;
  toggleLowPowerMode: () => void;
  toggleLeftPanel: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  triggerCameraReset: () => void;
  recordUserActivity: () => void;
  togglePinFile: (file: FileNode) => void;
  clearPinnedFiles: () => void;
  toggleDecorativeSkyline: () => void;
  simulateFailure: (file: FileNode | null) => void;
  openModelCard: () => Promise<void>;
  closeModelCard: () => void;
  toggleOnboarding: () => void;
  analyzeRepository: (url: string) => Promise<void>;
}

export const useCityStore = create<CityState>((set, get) => ({
  repos: [],
  currentRepo: null,
  selectedFile: null,
  hoveredFile: null,
  colorMode: 'risk',
  riskThreshold: 0.0,
  maxHopDepth: 3,
  searchQuery: '',
  selectedDirectory: null,
  presentationMode: false,
  isLoading: false,
  error: null,

  // Cinematic defaults
  lowPowerMode: false,
  isLeftPanelCollapsed: false,
  isCommandPaletteOpen: false,
  cameraResetTrigger: 0,
  lastUserActivity: Date.now(),
  pinnedFiles: [],
  showDecorativeSkyline: true,
  simulatedFailedFile: null,

  isAnalyzing: false,
  analysisJobId: null,
  analysisProgress: 0,
  analysisMessage: '',
  analysisError: null,

  isModelCardOpen: false,
  isOnboardingOpen: false,
  modelCardData: null,

  togglePinFile: (file) =>
    set((state) => {
      const exists = state.pinnedFiles.some((f) => f.id === file.id || f.path === file.path);
      return {
        pinnedFiles: exists
          ? state.pinnedFiles.filter((f) => f.id !== file.id && f.path !== file.path)
          : [...state.pinnedFiles, file],
        lastUserActivity: Date.now(),
      };
    }),

  clearPinnedFiles: () => set({ pinnedFiles: [], lastUserActivity: Date.now() }),
  toggleDecorativeSkyline: () =>
    set((state) => ({ showDecorativeSkyline: !state.showDecorativeSkyline, lastUserActivity: Date.now() })),
  simulateFailure: (file) =>
    set({ simulatedFailedFile: file, lastUserActivity: Date.now() }),

  fetchRepos: async () => {
    try {
      const res = await fetch(`${API_BASE}/repos`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      set({ repos: data });
      if (data.length > 0 && !get().currentRepo) {
        // Auto-load first cached repo
        get().loadRepo(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to fetch repositories:', err);
      set({ error: 'Failed to connect to backend API server.' });
    }
  },

  loadRepo: async (repoId: string) => {
    set({ isLoading: true, error: null, selectedFile: null });
    try {
      const res = await fetch(`${API_BASE}/repos/${repoId}`);
      if (!res.ok) throw new Error(`Failed to load repository '${repoId}'`);
      const payload: CityPayload = await res.json();
      set({ currentRepo: payload, isLoading: false, lastUserActivity: Date.now() });
    } catch (err: any) {
      set({ error: err.message || 'Error loading repository city', isLoading: false });
    }
  },

  selectFile: (file) => set({ selectedFile: file, lastUserActivity: Date.now() }),
  setHoveredFile: (file) => set({ hoveredFile: file }),
  setColorMode: (mode) => set({ colorMode: mode, lastUserActivity: Date.now() }),
  setRiskThreshold: (val) => set({ riskThreshold: val, lastUserActivity: Date.now() }),
  setMaxHopDepth: (depth) => set({ maxHopDepth: depth, lastUserActivity: Date.now() }),
  setSearchQuery: (query) => set({ searchQuery: query, lastUserActivity: Date.now() }),
  setSelectedDirectory: (dir) => set({ selectedDirectory: dir, lastUserActivity: Date.now() }),
  togglePresentationMode: () => set((state) => ({ presentationMode: !state.presentationMode, lastUserActivity: Date.now() })),
  toggleLowPowerMode: () => set((state) => ({ lowPowerMode: !state.lowPowerMode })),
  toggleLeftPanel: () => set((state) => ({ isLeftPanelCollapsed: !state.isLeftPanelCollapsed, lastUserActivity: Date.now() })),
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen, lastUserActivity: Date.now() })),
  triggerCameraReset: () => set((state) => ({ cameraResetTrigger: state.cameraResetTrigger + 1, lastUserActivity: Date.now() })),
  recordUserActivity: () => set({ lastUserActivity: Date.now() }),

  openModelCard: async () => {
    set({ isModelCardOpen: true, lastUserActivity: Date.now() });
    if (!get().modelCardData) {
      try {
        const res = await fetch(`${API_BASE}/model-card`);
        if (res.ok) {
          const data = await res.json();
          set({ modelCardData: data });
        }
      } catch (e) {
        console.error('Failed to fetch model card:', e);
      }
    }
  },

  closeModelCard: () => set({ isModelCardOpen: false, lastUserActivity: Date.now() }),
  toggleOnboarding: () => set((state) => ({ isOnboardingOpen: !state.isOnboardingOpen, lastUserActivity: Date.now() })),

  analyzeRepository: async (url: string) => {
    set({
      isAnalyzing: true,
      analysisProgress: 0.1,
      analysisMessage: 'Initializing clone...',
      analysisError: null,
      lastUserActivity: Date.now()
    });

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), max_commits: 2000 })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Failed to start analysis');
      }

      const { job_id } = await res.json();
      set({ analysisJobId: job_id });

      // Poll job progress
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`${API_BASE}/analyze/${job_id}`);
          if (!statusRes.ok) return;
          const statusData = await statusRes.json();

          set({
            analysisProgress: statusData.progress || 0.2,
            analysisMessage: statusData.message || 'Analyzing...'
          });

          if (statusData.status === 'completed') {
            clearInterval(pollInterval);
            set({ isAnalyzing: false, analysisJobId: null });
            await get().fetchRepos();
            if (statusData.repo_id) {
              await get().loadRepo(statusData.repo_id);
            }
          } else if (statusData.status === 'failed') {
            clearInterval(pollInterval);
            set({
              isAnalyzing: false,
              analysisError: statusData.error || statusData.message || 'Analysis failed',
              analysisJobId: null
            });
          }
        } catch (pollErr: any) {
          clearInterval(pollInterval);
          set({ isAnalyzing: false, analysisError: pollErr.message });
        }
      }, 1000);

    } catch (err: any) {
      set({ isAnalyzing: false, analysisError: err.message });
    }
  }
}));
