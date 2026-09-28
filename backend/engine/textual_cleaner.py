import io
import os
import re
import zipfile
import hashlib
import unicodedata
import pandas as pd
from typing import Dict, Any, Tuple, List, Optional

def clean_single_text(
    text: str,
    options: Optional[Dict[str, Any]] = None
) -> str:
    """Sanitizes an individual string or document text."""
    if not text or not isinstance(text, str):
        return ""

    if options is None:
        options = {
            "strip_html": True,
            "strip_urls": True,
            "strip_emails": False,
            "normalize_unicode": True,
            "remove_control_chars": True,
            "collapse_whitespace": True,
            "lowercase": False
        }

    # 1. Unicode Normalization (NFKD / NFC)
    if options.get("normalize_unicode", True):
        text = unicodedata.normalize("NFKD", text)

    # 2. HTML Tag Stripping
    if options.get("strip_html", True):
        text = re.sub(r'<[^>]+>', ' ', text)

    # 3. URL Stripping / Normalization
    if options.get("strip_urls", True):
        text = re.sub(r'https?://\S+|www\.\S+', ' ', text)

    # 4. Email Stripping
    if options.get("strip_emails", False):
        text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', ' ', text)

    # 5. Remove non-printable / control characters (keep newlines/tabs if desired, or replace)
    if options.get("remove_control_chars", True):
        text = "".join(ch for ch in text if unicodedata.category(ch)[0] != "C" or ch in ['\n', '\t', ' '])

    # 6. Lowercase
    if options.get("lowercase", False):
        text = text.lower()

    # 7. Collapse whitespace
    if options.get("collapse_whitespace", True):
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = text.strip()

    return text

def process_text_archive_or_files(
    file_bytes_or_dict: Any,
    filename: str = "dataset.zip",
    options: Optional[Dict[str, Any]] = None
) -> Tuple[pd.DataFrame, bytes, Dict[str, Any]]:
    """
    Crawls nested zip archive or file map, extracts text files, cleans each file,
    computes text & corpus stats, deduplicates docs, and returns (DataFrame, Cleaned_Zip_Bytes, Metrics).
    """
    raw_entries = [] # {path, category, raw_text, filename}
    
    # 1. Read files from Zip Archive
    if isinstance(file_bytes_or_dict, bytes) and filename.lower().endswith(('.zip', '.tar.gz', '.tgz')):
        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes_or_dict), 'r') as zf:
                for file_info in zf.infolist():
                    if file_info.is_dir() or file_info.filename.startswith('__MACOSX') or file_info.filename.startswith('.'):
                        continue
                    
                    # Check text-like extensions
                    ext = os.path.splitext(file_info.filename)[1].lower()
                    if ext in ['.txt', '.json', '.csv', '.log', '.md', '.tsv', '.text', '.rtf', '']:
                        try:
                            content_bytes = zf.read(file_info.filename)
                            # Try UTF-8, then fallback
                            for enc in ['utf-8', 'latin1', 'cp1252', 'utf-16']:
                                try:
                                    raw_text = content_bytes.decode(enc)
                                    break
                                except Exception:
                                    raw_text = None
                                    
                            if raw_text is not None:
                                parts = [p for p in file_info.filename.replace('\\', '/').split('/') if p]
                                category = parts[-2] if len(parts) > 1 else "root"
                                file_basename = parts[-1]
                                
                                raw_entries.append({
                                    "file_path": file_info.filename,
                                    "category": category,
                                    "file_name": file_basename,
                                    "raw_text": raw_text
                                })
                        except Exception:
                            continue
        except Exception as e:
            raise ValueError(f"Could not extract zip archive: {e}")
            
    elif isinstance(file_bytes_or_dict, list):
        # Multi-file direct list payload: [{'name': '...', 'path': '...', 'content': '...'}]
        for item in file_bytes_or_dict:
            raw_entries.append({
                "file_path": item.get("path", item.get("name", "file.txt")),
                "category": item.get("category", "root"),
                "file_name": item.get("name", "file.txt"),
                "raw_text": item.get("content", "")
            })

    if not raw_entries:
        raise ValueError("No valid text documents found in the uploaded archive/folder.")

    # 2. Process & Clean each entry
    processed_rows = []
    seen_hashes = set()
    duplicate_docs_count = 0
    empty_docs_count = 0
    
    total_raw_words = 0
    total_cleaned_words = 0
    total_raw_chars = 0
    total_cleaned_chars = 0
    
    category_counts_before = {}
    category_counts_after = {}
    
    for entry in raw_entries:
        cat = entry["category"]
        category_counts_before[cat] = category_counts_before.get(cat, 0) + 1
        
        raw_text = entry["raw_text"]
        raw_w_count = len(raw_text.split())
        raw_c_count = len(raw_text)
        total_raw_words += raw_w_count
        total_raw_chars += raw_c_count
        
        cleaned_text = clean_single_text(raw_text, options)
        clean_w_count = len(cleaned_text.split())
        clean_c_count = len(cleaned_text)
        
        # Check if empty
        if not cleaned_text or clean_w_count == 0:
            empty_docs_count += 1
            continue
            
        # Deduplication check
        content_hash = hashlib.md5(cleaned_text.encode('utf-8')).hexdigest()
        if content_hash in seen_hashes:
            duplicate_docs_count += 1
            continue
            
        seen_hashes.add(content_hash)
        category_counts_after[cat] = category_counts_after.get(cat, 0) + 1
        
        total_cleaned_words += clean_w_count
        total_cleaned_chars += clean_c_count
        
        processed_rows.append({
            "file_path": entry["file_path"],
            "category": cat,
            "file_name": entry["file_name"],
            "raw_text": raw_text,
            "cleaned_text": cleaned_text,
            "raw_word_count": raw_w_count,
            "cleaned_word_count": clean_w_count,
            "raw_char_count": raw_c_count,
            "cleaned_char_count": clean_c_count,
            "compression_ratio": round((1.0 - (clean_c_count / max(raw_c_count, 1))) * 100, 1)
        })

    master_df = pd.DataFrame(processed_rows)

    # 3. Create Cleaned Zip Archive
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as clean_zip:
        for idx, row in master_df.iterrows():
            clean_zip.writestr(row["file_path"], row["cleaned_text"])
            
    zip_buffer.seek(0)
    cleaned_zip_bytes = zip_buffer.getvalue()

    # 4. Compute Metrics
    total_files_before = len(raw_entries)
    total_files_after = len(master_df)
    
    metrics = {
        "mode": "textual_corpus",
        "total_files_before": total_files_before,
        "total_files_after": total_files_after,
        "empty_files_removed": empty_docs_count,
        "duplicate_files_removed": duplicate_docs_count,
        "total_categories": len(category_counts_after),
        "category_counts_before": category_counts_before,
        "category_counts_after": category_counts_after,
        "total_raw_words": total_raw_words,
        "total_cleaned_words": total_cleaned_words,
        "total_raw_chars": total_raw_chars,
        "total_cleaned_chars": total_cleaned_chars,
        "avg_words_per_doc": round(total_cleaned_words / max(total_files_after, 1), 1),
        "corpus_noise_reduction_pct": round((1.0 - (total_cleaned_chars / max(total_raw_chars, 1))) * 100, 2),
        "quality_score": min(100.0, max(10.0, round(100.0 - (empty_docs_count * 5.0) - (duplicate_docs_count * 3.0), 1)))
    }

    return master_df, cleaned_zip_bytes, metrics
