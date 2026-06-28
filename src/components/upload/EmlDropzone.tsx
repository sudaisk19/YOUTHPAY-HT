'use client';

import { useCallback, useState } from 'react';
import { fetcher } from '@/lib/fetcher';
import { ParseResponse } from '@/lib/types';
import ErrorBanner from '@/components/shared/ErrorBanner';
import { ParseResultCard } from '@/components/inbox/ParseButton';

interface ParsedFile {
  name: string;
  result: ParseResponse & { is_duplicate: boolean };
}

interface ParseApiResponse extends ParseResponse {
  transaction_id: string | null;
  is_duplicate: boolean;
}

export default function EmlDropzone() {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ParsedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.eml')) {
      setError('Only .eml files are accepted');
      return;
    }

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl.split(',')[1] ?? '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const result = await fetcher<ParseApiResponse>('/api/parse', {
      method: 'POST',
      body: JSON.stringify({
        raw_text: base64,
        source: file.name,
        input_type: 'eml_base64',
      }),
    });

    setResults((prev) => [
      ...prev,
      {
        name: file.name,
        result: {
          merchant_name: result.merchant_name,
          amount_pkr: result.amount_pkr,
          direction: result.direction,
          payment_method: result.payment_method,
          txn_date: result.txn_date,
          category: result.category,
          is_roman_urdu: result.is_roman_urdu,
          confidence: result.confidence,
          parsed_by: result.parsed_by,
          is_duplicate: result.is_duplicate,
        },
      },
    ]);
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setProcessing(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        await processFile(file);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
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
    <div className="max-w-2xl mx-auto">
      {error && (
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('eml-input')?.click()}
        className={`border-2 border-dashed rounded-card p-16 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-surface-border hover:border-primary'
        }`}
      >
        <input
          id="eml-input"
          type="file"
          accept=".eml"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {processing ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-text-secondary text-sm">Parsing email...</span>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto mb-4 border-2 border-text-secondary rounded-xl relative">
              <div className="absolute left-1/2 top-4 w-0.5 h-5 bg-text-secondary -translate-x-1/2" />
              <div className="absolute left-1/2 top-3.5 w-3 h-3 border-t-2 border-l-2 border-text-secondary -translate-x-1/2 rotate-45" />
            </div>
            <p className="font-semibold text-text-primary">Drop .eml files here</p>
            <p className="text-text-muted text-sm mt-1">or click to browse</p>
          </>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          {results.map((item) => (
            <div
              key={item.name}
              className="bg-surface-card border border-surface-border rounded-card p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-success">✓</span>
                <span className="text-text-primary font-medium text-sm">
                  {item.name}
                </span>
              </div>
              <ParseResultCard result={item.result} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
