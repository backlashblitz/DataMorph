import io
import os
import sys
import json
import uuid
from typing import Dict, Any, Optional
import numpy as np
import pandas as pd
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.responses import Response, JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from engine.tabular_cleaner import detect_and_read_file, profile_dataframe, clean_tabular_data
from engine.textual_cleaner import process_text_archive_or_files
from engine.report_generator import build_pdf_report

app = FastAPI(
    title="DataMorph API",
    description="Automated Intelligent Data Cleaning & Profiling Engine",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (with cleanup limit)
SESSION_STORE: Dict[str, Dict[str, Any]] = {}
MAX_STORE_SESSIONS = 50

def manage_cache_size():
    if len(SESSION_STORE) > MAX_STORE_SESSIONS:
        # Remove oldest keys
        oldest_keys = list(SESSION_STORE.keys())[:10]
        for k in oldest_keys:
            SESSION_STORE.pop(k, None)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "DataMorph Engine", "version": "1.0.0"}

@app.post("/api/clean-tabular")
async def clean_tabular_endpoint(
    file: UploadFile = File(...),
    options: Optional[str] = Form(None)
):
    try:
        content = await file.read()
        filename = file.filename or "dataset.csv"
        
        # Parse options
        cleaning_options = None
        if options:
            try:
                cleaning_options = json.loads(options)
            except Exception:
                cleaning_options = None

        # 1. Ingest raw file
        raw_df = detect_and_read_file(content, filename)
        if raw_df.empty:
            raise HTTPException(status_code=400, detail="Uploaded file contains no data or could not be parsed.")

        # 2. Profile raw dataframe
        before_stats = profile_dataframe(raw_df)

        # 3. Clean dataframe
        clean_df, clean_meta = clean_tabular_data(raw_df, cleaning_options)

        # 4. Profile cleaned dataframe
        after_stats = profile_dataframe(clean_df)

        # Generate unique session ID
        session_id = str(uuid.uuid4())
        manage_cache_size()

        def safe_sample_records(df_slice):
            records = []
            for row in df_slice.to_dict(orient="records"):
                sanitized = {}
                for k, v in row.items():
                    if v is None:
                        sanitized[str(k)] = None
                    elif isinstance(v, (list, dict, set, tuple, np.ndarray)):
                        try:
                            sanitized[str(k)] = json.loads(json.dumps(v, default=str))
                        except Exception:
                            sanitized[str(k)] = str(v)
                    elif isinstance(v, (int, np.integer, np.int64, np.int32)):
                        sanitized[str(k)] = int(v)
                    elif isinstance(v, (float, np.floating, np.float64, np.float32)):
                        sanitized[str(k)] = None if (np.isnan(v) or np.isinf(v)) else float(v)
                    elif isinstance(v, (pd.Timestamp, np.datetime64)):
                        sanitized[str(k)] = str(v)
                    else:
                        try:
                            if pd.isna(v):
                                sanitized[str(k)] = None
                            else:
                                sanitized[str(k)] = v
                        except Exception:
                            sanitized[str(k)] = str(v)
                records.append(sanitized)
            return records

        raw_sample = safe_sample_records(raw_df.head(10))
        clean_sample = safe_sample_records(clean_df.head(10))

        SESSION_STORE[session_id] = {
            "mode": "tabular",
            "filename": filename,
            "raw_df": raw_df,
            "clean_df": clean_df,
            "before_stats": before_stats,
            "after_stats": after_stats,
            "actions_taken": clean_meta.get("actions_taken", []),
            "cleaning_options": cleaning_options
        }

        return {
            "session_id": session_id,
            "filename": filename,
            "mode": "tabular",
            "before_stats": before_stats,
            "after_stats": after_stats,
            "actions_taken": clean_meta.get("actions_taken", []),
            "raw_sample": raw_sample,
            "clean_sample": clean_sample
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/clean-textual-archive")
async def clean_textual_endpoint(
    file: UploadFile = File(...),
    options: Optional[str] = Form(None)
):
    try:
        content = await file.read()
        filename = file.filename or "corpus.zip"
        
        cleaning_options = None
        if options:
            try:
                cleaning_options = json.loads(options)
            except Exception:
                cleaning_options = None

        # Process text archive
        master_df, clean_zip_bytes, metrics = process_text_archive_or_files(
            content,
            filename=filename,
            options=cleaning_options
        )

        session_id = str(uuid.uuid4())
        manage_cache_size()

        # Sample preview
        clean_sample = master_df.head(10).replace({float('nan'): None}).to_dict(orient="records")

        SESSION_STORE[session_id] = {
            "mode": "textual",
            "filename": filename,
            "master_df": master_df,
            "clean_zip_bytes": clean_zip_bytes,
            "metrics": metrics,
            "actions_taken": [
                f"Crawled and structured {metrics.get('total_files_before', 0)} documents across {metrics.get('total_categories', 1)} categories.",
                f"Removed {metrics.get('empty_files_removed', 0)} blank or unreadable documents.",
                f"Eliminated {metrics.get('duplicate_files_removed', 0)} duplicate documents via cryptographic fingerprinting.",
                f"Reduced noise from {metrics.get('total_raw_words', 0):,} words down to {metrics.get('total_cleaned_words', 0):,} sanitized tokens ({metrics.get('corpus_noise_reduction_pct', 0)}% noise eliminated)."
            ]
        }

        return {
            "session_id": session_id,
            "filename": filename,
            "mode": "textual",
            "metrics": metrics,
            "actions_taken": SESSION_STORE[session_id]["actions_taken"],
            "clean_sample": clean_sample
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download/data/{session_id}")
def download_clean_data(session_id: str, format: str = Query("csv")):
    if session_id not in SESSION_STORE:
        raise HTTPException(status_code=404, detail="Session expired or not found. Please upload dataset again.")

    session = SESSION_STORE[session_id]
    mode = session["mode"]
    orig_name = os.path.splitext(session["filename"])[0]

    if mode == "tabular":
        df: pd.DataFrame = session["clean_df"]
        fmt = format.lower()
        
        if fmt == "csv":
            out_buf = io.BytesIO()
            df.to_csv(out_buf, index=False, encoding="utf-8")
            out_buf.seek(0)
            return StreamingResponse(
                out_buf,
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename={orig_name}_cleaned.csv"}
            )
        elif fmt == "json":
            out_buf = io.BytesIO()
            df.to_json(out_buf, orient="records", indent=2)
            out_buf.seek(0)
            return StreamingResponse(
                out_buf,
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename={orig_name}_cleaned.json"}
            )
        elif fmt in ["xlsx", "excel"]:
            out_buf = io.BytesIO()
            df.to_excel(out_buf, index=False, engine="openpyxl")
            out_buf.seek(0)
            return StreamingResponse(
                out_buf,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f"attachment; filename={orig_name}_cleaned.xlsx"}
            )
        elif fmt == "parquet":
            out_buf = io.BytesIO()
            df.to_parquet(out_buf, index=False)
            out_buf.seek(0)
            return StreamingResponse(
                out_buf,
                media_type="application/octet-stream",
                headers={"Content-Disposition": f"attachment; filename={orig_name}_cleaned.parquet"}
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")

    else:
        # Textual Mode
        fmt = format.lower()
        if fmt == "zip":
            zip_bytes = session["clean_zip_bytes"]
            return StreamingResponse(
                io.BytesIO(zip_bytes),
                media_type="application/zip",
                headers={"Content-Disposition": f"attachment; filename={orig_name}_cleaned_corpus.zip"}
            )
        elif fmt == "csv":
            df = session["master_df"]
            out_buf = io.BytesIO()
            df.to_csv(out_buf, index=False, encoding="utf-8")
            out_buf.seek(0)
            return StreamingResponse(
                out_buf,
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename={orig_name}_nlp_master.csv"}
            )
        elif fmt == "json":
            df = session["master_df"]
            out_buf = io.BytesIO()
            df.to_json(out_buf, orient="records", indent=2)
            out_buf.seek(0)
            return StreamingResponse(
                out_buf,
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename={orig_name}_nlp_master.json"}
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")

@app.get("/api/download/pdf/{session_id}")
def download_pdf_report(session_id: str):
    if session_id not in SESSION_STORE:
        raise HTTPException(status_code=404, detail="Session expired or not found.")

    session = SESSION_STORE[session_id]
    mode = session["mode"]
    filename = session["filename"]
    actions = session.get("actions_taken", [])

    if mode == "tabular":
        pdf_bytes = build_pdf_report(
            filename=filename,
            mode="tabular",
            before_stats=session["before_stats"],
            after_stats=session["after_stats"],
            actions_taken=actions
        )
    else:
        pdf_bytes = build_pdf_report(
            filename=filename,
            mode="textual",
            before_stats=session["metrics"],
            after_stats={},
            actions_taken=actions
        )

    orig_name = os.path.splitext(filename)[0]
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={orig_name}_DataMorph_Audit_Report.pdf"}
    )

# Serve built frontend if dist exists
dist_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist")
if os.path.exists(dist_dir):
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    assets_path = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(dist_dir, full_path)
        if file_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("app:app", host=host, port=port, reload=False)
