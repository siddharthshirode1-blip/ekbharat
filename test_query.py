"""
Government AI Intelligence Platform - Query Interface
Usage:
    python test_query.py "Which department has the highest budget utilization?"

Generates a rich HTML report and opens it in the browser automatically.
"""

import sys
import os
import json
import logging
from datetime import datetime
from ai_engine.query_engine import GovernmentAIEngine

logging.basicConfig(level=logging.WARNING)


# ──────────────────────────────────────────────
# Number formatting helpers
# ──────────────────────────────────────────────

def fmt_num(val, col_name=""):
    """Smart number formatter based on column context."""
    try:
        v = float(val)
        if is_money_col(col_name):
            if v >= 1_00_00_00_000: return f"Rs. {v/1_00_00_00_000:.2f} Cr"
            if v >= 1_00_00_000:    return f"Rs. {v/1_00_00_000:.2f} Cr"
            if v >= 1_00_000:       return f"Rs. {v/1_00_000:.2f} L"
            if v >= 1_000:          return f"Rs. {v/1_000:.2f}K"
            return f"Rs. {v:.2f}"
        if is_pct_col(col_name):    return f"{v:.1f}%"
        if v == int(v):             return f"{int(v):,}"
        return f"{v:,.2f}"
    except (TypeError, ValueError):
        return str(val) if val is not None else "—"


def is_money_col(c): return any(k in c.lower() for k in ["allocated","spent","released","budget","amount"])
def is_pct_col(c):   return any(k in c.lower() for k in ["pct","rate","percent","utilization"])
def is_label_col(c): return any(k in c.lower() for k in ["name","status","category","state","district","village","scheme","department","ministry"])


# ──────────────────────────────────────────────
# HTML Report Builder
# ──────────────────────────────────────────────

def build_html_report(question: str, result: dict) -> str:
    """Build a complete, self-contained HTML report."""
    data        = result.get("data", [])
    viz         = result.get("recommended_viz", "table")
    summary     = result.get("summary_text", "")
    sql         = result.get("generated_sql", "")
    status      = result.get("status", "error")
    timestamp   = datetime.now().strftime("%d %B %Y, %I:%M %p")

    # ── Chart Data ─────────────────────────────
    chart_js_block = ""
    if data and viz in ("bar_chart", "line_chart"):
        keys       = list(data[0].keys())
        label_col  = next((k for k in keys if is_label_col(k)), keys[0])
        num_cols   = [k for k in keys if isinstance(data[0].get(k), (int, float))]

        if num_cols:
            chart_col  = next((c for c in num_cols if is_pct_col(c)), num_cols[0])
            labels     = json.dumps([str(row.get(label_col, ""))[:30] for row in data])
            values     = json.dumps([float(row.get(chart_col, 0) or 0) for row in data])
            chart_label = chart_col.replace("_", " ").title()
            chart_type  = "line" if viz == "line_chart" else "bar"
            # Color logic
            colors = []
            for row in data:
                v = float(row.get(chart_col, 0) or 0)
                if is_pct_col(chart_col):
                    colors.append("rgba(34,197,94,0.85)" if v >= 70 else ("rgba(234,179,8,0.85)" if v >= 50 else "rgba(239,68,68,0.85)"))
                else:
                    colors.append("rgba(99,102,241,0.85)")
            colors_js = json.dumps(colors)

            chart_js_block = f"""
            const ctx = document.getElementById('mainChart').getContext('2d');
            new Chart(ctx, {{
                type: '{chart_type}',
                data: {{
                    labels: {labels},
                    datasets: [{{
                        label: '{chart_label}',
                        data: {values},
                        backgroundColor: {colors_js},
                        borderColor: {colors_js},
                        borderWidth: 2,
                        borderRadius: 8,
                        tension: 0.4
                    }}]
                }},
                options: {{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {{
                        legend: {{ labels: {{ color: '#e2e8f0', font: {{ size: 13, family: 'Inter' }} }} }},
                        tooltip: {{
                            backgroundColor: '#1e293b',
                            titleColor: '#94a3b8',
                            bodyColor: '#e2e8f0',
                            callbacks: {{
                                label: function(ctx) {{
                                    let v = ctx.parsed.y;
                                    {'return v.toFixed(1) + "%";' if is_pct_col(chart_col) else 'return "Rs. " + (v >= 1e7 ? (v/1e7).toFixed(2) + " Cr" : (v/1e5).toFixed(2) + " L");'}
                                }}
                            }}
                        }}
                    }},
                    scales: {{
                        x: {{ ticks: {{ color: '#94a3b8', maxRotation: 35 }}, grid: {{ color: 'rgba(255,255,255,0.05)' }} }},
                        y: {{ ticks: {{ color: '#94a3b8' }},             grid: {{ color: 'rgba(255,255,255,0.05)' }} }}
                    }}
                }}
            }});
            """

    # ── KPI Cards HTML ─────────────────────────
    kpi_html = ""
    if data and viz == "kpi_card":
        row = data[0]
        for k, v in row.items():
            label   = k.replace("_", " ").title()
            display = fmt_num(v, k)
            icon    = "💰" if is_money_col(k) else ("📊" if is_pct_col(k) else "🔢")
            kpi_html += f"""
            <div class="kpi-card">
                <div class="kpi-icon">{icon}</div>
                <div class="kpi-label">{label}</div>
                <div class="kpi-value">{display}</div>
            </div>"""

    # ── Data Table HTML ────────────────────────
    table_html = ""
    if data:
        keys = list(data[0].keys())
        headers = "".join(f"<th>{k.replace('_',' ').title()}</th>" for k in keys)

        rows_html = ""
        for i, row in enumerate(data):
            cells = ""
            for k in keys:
                v   = row.get(k)
                raw = fmt_num(v, k)
                # Progress bar for percentage columns
                if is_pct_col(k) and v is not None:
                    try:
                        pct = float(v)
                        bar_color = "#22c55e" if pct >= 70 else ("#eab308" if pct >= 50 else "#ef4444")
                        cells += f"""<td>
                            <div class="pct-cell">
                                <div class="pct-bar-wrap"><div class="pct-bar" style="width:{min(pct,100):.1f}%;background:{bar_color}"></div></div>
                                <span class="pct-label">{raw}</span>
                            </div></td>"""
                    except (TypeError, ValueError):
                        cells += f"<td>{raw}</td>"
                elif is_money_col(k) and v is not None:
                    cells += f'<td class="money-cell">{raw}</td>'
                else:
                    cells += f"<td>{raw}</td>"
            rows_html += f'<tr class="{"alt-row" if i % 2 == 0 else ""}">{cells}</tr>'

        table_html = f"""
        <div class="table-wrap">
            <table class="data-table">
                <thead><tr>{headers}</tr></thead>
                <tbody>{rows_html}</tbody>
            </table>
        </div>"""

    # ── Chart section visibility ───────────────
    chart_section = ""
    if chart_js_block:
        chart_section = '<div class="chart-section"><canvas id="mainChart" style="max-height:420px"></canvas></div>'

    # ── Error state ───────────────────────────
    error_html = ""
    if status == "error":
        error_html = f"""
        <div class="error-box">
            <h3>⚠️ Query Error</h3>
            <p>{result.get('message', 'An unknown error occurred.')}</p>
        </div>"""

    # ── Summary statement formatting ───────────
    summary_html = ""
    if summary:
        summary_html = f'<div class="summary-box"><p class="summary-text">💡 {summary}</p></div>'

    # ── Record count badge ─────────────────────
    badge = f'<span class="badge">{len(data)} records</span>' if data else ""

    # ──────────────────────────────────────────
    # Full HTML Template
    # ──────────────────────────────────────────
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EkBharat Gov AI - Query Result</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
<style>
  *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}

  body {{
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
    min-height: 100vh;
    color: #e2e8f0;
    padding: 24px;
  }}

  .container {{
    max-width: 1100px;
    margin: 0 auto;
  }}

  /* Header */
  .header {{
    background: linear-gradient(90deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2));
    border: 1px solid rgba(99,102,241,0.4);
    border-radius: 16px;
    padding: 28px 32px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 20px;
  }}
  .header-logo {{ font-size: 2.4rem; }}
  .header-text h1 {{ font-size: 1.5rem; font-weight: 700; color: #a5b4fc; }}
  .header-text p  {{ font-size: 0.85rem; color: #64748b; margin-top: 2px; }}

  /* Question box */
  .question-box {{
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(99,102,241,0.3);
    border-left: 4px solid #818cf8;
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 20px;
  }}
  .question-label {{ font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #6366f1; font-weight: 600; margin-bottom: 8px; }}
  .question-text  {{ font-size: 1.25rem; font-weight: 600; color: #f1f5f9; }}

  /* Summary */
  .summary-box {{
    background: rgba(34,197,94,0.08);
    border: 1px solid rgba(34,197,94,0.25);
    border-radius: 12px;
    padding: 18px 24px;
    margin-bottom: 20px;
  }}
  .summary-text {{ font-size: 1rem; color: #86efac; line-height: 1.7; }}

  /* KPI Cards */
  .kpi-row {{ display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }}
  .kpi-card {{
    flex: 1; min-width: 180px;
    background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1));
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 14px;
    padding: 22px 20px;
    text-align: center;
  }}
  .kpi-icon  {{ font-size: 2rem; margin-bottom: 8px; }}
  .kpi-label {{ font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }}
  .kpi-value {{ font-size: 1.6rem; font-weight: 700; color: #a5b4fc; }}

  /* Chart */
  .chart-section {{
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 24px;
    margin-bottom: 24px;
  }}

  /* Table */
  .section-header {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }}
  .section-title {{ font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #6366f1; font-weight: 600; }}
  .badge {{
    background: rgba(99,102,241,0.25);
    border: 1px solid rgba(99,102,241,0.4);
    color: #a5b4fc;
    border-radius: 99px;
    padding: 3px 12px;
    font-size: 0.78rem;
    font-weight: 600;
  }}

  .table-wrap {{
    overflow-x: auto;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.07);
  }}
  .data-table {{ width: 100%; border-collapse: collapse; font-size: 0.9rem; }}
  .data-table thead tr {{
    background: linear-gradient(90deg, rgba(99,102,241,0.25), rgba(168,85,247,0.15));
  }}
  .data-table th {{
    padding: 13px 16px;
    text-align: left;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #94a3b8;
    font-weight: 600;
    white-space: nowrap;
  }}
  .data-table td {{
    padding: 12px 16px;
    color: #cbd5e1;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    vertical-align: middle;
  }}
  .alt-row td   {{ background: rgba(255,255,255,0.02); }}
  .money-cell   {{ font-variant-numeric: tabular-nums; color: #6ee7b7; font-weight: 500; }}

  /* Progress bar in table */
  .pct-cell    {{ display: flex; align-items: center; gap: 10px; }}
  .pct-bar-wrap {{ flex: 1; background: rgba(255,255,255,0.07); border-radius: 99px; height: 8px; min-width: 80px; }}
  .pct-bar     {{ height: 8px; border-radius: 99px; transition: width 0.5s ease; }}
  .pct-label   {{ font-weight: 600; min-width: 44px; color: #e2e8f0; font-size: 0.88rem; }}

  /* Error */
  .error-box {{
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 20px;
  }}
  .error-box h3 {{ color: #f87171; margin-bottom: 8px; }}
  .error-box p  {{ color: #fca5a5; }}

  /* SQL disclosure */
  details {{ margin-top: 20px; }}
  summary {{
    cursor: pointer;
    font-size: 0.78rem;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 8px 0;
    user-select: none;
  }}
  summary:hover {{ color: #6366f1; }}
  .sql-box {{
    background: #0f172a;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    padding: 16px;
    margin-top: 10px;
    font-family: 'Courier New', monospace;
    font-size: 0.82rem;
    color: #7dd3fc;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
  }}

  /* Footer */
  .footer {{
    text-align: center;
    margin-top: 32px;
    font-size: 0.75rem;
    color: #334155;
  }}
</style>
</head>
<body>
<div class="container">

  <!-- Header -->
  <div class="header">
    <div class="header-logo">🇮🇳</div>
    <div class="header-text">
      <h1>EkBharat Government AI Intelligence Platform</h1>
      <p>Data-driven insights for governance &mdash; Generated on {timestamp}</p>
    </div>
  </div>

  <!-- Question -->
  <div class="question-box">
    <div class="question-label">Your Question</div>
    <div class="question-text">"{question}"</div>
  </div>

  {error_html}
  {summary_html}

  <!-- KPI Cards (single-row results) -->
  {'<div class="kpi-row">' + kpi_html + '</div>' if kpi_html else ''}

  <!-- Chart -->
  {chart_section}

  <!-- Data Table -->
  {'<div class="section-header"><span class="section-title">Data Results</span>' + badge + '</div>' + table_html if table_html else ''}

  <!-- SQL query (collapsed) -->
  <details>
    <summary>View Generated SQL Query</summary>
    <div class="sql-box">{sql}</div>
  </details>

  <div class="footer">EkBharat Gov AI &bull; Official Administrative Data &bull; For Internal Use Only</div>
</div>

<script>
{chart_js_block}
</script>
</body>
</html>"""
    return html


# ──────────────────────────────────────────────
# Main Runner
# ──────────────────────────────────────────────

def run_query(question: str):
    print(f"\n  Processing: \"{question}\"")
    print("  Please wait...\n")

    engine = GovernmentAIEngine()
    result = engine.process_question(question)

    # Build HTML
    html_content = build_html_report(question, result)

    # Always overwrite the same file — user just refreshes their browser tab
    out_dir   = os.path.join(os.path.dirname(__file__), "data", "reports")
    os.makedirs(out_dir, exist_ok=True)
    filepath  = os.path.join(out_dir, "latest_report.html")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html_content)

    abs_path = os.path.abspath(filepath).replace(os.sep, '/')
    print(f"  Report updated : {filepath}")
    print(f"  Open this file in your browser (or just REFRESH the tab):")
    print(f"  file:///{abs_path}\n")

    # Quick terminal summary
    status = result.get("status", "error")
    if status == "error":
        print(f"  ERROR: {result.get('message')}")
    else:
        data    = result.get("data", [])
        summary = result.get("summary_text", "")
        print(f"  Records returned : {len(data)}")
        if summary:
            print(f"  Answer           : {summary[:250]}{'...' if len(summary) > 250 else ''}")
    print()


if __name__ == "__main__":
    q = sys.argv[1] if len(sys.argv) > 1 else "Which department has the highest budget utilization?"
    run_query(q)
