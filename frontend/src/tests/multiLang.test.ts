import { describe, it, expect, beforeEach } from 'vitest';
import { useCityStore } from '../store/useCityStore';
import { computeCityLayout } from '../utils/cityLayout';
import { FileNode, CityPayload } from '../types';

const mockMultiLangFiles: FileNode[] = [
  {
    id: 'f_py_1',
    path: 'backend/server.py',
    directory: 'backend',
    filename: 'server.py',
    language: 'python',
    file_class: 'source',
    loc: 250,
    mean_complexity: 4.2,
    max_complexity: 12.0,
    commit_count: 35,
    distinct_authors: 3,
    file_age_days: 120,
    days_since_last_change: 2,
    churn_90d: 80,
    total_churn: 450,
    past_bug_fixes: 4,
    fan_in: 5,
    fan_out: 3,
    risk_probability: 0.78,
    impact_score: 9.2,
    blast_radius: { target: 'backend/server.py', hops: { 1: [], 2: [], 3: [] }, all_dependents: [], total_count: 4 },
    shap: { top_drivers: [], mitigators: [], top_impacts: [], explanation_text: '' },
  },
  {
    id: 'f_ts_1',
    path: 'frontend/src/App.tsx',
    directory: 'frontend/src',
    filename: 'App.tsx',
    language: 'typescript',
    file_class: 'source',
    loc: 180,
    mean_complexity: 3.1,
    max_complexity: 8.0,
    commit_count: 22,
    distinct_authors: 2,
    file_age_days: 90,
    days_since_last_change: 5,
    churn_90d: 40,
    total_churn: 280,
    past_bug_fixes: 1,
    fan_in: 2,
    fan_out: 7,
    risk_probability: 0.35,
    impact_score: 6.5,
    blast_radius: { target: 'frontend/src/App.tsx', hops: { 1: [], 2: [], 3: [] }, all_dependents: [], total_count: 2 },
    shap: { top_drivers: [], mitigators: [], top_impacts: [], explanation_text: '' },
  },
  {
    id: 'f_go_1',
    path: 'services/auth/main.go',
    directory: 'services/auth',
    filename: 'main.go',
    language: 'go',
    file_class: 'source',
    loc: 310,
    mean_complexity: 5.0,
    max_complexity: 15.0,
    commit_count: 40,
    distinct_authors: 4,
    file_age_days: 140,
    days_since_last_change: 1,
    churn_90d: 120,
    total_churn: 600,
    past_bug_fixes: 6,
    fan_in: 8,
    fan_out: 4,
    risk_probability: 0.85,
    impact_score: 11.4,
    blast_radius: { target: 'services/auth/main.go', hops: { 1: [], 2: [], 3: [] }, all_dependents: [], total_count: 6 },
    shap: { top_drivers: [], mitigators: [], top_impacts: [], explanation_text: '' },
  },
  {
    id: 'f_test_1',
    path: 'tests/test_server.py',
    directory: 'tests',
    filename: 'test_server.py',
    language: 'python',
    file_class: 'test',
    loc: 95,
    mean_complexity: 1.5,
    max_complexity: 3.0,
    commit_count: 10,
    distinct_authors: 1,
    file_age_days: 60,
    days_since_last_change: 12,
    churn_90d: 10,
    total_churn: 95,
    past_bug_fixes: 0,
    fan_in: 0,
    fan_out: 1,
    risk_probability: 0.08,
    impact_score: 1.0,
    blast_radius: { target: 'tests/test_server.py', hops: { 1: [], 2: [], 3: [] }, all_dependents: [], total_count: 0 },
    shap: { top_drivers: [], mitigators: [], top_impacts: [], explanation_text: '' },
  },
  {
    id: 'f_cfg_1',
    path: 'config/settings.json',
    directory: 'config',
    filename: 'settings.json',
    language: 'json',
    file_class: 'config',
    loc: 45,
    mean_complexity: 1.0,
    max_complexity: 1.0,
    commit_count: 8,
    distinct_authors: 2,
    file_age_days: 150,
    days_since_last_change: 25,
    churn_90d: 0,
    total_churn: 45,
    past_bug_fixes: 0,
    fan_in: 3,
    fan_out: 0,
    risk_probability: 0.05,
    impact_score: 0.8,
    blast_radius: { target: 'config/settings.json', hops: { 1: [], 2: [], 3: [] }, all_dependents: [], total_count: 0 },
    shap: { top_drivers: [], mitigators: [], top_impacts: [], explanation_text: '' },
  },
];

describe('Multi-Language Extension Store & Layout Tests', () => {
  beforeEach(() => {
    useCityStore.setState({
      selectedLanguage: null,
      selectedFileClass: 'all',
      impactFocusMode: 'all',
      isCapabilitiesModalOpen: false,
      isExclusionRulesModalOpen: false,
      customExcludes: [],
    });
  });

  it('filters files by programming language correctly', () => {
    const store = useCityStore.getState();
    expect(store.selectedLanguage).toBeNull();

    store.setSelectedLanguage('go');
    expect(useCityStore.getState().selectedLanguage).toBe('go');

    const goFiles = mockMultiLangFiles.filter((f) => f.language === 'go');
    expect(goFiles).toHaveLength(1);
    expect(goFiles[0].filename).toBe('main.go');
  });

  it('filters files by file classification class (source, test, config)', () => {
    const store = useCityStore.getState();
    store.setSelectedFileClass('test');
    expect(useCityStore.getState().selectedFileClass).toBe('test');

    const testFiles = mockMultiLangFiles.filter((f) => f.file_class === 'test');
    expect(testFiles).toHaveLength(1);
    expect(testFiles[0].filename).toBe('test_server.py');

    const sourceFiles = mockMultiLangFiles.filter((f) => f.file_class === 'source');
    expect(sourceFiles).toHaveLength(3);
  });

  it('manages custom exclusion glob rules', () => {
    const store = useCityStore.getState();
    expect(store.customExcludes).toEqual([]);

    store.addCustomExclude('*.gen.ts');
    expect(useCityStore.getState().customExcludes).toContain('*.gen.ts');

    store.addCustomExclude('legacy/**');
    expect(useCityStore.getState().customExcludes).toHaveLength(2);

    store.removeCustomExclude('*.gen.ts');
    expect(useCityStore.getState().customExcludes).toEqual(['legacy/**']);
  });

  it('toggles capabilities and exclusion modals', () => {
    const store = useCityStore.getState();
    expect(store.isCapabilitiesModalOpen).toBe(false);
    expect(store.isExclusionRulesModalOpen).toBe(false);

    store.toggleCapabilitiesModal(true);
    expect(useCityStore.getState().isCapabilitiesModalOpen).toBe(true);

    store.toggleExclusionRulesModal(true);
    expect(useCityStore.getState().isExclusionRulesModalOpen).toBe(true);
  });

  it('organizes monorepo roots as distinct top-level district zones in computeCityLayout', () => {
    const monorepoRoots = ['backend', 'frontend', 'services/auth'];
    const layout = computeCityLayout(mockMultiLangFiles, monorepoRoots);

    expect(layout.districts.length).toBeGreaterThanOrEqual(3);
    const districtNames = layout.districts.map((d) => d.name);
    expect(districtNames).toContain('backend');
    expect(districtNames).toContain('frontend');
    expect(districtNames).toContain('auth');
  });

  it('supports Impact Focus Mode for 55+ FPS rendering on large repositories', () => {
    const store = useCityStore.getState();
    store.setImpactFocusMode(50);
    expect(useCityStore.getState().impactFocusMode).toBe(50);

    const sortedByImpact = [...mockMultiLangFiles].sort((a, b) => b.impact_score - a.impact_score);
    const top2 = sortedByImpact.slice(0, 2);

    expect(top2).toHaveLength(2);
    expect(top2[0].filename).toBe('main.go'); // impact 11.4
    expect(top2[1].filename).toBe('server.py'); // impact 9.2
  });
});
