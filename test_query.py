"""
CLI Interactive Test Runner for Government AI Query Engine.
Usage:
    python test_query.py "Which villages have multiple departments active simultaneously?"
"""

import sys
import json
import logging
from ai_engine.query_engine import GovernmentAIEngine

logging.basicConfig(level=logging.WARNING)

def run_test(question: str):
    print("=" * 75)
    print("     GOVERNMENT AI NATURAL LANGUAGE QUERY ENGINE - CLI TEST RUNNER       ")
    print("=" * 75)
    print(f"\nUser Question: \"{question}\"")
    
    engine = GovernmentAIEngine()
    result = engine.process_question(question)
    
    print("\n[Generated SQL]:")
    print(result.get("generated_sql", "N/A"))
    
    print("\n[Recommended Visualization]:")
    print(result.get("recommended_viz", "N/A"))
    
    print("\n[Synthesized Summary]:")
    print(result.get("summary_text", "N/A"))
    
    data = result.get("data", [])
    print(f"\n[Data Payload ({len(data)} rows returned)]:")
    if data:
        print(json.dumps(data[:5], indent=2, default=str))
        if len(data) > 5:
            print(f"... and {len(data) - 5} more rows.")
    else:
        print("No data rows returned.")
    print("\n" + "=" * 75)

if __name__ == "__main__":
    test_q = sys.argv[1] if len(sys.argv) > 1 else "Which villages have both road and water supply projects active simultaneously?"
    run_test(test_q)
