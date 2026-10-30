"""
Review Budget Planner Engine for CodeCity AI (B6).

Formulates an optimal code review checklist under constrained engineering hours
using greedy knapsack optimization maximizing expected defect prevention.
"""

from typing import Dict, List, Any

def plan_review_budget(
    repo_files: List[Dict[str, Any]],
    total_hours: float = 12.0,
    team_reviewers: int = 2
) -> Dict[str, Any]:
    """
    Computes an optimized code review allocation plan maximizing total risk reduction.
    """
    candidates = []

    for f in repo_files:
        loc = max(10, int(f.get("loc", 50)))
        cc = max(1.0, float(f.get("max_complexity", 2.0)))
        risk = float(f.get("risk_probability", 0.15))
        impact = float(f.get("impact_score", 0.5))

        # Estimated review effort in hours: 150 LOC/hr scaled by branching complexity
        effort = max(0.5, round((loc / 140.0) * (1.0 + (cc - 1.0) * 0.05), 1))

        # Expected benefit: risk mitigated * module architectural impact
        benefit = round(risk * impact * 10.0, 2)
        roi = round(benefit / effort, 2)

        top_drivers = f.get("shap", {}).get("top_drivers") or []
        primary_driver = top_drivers[0].get("label", "Code Churn") if top_drivers else "Code Churn"

        candidates.append({
            "path": f["path"],
            "filename": f["filename"],
            "loc": loc,
            "max_complexity": cc,
            "risk_probability": round(risk, 3),
            "impact_score": round(impact, 3),
            "estimated_hours": effort,
            "risk_benefit": benefit,
            "efficiency_roi": roi,
            "primary_driver": primary_driver
        })

    # Sort candidates by ROI (benefit per hour) descending
    candidates.sort(key=lambda x: x["efficiency_roi"], reverse=True)

    budget_left = total_hours
    selected_files = []
    total_planned_hours = 0.0
    total_mitigated_risk = 0.0

    for item in candidates:
        if item["estimated_hours"] <= budget_left:
            selected_files.append(item)
            budget_left -= item["estimated_hours"]
            total_planned_hours += item["estimated_hours"]
            total_mitigated_risk += item["risk_benefit"]

    total_pool_benefit = sum(c["risk_benefit"] for c in candidates)
    coverage_pct = round((total_mitigated_risk / max(0.1, total_pool_benefit)) * 100, 1)

    return {
        "budget_total_hours": total_hours,
        "team_reviewers": team_reviewers,
        "allocated_hours": round(total_planned_hours, 1),
        "unallocated_hours": round(budget_left, 1),
        "planned_files_count": len(selected_files),
        "total_candidate_files": len(candidates),
        "risk_coverage_percentage": coverage_pct,
        "selected_files": selected_files,
        "unreviewed_high_risk_files": [
            c for c in candidates if c not in selected_files and c["risk_probability"] >= 0.50
        ]
    }

