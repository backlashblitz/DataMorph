import io
import os
import sys
import pandas as pd
import numpy as np

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from engine.tabular_cleaner import clean_tabular_data, profile_dataframe
from engine.report_generator import build_pdf_report
from engine.textual_cleaner import process_text_archive_or_files
import zipfile

def test_tabular():
    print("Testing Tabular Pipeline...")
    raw_data = {
        "User ID": [101, 102, 103, 104, 105, 105, 106, 107],
        "Customer Name ": ["  Alice Smith  ", "Bob  Jones", "Charlie Brown", "Diana Prince", "Evan Wright", "Evan Wright", np.nan, "Frank Castle"],
        "Joining Date": ["2023-01-15", "02/20/2023", "2023.03.10", "2023-04-05", "2023-05-12", "2023-05-12", "invalid_date", "2023-07-22"],
        "Monthly Spend ($)": ["$120.50", "$340.00", "$99.99", "$50000.00", "$210.20", "$210.20", "$150.00", np.nan],
        "City": ["New York", "San Francisco", "new york", np.nan, "Chicago", "Chicago", "Boston", "Seattle"],
        "Empty Col": [np.nan] * 8
    }
    df = pd.DataFrame(raw_data)
    before_stats = profile_dataframe(df)
    print(f"Before: Rows={before_stats['total_rows']}, Missing={before_stats['total_missing']}, Dups={before_stats['total_duplicates']}, Quality={before_stats['quality_score']}%")

    clean_df, meta = clean_tabular_data(df)
    after_stats = profile_dataframe(clean_df)
    print(f"After: Rows={after_stats['total_rows']}, Missing={after_stats['total_missing']}, Dups={after_stats['total_duplicates']}, Quality={after_stats['quality_score']}%")
    print("Actions:", meta["actions_taken"])

    pdf_bytes = build_pdf_report("customers_dirty.csv", "tabular", before_stats, after_stats, meta["actions_taken"])
    print(f"PDF Generated successfully! Size: {len(pdf_bytes)} bytes")
    assert len(pdf_bytes) > 1000

def test_textual():
    print("\nTesting Textual Pipeline...")
    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("reviews/positive/rev1.txt", "This is an AMAZING product! Loved it. <p>Check https://example.com</p>")
        zf.writestr("reviews/positive/rev2.txt", "This is an AMAZING product! Loved it. <p>Check https://example.com</p>") # Duplicate
        zf.writestr("reviews/positive/empty.txt", "   \n\n\t   ") # Empty
        zf.writestr("reviews/negative/bad1.txt", "Terrible customer service. Contact support@company.com ASAP!!!")
    
    zip_buf.seek(0)
    master_df, clean_zip_bytes, metrics = process_text_archive_or_files(zip_buf.getvalue(), "reviews_corpus.zip")
    print("Textual Metrics:", metrics)
    pdf_bytes = build_pdf_report("reviews_corpus.zip", "textual", metrics, {}, ["Cleaned and deduplicated text docs."])
    print(f"Textual PDF Generated successfully! Size: {len(pdf_bytes)} bytes")

def test_nested_json():
    print("\nTesting Nested JSON with Lists and Dicts...")
    json_bytes = b'''[
        {"id": 1, "tags": ["python", "ai", "data"], "meta": {"owner": "alice"}, "scores": [98, 95]},
        {"id": 2, "tags": ["web", "react"], "meta": {"owner": "bob"}, "scores": [80]},
        {"id": 2, "tags": ["web", "react"], "meta": {"owner": "bob"}, "scores": [80]},
        {"id": 3, "tags": [], "meta": null, "scores": null}
    ]'''
    from engine.tabular_cleaner import detect_and_read_file
    df = detect_and_read_file(json_bytes, "nested_tags.json")
    print("Parsed JSON shape:", df.shape)
    before_stats = profile_dataframe(df)
    print("JSON Profile Before:", before_stats["total_rows"], "rows, dups:", before_stats["total_duplicates"])
    clean_df, meta = clean_tabular_data(df)
    after_stats = profile_dataframe(clean_df)
    print("JSON Profile After:", after_stats["total_rows"], "rows, dups:", after_stats["total_duplicates"])
    pdf_bytes = build_pdf_report("nested_tags.json", "tabular", before_stats, after_stats, meta["actions_taken"])
    print(f"JSON PDF Generated! Size: {len(pdf_bytes)} bytes")

if __name__ == "__main__":
    test_tabular()
    test_nested_json()
    test_textual()
    print("\nALL PIPELINE TESTS PASSED!")
