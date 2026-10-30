import { describe, it, expect } from 'vitest';
import { computeCityLayout, getBuildingColorHex } from '../utils/cityLayout';
import { FileNode } from '../types';

describe('3D City Layouter', () => {
  const mockFiles: FileNode[] = [
    {
      id: 'src/core/engine.py',
      path: 'src/core/engine.py',
      directory: 'src/core',
      filename: 'engine.py',
      loc: 250,
      mean_complexity: 4.2,
      max_complexity: 16.0,
      commit_count: 24,
      distinct_authors: 3,
      file_age_days: 120,
      days_since_last_change: 12,
      churn_90d: 140,
      total_churn: 800,
      past_bug_fixes: 4,
      fan_in: 5,
      fan_out: 2,
      risk_probability: 0.78,
      impact_score: 2.35,
      blast_radius: {
        target: 'src/core/engine.py',
        hops: { 1: ['src/api/router.py'], 2: [], 3: [] },
        all_dependents: ['src/api/router.py'],
        total_count: 1
      },
      shap: {
        top_drivers: [],
        mitigators: [],
        top_impacts: [],
        explanation_text: 'High complexity drives defect likelihood.'
      }
    },
    {
      id: 'src/core/parser.py',
      path: 'src/core/parser.py',
      directory: 'src/core',
      filename: 'parser.py',
      loc: 80,
      mean_complexity: 2.1,
      max_complexity: 5.0,
      commit_count: 8,
      distinct_authors: 1,
      file_age_days: 80,
      days_since_last_change: 45,
      churn_90d: 20,
      total_churn: 120,
      past_bug_fixes: 0,
      fan_in: 1,
      fan_out: 1,
      risk_probability: 0.22,
      impact_score: 0.35,
      blast_radius: {
        target: 'src/core/parser.py',
        hops: { 1: [], 2: [], 3: [] },
        all_dependents: [],
        total_count: 0
      },
      shap: {
        top_drivers: [],
        mitigators: [],
        top_impacts: [],
        explanation_text: 'Low complexity ensures stability.'
      }
    }
  ];

  it('computes building positions and district bounding boxes', () => {
    const layout = computeCityLayout(mockFiles);
    expect(layout.buildings).toHaveLength(2);
    expect(layout.districts).toHaveLength(1);
    expect(layout.districts[0].path).toBe('src/core');

    const engine = layout.buildings.find(b => b.filename === 'engine.py');
    expect(engine).toBeDefined();
    expect(engine?.x).toBeDefined();
    expect(engine?.z).toBeDefined();
    expect(engine?.height).toBeGreaterThan(1.0);
  });

  it('calculates risk color gradient correctly', () => {
    const highRiskColor = getBuildingColorHex(mockFiles[0], 'risk');
    const lowRiskColor = getBuildingColorHex(mockFiles[1], 'risk');
    // High risk should be reddish (#f43f5e)
    expect(highRiskColor).toBe('#f43f5e');
    // Low risk should be emerald green (#10b981)
    expect(lowRiskColor).toBe('#10b981');
  });

  it('calculates complexity color mode correctly', () => {
    const highCC = getBuildingColorHex(mockFiles[0], 'complexity');
    expect(highCC).toBe('#f43f5e');
  });
});
