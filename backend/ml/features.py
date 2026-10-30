"""
ML Feature Schema for CodeCity AI.
"""

FEATURE_COLUMNS = [
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
    "fan_in",
    "fan_out"
]

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
