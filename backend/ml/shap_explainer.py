"""
Deterministic Plain-English SHAP Explainer (API-Free, No LLM).

Computes SHAP feature importance for each file and translates contributions into
clear, human-readable engineering narratives using domain-tailored templates.
"""

from typing import Dict, List, Any
import numpy as np
import pandas as pd
import shap
from ml.features import FEATURE_COLUMNS, FEATURE_LABELS

def generate_feature_snippet(feat: str, val: float, shap_val: float) -> str:
    """
    Returns a concise phrase explaining why a feature increases or decreases risk.
    """
    increases = shap_val > 0
    if feat == "max_complexity":
        return f"intricate branching complexity (max CC {val:.1f})" if increases else f"low branch complexity (max CC {val:.1f})"
    elif feat == "mean_complexity":
        return f"elevated average complexity ({val:.1f})" if increases else f"clean average complexity ({val:.1f})"
    elif feat == "churn_90d":
        return f"heavy recent churn ({int(val)} lines touched in last 90 days)" if increases else f"minimal recent code churn ({int(val)} lines)"
    elif feat == "total_churn":
        return f"large cumulative churn ({int(val)} lines total)" if increases else f"stable code history"
    elif feat == "past_bug_fixes":
        return f"recurring defect hotspot ({int(val)} previous bug fixes)" if increases else f"clean defect record (0 prior bug fixes)"
    elif feat == "days_since_last_change":
        return f"frequent recent edits ({val:.1f} days ago)" if increases else f"settled codebase history ({int(val)} days dormant)"
    elif feat == "distinct_authors":
        return f"high author churn ({int(val)} contributors)" if increases else f"consistent authorship ({int(val)} author)"
    elif feat == "fan_in":
        return f"high module centrality (imported by {int(val)} files)" if increases else f"isolated module position"
    elif feat == "fan_out":
        return f"broad dependency coupling ({int(val)} external imports)" if increases else f"low dependency footprint"
    elif feat == "loc":
        return f"large codebase footprint ({int(val)} LOC)" if increases else f"compact module size ({int(val)} LOC)"
    elif feat == "file_age_days":
        return f"newly introduced file ({int(val)} days old)" if increases else f"mature codebase longevity ({int(val)} days)"
    return f"{FEATURE_LABELS.get(feat, feat)} of {val}"


def build_plain_english_narrative(risk_prob: float, top_drivers: List[Dict[str, Any]], mitigators: List[Dict[str, Any]]) -> str:
    """
    Generates a natural engineering explanation based on top SHAP drivers.
    """
    risk_level = "High" if risk_prob >= 0.65 else ("Moderate" if risk_prob >= 0.35 else "Low")
    driver_phrases = [d["snippet"] for d in top_drivers if d.get("snippet")]
    mitigator_phrases = [m["snippet"] for m in mitigators if m.get("snippet")]

    if risk_prob >= 0.65:
        lead = f"{risk_level} defect likelihood ({risk_prob*100:.1f}%)."
        if driver_phrases:
            reason = f" Driven primarily by {', and '.join(driver_phrases[:2])}."
        else:
            reason = " Driven by elevated cumulative architectural metrics."
        if mitigator_phrases:
            coda = f" Partially buffered by {mitigator_phrases[0]}."
        else:
            coda = " Re-testing and static analysis recommended before merging."
        return f"{lead}{reason}{coda}"
    elif risk_prob >= 0.35:
        lead = f"{risk_level} defect risk ({risk_prob*100:.1f}%)."
        if driver_phrases:
            reason = f" Watch for {', and '.join(driver_phrases[:2])}."
        else:
            reason = " Balanced mix of historical churn and architectural coupling."
        if mitigator_phrases:
            coda = f" Stabilized by {mitigator_phrases[0]}."
        else:
            coda = ""
        return f"{lead}{reason}{coda}".strip()
    else:
        lead = f"Low defect risk ({risk_prob*100:.1f}%)."
        if mitigator_phrases:
            reason = f" Strong stability sustained by {', and '.join(mitigator_phrases[:2])}."
        else:
            reason = " Codebase metrics indicate mature and stable code."
        return f"{lead}{reason}"


class CodeCityExplainer:
    def __init__(self, model):
        self.model = model
        # Use TreeExplainer for tree models
        self.explainer = shap.TreeExplainer(model)

    def explain_dataframe(self, df: pd.DataFrame, risk_probs: np.ndarray) -> List[Dict[str, Any]]:
        """
        Computes SHAP explanations for all rows in df.
        """
        X = df[FEATURE_COLUMNS].fillna(0.0)
        shap_values = self.explainer.shap_values(X)
        
        # In multi-class or binary xgboost, shap_values can be 2D array or list of arrays
        if isinstance(shap_values, list):
            # Binary classification positive class
            raw_shap = shap_values[1] if len(shap_values) > 1 else shap_values[0]
        else:
            raw_shap = shap_values

        explanations = []
        for i in range(len(df)):
            row_shap = raw_shap[i]
            row_vals = X.iloc[i].to_dict()
            prob = float(risk_probs[i])

            features_with_shap = []
            for feat_idx, feat in enumerate(FEATURE_COLUMNS):
                sv = float(row_shap[feat_idx])
                fv = float(row_vals[feat])
                features_with_shap.append({
                    "feature": feat,
                    "label": FEATURE_LABELS.get(feat, feat),
                    "shap_value": round(sv, 4),
                    "feature_value": round(fv, 2),
                    "direction": "increases_risk" if sv > 0 else "decreases_risk",
                    "snippet": generate_feature_snippet(feat, fv, sv),
                })

            # Sort drivers
            drivers = sorted([f for f in features_with_shap if f["shap_value"] > 0], key=lambda x: x["shap_value"], reverse=True)
            mitigators = sorted([f for f in features_with_shap if f["shap_value"] < 0], key=lambda x: x["shap_value"])

            top_drivers = drivers[:3]
            top_mitigators = mitigators[:2]

            narrative = build_plain_english_narrative(prob, top_drivers, top_mitigators)

            # Combined sorted list for UI bars: top absolute SHAP features
            top_impacts = sorted(features_with_shap, key=lambda x: abs(x["shap_value"]), reverse=True)[:6]

            explanations.append({
                "top_drivers": top_drivers,
                "mitigators": top_mitigators,
                "top_impacts": top_impacts,
                "explanation_text": narrative,
            })

        return explanations
