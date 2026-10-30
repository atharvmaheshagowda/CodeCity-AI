import { describe, it, expect, beforeEach } from 'vitest';
import { useCityStore } from '../store/useCityStore';
import { getBuildingColorHex } from '../utils/cityLayout';
import { FileNode } from '../types';

describe('P0 Intelligence Store & Color Modes', () => {
  const dummyFile: FileNode = {
    id: 'src/app.py',
    path: 'src/app.py',
    directory: 'src',
    filename: 'app.py',
    loc: 200,
    mean_complexity: 4.0,
    max_complexity: 12.0,
    commit_count: 10,
    distinct_authors: 1,
    file_age_days: 60,
    days_since_last_change: 5,
    churn_90d: 80,
    total_churn: 200,
    past_bug_fixes: 1,
    fan_in: 3,
    fan_out: 2,
    risk_probability: 0.75,
    impact_score: 2.1,
    blast_radius: {
      target: 'src/app.py',
      hops: { 1: [], 2: [], 3: [] },
      all_dependents: [],
      total_count: 0,
    },
    shap: {
      top_drivers: [],
      mitigators: [],
      top_impacts: [],
      explanation_text: '',
    },
  };

  it('evaluates contagion and busfactor color modes correctly', () => {
    // High risk in contagion -> red
    const contagionHex = getBuildingColorHex(dummyFile, 'contagion');
    expect(contagionHex).toBe('#ef4444');

    // Single author in busfactor -> high risk red
    const busfactorHex = getBuildingColorHex(dummyFile, 'busfactor');
    expect(busfactorHex).toBe('#f43f5e');

    // Multi-author file in busfactor -> lower risk
    const multiAuthorFile = { ...dummyFile, distinct_authors: 3 };
    const lowRiskBusHex = getBuildingColorHex(multiAuthorFile, 'busfactor');
    expect(lowRiskBusHex).toBe('#10b981');
  });

  it('toggles insights dock and sets active tab', () => {
    const store = useCityStore.getState();
    expect(store.isInsightsOpen).toBe(false);

    store.toggleInsights(true);
    expect(useCityStore.getState().isInsightsOpen).toBe(true);

    store.setInsightsTab('smells');
    expect(useCityStore.getState().insightsTab).toBe('smells');

    store.toggleInsights(false);
    expect(useCityStore.getState().isInsightsOpen).toBe(false);
  });

  it('toggles visual layers independently', () => {
    const store = useCityStore.getState();
    const initialCoupling = store.activeLayers.coupling;

    store.toggleLayer('coupling');
    expect(useCityStore.getState().activeLayers.coupling).toBe(!initialCoupling);

    store.toggleLayer('coupling');
    expect(useCityStore.getState().activeLayers.coupling).toBe(initialCoupling);
  });

  it('handles what-if state and reset', () => {
    const store = useCityStore.getState();
    expect(store.whatIfResult).toBeNull();

    store.resetWhatIf();
    expect(useCityStore.getState().whatIfResult).toBeNull();
    expect(useCityStore.getState().whatIfOverrides).toEqual({});
  });
});

