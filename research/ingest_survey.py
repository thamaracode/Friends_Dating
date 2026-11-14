#!/usr/bin/env python3
"""
SOULVERSE HUMAN INTELLIGENCE: DATING SURVEY INGESTION & PIPELINE ENGINE
Role: Chief Research Director & Product Intelligence Architect

Strict Research Principles:
1. Primary Evidence: Use original survey responses only.
2. Zero Hallucination: Never invent answers or fill missing cells.
3. Rigorous Accounting: Always report valid counts (N) and denominators.
4. Linguistic Preservation: Preserve informal language and Sinhala-English expressions.
5. No Clinical Diagnoses: Do not diagnose personality or attachment disorders.
"""

import os
import sys
import json
import csv
from typing import Dict, List, Any, Optional

RESEARCH_ROOT = os.path.dirname(os.path.abspath(__file__))

def find_survey_data() -> Optional[str]:
    """Scans research directory for survey dataset in CSV, TSV, JSON, or XLSX format."""
    candidates = [
        os.path.join(RESEARCH_ROOT, "raw_data", "survey.csv"),
        os.path.join(RESEARCH_ROOT, "raw_data", "survey.xlsx"),
        os.path.join(RESEARCH_ROOT, "raw_data", "survey.json"),
        os.path.join(RESEARCH_ROOT, "raw_data", "survey.tsv"),
        os.path.join(RESEARCH_ROOT, "survey.csv"),
        os.path.join(RESEARCH_ROOT, "survey.xlsx"),
        os.path.join(RESEARCH_ROOT, "survey.json"),
        os.path.join(RESEARCH_ROOT, "survey.tsv")
    ]
    for c in candidates:
        if os.path.exists(c) and os.path.getsize(c) > 0:
            return c
    return None

def main():
    print("=" * 70)
    print("SOULVERSE DATING HUMAN INTELLIGENCE PIPELINE")
    print("=" * 70)
    
    survey_file = find_survey_data()
    if not survey_file:
        print("[AUDIT STATUS: DATASET_PENDING]")
        print("CRITICAL BLOCKER IDENTIFIED:")
        print("  - The directive references: 'Your input is a real, anonymous dating survey")
        print("    containing 52 questions and respondent answers.'")
        print("  - However, no survey file or response rows were provided in the input payload.")
        print("  - In accordance with Research Rule 2 ('Never invent answers or fill missing cells')")
        print("    and the Execution Policy ('Prioritize truth over impressive-looking output'),")
        print("    synthetic data generation is strictly prohibited.")
        print()
        print("TO EXECUTE OPERATION:")
        print("  1. Save your survey file as: research/raw_data/survey.csv (or .xlsx / .json)")
        print("  2. Or paste the raw question/answer table in chat.")
        print("  3. Run: python research/ingest_survey.py")
        sys.exit(0)

    print(f"[+] Found dataset: {survey_file}")

if __name__ == "__main__":
    main()
