import io
import json
import re
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List, Optional

def is_complex_or_unhashable(val: Any) -> bool:
    if val is None or isinstance(val, (str, int, float, bool, bytes)):
        return False
    if isinstance(val, (list, dict, set, tuple, np.ndarray)):
        return True
    try:
        hash(val)
        return False
    except TypeError:
        return True

def stringify_complex_val(val: Any) -> Any:
    if val is None:
        return np.nan
    if isinstance(val, float) and np.isnan(val):
        return np.nan
    if isinstance(val, (list, set, tuple, np.ndarray)):
        if isinstance(val, np.ndarray):
            val = val.tolist()
        if len(val) == 0:
            return ""
        try:
            if all(isinstance(i, (str, int, float, bool)) and not isinstance(i, bool) for i in val):
                return ", ".join(str(i) for i in val)
            return json.dumps(val, ensure_ascii=False, default=str)
        except Exception:
            return str(val)
    elif isinstance(val, dict):
        try:
            return json.dumps(val, ensure_ascii=False, default=str)
        except Exception:
            return str(val)
    elif is_complex_or_unhashable(val):
        return str(val)
    
    try:
        if not isinstance(val, (str, int, bool, bytes)) and pd.isna(val):
            return np.nan
    except Exception:
        pass

    return val

def serialize_complex_objects(df: pd.DataFrame) -> pd.DataFrame:
    """
    Converts any list/dict/set/array objects inside DataFrame columns to standard
    JSON/string format so that downstream pandas methods (nunique, duplicated,
    drop_duplicates, mode, replace, to_dict) never fail with TypeError: unhashable type: 'list'
    or ValueError: The truth value of an array is ambiguous.
    """
    if df is None or df.empty:
        return df

    for col in df.columns:
        if df[col].dtype == 'object':
            has_complex = False
            try:
                has_complex = df[col].apply(lambda x: isinstance(x, (list, dict, set, tuple, np.ndarray))).any()
            except Exception:
                has_complex = True

            if not has_complex:
                try:
                    df[col].nunique(dropna=True)
                except Exception:
                    has_complex = True

            if has_complex:
                df[col] = df[col].apply(stringify_complex_val)

    return df

def detect_and_read_file(file_bytes: bytes, filename: str) -> pd.DataFrame:
    """Reads various file types (CSV, TSV, JSON, Excel, Parquet) with automatic fallback and parsing."""
    name_lower = filename.lower()
    
    if name_lower.endswith(('.json', '.jsonl', '.ndjson')):
        df = None
        decoded_text = file_bytes.decode('utf-8', errors='replace').strip()
        
        # 1. Try standard JSON parsing
        try:
            data = json.loads(decoded_text)
            if isinstance(data, list):
                if len(data) > 0 and isinstance(data[0], dict):
                    df = pd.json_normalize(data)
                elif len(data) > 0:
                    df = pd.DataFrame(data)
                else:
                    df = pd.DataFrame()
            elif isinstance(data, dict):
                # Look for common array wrappers
                for k in ['data', 'results', 'items', 'records', 'rows', 'payload', 'objects', 'entries', 'users', 'list']:
                    if k in data and isinstance(data[k], list) and len(data[k]) > 0:
                        df = pd.json_normalize(data[k])
                        break
                
                # Check all top-level keys for list of dicts
                if df is None:
                    for k, v in data.items():
                        if isinstance(v, list) and len(v) > 0 and isinstance(v[0], dict):
                            df = pd.json_normalize(v)
                            break

                # If still None, normalize single top-level object
                if df is None:
                    df = pd.json_normalize([data])
        except Exception:
            pass
            
        # 2. If standard json failed, try JSON lines
        if df is None or df.empty:
            try:
                lines = [json.loads(l) for l in decoded_text.splitlines() if l.strip()]
                if lines:
                    if isinstance(lines[0], dict):
                        df = pd.json_normalize(lines)
                    else:
                        df = pd.DataFrame(lines)
            except Exception:
                pass

        # 3. Fallback to pd.read_json
        if df is None or df.empty:
            try:
                df = pd.read_json(io.StringIO(decoded_text))
            except Exception:
                pass
                
        if df is None or df.empty:
            raise ValueError("Could not parse JSON dataset. Please ensure it contains a valid JSON array or object.")
            
        return serialize_complex_objects(df)
            
    elif name_lower.endswith(('.xlsx', '.xls')):
        df = pd.read_excel(io.BytesIO(file_bytes))
        return serialize_complex_objects(df)
        
    elif name_lower.endswith(('.parquet', '.pq')):
        df = pd.read_parquet(io.BytesIO(file_bytes))
        return serialize_complex_objects(df)
        
    else:
        # CSV / TSV / Text-delimited
        encodings_to_try = ['utf-8', 'utf-8-sig', 'latin1', 'cp1252', 'iso-8859-1']
        delimiters_to_try = [None, ',', ';', '\t', '|']
        
        last_err = None
        for enc in encodings_to_try:
            for sep in delimiters_to_try:
                try:
                    df = pd.read_csv(io.BytesIO(file_bytes), encoding=enc, sep=sep, engine='python', on_bad_lines='skip')
                    if not df.empty and df.shape[1] > 0:
                        return serialize_complex_objects(df)
                except Exception as e:
                    last_err = e
                    continue
        raise ValueError(f"Unable to auto-detect delimiter/encoding for CSV: {last_err}")

def profile_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
    """Computes comprehensive health metrics and statistics for a DataFrame safely."""
    # Ensure complex types are serialized before profiling
    df = serialize_complex_objects(df)
    
    total_rows = int(len(df))
    total_cols = int(len(df.columns))
    memory_kb = float(df.memory_usage(deep=True).sum() / 1024.0)
    
    # Missing values
    missing_by_col = {str(col): int(val) for col, val in df.isnull().sum().items()}
    total_missing = int(df.isnull().sum().sum())
    missing_pct = round((total_missing / (total_rows * total_cols * 1.0)) * 100, 2) if total_rows * total_cols > 0 else 0.0
    
    # Duplicates (with unhashable fallback)
    try:
        total_duplicates = int(df.duplicated().sum())
    except Exception:
        try:
            total_duplicates = int(df.astype(str).duplicated().sum())
        except Exception:
            total_duplicates = 0
    
    # Column details & Outliers
    columns_info = []
    numeric_stats = {}
    
    for col in df.columns:
        col_series = df[col]
        col_type = str(col_series.dtype)
        null_count = int(col_series.isnull().sum())
        null_pct = round((null_count / total_rows) * 100, 2) if total_rows > 0 else 0.0
        
        # Unique count (safe)
        try:
            unique_count = int(col_series.nunique(dropna=True))
        except Exception:
            try:
                unique_count = int(col_series.astype(str).nunique(dropna=True))
            except Exception:
                unique_count = 0
        
        outliers_count = 0
        mean_val = None
        median_val = None
        min_val = None
        max_val = None
        
        if pd.api.types.is_numeric_dtype(col_series):
            valid_nums = col_series.dropna()
            if len(valid_nums) > 0:
                try:
                    q25 = float(valid_nums.quantile(0.25))
                    q75 = float(valid_nums.quantile(0.75))
                    iqr = q75 - q25
                    lower_bound = q25 - 1.5 * iqr
                    upper_bound = q75 + 1.5 * iqr
                    outliers_count = int(((valid_nums < lower_bound) | (valid_nums > upper_bound)).sum())
                    
                    mean_val = round(float(valid_nums.mean()), 2)
                    median_val = round(float(valid_nums.median()), 2)
                    min_val = round(float(valid_nums.min()), 2)
                    max_val = round(float(valid_nums.max()), 2)
                    
                    numeric_stats[str(col)] = {
                        "mean": mean_val,
                        "median": median_val,
                        "min": min_val,
                        "max": max_val,
                        "outliers": outliers_count,
                        "q25": round(q25, 2),
                        "q75": round(q75, 2)
                    }
                except Exception:
                    pass

        sample_vals = []
        for x in col_series.dropna().head(3):
            if x is None:
                continue
            if isinstance(x, (list, dict, set, tuple)):
                sample_vals.append(str(x)[:40])
            else:
                try:
                    if pd.notnull(x):
                        sample_vals.append(str(x)[:40])
                except Exception:
                    sample_vals.append(str(x)[:40])
        if not sample_vals:
            sample_vals = ["NaN"]

        columns_info.append({
            "name": str(col),
            "dtype": col_type,
            "missing_count": null_count,
            "missing_pct": null_pct,
            "unique_count": unique_count,
            "outliers_count": outliers_count,
            "sample_values": sample_vals
        })

    # Overall Data Quality Score (0 - 100)
    deduction_missing = min(40, missing_pct * 0.8)
    deduction_dups = min(30, (total_duplicates / max(total_rows, 1)) * 100 * 0.6)
    quality_score = max(5, round(100.0 - deduction_missing - deduction_dups, 1))

    return {
        "total_rows": total_rows,
        "total_cols": total_cols,
        "memory_kb": round(memory_kb, 2),
        "total_missing": total_missing,
        "missing_pct": missing_pct,
        "missing_by_col": missing_by_col,
        "total_duplicates": total_duplicates,
        "quality_score": quality_score,
        "columns_info": columns_info,
        "numeric_stats": numeric_stats,
        "column_names": [str(c) for c in df.columns]
    }

def clean_tabular_data(
    df: pd.DataFrame,
    options: Optional[Dict[str, Any]] = None
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans a DataFrame based on rules:
    - Serializes complex unhashables (lists, dicts) safely
    - Normalizes column names (snake_case, trim, remove symbols)
    - Removes exact & subset duplicate rows
    - Trims whitespace & removes extra spaces in strings
    - Converts date strings to standard ISO datetime
    - Detects & casts numeric strings
    - Imputes missing values intelligently
    - Treats outliers (clipping or removal)
    """
    if options is None:
        options = {
            "remove_duplicates": True,
            "standardize_column_names": True,
            "trim_whitespace": True,
            "smart_type_inference": True,
            "impute_missing": True,
            "impute_numeric_strategy": "median",
            "impute_categorical_strategy": "mode",
            "handle_outliers": "clip",
            "drop_empty_threshold": 0.95
        }
    
    clean_df = serialize_complex_objects(df.copy())
    actions_log = []

    # 1. Standardize column names
    if options.get("standardize_column_names", True):
        orig_cols = list(clean_df.columns)
        new_cols = []
        for c in orig_cols:
            c_str = str(c).strip()
            c_clean = re.sub(r'[^a-zA-Z0-9_]+', '_', c_str)
            c_clean = re.sub(r'_+', '_', c_clean).strip('_').lower()
            if not c_clean:
                c_clean = "unnamed_column"
            new_cols.append(c_clean)
        
        seen = {}
        unique_cols = []
        for c in new_cols:
            if c in seen:
                seen[c] += 1
                unique_cols.append(f"{c}_{seen[c]}")
            else:
                seen[c] = 0
                unique_cols.append(c)
                
        clean_df.columns = unique_cols
        actions_log.append(f"Standardized and sanitized {len(unique_cols)} column headers.")

    # 2. Trim string whitespace & clean invisible characters (converts empty spaces & null strings to NaN)
    if options.get("trim_whitespace", True):
        for col in clean_df.columns:
            if clean_df[col].dtype == 'object' or pd.api.types.is_string_dtype(clean_df[col]):
                def clean_str_cell(x):
                    if x is None:
                        return np.nan
                    if isinstance(x, (list, dict, set, tuple)):
                        return x
                    try:
                        if pd.isna(x):
                            return np.nan
                    except Exception:
                        pass
                    s = str(x)
                    s_clean = re.sub(r'\s+', ' ', s).strip()
                    if re.match(r'(?i)^(nan|null|none|n/a|na|undefined|\s*)$', s_clean):
                        return np.nan
                    return s_clean

                clean_df[col] = clean_df[col].apply(clean_str_cell)

    # 3. Drop columns exceeding missing threshold (now accurately detects trimmed empty cells)
    threshold = float(options.get("drop_empty_threshold", 0.95))
    high_missing_cols = [c for c in clean_df.columns if clean_df[c].isnull().mean() > threshold]
    if high_missing_cols:
        clean_df = clean_df.drop(columns=high_missing_cols)
        actions_log.append(f"Dropped {len(high_missing_cols)} empty/sparse columns (> {int(threshold*100)}% missing): {high_missing_cols}")

    # 4. Deduplication (Safe for all dtypes)
    if options.get("remove_duplicates", True):
        try:
            dup_count = int(clean_df.duplicated().sum())
            if dup_count > 0:
                clean_df = clean_df.drop_duplicates().reset_index(drop=True)
                actions_log.append(f"Removed {dup_count} duplicate rows.")
        except Exception:
            try:
                temp_str_df = clean_df.astype(str)
                mask = ~temp_str_df.duplicated()
                dup_count = int((~mask).sum())
                if dup_count > 0:
                    clean_df = clean_df[mask].reset_index(drop=True)
                    actions_log.append(f"Removed {dup_count} duplicate rows.")
            except Exception:
                pass

    # 5. Smart Type Inference (Dates & Numbers)
    if options.get("smart_type_inference", True):
        for col in clean_df.columns:
            series = clean_df[col].dropna()
            if len(series) == 0:
                continue
                
            if clean_df[col].dtype == 'object' or pd.api.types.is_string_dtype(clean_df[col]):
                try:
                    sample = series.head(50).astype(str).str.replace(r'[\$,]', '', regex=True)
                    converted = pd.to_numeric(sample, errors='coerce')
                    if converted.notnull().mean() > 0.85:
                        clean_df[col] = pd.to_numeric(clean_df[col].astype(str).str.replace(r'[\$,]', '', regex=True), errors='coerce')
                        actions_log.append(f"Inferred & converted column '{col}' to Numerical format.")
                        continue
                except Exception:
                    pass

                try:
                    sample = series.head(30).astype(str)
                    if sample.str.contains(r'\d{1,4}[-/\.]\d{1,2}[-/\.]\d{1,4}', regex=True).mean() > 0.7:
                        clean_df[col] = pd.to_datetime(clean_df[col], errors='coerce')
                        actions_log.append(f"Inferred & standardized column '{col}' to Datetime ISO format.")
                except Exception:
                    pass

    # 6. Outlier Handling
    handle_outliers_mode = options.get("handle_outliers", "clip")
    if handle_outliers_mode in ["clip", "remove"]:
        outlier_updates = 0
        for col in clean_df.columns:
            if pd.api.types.is_numeric_dtype(clean_df[col]):
                valid_nums = clean_df[col].dropna()
                if len(valid_nums) > 10:
                    try:
                        q25 = valid_nums.quantile(0.25)
                        q75 = valid_nums.quantile(0.75)
                        iqr = q75 - q25
                        lower_bound = q25 - 1.5 * iqr
                        upper_bound = q75 + 1.5 * iqr
                        
                        if handle_outliers_mode == "clip":
                            outliers = ((clean_df[col] < lower_bound) | (clean_df[col] > upper_bound)).sum()
                            if outliers > 0:
                                clean_df[col] = clean_df[col].clip(lower=lower_bound, upper=upper_bound)
                                outlier_updates += int(outliers)
                        elif handle_outliers_mode == "remove":
                            initial_len = len(clean_df)
                            clean_df = clean_df[(clean_df[col] >= lower_bound) & (clean_df[col] <= upper_bound) | clean_df[col].isnull()]
                            outlier_updates += (initial_len - len(clean_df))
                    except Exception:
                        pass
        if outlier_updates > 0:
            actions_log.append(f"Treated {outlier_updates} outlier values using IQR bounds ({handle_outliers_mode} mode).")

    # 7. Smart Imputation
    if options.get("impute_missing", True):
        num_strat = options.get("impute_numeric_strategy", "median")
        cat_strat = options.get("impute_categorical_strategy", "mode")
        
        for col in clean_df.columns:
            if clean_df[col].isnull().sum() == 0:
                continue
                
            if pd.api.types.is_numeric_dtype(clean_df[col]):
                if num_strat == "median":
                    fill_val = clean_df[col].median()
                    clean_df[col] = clean_df[col].fillna(fill_val)
                elif num_strat == "mean":
                    fill_val = clean_df[col].mean()
                    clean_df[col] = clean_df[col].fillna(fill_val)
                elif num_strat == "zero":
                    clean_df[col] = clean_df[col].fillna(0)
            elif pd.api.types.is_datetime64_any_dtype(clean_df[col]):
                clean_df[col] = clean_df[col].ffill().bfill()
            else:
                try:
                    if cat_strat == "mode":
                        mode_series = clean_df[col].dropna()
                        if not mode_series.empty:
                            try:
                                modes = mode_series.mode()
                                fill_val = modes[0] if not modes.empty else "Unknown"
                            except Exception:
                                fill_val = mode_series.astype(str).mode()[0] if not mode_series.empty else "Unknown"
                        else:
                            fill_val = "Unknown"
                        clean_df[col] = clean_df[col].fillna(fill_val)
                    elif cat_strat == "unknown":
                        clean_df[col] = clean_df[col].fillna("Unknown")
                except Exception:
                    clean_df[col] = clean_df[col].fillna("Unknown")
                    
        actions_log.append(f"Imputed missing entries across columns (Numeric: {num_strat}, Categorical: {cat_strat}).")

    clean_df = clean_df.reset_index(drop=True)
    return clean_df, {"actions_taken": actions_log}
