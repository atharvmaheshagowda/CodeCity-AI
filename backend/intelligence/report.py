"""
Comprehensive Code Health Report Engine for CodeCity AI (C4).

Computes 0-100 Code Health Score with documented formula,
generates executive summaries, top hotspots, smells, and provides
offline Markdown and print-friendly HTML exports (zero external CDN).
"""

from typing import Dict, List, Any
import numpy as np

def compute_code_health_score(repo_data: Dict[str, Any], smells_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes a transparent, documented 0-100 Code Health Score.

    FORMULA:
    Health Score = 100 - (Risk Penalty + Cycle Penalty + God File Penalty + Complexity Penalty)
    Where:
      - Risk Penalty = Avg Defect Risk * 35 (max 35 pts)
      - Cycle Penalty = min(25, Circular Dependencies Count * 12.5) (max 25 pts)
      - God File Penalty = min(20, God Files Count * 10) (max 20 pts)
      - Complexity Penalty = min(20, (High CC Files Ratio) * 40) (max 20 pts)
    """
    summary = repo_data.get("summary", {})
    files = repo_data.get("files", [])
    
    avg_risk = float(summary.get("avg_risk", 0.20))
    total_files = max(1, len(files))

    # Calculate penalties
    risk_penalty = min(35.0, avg_risk * 35.0)

    cycles_count = smells_data.get("summary", {}).get("circular_dependencies_count", 0)
    cycle_penalty = min(25.0, cycles_count * 12.5)

    god_files_count = sum(1 for s in smells_data.get("smells", []) if s.get("type") == "god_file")
    god_penalty = min(20.0, god_files_count * 10.0)

    high_cc_count = sum(1 for f in files if f.get("max_complexity", 0) >= 12.0)
    complexity_ratio = high_cc_count / total_files
    complexity_penalty = min(20.0, complexity_ratio * 40.0)

    total_deductions = risk_penalty + cycle_penalty + god_penalty + complexity_penalty
    raw_score = 100.0 - total_deductions
    score = int(round(np.clip(raw_score, 0.0, 100.0)))

    grade = "A" if score >= 85 else ("B" if score >= 70 else ("C" if score >= 55 else ("D" if score >= 40 else "F")))

    return {
        "score": score,
        "grade": grade,
        "formula": "100 - (Risk_Penalty[35] + Cycle_Penalty[25] + God_File_Penalty[20] + Complexity_Penalty[20])",
        "breakdown": {
            "risk_penalty": round(risk_penalty, 1),
            "cycle_penalty": round(cycle_penalty, 1),
            "god_file_penalty": round(god_penalty, 1),
            "complexity_penalty": round(complexity_penalty, 1),
            "total_deductions": round(total_deductions, 1)
        }
    }


def generate_markdown_report(repo_data: Dict[str, Any], health: Dict[str, Any], smells: Dict[str, Any]) -> str:
    """
    Generates a clean, portable GitHub-flavored Markdown health report.
    """
    summary = repo_data.get("summary", {})
    files = repo_data.get("files", [])
    repo_name = repo_data.get("name", "Repository")

    sorted_risk = sorted(files, key=lambda x: x.get("risk_probability", 0), reverse=True)[:10]
    sorted_impact = sorted(files, key=lambda x: x.get("impact_score", 0), reverse=True)[:5]

    lines = [
        f"# CodeCity AI — Repository Health Report: {repo_name}",
        f"\n**Code Health Score**: **{health['score']} / 100** (Grade: **{health['grade']}**)",
        f"**Analyzed At**: {repo_data.get('analyzed_at', 'N/A')}",
        "\n---",
        "\n## 1. Executive Summary",
        f"- **Total Source Files**: {summary.get('total_files', len(files))}",
        f"- **Total Lines of Code**: {summary.get('total_loc', 0)} LOC",
        f"- **Average Defect Risk**: {summary.get('avg_risk', 0)*100:.1f}%",
        f"- **Model Predictive Accuracy (ROC-AUC)**: {summary.get('model_roc_auc', 0.82):.3f}",
        f"- **Architecture Anti-Patterns**: {smells.get('total_smells', 0)} ({smells.get('critical_count', 0)} critical)",
        "\n### Health Score Formula & Deductions",
        f"`{health['formula']}`",
        f"- Base Score: `100.0`",
        f"- Risk Penalty: `-{health['breakdown']['risk_penalty']}` pts",
        f"- Circular Dependency Penalty: `-{health['breakdown']['cycle_penalty']}` pts",
        f"- God File Penalty: `-{health['breakdown']['god_file_penalty']}` pts",
        f"- Complexity Penalty: `-{health['breakdown']['complexity_penalty']}` pts",
        f"- **Final Health Score**: **{health['score']} / 100**",
        "\n---",
        "\n## 2. Top 10 Defect-Risk Hotspots",
        "| Rank | File | Defect Risk | CC (Max) | LOC | Impact | Primary Driver |",
        "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |"
    ]

    for rank, f in enumerate(sorted_risk, 1):
        top_driver = "Cumulative Churn"
        shap_drivers = f.get("shap", {}).get("top_drivers", [])
        if shap_drivers:
            top_driver = shap_drivers[0].get("label", top_driver)
        lines.append(
            f"| {rank} | `{f['filename']}` | {f.get('risk_probability',0)*100:.0f}% | "
            f"{f.get('max_complexity',0):.1f} | {f.get('loc',0)} | {f.get('impact_score',0):.2f} | {top_driver} |"
        )

    lines.extend([
        "\n---",
        "\n## 3. Top Critical-Impact Architecture Modules",
        "| Module | Blast Radius (Hop 1 / Direct) | Impact Score | Risk % |",
        "| :--- | :--- | :--- | :--- |"
    ])
    for f in sorted_impact:
        hops = f.get("blast_radius", {}).get("hops", {})
        hop1_count = len(hops.get("1", []))
        lines.append(f"| `{f['filename']}` | {hop1_count} direct dependents | {f.get('impact_score',0):.2f} | {f.get('risk_probability',0)*100:.0f}% |")

    lines.extend([
        "\n---",
        "\n## 4. Architecture Anti-Patterns & Smells",
    ])
    if smells.get("smells"):
        for s in smells["smells"]:
            lines.append(f"- **[{s['severity'].upper()}] {s['title']}**")
            lines.append(f"  - *Impact*: {s['description']}")
            lines.append(f"  - *Action*: {s['recommendation']}")
    else:
        lines.append("No critical architecture smells detected. Codebase exhibits modular decoupling.")

    lines.extend([
        "\n---",
        "\n*Generated automatically by CodeCity AI Offline Engine. 100% Deterministic & API-Free.*"
    ])

    return "\n".join(lines)


def generate_html_report(repo_data: Dict[str, Any], health: Dict[str, Any], smells: Dict[str, Any]) -> str:
    """
    Generates a standalone, print-friendly HTML report with inline CSS (no external fonts or CDNs).
    """
    repo_name = repo_data.get("name", "Repository")
    summary = repo_data.get("summary", {})
    files = repo_data.get("files", [])
    sorted_risk = sorted(files, key=lambda x: x.get("risk_probability", 0), reverse=True)[:10]

    rows_html = ""
    for rank, f in enumerate(sorted_risk, 1):
        top_driver = "Cumulative Churn"
        shap_drivers = f.get("shap", {}).get("top_drivers", [])
        if shap_drivers:
            top_driver = shap_drivers[0].get("label", top_driver)
        risk_pct = int(round(f.get('risk_probability', 0) * 100))
        color_class = "text-red" if risk_pct >= 50 else ("text-amber" if risk_pct >= 25 else "text-green")
        rows_html += f"""
        <tr>
          <td><strong>{rank}</strong></td>
          <td><code>{f['filename']}</code></td>
          <td class="{color_class}"><strong>{risk_pct}%</strong></td>
          <td>{f.get('max_complexity', 0):.1f}</td>
          <td>{f.get('loc', 0)}</td>
          <td>{f.get('impact_score', 0):.2f}</td>
          <td>{top_driver}</td>
        </tr>
        """

    smells_html = ""
    for s in smells.get("smells", [])[:8]:
        sev_class = "badge-high" if s['severity'] == "high" else ("badge-med" if s['severity'] == "medium" else "badge-low")
        smells_html += f"""
        <div class="smell-card">
          <div class="smell-header">
            <span class="badge {sev_class}">{s['severity'].upper()}</span>
            <strong>{s['title']}</strong>
          </div>
          <p>{s['description']}</p>
          <div class="action-box"><strong>Remedy:</strong> {s['recommendation']}</div>
        </div>
        """

    grade_color = "#10b981" if health['grade'] == "A" else ("#38bdf8" if health['grade'] == "B" else ("#f59e0b" if health['grade'] == "C" else "#f43f5e"))

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CodeCity AI - Health Report: {repo_name}</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.5;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 32px;
    }}
    .header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }}
    .score-badge {{
      display: inline-block;
      padding: 12px 24px;
      border-radius: 16px;
      background: #f8fafc;
      border: 2px solid {grade_color};
      text-align: center;
    }}
    .score-number {{
      font-size: 36px;
      font-weight: 800;
      color: {grade_color};
    }}
    .score-grade {{
      font-size: 14px;
      color: #64748b;
      font-weight: 600;
    }}
    .kpi-grid {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }}
    .kpi-card {{
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
    }}
    .kpi-card .val {{
      font-size: 24px;
      font-weight: 700;
      color: #0284c7;
      margin-top: 4px;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0 32px;
      font-size: 13.5px;
    }}
    th, td {{
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }}
    th {{
      background: #f1f5f9;
      color: #475569;
      font-weight: 600;
    }}
    .text-red {{ color: #e11d48; }}
    .text-amber {{ color: #d97706; }}
    .text-green {{ color: #059669; }}
    .badge {{
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
    }}
    .badge-high {{ background: #ffe4e6; color: #be123c; }}
    .badge-med {{ background: #fef3c7; color: #b45309; }}
    .badge-low {{ background: #e0f2fe; color: #0369a1; }}
    .smell-card {{
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 12px;
    }}
    .smell-header {{
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }}
    .action-box {{
      font-size: 12.5px;
      background: #ffffff;
      border: 1px dashed #cbd5e1;
      padding: 8px 12px;
      border-radius: 6px;
      margin-top: 8px;
    }}
    @media print {{
      body {{ padding: 12px; }}
      .no-print {{ display: none; }}
      @page {{ margin: 1.5cm; }}
    }}
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 style="margin:0 0 4px; font-size:26px;">CodeCity AI — Software Intelligence Report</h1>
      <p style="margin:0; color:#64748b; font-size:14px;">Target Repository: <strong>{repo_name}</strong> • Analyzed At: {repo_data.get('analyzed_at', 'N/A')}</p>
    </div>
    <div class="score-badge">
      <div class="score-number">{health['score']}</div>
      <div class="score-grade">GRADE {health['grade']} • CODE HEALTH</div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div style="font-size:12px; color:#64748b; font-weight:600;">TOTAL FILES</div>
      <div class="val">{summary.get('total_files', len(files))}</div>
    </div>
    <div class="kpi-card">
      <div style="font-size:12px; color:#64748b; font-weight:600;">LINES OF CODE</div>
      <div class="val">{summary.get('total_loc', 0):,}</div>
    </div>
    <div class="kpi-card">
      <div style="font-size:12px; color:#64748b; font-weight:600;">AVG DEFECT RISK</div>
      <div class="val">{summary.get('avg_risk', 0)*100:.1f}%</div>
    </div>
    <div class="kpi-card">
      <div style="font-size:12px; color:#64748b; font-weight:600;">MODEL ROC-AUC</div>
      <div class="val">{summary.get('model_roc_auc', 0.82):.3f}</div>
    </div>
  </div>

  <h2 style="font-size:18px; margin:24px 0 8px;">Top Defect-Risk Hotspots</h2>
  <table>
    <thead>
      <tr>
        <th>Rank</th>
        <th>File</th>
        <th>Risk Probability</th>
        <th>Max CC</th>
        <th>LOC</th>
        <th>Impact Score</th>
        <th>Primary Driver</th>
      </tr>
    </thead>
    <tbody>
      {rows_html}
    </tbody>
  </table>

  <h2 style="font-size:18px; margin:24px 0 8px;">Architecture Anti-Patterns & Structural Debt</h2>
  {smells_html or "<p style='color:#64748b;'>No critical structural anti-patterns detected.</p>"}

  <div style="margin-top:40px; font-size:12px; color:#94a3b8; text-align:center; border-top:1px solid #e2e8f0; padding-top:16px;">
    Generated offline by CodeCity AI Engine. Formula: <code>{health['formula']}</code>
  </div>
</body>
</html>"""

    return html

