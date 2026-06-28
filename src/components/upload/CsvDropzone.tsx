'use client';

import { useCallback, useState } from 'react';
import { fetcher } from '@/lib/fetcher';
import ErrorBanner from '@/components/shared/ErrorBanner';

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export default function CsvDropzone() {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only .csv files are accepted');
      return;
    }

    const csv = await file.text();
    const data = await fetcher<ImportResult>('/api/transactions/import', {
      method: 'POST',
      body: JSON.stringify({ csv }),
    });

    setResult(data);
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const file = Array.from(files)[0];
      if (file) await processFile(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setProcessing(false);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div>
      {error && (
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      <p className="text-text-muted text-xs mb-3">
        Expected columns:{' '}
        <code className="text-text-secondary">
          Date, Merchant, Amount, Direction, Bank, Method, Category
        </code>
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('csv-input')?.click()}
        className={`border-2 border-dashed rounded-card p-12 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-accent bg-accent/5'
            : 'border-surface-border hover:border-accent'
        }`}
      >
        <input
          id="csv-input"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {processing ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            <span className="text-text-secondary text-sm">Importing transactions...</span>
          </div>
        ) : (
          <>
            <p className="font-semibold text-text-primary">Drop .csv file here</p>
            <p className="text-text-muted text-sm mt-1">or click to browse</p>
            <p className="text-text-muted text-xs mt-2">
              Bank statement exports with Date, Merchant, Amount columns
            </p>
          </>
        )}
      </div>

      {result && (
        <div className="mt-4 bg-surface-card border border-success/30 rounded-card p-4">
          <p className="text-success font-semibold text-sm">
            ✓ {result.imported} transaction{result.imported !== 1 ? 's' : ''} imported
          </p>
          {result.skipped > 0 && (
            <p className="text-warning text-xs mt-1">
              {result.skipped} row{result.skipped !== 1 ? 's' : ''} skipped
            </p>
          )}
          {result.errors.length > 0 && (
            <ul className="text-text-muted text-xs mt-2 space-y-0.5">
              {result.errors.slice(0, 5).map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
