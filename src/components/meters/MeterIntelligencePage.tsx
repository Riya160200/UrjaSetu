
import React, { useMemo, useState } from 'react';
import { METER_FIXTURE } from '../../data/meterFixture';
import {
  detectAnomalies,
  exportAnomalyResults,
} from '../../services/anomalyDetection';

export const MeterIntelligencePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const results = useMemo(
    () => detectAnomalies(METER_FIXTURE),
    [],
  );

  const filteredResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    return results.filter((item) => {
      const matchesSearch =
        !query ||
        item.meterId.toLowerCase().includes(query) ||
        item.clientId.toLowerCase().includes(query) ||
        item.region.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === 'all' ||
        item.category === categoryFilter ||
        item.qualityStatus === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [results, search, categoryFilter]);

  const anomalyCount = results.filter(
    (item) =>
      item.category === 'high-consumption' ||
      item.category === 'low-consumption',
  ).length;

  const invalidCount = results.filter(
    (item) => item.qualityStatus !== 'valid',
  ).length;

  const meterCount = new Set(
    results.map((item) => item.meterId),
  ).size;

  function downloadResults() {
    const blob = new Blob(
      [exportAnomalyResults(results)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'meter-anomaly-results.json';
    link.click();

    URL.revokeObjectURL(url);
  }

  function formatTimestamp(timestamp: string) {
    return new Date(timestamp).toLocaleString();
  }

  function categoryLabel(category: string) {
    return category.replaceAll('-', ' ');
  }

  return (
    <div className="h-full overflow-y-auto bg-[#050B14] p-5 text-slate-100 md:p-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              URJASETU / ANALYTICS
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Meter Intelligence
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Smart-meter telemetry, data quality and anomaly detection.
            </p>
          </div>

          <button
            onClick={downloadResults}
            className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20"
          >
            Export JSON
          </button>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="text-sm font-semibold text-amber-300">
            Demo data — simulated
          </p>
          <p className="mt-1 text-sm text-slate-400">
            These readings are deterministic sample data, not live smart-meter
            telemetry. Scores come from an explainable statistical baseline,
            not a trained machine-learning model. An anomaly is a signal for
            investigation, not proof of theft.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total readings" value={results.length} />
          <StatCard title="Meters monitored" value={meterCount} />
          <StatCard title="Anomaly flags" value={anomalyCount} />
          <StatCard title="Data quality issues" value={invalidCount} />
        </div>

        <section className="rounded-xl border border-slate-800 bg-[#0A1220] p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold">Meter readings</h2>
              <p className="mt-1 text-sm text-slate-400">
                Search readings and inspect the evidence behind each flag.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search meter, client or region..."
                className="min-w-0 rounded-lg border border-slate-700 bg-[#050B14] px-3 py-2 text-sm outline-none focus:border-cyan-500 sm:w-72"
              />

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="rounded-lg border border-slate-700 bg-[#050B14] px-3 py-2 text-sm capitalize outline-none focus:border-cyan-500"
              >
                <option value="all">All categories</option>
                <option value="normal">Normal</option>
                <option value="high-consumption">High consumption</option>
                <option value="low-consumption">Low consumption</option>
                <option value="insufficient-data">Insufficient data</option>
                <option value="missing">Missing reading</option>
                <option value="duplicate">Duplicate timestamp</option>
                <option value="invalid">Invalid reading</option>
                <option value="inconsistent-unit">Inconsistent unit</option>
              </select>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3">Meter / Client</th>
                  <th className="px-3 py-3">Timestamp</th>
                  <th className="px-3 py-3">Consumption</th>
                  <th className="px-3 py-3">Quality</th>
                  <th className="px-3 py-3">Anomaly score</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Evidence</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/80">
                {filteredResults.map((item, index) => (
                  <tr
                    key={`${item.meterId}-${item.timestamp}-${index}`}
                    className="align-top hover:bg-white/[0.02]"
                  >
                    <td className="px-3 py-4">
                      <p className="font-semibold text-slate-200">
                        {item.meterId}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.clientId} · {item.region}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-slate-400">
                      {formatTimestamp(item.timestamp)}
                    </td>

                    <td className="px-3 py-4 font-medium">
                      {item.consumption === null
                        ? '—'
                        : `${item.consumption} ${item.unit}`}
                    </td>

                    <td className="px-3 py-4">
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-xs capitalize text-slate-300">
                        {categoryLabel(item.qualityStatus)}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      {item.anomalyScore === null
                        ? '—'
                        : item.anomalyScore.toFixed(2)}
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs capitalize ${
                          item.category === 'high-consumption' ||
                          item.category === 'low-consumption'
                            ? 'bg-rose-500/10 text-rose-300'
                            : item.category === 'normal'
                              ? 'bg-emerald-500/10 text-emerald-300'
                              : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {categoryLabel(item.category)}
                      </span>
                    </td>

                    <td className="max-w-xs px-3 py-4 text-xs text-slate-400">
                      {item.evidence.length > 0
                        ? item.evidence.map((evidence) => (
                            <p key={evidence.code} className="mb-1">
                              {evidence.message}
                            </p>
                          ))
                        : item.category === 'insufficient-data'
                          ? 'Not enough previous readings to score.'
                          : 'No anomaly evidence.'}
                      {item.evidence.some(
                        (evidence) => evidence.expectedValue !== null,
                      ) && (
                        <p className="mt-2 text-slate-500">
                          Expected baseline:{' '}
                          {item.evidence
                            .find((evidence) => evidence.expectedValue !== null)
                            ?.expectedValue?.toFixed(2)}{' '}
                          kWh
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredResults.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-500">
                No readings match your search or selected category.
              </div>
            )}
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Showing {filteredResults.length} of {results.length} readings ·
            Model version: {results[0]?.modelVersion ?? 'N/A'}
          </p>
        </section>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <div className="rounded-xl border border-slate-800 bg-[#0A1220] p-5">
    <p className="text-sm text-slate-400">{title}</p>
    <p className="mt-3 text-3xl font-bold text-slate-100">{value}</p>
  </div>
);
