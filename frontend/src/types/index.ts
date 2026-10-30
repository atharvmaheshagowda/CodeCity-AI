export type ColorMode = 'risk' | 'complexity' | 'churn' | 'age' | 'impact';

export interface BlastRadiusHops {
  1: string[];
  2: string[];
  3: string[];
}

export interface BlastRadiusData {
  target: string;
  hops: BlastRadiusHops;
  all_dependents: string[];
  total_count: number;
  hop_counts?: {
    1: number;
    2: number;
    3: number;
  };
}

export interface ShapDriver {
  feature: string;
  label: string;
  shap_value: number;
  feature_value: number;
  direction: 'increases_risk' | 'decreases_risk';
  snippet?: string;
}

export interface ShapExplanation {
  top_drivers: ShapDriver[];
  mitigators: ShapDriver[];
  top_impacts: ShapDriver[];
  explanation_text: string;
}

export interface FileNode {
  id: string;
  path: string;
  directory: string;
  filename: string;
  loc: number;
  mean_complexity: number;
  max_complexity: number;
  commit_count: number;
  distinct_authors: number;
  file_age_days: number;
  days_since_last_change: number;
  churn_90d: number;
  total_churn: number;
  past_bug_fixes: number;
  fan_in: number;
  fan_out: number;
  risk_probability: number;
  impact_score: number;
  risk_rank?: number;
  impact_rank?: number;
  is_hotspot?: boolean;
  archetype?: string;
  blast_radius: BlastRadiusData;
  shap: ShapExplanation;

  // Layout coordinates in 3D scene (computed by district/building layouter)
  x?: number;
  y?: number;
  z?: number;
  width?: number;
  depth?: number;
  height?: number;
  districtColor?: string;
}

export interface DirectoryTreeNode {
  name: string;
  path: string;
  children: DirectoryTreeNode[];
  files: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  calls?: string[];
}

export interface RepoSummary {
  total_files: number;
  total_loc: number;
  avg_risk: number;
  critical_files_count: number;
  model_roc_auc: number;
  total_dependencies: number;
}

export interface CityPayload {
  repo_id: string;
  name: string;
  analyzed_at: string;
  summary: RepoSummary;
  directory_tree: DirectoryTreeNode;
  files: FileNode[];
  graph_edges: GraphEdge[];
  critical_files: string[];
}

export interface RepoListItem {
  id: string;
  name: string;
  analyzed_at?: string;
  summary: RepoSummary;
}

export interface ModelCardMetrics {
  roc_auc: number;
  precision_at_10: number;
  recall_at_top_10_percent: number;
}

export interface RocCurvePoint {
  fpr: number;
  tpr: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface ModelCardData {
  model_name: string;
  evaluation_date: string;
  training_repositories: string[];
  held_out_repository: string;
  training_samples: number;
  held_out_samples: number;
  held_out_positives: number;
  used_synthetic_fallback?: boolean;
  metrics: {
    model: ModelCardMetrics;
    baseline_churn: ModelCardMetrics;
  };
  roc_curve: RocCurvePoint[];
  feature_importances: FeatureImportance[];
}

export interface DistrictZone {
  path: string;
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  color: string;
  fileCount: number;
  maxBuildingHeight?: number;
}
