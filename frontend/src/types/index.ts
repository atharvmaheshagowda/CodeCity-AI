export type ColorMode = 'risk' | 'complexity' | 'churn' | 'age' | 'impact' | 'contagion' | 'busfactor';

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

export interface LineFailureDiagnostic {
  line: number;
  function_name: string;
  snippet: string;
  failure_type: string;
  severity: 'critical' | 'high' | 'warning' | 'info';
  root_cause: string;
  why_it_fails: string;
  suggested_fix: string;
  cascade_impact?: string;
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
  dominant_contributor_share?: number;
  file_age_days: number;
  days_since_last_change: number;
  churn_90d: number;
  total_churn: number;
  past_bug_fixes: number;
  fan_in: number;
  fan_out: number;
  pagerank?: number;
  betweenness_centrality?: number;
  risk_probability: number;
  impact_score: number;
  risk_rank?: number;
  impact_rank?: number;
  is_hotspot?: boolean;
  archetype?: string;
  language?: string;
  file_class?: string;
  is_approximate_complexity?: boolean;
  complexity_method?: string;
  comment_loc?: number;
  blank_loc?: number;
  blast_radius: BlastRadiusData;
  shap: ShapExplanation;
  line_failure?: LineFailureDiagnostic;

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
  git_history_available?: boolean;
}

export type FileClassFilter = 'all' | 'source' | 'test' | 'config' | 'docs' | 'other';

export interface LanguageCapability {
  complexity: 'yes' | 'approx' | 'no';
  graph: 'yes' | 'partial' | 'no';
  model: 'validated' | 'unvalidated';
}

export interface LanguageInfo {
  name: string;
  display_name: string;
  file_count: number;
  loc: number;
  color: string;
  capabilities: LanguageCapability;
}

export interface LanguageGraphCoverage {
  detected_imports: number;
  resolved_edges: number;
  coverage_ratio: number;
  confidence: 'High' | 'Moderate' | 'Low' | 'Unsupported';
}

export interface GraphCoverageReport {
  overall_coverage: number;
  overall_confidence: 'High' | 'Moderate' | 'Low' | 'Unsupported';
  total_detected_imports: number;
  total_resolved_edges: number;
  per_language: Record<string, LanguageGraphCoverage>;
}

export interface ExclusionSummary {
  analyzed: number;
  excluded: number;
  reasons: Record<string, number>;
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
  is_static_only?: boolean;
  source_type?: 'git_url' | 'local_git' | 'local_static' | 'zip_archive';
  languages?: LanguageInfo[];
  file_classes?: Record<string, number>;
  graph_coverage?: GraphCoverageReport;
  model_used?: 'core' | 'core+graph';
  model_rationale?: string;
  exclusion_summary?: ExclusionSummary;
  monorepo_roots?: string[];
}

export interface RepoListItem {
  id: string;
  name: string;
  analyzed_at?: string;
  summary: RepoSummary;
  languages?: LanguageInfo[];
  is_static_only?: boolean;
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

export interface LanguageModelMetrics {
  samples: number;
  positives: number;
  roc_auc: number;
  precision_at_10: number;
  recall_at_top_10_percent: number;
  baseline_churn_roc_auc: number;
  confidence: 'validated' | 'low_confidence';
}

export interface ModelCardData {
  model_name: string;
  evaluation_date: string;
  training_repositories: string[];
  held_out_repository?: string;
  held_out_repositories?: string[];
  training_samples: number;
  held_out_samples: number;
  held_out_positives: number;
  used_synthetic_fallback?: boolean;
  metrics: {
    model: ModelCardMetrics;
    baseline_churn: ModelCardMetrics;
  };
  per_language?: Record<string, LanguageModelMetrics>;
  roc_curve: RocCurvePoint[];
  feature_importances: FeatureImportance[];
  model_architecture?: {
    core_features: string[];
    graph_features: string[];
    graph_threshold: number;
    description: string;
  };
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

// ==============================================================
// ADVANCED INTELLIGENCE & GRAPHICS EXTENSIONS TYPES
// ==============================================================

export interface CascadeStep {
  path: string;
  filename: string;
  risk: number;
  loc: number;
  via?: string;
}

export interface CascadeResult {
  crashed_file: string;
  impact_score: number;
  total_dependents: number;
  at_risk_tests_count: number;
  at_risk_tests: string[];
  summary: string;
  hops: {
    1: CascadeStep[];
    2: CascadeStep[];
    3: CascadeStep[];
  };
}

export interface TracebackResult {
  status: 'success' | 'error';
  error_message: string;
  crashed_file: string;
  crashed_filename: string;
  crashed_line: number;
  crashed_function: string;
  frames_detected: number;
  cascade: CascadeResult;
}

export interface PathHopEdge {
  from: string;
  to: string;
  type: string;
  calls?: string[];
}

export interface ShortestPathResult {
  exists: boolean;
  is_directed: boolean;
  path: string[];
  length: number;
  edges: PathHopEdge[];
  description: string;
}

export interface CouplingPair {
  file_a: string;
  file_b: string;
  fname_a: string;
  fname_b: string;
  support: number;
  jaccard: number;
  confidence_a_to_b: number;
  confidence_b_to_a: number;
  explanation: string;
  recent_commit_samples: string[];
}

export interface CouplingResult {
  has_enough_history: boolean;
  message?: string;
  total_commits_analyzed?: number;
  pairs: CouplingPair[];
}

export interface NeighborAttribution {
  neighbor: string;
  neighbor_name: string;
  base_risk: number;
  relationship: string;
}

export interface ContagionResult {
  damping_factor: number;
  contagion_scores: Record<string, number>;
  attributions: Record<string, NeighborAttribution[]>;
}

export interface ArchitectureSmell {
  id: string;
  type: 'circular_dependency' | 'god_file' | 'orphan_file';
  title: string;
  severity: 'high' | 'medium' | 'low';
  affected_files: string[];
  affected_filenames: string[];
  description: string;
  recommendation: string;
}

export interface SmellsSummary {
  total: number;
  circular_dependencies_count: number;
  god_files_count: number;
  orphan_files_count: number;
}

export interface SmellsResult {
  total_smells: number;
  critical_count: number;
  smells: ArchitectureSmell[];
  summary: SmellsSummary;
}

export interface HealthScoreBreakdown {
  risk_penalty: number;
  cycle_penalty: number;
  god_file_penalty: number;
  complexity_penalty: number;
  total_deductions: number;
}

export interface CodeHealthData {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  formula: string;
  breakdown: HealthScoreBreakdown;
}

export interface HealthReportResult {
  health: CodeHealthData;
  smells: SmellsResult;
  markdown: string;
  summary: RepoSummary;
}

export interface WhatIfResult {
  file_path: string;
  original_risk: number;
  new_risk: number;
  delta_risk: number;
  original_impact: number;
  new_impact: number;
  shap: ShapExplanation;
  overrides_applied: Record<string, any>;
}

export interface ActiveLayersState {
  skybridges: boolean;
  coupling: boolean;
  contagion: boolean;
  smells: boolean;
  path: boolean;
  dangerZones: boolean;
  busFactor: boolean;
}

export interface BrokenCaller {
  caller_file: string;
  caller_name: string;
  line: number;
  call_text: string;
  reason: string;
}

export interface BreakingChangeResult {
  status: 'success' | 'error';
  target_file: string;
  broken_callers: BrokenCaller[];
  total_broken_callers: number;
  summary: string;
}

export interface TestImpactResult {
  file_to_tests: Record<string, string[]>;
  uncovered_danger_zones: string[];
  total_uncovered_danger_zones: number;
}

export interface BacktestCutoff {
  date: string;
  days_ago: number;
  train_samples: number;
  test_samples: number;
  model_precision_at_10: number;
  churn_precision_at_10: number;
  random_precision_at_10: number;
}

export interface BacktestResult {
  has_history: boolean;
  trust_score: number;
  cutoffs: BacktestCutoff[];
  mean_model_p10: number;
  mean_churn_p10: number;
  summary: string;
}

export interface TrajectoryPoint {
  date: string;
  days_ago: number;
  risk: number;
  churn: number;
  complexity: number;
}

export interface FileTrajectory {
  file: string;
  points: TrajectoryPoint[];
  delta_90d: number;
  is_rapid_rise: boolean;
}

export interface TrajectoryResult {
  has_history: boolean;
  trajectories: Record<string, FileTrajectory>;
}

export interface PlannedFile {
  path: string;
  filename: string;
  loc: number;
  max_complexity: number;
  risk_probability: number;
  impact_score: number;
  estimated_hours: number;
  risk_benefit: number;
  efficiency_roi: number;
  primary_driver: string;
}

export interface PlannerResult {
  total_hours: number;
  budget_total_hours?: number;
  team_reviewers: number;
  planned_hours: number;
  allocated_hours?: number;
  total_risk_mitigated: number;
  coverage_percent: number;
  risk_coverage_percentage?: number;
  selected_files: PlannedFile[];
  unselected_count: number;
}

export interface UncertaintyData {
  risk_mean: number;
  risk_std: number;
  ci_lower: number;
  ci_upper: number;
  confidence_label: string;
}

export interface UncertaintyResult {
  uncertainty: Record<string, UncertaintyData>;
}

export interface TimelapseSnapshot {
  date: string;
  month_label: string;
  commit_hash: string;
  active_files: Record<string, { loc: number; max_complexity: number; churn: number; risk: number }>;
  summary: { total_files: number; total_loc: number; avg_risk: number };
}

export interface TimelapseResult {
  has_history: boolean;
  total_snapshots: number;
  snapshots: TimelapseSnapshot[];
}

export interface CommitRiskBreakdown {
  path: string;
  loc_added: number;
  loc_deleted: number;
  single_risk: number;
}

export interface CommitRiskResult {
  status: 'success' | 'error';
  touched_files: string[];
  combined_pr_risk: number;
  risk_tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  blast_radius_files: string[];
  total_blast_radius: number;
  file_breakdown: CommitRiskBreakdown[];
}

export type ExhibitionStage =
  | 'reveal'
  | 'overview'
  | 'tour'
  | 'hotspots'
  | 'dependencies'
  | 'simulation'
  | 'summary'
  | 'complete';


