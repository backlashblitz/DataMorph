# DataMorph ⚡
> **Automated Intelligent Dataset Profiling, Sanitization & PDF Audit Reporting Engine**

DataMorph is an enterprise-grade data handling and automatic cleaning engine designed to take raw, messy, or unstructured datasets (CSV, JSON, Excel, Parquet, or multi-folder text corpus) and transform them into production-ready, clean data with detailed before-vs-after analytics and executive PDF audit reports.

---

## 🚀 Key Features

### 1. Tabular & Semi-Structured Dataset Engine
- **Multi-Format Support:** Ingests CSV, TSV, JSON (flat or deeply nested), Excel (`.xlsx`, `.xls`), and Parquet.
- **Automated Deep Profiling:** Detects missing values, duplicate rows, irregular data types, outliers, and schema inconsistencies.
- **Smart Imputation:** Imputes missing values intelligently using median, mean, or mode based on column type.
- **Deduplication:** Eliminates exact and near-duplicate rows.
- **Outlier Calibration:** Detects and clips or removes outliers using the Interquartile Range (IQR) technique.
- **Header & String Sanitization:** Normalizes column headers to standard `snake_case`, strips invisible characters, and collapses redundant whitespace.
- **Smart Type Casting:** Auto-detects and standardizes dates and currency strings (`$120.50` &rarr; `120.50`).

### 2. Multi-Folder Textual & NLP Corpus Engine
- **Recursive Folder & Zip Crawler:** Ingests `.zip` archives or direct folder tree uploads, mapping folder paths directly into class labels.
- **Text Sanitization:** Cleans HTML tags, URLs, email addresses, control characters, and normalizes Unicode.
- **Deduplication:** Cryptographic MD5 content fingerprinting to eliminate duplicate documents.
- **NLP Master Dataset Export:** Outputs a structured table (`[file_path, category, raw_text, cleaned_text, word_count]`) ready for Machine Learning and LLM fine-tuning.
- **Cleaned Zip Export:** Recreates the original folder structure with cleaned text files.

### 3. Executive PDF Audit Report
- Automated ReportLab + Matplotlib report generation.
- Before-vs-After KPI metric comparison cards.
- High-resolution visual charts for missing value resolution, row deduplication, and quality scores.
- Comprehensive column schema audit table.

---

## 🛠️ Tech Stack
- **Backend:** Python, FastAPI, Pandas, Polars, ReportLab, Matplotlib, Uvicorn
- **Frontend:** React 19, Vite, Lucide Icons, Chart.js, React-ChartJS-2, Canvas Confetti

---

## 🏁 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ (Optional, for frontend development)

### Quick Launch

1. **Install Backend Dependencies:**
   ```bash
   pip install fastapi uvicorn pandas openpyxl reportlab matplotlib polars
   ```

2. **Run the Application:**
   ```bash
   python backend/app.py
   ```

3. **Open in Browser:**
   Navigate to [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 📁 Project Structure

```
DataMorph/
├── backend/
│   ├── app.py                     # FastAPI server with static files & API routes
│   ├── test_pipeline.py           # Unit and integration test suite
│   └── engine/
│       ├── __init__.py
│       ├── tabular_cleaner.py     # Tabular profiling, imputation, deduplication
│       ├── textual_cleaner.py     # Multi-folder crawler, text sanitization
│       └── report_generator.py    # ReportLab & Matplotlib PDF generator
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Main Application component
│   │   ├── index.css              # Glassmorphism & dark theme design system
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── SampleDataPicker.jsx
│   │       ├── FileUploadZone.jsx
│   │       ├── ConfigPanel.jsx
│   │       ├── ProcessingOverlay.jsx
│   │       ├── TabularReportView.jsx
│   │       ├── TextualReportView.jsx
│   │       └── DownloadCenter.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```
