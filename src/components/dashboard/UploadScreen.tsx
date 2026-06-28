'use client';

import { useState } from 'react';
import TopHeader from '@/components/shared/TopHeader';
import EmlDropzone from '@/components/upload/EmlDropzone';
import CsvDropzone from '@/components/upload/CsvDropzone';
import { BANKS } from '@/lib/mockData';

type ImportTab = 'eml' | 'csv';

export default function UploadScreen() {
  const [tab, setTab] = useState<ImportTab>('eml');

  return (
    <>
      <TopHeader title="Import Transactions" />

      <div className="max-w-2xl mx-auto">
        <p className="text-text-muted text-sm mb-2">Supported banks</p>
        <div className="flex gap-2 flex-wrap mb-6">
          {BANKS.map((bank) => (
            <span
              key={bank}
              className="bg-surface-elevated text-text-secondary px-3.5 py-1.5 rounded-pill text-sm"
            >
              {bank}
            </span>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTab('eml')}
            className={`px-4 py-2 rounded-pill text-sm font-medium transition-colors ${
              tab === 'eml'
                ? 'bg-primary text-white'
                : 'bg-surface-elevated text-text-secondary hover:text-text-primary'
            }`}
          >
            Email (.eml)
          </button>
          <button
            type="button"
            onClick={() => setTab('csv')}
            className={`px-4 py-2 rounded-pill text-sm font-medium transition-colors ${
              tab === 'csv'
                ? 'bg-accent text-surface-bg'
                : 'bg-surface-elevated text-text-secondary hover:text-text-primary'
            }`}
          >
            Spreadsheet (.csv)
          </button>
        </div>

        {tab === 'eml' ? <EmlDropzone /> : <CsvDropzone />}
      </div>
    </>
  );
}
