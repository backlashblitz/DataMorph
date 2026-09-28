import React from 'react';
import { FileSpreadsheet, FileCode, FolderArchive, Sparkles } from 'lucide-react';

export const SAMPLE_DATASETS = {
  tabular_csv: {
    name: "messy_ecommerce_customers.csv",
    type: "text/csv",
    description: "Contains messy dates, currency symbols ($), missing records, trailing whitespaces, and duplicates.",
    content: `User_ID,Customer_Name,Email_Address,Join_Date,Total_Spend_USD,City,Category,Status
101,  Alice Smith  ,alice@example.com,2023-01-15,$1250.00,New York,Electronics,Active
102,Bob  Johnson,bob.j@corp.io,02/20/2023,$450.50,San Francisco,Apparel,pending
103,Charlie  Brown,charlie@null.org,2023.03.10,$89.99,new york,Home,ACTIVE
104,Diana Prince,,2023-04-05,$50000.00,Chicago,Electronics,active
105,Evan Wright,evan.w@tech.co,2023-05-12,$310.20,Boston,Apparel,Pending
105,Evan Wright,evan.w@tech.co,2023-05-12,$310.20,Boston,Apparel,Pending
106,Frank Castle,frank@punisher.com,invalid_date,$150.00,Seattle,Home,Active
107,,grace@studio.art,2023-07-22,N/A,Miami,Electronics,active
108,Hank Pym,hank@pym.tech,2023-08-30,$920.00,,Home,active
109,Ivy Pepper,ivy@gotham.city,2023-09-14,$2100.00,Gotham,Electronics,Pending`
  },
  tabular_json: {
    name: "deeply_nested_api_events.json",
    type: "application/json",
    description: "Nested telemetry logs with metadata objects, nested user structures, and missing timestamps.",
    content: JSON.stringify([
      {
        "event_id": "evt_001",
        "timestamp": "2023-11-01T10:00:00Z",
        "user": { "id": 101, "name": "Alice Smith", "location": { "city": "New York", "country": "USA" } },
        "metrics": { "duration_ms": 142.5, "status_code": 200 },
        "tags": ["web", "checkout"]
      },
      {
        "event_id": "evt_002",
        "timestamp": "2023-11-01 10:15:00",
        "user": { "id": 102, "name": "Bob Johnson", "location": { "city": "San Francisco", "country": "USA" } },
        "metrics": { "duration_ms": 89000.0, "status_code": 500 },
        "tags": ["mobile", "error"]
      },
      {
        "event_id": "evt_003",
        "timestamp": null,
        "user": { "id": 103, "name": "Charlie Brown", "location": { "city": "Chicago", "country": "USA" } },
        "metrics": { "duration_ms": 95.0, "status_code": 200 },
        "tags": ["api"]
      },
      {
        "event_id": "evt_003",
        "timestamp": null,
        "user": { "id": 103, "name": "Charlie Brown", "location": { "city": "Chicago", "country": "USA" } },
        "metrics": { "duration_ms": 95.0, "status_code": 200 },
        "tags": ["api"]
      }
    ], null, 2)
  },
  textual_sample: {
    name: "customer_feedback_corpus.zip",
    type: "application/zip",
    description: "Nested folder review documents with HTML spam, redundant white-spaces, and duplicate reviews."
  }
};

export default function SampleDataPicker({ onSelectSample, activeMode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flexWrap: 'wrap',
      margin: '1.25rem 0 0.5rem 0'
    }}>
      <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <Sparkles size={14} color="#818CF8" /> Quick Test Samples:
      </span>

      {activeMode === 'tabular' ? (
        <>
          <button
            onClick={() => onSelectSample(SAMPLE_DATASETS.tabular_csv)}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
          >
            <FileSpreadsheet size={14} color="#34D399" />
            Dirty E-Commerce CSV
          </button>
          <button
            onClick={() => onSelectSample(SAMPLE_DATASETS.tabular_json)}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
          >
            <FileCode size={14} color="#60A5FA" />
            Nested JSON API Logs
          </button>
        </>
      ) : (
        <button
          onClick={() => onSelectSample(SAMPLE_DATASETS.textual_sample)}
          className="btn-secondary"
          style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
        >
          <FolderArchive size={14} color="#C084FC" />
          Multi-Category NLP Review Corpus (Zip)
        </button>
      )}
    </div>
  );
}
