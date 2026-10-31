"""
ML Feature Schema for Multi-Language CodeCity AI.

Defines:
- CORE_FEATURE_COLUMNS: Universal metrics available for all programming languages
- GRAPH_FEATURE_COLUMNS: Additional structural dependency metrics (fan-in, fan-out)
- CORE_GRAPH_FEATURE_COLUMNS: Combined features when dependency graph coverage is sufficient
- Backward-compatible FEATURE_COLUMNS
"""

CORE_FEATURE_COLUMNS = [
    "loc",
    "mean_complexity",
    "max_complexity",
    "commit_count",
    "distinct_authors",
    "file_age_days",
    "days_since_last_change",
    "churn_90d",
    "total_churn",
    "past_bug_fixes",
]

GRAPH_FEATURE_COLUMNS = [
    "fan_in",
    "fan_out",
]

CORE_GRAPH_FEATURE_COLUMNS = CORE_FEATURE_COLUMNS + GRAPH_FEATURE_COLUMNS

# Backward-compatibility alias
FEATURE_COLUMNS = CORE_GRAPH_FEATURE_COLUMNS

GRAPH_COVERAGE_THRESHOLD = 0.35

FEATURE_LABELS = {
    "loc": "Lines of Code",
    "mean_complexity": "Mean Cyclomatic Complexity",
    "max_complexity": "Max Cyclomatic Complexity",
    "commit_count": "Total Commit Count",
    "distinct_authors": "Distinct Authors",
    "file_age_days": "File Age (Days)",
    "days_since_last_change": "Days Since Last Change",
    "churn_90d": "90-Day Churn (Lines)",
    "total_churn": "Total Churn (Lines)",
    "past_bug_fixes": "Past Bug Fixes",
    "fan_in": "Fan-In (Dependents)",
    "fan_out": "Fan-Out (Dependencies)",
}
