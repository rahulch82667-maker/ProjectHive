'use client';

import { useState } from 'react';
import {
  exportReport,
  ExportParams,
  DateRange,
  ReportType,
  ExportFormat,
  REPORT_TYPE_LABELS,
  REPORT_TYPE_DESCRIPTIONS,
  DATE_RANGE_LABELS,
  FORMAT_LABELS,
  FORMAT_ICONS,
} from '@/services/admin/exports.api';
import {
  X,
  FileDown,
  Calendar,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ExportReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportReportsModal({ isOpen, onClose }: ExportReportsModalProps) {
  const [selectedType, setSelectedType] = useState<ReportType>('projects');
  const [selectedRange, setSelectedRange] = useState<DateRange>('monthly');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('xlsx');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleExport = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsExporting(true);

    try {
      const params: ExportParams = {
        range: selectedRange,
        type: selectedType,
        format: selectedFormat,
      };

      if (selectedRange === 'custom') {
        if (!customStartDate) {
          setError('Please select a start date for the custom range.');
          setIsExporting(false);
          return;
        }
        params.startDate = customStartDate;
        params.endDate = customEndDate || undefined;
      }

      await exportReport(params);

      const typeLabel = REPORT_TYPE_LABELS[selectedType];
      const formatLabel = FORMAT_LABELS[selectedFormat];
      setSuccessMessage(`${typeLabel} exported successfully as ${formatLabel}`);

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Failed to export report';
      setError(message);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-500">
              <FileDown size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Export Reports
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate and download reports in multiple formats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Step 1: Report Type */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-500">
                1
              </span>
              Select Report Type
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(Object.keys(REPORT_TYPE_LABELS) as ReportType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`text-left rounded-2xl border p-4 transition-all ${
                    selectedType === type
                      ? 'border-amber-300 bg-amber-50 shadow-sm dark:border-amber-700 dark:bg-amber-900/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {REPORT_TYPE_LABELS[type]}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {REPORT_TYPE_DESCRIPTIONS[type]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Date Range */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-500">
                2
              </span>
              Select Date Range
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                Object.keys(DATE_RANGE_LABELS) as DateRange[]
              ).map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setSelectedRange(range);
                    if (range !== 'custom') {
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }
                  }}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    selectedRange === range
                      ? 'bg-amber-100 text-amber-800 shadow-sm dark:bg-amber-900/40 dark:text-amber-400'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800'
                  }`}
                >
                  {DATE_RANGE_LABELS[range]}
                </button>
              ))}
            </div>

            {/* Custom Date Range Picker */}
            {selectedRange === 'custom' && (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-amber-600 dark:focus:ring-amber-900/40"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-amber-600 dark:focus:ring-amber-900/40"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Export Format */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-500">
                3
              </span>
              Select Export Format
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={`rounded-2xl border p-4 text-center transition-all ${
                    selectedFormat === format
                      ? 'border-amber-300 bg-amber-50 shadow-sm dark:border-amber-700 dark:bg-amber-900/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="text-2xl">{FORMAT_ICONS[format]}</span>
                  <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {FORMAT_LABELS[format]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/40 dark:bg-rose-950/30">
              <AlertCircle size={16} className="shrink-0 text-rose-600 dark:text-rose-500" />
              <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                {successMessage}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Selected: {REPORT_TYPE_LABELS[selectedType]} &middot;{' '}
            {DATE_RANGE_LABELS[selectedRange]} &middot; {FORMAT_LABELS[selectedFormat]}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-60"
            >
              {isExporting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileDown size={16} />
                  Export Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}